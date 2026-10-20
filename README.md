# fetch-queue

Demonstrates concurrent Fetch jobs with a concurrency pool, retries, and AbortController cancellation.

## Status

Complete: queue helpers, accessible demo page, styles, and CI.

## Run

```powershell
python -m http.server 5183
```

Then open http://localhost:5183

Uses public httpbin.org endpoints for demos.

## Module

```js
import { mapPool, fetchWithRetry } from "./js/queue.js";

const results = await mapPool(urls, 3, (url, _i, signal) =>
  fetchWithRetry(url, { retries: 2, signal })
);
```

## License

MIT
