export async function mapPool(items, concurrency, worker, signal) {
  const results = new Array(items.length);
  let next = 0;

  async function run() {
    while (next < items.length) {
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      const current = next++;
      results[current] = await worker(items[current], current, signal);
    }
  }

  const runners = Array.from({ length: Math.min(concurrency, items.length) }, () => run());
  await Promise.all(runners);
  return results;
}

export async function fetchWithRetry(url, { retries = 2, signal, onAttempt } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    onAttempt?.(attempt + 1, url);
    try {
      const res = await fetch(url, { signal });
      if (!res.ok && res.status >= 500 && attempt < retries) {
        lastError = new Error(`HTTP ${res.status}`);
        await wait(200 * (attempt + 1), signal);
        continue;
      }
      const text = await res.text();
      return { url, ok: res.ok, status: res.status, bytes: text.length, attempts: attempt + 1 };
    } catch (err) {
      lastError = err;
      if (err.name === "AbortError") throw err;
      if (attempt < retries) {
        await wait(200 * (attempt + 1), signal);
        continue;
      }
    }
  }
  return { url, ok: false, status: null, bytes: 0, attempts: retries + 1, error: String(lastError?.message || lastError) };
}

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    if (!signal) return;
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    if (signal.aborted) return onAbort();
    signal.addEventListener("abort", onAbort, { once: true });
  });
}