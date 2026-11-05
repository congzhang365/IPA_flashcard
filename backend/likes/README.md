# IPA365 shared hearts

The website stays on GitHub Pages. This small Cloudflare Worker receives hearts;
D1 stores one counter for each contributing browser plus one community total.
Visitors do not sign in. No per-click history, names, emails or device fingerprints
are collected by this code. A random identifier saved in the browser lets retries
be recognised. Cloudflare may process normal request metadata under its policies.

The current app version is **1.1.0-preview.9**. The Cloudflare counter is live at
`https://ipa365-likes.rolin365.workers.dev`, backed by the `ipa365-hearts` D1
database and the `LIKES_DB` Worker binding. The local preview is connected, and
the repository's `VITE_LIKES_API_URL` Actions variable contains the public URL.
The GitHub Pages build reads this variable to connect the published app to the
same counter. No password or API token is included in the frontend.

The steps below are retained for maintenance or recreating the service. The
local `.env.local` and `backend/likes/wrangler.jsonc` contain this installation's
configuration and are ignored by Git. Existing pending local hearts sync on
connection; do not reset browser storage to activate the counter.

## One-time setup using the Cloudflare dashboard

1. [Create a Cloudflare account](https://dash.cloudflare.com/sign-up) and verify
   your email. Choose **Workers Free**; there is no need to buy a domain, move the
   GitHub Pages website, or choose Workers Paid.
2. Create a **D1 database** named `ipa365-hearts`. Open its SQL console and run
   [schema.sql](schema.sql). It creates the tables and counter triggers, with an
   initial shared total of zero. Re-running the schema preserves existing data.
3. Create a **Worker** named `ipa365-likes`. Replace its example code with the
   complete contents of [worker.mjs](worker.mjs).
4. Add a **D1 database binding** to the Worker. Set its variable/binding name to
   **`LIKES_DB`**, and select `ipa365-hearts`. Save and deploy the Worker.
5. Copy its permanent HTTPS `workers.dev` URL, for example
   `https://ipa365-likes.your-subdomain.workers.dev`. Use the normal deployed
   Worker URL, not a temporary preview URL.
6. Open that URL followed by `/likes`. It should return JSON such as
   `{"total":0,"mine":0}`. This confirms the schema and binding are working.
7. In this project's local `.env.local`, add:

   ```dotenv
   VITE_LIKES_API_URL=https://ipa365-likes.your-subdomain.workers.dev
   ```

   This URL is public configuration, not a password. Never put a Cloudflare API
   token or database credentials into the frontend. Restart Vite after changing it.
8. To allow your local preview to use this Worker, set its **`ALLOWED_ORIGINS`**
   text variable to the following, substituting the actual preview port:

   ```text
   https://congzhang365.github.io,http://127.0.0.1:5174,http://localhost:5174
   ```

   The default production origin is `https://congzhang365.github.io`. Origins
   have no trailing slash or `/IPA_flashcard/` path. Preview hearts sent to this
   Worker contribute to its real total; use a separate Worker/database for testing
   if those hearts should not count.
9. When ready to publish the frontend, add the same **`VITE_LIKES_API_URL`** value
   under GitHub repository **Settings → Secrets and variables → Actions →
   Variables**. The existing Pages build reads this repository variable. Publish
   the app source normally; adding the variable alone does not rebuild the site.

Only the owner needs the Cloudflare account. Visitors continue using IPA365
without accounts or popups. After setup, test from the GitHub Pages website too:
it should show the community total, and two taps should increase both counters.
The displayed total can briefly include hearts waiting for server confirmation.
Connection and queue details are kept out of the public widget; failed saves
remain queued locally and retry automatically.

## Saving, offline use and repeat clicks

- Hearts are saved in `ipa365_hearts_v1`, separately from learning progress.
- A short burst of clicks becomes one save. Large pending totals are sent in
  increments of at most 250; this is a request size, not a visitor's like limit.
- The client sends its cumulative contribution count, not a blindly repeated
  increment. SQLite triggers apply only increases, inside an atomic D1 batch.
  Lost responses, retries and older requests do not add the same hearts twice.
- Failed saves retry with backoff while the widget is open. Online/focus events
  also reconnect; there is no continuous polling loop for idle visitors.
- Each animated IPA reaction includes the count returned by its individual
  saved tap, so rapid clicks show successive running counts rather than a stale
  number copied from the previous rendered frame.
- Browser tabs share local storage and coordinate writes with Web Locks in
  browsers that support them. Older browsers fall back to local storage; exactly
  simultaneous clicks in different tabs cannot be guaranteed there.
- Offline hearts remain queued across reloads. When storage is blocked, the
  personal count applies to the current visit instead of persisting across reloads.
- Clearing browser/site data creates a new identifier and resets the personal
  count. Without login, contributions cannot be restored on another device.

## Maintenance

The API exposes totals and accepts hearts only. It does not expose a contributor
list or database administration. Origin checks limit ordinary browser access to
the configured sites, but they are not authentication or proof of a human click;
this is a playful counter, not a verified vote or count of unique people.

No record is added for each tap, so the storage stays small. Back up
`like_totals` and `like_contributions` together. Do not clear contributor rows
independently while retaining the total: those rows prevent retries from being
counted again. There is no routine data deletion required by this implementation.

Workers Free and D1 have daily request/query quotas and storage limits. If the
counter is unavailable, the app keeps local hearts and study continues. Clearing
stored data does not reset daily request allowances.

If using Wrangler later, copy `wrangler.jsonc.example` to `wrangler.jsonc`, replace
the database ID with your own, and use the same schema and Worker. The example is
not a second website deployment; it is just this counter service.

## Checks

```sh
npm test
npm run build
```

The SQL integration checks use Python's built-in SQLite without extra packages:

```powershell
py -3.12 scripts/test-likes-sql.py
```

On other platforms, use `python3 scripts/test-likes-sql.py`.

References: [Workers dashboard setup](https://developers.cloudflare.com/workers/get-started/dashboard/),
[D1 setup](https://developers.cloudflare.com/d1/get-started/),
[D1 atomic batches](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch),
[Workers limits](https://developers.cloudflare.com/workers/platform/limits/),
[D1 pricing and limits](https://developers.cloudflare.com/d1/platform/pricing/).
