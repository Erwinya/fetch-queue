# fetch-queue

Demonstrates concurrent Fetch jobs with a concurrency pool, retries, and AbortController cancellation.

## Status

Queue helpers (`js/queue.js`) for concurrency pooling and retrying fetches are in place. Demo UI and styles will land in follow-up commits.

## Module

```js
import { mapPool, fetchWithRetry } from "./js/queue.js";

const results = await mapPool(urls, 3, (url, _i, signal) =>
  fetchWithRetry(url, { retries: 2, signal })
);
```

## Planned run

```powershell
python -m http.server 5183
```

Then open http://localhost:5183

Uses public httpbin.org endpoints for demos.

## License

MIT
