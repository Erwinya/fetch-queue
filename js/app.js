import { fetchWithRetry, mapPool } from "./queue.js";

const logEl = document.getElementById("log");
const runBtn = document.getElementById("run");
const abortBtn = document.getElementById("abort");
let controller = null;

function log(line) {
  if (logEl.textContent === "Idle.") logEl.textContent = "";
  logEl.textContent += line + "\n";
  logEl.scrollTop = logEl.scrollHeight;
}

const urls = [
  "https://httpbin.org/delay/1",
  "https://httpbin.org/status/200",
  "https://httpbin.org/status/500",
  "https://httpbin.org/bytes/128",
  "https://httpbin.org/get",
];

runBtn.addEventListener("click", async () => {
  const concurrency = Number(document.getElementById("concurrency").value) || 2;
  const retries = Number(document.getElementById("retries").value) || 0;
  controller = new AbortController();
  runBtn.disabled = true;
  abortBtn.disabled = false;
  logEl.textContent = "";
  log(`Starting ${urls.length} jobs · concurrency=${concurrency} · retries=${retries}`);

  try {
    const results = await mapPool(
      urls,
      concurrency,
      (url, index, signal) =>
        fetchWithRetry(url, {
          retries,
          signal,
          onAttempt: (attempt) => log(`[${index + 1}] attempt ${attempt} → ${url}`),
        }),
      controller.signal
    );
    for (const result of results) {
      if (result.ok) log(`OK ${result.status} ${result.url} (${result.bytes} bytes, ${result.attempts} attempts)`);
      else log(`FAIL ${result.url} :: ${result.error || result.status} (${result.attempts} attempts)`);
    }
    log("Queue finished.");
  } catch (err) {
    log(err.name === "AbortError" ? "Queue aborted." : `Error: ${err.message}`);
  } finally {
    runBtn.disabled = false;
    abortBtn.disabled = true;
    controller = null;
  }
});

abortBtn.addEventListener("click", () => {
  if (controller) controller.abort();
});