# ClipNest Collector (Chrome extension)

A **developer-run** MV3 extension that collects public reels / short videos from
the page you're viewing and sends them to the ClipNest API. No build step — it's
plain JavaScript.

## Load it

1. Start the ClipNest backend (`cd backend && python main.py`, default `http://localhost:5201`).
2. Open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select this `extension/` folder.
3. Click the ClipNest Collector toolbar icon. In **Settings**, set the API base URL
   (default `http://localhost:5201`) and, if the backend has `INGEST_API_KEY` set, the key.

## Use it

Open a public page with short videos (YouTube `/shorts`, TikTok profile, Instagram
`/reels`, Facebook reels), then:

- **Scan this page** → extracts visible reel/short links.
- **Send collected reels →** → posts them to `POST /api/collect/videos`.
- **Server-side collect this URL** → sends just the current URL to
  `POST /api/collect/page`, which fetches public metadata (oEmbed / Open Graph)
  entirely on the server.

Collected reels appear in the ClipNest web app (Feed / Explore / Pages).

> Only reads what is publicly visible in your browser. Runs on demand when you
> click the button (uses `activeTab` + `scripting`), no always-on content script.
