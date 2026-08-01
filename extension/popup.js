/* ClipNest Collector — popup logic. Developer-run tool.
 * Flow: Scan active tab (extract reel/short links) -> Send to ClipNest API.
 * Also supports fully server-side collection of the current URL.
 */
const $ = (id) => document.getElementById(id);
let collected = null;

async function getSettings() {
  const s = await chrome.storage.local.get(["apiBase", "apiKey"]);
  return { apiBase: (s.apiBase || "http://localhost:5201").replace(/\/$/, ""), apiKey: s.apiKey || "" };
}
async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}
function setStatus(msg, cls) {
  const el = $("status");
  el.textContent = msg;
  el.className = cls || "";
}
function headers(apiKey) {
  const h = { "content-type": "application/json" };
  if (apiKey) h["x-api-key"] = apiKey;
  return h;
}

(async () => {
  const s = await getSettings();
  $("apiBase").value = s.apiBase;
  $("apiKey").value = s.apiKey;
})();

$("save").onclick = async () => {
  await chrome.storage.local.set({ apiBase: $("apiBase").value.trim(), apiKey: $("apiKey").value.trim() });
  setStatus("Settings saved.", "ok");
};

$("scan").onclick = async () => {
  setStatus("Scanning page…");
  $("send").disabled = true;
  try {
    const tab = await activeTab();
    const [res] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: extractReels });
    collected = res && res.result;
    if (!collected || !collected.videos.length) {
      setStatus("No reels/shorts found on this page. Scroll to load more, then rescan.", "err");
      return;
    }
    setStatus(`Found ${collected.videos.length} reels on ${collected.page.platform} (@${collected.page.handle}).`, "ok");
    $("send").disabled = false;
  } catch (e) {
    setStatus("Scan failed: " + e.message, "err");
  }
};

$("send").onclick = async () => {
  if (!collected) return;
  const { apiBase, apiKey } = await getSettings();
  setStatus("Sending to ClipNest…");
  try {
    const r = await fetch(apiBase + "/api/collect/videos", {
      method: "POST", headers: headers(apiKey), body: JSON.stringify(collected),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j.detail || "HTTP " + r.status);
    setStatus(`Saved: ${j.created} new, ${j.updated} updated → page "${j.page.name}".`, "ok");
  } catch (e) {
    setStatus("Send failed: " + e.message + "\n(Is the ClipNest API running?)", "err");
  }
};

$("serverCollect").onclick = async () => {
  const { apiBase, apiKey } = await getSettings();
  setStatus("Collecting server-side…");
  try {
    const tab = await activeTab();
    const r = await fetch(apiBase + "/api/collect/page", {
      method: "POST", headers: headers(apiKey), body: JSON.stringify({ url: tab.url }),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j.detail || "HTTP " + r.status);
    setStatus(`Server collected ${j.created} new reels → "${j.page.name}".`, "ok");
  } catch (e) {
    setStatus("Server collect failed: " + e.message, "err");
  }
};

/* Injected into the active tab. Must be fully self-contained. */
function extractReels() {
  const loc = window.location;
  const host = loc.hostname.toLowerCase();
  let platform = "youtube";
  if (host.includes("tiktok")) platform = "tiktok";
  else if (host.includes("instagram")) platform = "instagram";
  else if (host.includes("facebook") || host.includes("fb.watch")) platform = "facebook";

  const patterns = {
    youtube: ["/shorts/"],
    tiktok: ["/video/"],
    instagram: ["/reel/", "/reels/"],
    facebook: ["/reel/", "/watch"],
  }[platform];

  const seen = new Set();
  const videos = [];
  for (const a of Array.from(document.querySelectorAll("a[href]"))) {
    const href = a.href;
    if (!href || !patterns.some((p) => href.includes(p))) continue;
    const key = href.split("?")[0];
    if (seen.has(key)) continue;
    seen.add(key);
    const img = a.querySelector("img");
    const title = (a.getAttribute("title") || a.getAttribute("aria-label") ||
      (img && img.getAttribute("alt")) || a.textContent || "").trim().slice(0, 200);
    const thumb = img ? (img.currentSrc || img.src || img.getAttribute("data-src") || "") : "";
    videos.push({ title: title || platform + " clip", url: href, thumbnail: thumb, platform });
    if (videos.length >= 60) break;
  }

  let handle = platform;
  const m = loc.pathname.match(/\/@([\w.\-]+)/) || loc.pathname.match(/^\/([\w.\-]+)/);
  if (m && !["reel", "reels", "shorts", "watch", "video", "p"].includes(m[1])) handle = m[1];
  const name = (document.title || handle).replace(/\s*[\-|·•].*$/, "").trim().slice(0, 80) || handle;
  return { sourceUrl: loc.href, page: { name, platform, handle }, videos };
}
