"""ClipNest API: collections, pages, tags, videos + the reel/short collector."""
from __future__ import annotations

from datetime import date
from typing import List, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel

from api_shared import vtstorage, vtlog, INGEST_API_KEY
import collector as collector_mod

router = APIRouter(prefix="/api", tags=["clipnest"])

ALLOWED_PLATFORMS = {"youtube", "tiktok", "instagram", "facebook"}


# ── helpers ───────────────────────────────────────────────────────────────────
def _id(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex[:10]}"


def _today() -> str:
    return date.today().isoformat()


def _clean(doc: dict) -> dict:
    return {k: v for k, v in doc.items() if k != "_id"}


def _norm_platform(value: Optional[str]) -> str:
    v = (value or "").lower().strip()
    return v if v in ALLOWED_PLATFORMS else "youtube"


def _avatar(seed: str) -> str:
    return f"https://api.dicebear.com/7.x/shapes/svg?seed={seed or 'clip'}"


def require_ingest_key(x_api_key: Optional[str] = Header(default=None)):
    """Guard the collector endpoints with an optional shared key."""
    if INGEST_API_KEY and x_api_key != INGEST_API_KEY:
        raise HTTPException(status_code=401, detail="invalid or missing X-API-Key")
    return True


# ── request models ────────────────────────────────────────────────────────────
class TagIn(BaseModel):
    name: str
    color: str = "hsl(205, 80%, 55%)"


class TagPatch(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None


class PageIn(BaseModel):
    name: str
    platform: str = "youtube"
    tagIds: List[str] = []
    collectionIds: List[str] = []
    thumbnail: Optional[str] = None
    handle: Optional[str] = None


class PagePatch(BaseModel):
    name: Optional[str] = None
    platform: Optional[str] = None
    tagIds: Optional[List[str]] = None
    collectionIds: Optional[List[str]] = None
    thumbnail: Optional[str] = None


class CollectionIn(BaseModel):
    name: str
    description: str = ""
    thumbnail: Optional[str] = None


class CollectionPatch(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    thumbnail: Optional[str] = None


class IngestVideo(BaseModel):
    title: str
    url: str
    thumbnail: Optional[str] = ""
    duration: Optional[str] = ""
    platform: Optional[str] = None
    externalId: Optional[str] = None
    publishedAt: Optional[str] = None
    views: Optional[int] = 0
    author: Optional[str] = None


class IngestPage(BaseModel):
    name: Optional[str] = None
    platform: Optional[str] = None
    handle: Optional[str] = None
    thumbnail: Optional[str] = ""


class CollectVideosRequest(BaseModel):
    sourceUrl: Optional[str] = None
    page: Optional[IngestPage] = None
    videos: List[IngestVideo] = []
    tagIds: List[str] = []
    collectionIds: List[str] = []


class CollectPageRequest(BaseModel):
    url: str
    tagIds: List[str] = []
    collectionIds: List[str] = []


# ── bootstrap ─────────────────────────────────────────────────────────────────
@router.get("/bootstrap")
async def bootstrap():
    return {
        "tags": [_clean(d) for d in vtstorage.get_all(collection="tags")],
        "pages": [_clean(d) for d in vtstorage.get_all(collection="pages")],
        "collections": [_clean(d) for d in vtstorage.get_all(collection="collections")],
        "videos": [_clean(d) for d in vtstorage.get_all(collection="videos")],
    }


# ── tags ──────────────────────────────────────────────────────────────────────
@router.post("/tags")
async def create_tag(body: TagIn):
    doc = {"_id": _id("tag"), "id": None, "name": body.name, "color": body.color}
    doc["id"] = doc["_id"]
    vtstorage.insert_one(collection="tags", set_object=doc)
    return _clean(doc)


@router.put("/tags/{tag_id}")
async def update_tag(tag_id: str, body: TagPatch):
    changes = {k: v for k, v in body.model_dump().items() if v is not None}
    vtstorage.update_one(collection="tags", query={"_id": tag_id}, set_object={"$set": changes})
    doc = vtstorage.get_one(collection="tags", query={"_id": tag_id})
    if not doc:
        raise HTTPException(404, "tag not found")
    return _clean(doc)


@router.delete("/tags/{tag_id}")
async def delete_tag(tag_id: str):
    vtstorage.delete_one(collection="tags", query={"_id": tag_id})
    for p in vtstorage.get_all(collection="pages"):
        if tag_id in (p.get("tagIds") or []):
            vtstorage.update_one(collection="pages", query={"_id": p["_id"]},
                                 set_object={"$set": {"tagIds": [t for t in p["tagIds"] if t != tag_id]}})
    return {"deleted": True}


# ── pages ─────────────────────────────────────────────────────────────────────
@router.post("/pages")
async def create_page(body: PageIn):
    doc = {
        "_id": _id("page"), "name": body.name, "platform": _norm_platform(body.platform),
        "tagIds": body.tagIds, "collectionIds": body.collectionIds,
        "handle": body.handle or body.name,
        "thumbnail": body.thumbnail or _avatar(body.name),
        "followedAt": _today(),
    }
    doc["id"] = doc["_id"]
    vtstorage.insert_one(collection="pages", set_object=doc)
    return _clean(doc)


@router.put("/pages/{page_id}")
async def update_page(page_id: str, body: PagePatch):
    changes = {k: v for k, v in body.model_dump().items() if v is not None}
    if "platform" in changes:
        changes["platform"] = _norm_platform(changes["platform"])
    vtstorage.update_one(collection="pages", query={"_id": page_id}, set_object={"$set": changes})
    doc = vtstorage.get_one(collection="pages", query={"_id": page_id})
    if not doc:
        raise HTTPException(404, "page not found")
    return _clean(doc)


@router.delete("/pages/{page_id}")
async def delete_page(page_id: str):
    vtstorage.delete_one(collection="pages", query={"_id": page_id})
    vtstorage.delete_many(collection="videos", query={"pageId": page_id})
    return {"deleted": True}


# ── collections ───────────────────────────────────────────────────────────────
@router.post("/collections")
async def create_collection(body: CollectionIn):
    doc = {
        "_id": _id("col"), "name": body.name, "description": body.description,
        "thumbnail": body.thumbnail or _avatar(body.name), "createdAt": _today(),
    }
    doc["id"] = doc["_id"]
    vtstorage.insert_one(collection="collections", set_object=doc)
    return _clean(doc)


@router.put("/collections/{collection_id}")
async def update_collection(collection_id: str, body: CollectionPatch):
    changes = {k: v for k, v in body.model_dump().items() if v is not None}
    vtstorage.update_one(collection="collections", query={"_id": collection_id}, set_object={"$set": changes})
    doc = vtstorage.get_one(collection="collections", query={"_id": collection_id})
    if not doc:
        raise HTTPException(404, "collection not found")
    return _clean(doc)


@router.delete("/collections/{collection_id}")
async def delete_collection(collection_id: str):
    vtstorage.delete_one(collection="collections", query={"_id": collection_id})
    for p in vtstorage.get_all(collection="pages"):
        if collection_id in (p.get("collectionIds") or []):
            vtstorage.update_one(collection="pages", query={"_id": p["_id"]},
                                 set_object={"$set": {"collectionIds": [c for c in p["collectionIds"] if c != collection_id]}})
    return {"deleted": True}


# ── videos ────────────────────────────────────────────────────────────────────
@router.get("/videos")
async def list_videos(pageId: Optional[str] = None, platform: Optional[str] = None):
    query = {}
    if pageId:
        query["pageId"] = pageId
    if platform:
        query["platform"] = platform
    return {"videos": [_clean(d) for d in vtstorage.get_all(collection="videos", query=query)]}


# ── collector (ingest) ────────────────────────────────────────────────────────
def _upsert_page(page_data: dict, source_url: Optional[str], tag_ids: list, collection_ids: list) -> dict:
    platform = _norm_platform(page_data.get("platform"))
    handle = page_data.get("handle") or page_data.get("name") or platform
    existing = None
    for p in vtstorage.get_all(collection="pages"):
        if p.get("handle") == handle and p.get("platform") == platform:
            existing = p
            break
    if existing:
        updates = {}
        if collection_ids:
            merged = list({*(existing.get("collectionIds") or []), *collection_ids})
            updates["collectionIds"] = merged
        if tag_ids:
            updates["tagIds"] = list({*(existing.get("tagIds") or []), *tag_ids})
        if updates:
            vtstorage.update_one(collection="pages", query={"_id": existing["_id"]}, set_object={"$set": updates})
            existing.update(updates)
        return existing
    doc = {
        "_id": _id("page"),
        "name": (page_data.get("name") or handle)[:80],
        "platform": platform,
        "handle": handle,
        "tagIds": tag_ids or [],
        "collectionIds": collection_ids or [],
        "thumbnail": page_data.get("thumbnail") or _avatar(handle),
        "followedAt": _today(),
        "sourceUrl": source_url,
    }
    doc["id"] = doc["_id"]
    vtstorage.insert_one(collection="pages", set_object=doc)
    return doc


def _upsert_video(v: dict, page_id: str, platform: str) -> str:
    """Return 'created' or 'updated'. Dedupe by url."""
    url = v.get("url")
    existing = vtstorage.get_one(collection="videos", query={"url": url}) if url else None
    payload = {
        "title": (v.get("title") or "Untitled clip")[:200],
        "thumbnail": v.get("thumbnail") or _avatar(v.get("title") or "clip"),
        "duration": v.get("duration") or "",
        "pageId": page_id,
        "platform": platform,
        "url": url,
        "externalId": v.get("externalId"),
        "publishedAt": v.get("publishedAt") or _today(),
        "views": v.get("views") or 0,
    }
    if existing:
        vtstorage.update_one(collection="videos", query={"_id": existing["_id"]}, set_object={"$set": payload})
        return "updated"
    doc = {"_id": _id("vid"), **payload}
    doc["id"] = doc["_id"]
    vtstorage.insert_one(collection="videos", set_object=doc)
    return "created"


@router.post("/collect/videos")
async def collect_videos(body: CollectVideosRequest, _=Depends(require_ingest_key)):
    """Ingest already-extracted videos (used by the browser collector extension)."""
    page_platform = _norm_platform(
        (body.page.platform if body.page else None)
        or (body.videos[0].platform if body.videos else None)
    )
    page_data = {
        "name": (body.page.name if body.page else None),
        "platform": page_platform,
        "handle": (body.page.handle if body.page else None) or (body.videos[0].author if body.videos else None),
        "thumbnail": (body.page.thumbnail if body.page else None) or (body.videos[0].thumbnail if body.videos else None),
    }
    page = _upsert_page(page_data, body.sourceUrl, body.tagIds, body.collectionIds)
    created = updated = 0
    for v in body.videos:
        result = _upsert_video(v.model_dump(), page["_id"], _norm_platform(v.platform or page_platform))
        if result == "created":
            created += 1
        else:
            updated += 1
    vtlog.info("collect_videos", page=page["_id"], created=created, updated=updated)
    return {"pageId": page["_id"], "page": _clean(page), "created": created, "updated": updated,
            "total": len(body.videos)}


@router.post("/collect/page")
async def collect_page(body: CollectPageRequest, _=Depends(require_ingest_key)):
    """Server-side: fetch a public page/reel URL and collect its short videos."""
    result = collector_mod.collect_from_url(body.url)
    videos = result.get("videos") or []
    if not videos:
        raise HTTPException(status_code=422,
                            detail="No videos could be collected from that URL (login-walled or unsupported).")
    page = _upsert_page(result["page"], body.url, body.tagIds, body.collectionIds)
    created = updated = 0
    for v in videos:
        r = _upsert_video(v, page["_id"], _norm_platform(v.get("platform")))
        if r == "created":
            created += 1
        else:
            updated += 1
    vtlog.info("collect_page", url=body.url, created=created, updated=updated)
    return {"pageId": page["_id"], "page": _clean(page), "created": created, "updated": updated,
            "videos": [_clean(d) for d in vtstorage.get_all(collection="videos", query={"pageId": page["_id"]})]}


# ── seed ──────────────────────────────────────────────────────────────────────
def seed_demo_data():
    """Seed a small starter dataset once so the app is populated out of the box."""
    if vtstorage.count(collection="tags") > 0:
        return
    tags = [
        ("Education", "hsl(205, 80%, 55%)"), ("Language", "hsl(38, 92%, 50%)"),
        ("Fitness", "hsl(0, 72%, 51%)"), ("Cooking", "hsl(25, 80%, 50%)"),
        ("Technology", "hsl(200, 70%, 45%)"), ("Business", "hsl(260, 50%, 50%)"),
    ]
    tag_ids = {}
    for name, color in tags:
        tid = _id("tag")
        vtstorage.insert_one(collection="tags", set_object={"_id": tid, "id": tid, "name": name, "color": color})
        tag_ids[name] = tid

    cols = [
        ("Learn German", "German language learning reels and lessons"),
        ("Fitness", "Quick workout reels and exercise routines"),
        ("Professional Growth", "Tech and business insights"),
    ]
    col_ids = {}
    for name, desc in cols:
        cid = _id("col")
        vtstorage.insert_one(collection="collections", set_object={
            "_id": cid, "id": cid, "name": name, "description": desc,
            "thumbnail": _avatar(name), "createdAt": _today()})
        col_ids[name] = cid

    pages = [
        ("Learn German Daily", "youtube", ["Education", "Language"], ["Learn German"]),
        ("Quick Fitness Pro", "tiktok", ["Fitness"], ["Fitness"]),
        ("Tech Explained", "youtube", ["Education", "Technology"], ["Professional Growth"]),
    ]
    for name, platform, tnames, cnames in pages:
        pid = _id("page")
        vtstorage.insert_one(collection="pages", set_object={
            "_id": pid, "id": pid, "name": name, "platform": platform,
            "handle": name, "tagIds": [tag_ids[t] for t in tnames],
            "collectionIds": [col_ids[c] for c in cnames],
            "thumbnail": _avatar(name), "followedAt": _today()})
        for i in range(2):
            vid = _id("vid")
            vtstorage.insert_one(collection="videos", set_object={
                "_id": vid, "id": vid, "title": f"{name} — clip {i+1}",
                "thumbnail": _avatar(f"{name}{i}"), "duration": "0:45",
                "pageId": pid, "platform": platform, "url": "",
                "publishedAt": _today(), "views": 1000 * (i + 1)})
    vtlog.info("clipnest_seeded")
