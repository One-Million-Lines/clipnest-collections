"""Server-side reel/short-video collector.

Collects public short-video metadata WITHOUT any API keys, using public oEmbed
endpoints (YouTube, TikTok) and Open Graph HTML tags (Instagram, Facebook).
Given a single video/reel/short URL it returns one item; given a channel or
profile URL it best-effort extracts several item URLs from the page HTML.

This module powers both:
  * the developer-run browser collector extension (which usually posts already
    extracted items to /api/collect/videos), and
  * the fully server-side POST /api/collect/page endpoint.
"""
from __future__ import annotations

import re
from typing import Optional

import httpx

_UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
       "(KHTML, like Gecko) Chrome/122.0 Safari/537.36")
_HEADERS = {"User-Agent": _UA, "Accept-Language": "en-US,en;q=0.9"}
_TIMEOUT = 8.0
_MAX_ITEMS = 15
_MAX_OEMBED = 12


def detect_platform(url: str) -> str:
    u = url.lower()
    if "youtube.com" in u or "youtu.be" in u:
        return "youtube"
    if "tiktok.com" in u:
        return "tiktok"
    if "instagram.com" in u:
        return "instagram"
    if "facebook.com" in u or "fb.watch" in u:
        return "facebook"
    return "youtube"


def _is_single_item(url: str, platform: str) -> bool:
    u = url.lower()
    markers = ["/shorts/", "/watch", "youtu.be/", "/video/", "/reel/", "/reels/", "/p/", "fb.watch/"]
    return any(m in u for m in markers)


def _get(url: str) -> Optional[str]:
    try:
        with httpx.Client(timeout=_TIMEOUT, headers=_HEADERS, follow_redirects=True) as c:
            r = c.get(url)
            if r.status_code == 200:
                return r.text
    except Exception:
        return None
    return None


def _oembed(url: str, platform: str) -> Optional[dict]:
    endpoints = {
        "youtube": "https://www.youtube.com/oembed",
        "tiktok": "https://www.tiktok.com/oembed",
    }
    ep = endpoints.get(platform)
    if not ep:
        return None
    try:
        with httpx.Client(timeout=_TIMEOUT, headers=_HEADERS, follow_redirects=True) as c:
            r = c.get(ep, params={"url": url, "format": "json"})
            if r.status_code == 200:
                return r.json()
    except Exception:
        return None
    return None


def _meta(html: str, prop: str) -> Optional[str]:
    for pattern in (
        rf'<meta[^>]+property=["\']{re.escape(prop)}["\'][^>]+content=["\']([^"\']+)["\']',
        rf'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']{re.escape(prop)}["\']',
        rf'<meta[^>]+name=["\']{re.escape(prop)}["\'][^>]+content=["\']([^"\']+)["\']',
    ):
        m = re.search(pattern, html, re.IGNORECASE)
        if m:
            return m.group(1)
    return None


def _handle_from_url(url: str, platform: str) -> str:
    m = re.search(r"tiktok\.com/@([\w.\-]+)", url) or re.search(r"instagram\.com/([\w.\-]+)", url)
    if m:
        return m.group(1)
    m = re.search(r"youtube\.com/@([\w.\-]+)", url) or re.search(r"youtube\.com/(?:c|channel|user)/([\w.\-]+)", url)
    if m:
        return m.group(1)
    m = re.search(r"facebook\.com/([\w.\-]+)", url)
    if m and m.group(1) not in ("reel", "watch", "video"):
        return m.group(1)
    return platform


def _single_video(url: str, platform: str) -> Optional[dict]:
    data = _oembed(url, platform)
    if data:
        return {
            "title": data.get("title") or f"{platform} clip",
            "url": url,
            "thumbnail": data.get("thumbnail_url") or "",
            "platform": platform,
            "author": data.get("author_name") or "",
            "authorUrl": data.get("author_url") or "",
        }
    html = _get(url)
    if html:
        return {
            "title": _meta(html, "og:title") or f"{platform} clip",
            "url": url,
            "thumbnail": _meta(html, "og:image") or "",
            "platform": platform,
            "author": _meta(html, "og:site_name") or "",
            "authorUrl": "",
        }
    return None


def _extract_item_urls(html: str, platform: str) -> list:
    urls, seen = [], set()

    def add(u: str):
        if u not in seen:
            seen.add(u)
            urls.append(u)

    if platform == "youtube":
        for vid in re.findall(r'/shorts/([\w\-]{6,})', html):
            add(f"https://www.youtube.com/shorts/{vid}")
        for vid in re.findall(r'"videoId":"([\w\-]{11})"', html):
            add(f"https://www.youtube.com/watch?v={vid}")
    elif platform == "tiktok":
        for vid in re.findall(r'/video/(\d{6,})', html):
            m = re.search(rf'(@[\w.\-]+)/video/{vid}', html)
            handle = m.group(1) if m else "@user"
            add(f"https://www.tiktok.com/{handle}/video/{vid}")
    elif platform == "instagram":
        for code in re.findall(r'/reel/([\w\-]{5,})', html):
            add(f"https://www.instagram.com/reel/{code}/")
        for code in re.findall(r'/p/([\w\-]{5,})', html):
            add(f"https://www.instagram.com/p/{code}/")
    elif platform == "facebook":
        for vid in re.findall(r'/reel/(\d{6,})', html):
            add(f"https://www.facebook.com/reel/{vid}")
    return urls[:_MAX_ITEMS]


def collect_from_url(url: str) -> dict:
    """Return {page: {...}, videos: [...]}. Never raises for network issues."""
    platform = detect_platform(url)
    handle = _handle_from_url(url, platform)
    videos: list = []

    if _is_single_item(url, platform):
        v = _single_video(url, platform)
        if v:
            videos.append(v)
    else:
        html = _get(url)
        if html:
            item_urls = _extract_item_urls(html, platform)
            oembed_budget = _MAX_OEMBED
            for item_url in item_urls:
                if platform in ("youtube", "tiktok") and oembed_budget > 0:
                    v = _single_video(item_url, platform)
                    oembed_budget -= 1
                    if v:
                        videos.append(v)
                else:
                    videos.append({
                        "title": f"{handle} · {platform} clip",
                        "url": item_url,
                        "thumbnail": "",
                        "platform": platform,
                        "author": handle,
                        "authorUrl": url,
                    })
            # page-level branding from the profile HTML
            page_thumb = _meta(html, "og:image") or ""
            page_name = _meta(html, "og:title") or handle
        else:
            page_thumb, page_name = "", handle

    author = videos[0].get("author") if videos else handle
    page = {
        "name": (author or handle or platform).strip()[:80],
        "platform": platform,
        "handle": handle,
        "thumbnail": (videos[0].get("thumbnail") if videos else "") or "",
        "sourceUrl": url,
    }
    if not _is_single_item(url, platform):
        page["name"] = (locals().get("page_name") or page["name"])[:80]
        page["thumbnail"] = page["thumbnail"] or locals().get("page_thumb", "")

    return {"page": page, "videos": videos}
