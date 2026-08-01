"""Local, zero-infrastructure document store.

A small SQLite-backed replacement for MongoDB that implements the subset of
Mongo-style operations this app relies on (equality/`$or`/`$exists` queries,
`$set` with dotted paths and the positional `$` operator, and `$push`).

It exists so the backend can run and persist data without a MongoDB server.
Documents are stored as JSON blobs in a single SQLite file, namespaced by
database + collection. It is intentionally simple and not meant for heavy
concurrent production load, but it is durable across restarts.
"""
import json
import os
import sqlite3
import threading
from datetime import date, datetime
from typing import Any, Optional


def _json_default(value: Any):
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    return str(value)


def _dumps(doc: dict) -> str:
    return json.dumps(doc, default=_json_default, ensure_ascii=False)


class LocalDocStore:
    """SQLite-backed document store with a tiny Mongo-compatible query layer."""

    def __init__(self, path: str, default_database: str = "app"):
        self._path = path
        self._default_db = default_database
        os.makedirs(os.path.dirname(path), exist_ok=True)
        self._lock = threading.RLock()
        self._conn = sqlite3.connect(path, check_same_thread=False)
        self._conn.execute(
            """CREATE TABLE IF NOT EXISTS documents (
                    db TEXT NOT NULL,
                    coll TEXT NOT NULL,
                    id TEXT NOT NULL,
                    doc TEXT NOT NULL,
                    PRIMARY KEY (db, coll, id)
                )"""
        )
        self._conn.commit()

    # ── low level ────────────────────────────────────────────────────────────
    def _db(self, database: Optional[str]) -> str:
        return database or self._default_db

    def _load(self, database: Optional[str], collection: str) -> list:
        with self._lock:
            rows = self._conn.execute(
                "SELECT doc FROM documents WHERE db=? AND coll=?",
                (self._db(database), collection),
            ).fetchall()
        return [json.loads(r[0]) for r in rows]

    def _put(self, database: Optional[str], collection: str, doc: dict):
        doc_id = str(doc.get("_id"))
        with self._lock:
            self._conn.execute(
                "INSERT OR REPLACE INTO documents (db, coll, id, doc) VALUES (?,?,?,?)",
                (self._db(database), collection, doc_id, _dumps(doc)),
            )
            self._conn.commit()

    def _delete_ids(self, database: Optional[str], collection: str, ids: list):
        if not ids:
            return
        with self._lock:
            self._conn.executemany(
                "DELETE FROM documents WHERE db=? AND coll=? AND id=?",
                [(self._db(database), collection, str(i)) for i in ids],
            )
            self._conn.commit()

    # ── query engine ─────────────────────────────────────────────────────────
    @staticmethod
    def _get_values(obj: Any, parts: list) -> list:
        """Return every value reachable at a dotted path, descending into lists."""
        if not parts:
            return [obj]
        if isinstance(obj, list):
            out = []
            for item in obj:
                out += LocalDocStore._get_values(item, parts)
            return out
        if isinstance(obj, dict):
            key = parts[0]
            if key in obj:
                return LocalDocStore._get_values(obj[key], parts[1:])
            return []
        return []

    @classmethod
    def _condition_matches(cls, doc: dict, path: str, condition: Any) -> bool:
        values = cls._get_values(doc, path.split("."))
        exists = len(values) > 0
        if isinstance(condition, dict) and any(k.startswith("$") for k in condition):
            for op, expected in condition.items():
                if op == "$exists":
                    if bool(expected) != exists:
                        return False
                elif op == "$in":
                    if not any(v in expected for v in values):
                        return False
                elif op == "$nin":
                    if any(v in expected for v in values):
                        return False
                elif op == "$ne":
                    if any(v == expected for v in values) or (expected is None and not exists):
                        return False
                elif op == "$eq":
                    if not any(v == expected for v in values):
                        return False
                elif op in ("$gt", "$gte", "$lt", "$lte"):
                    def _cmp(v):
                        try:
                            if op == "$gt":
                                return v > expected
                            if op == "$gte":
                                return v >= expected
                            if op == "$lt":
                                return v < expected
                            return v <= expected
                        except TypeError:
                            return False
                    if not any(_cmp(v) for v in values):
                        return False
                else:
                    return False
            return True
        if condition is None:
            return (None in values) or (not exists)
        return any(v == condition for v in values)

    @classmethod
    def _matches(cls, doc: dict, query: Optional[dict]) -> bool:
        if not query:
            return True
        for key, condition in query.items():
            if key == "$or":
                if not any(cls._matches(doc, sub) for sub in condition):
                    return False
            elif key == "$and":
                if not all(cls._matches(doc, sub) for sub in condition):
                    return False
            elif key == "$nor":
                if any(cls._matches(doc, sub) for sub in condition):
                    return False
            else:
                if not cls._condition_matches(doc, key, condition):
                    return False
        return True

    # ── update engine ────────────────────────────────────────────────────────
    @staticmethod
    def _set_path(target: dict, path: str, value: Any):
        parts = path.split(".")
        cur = target
        for p in parts[:-1]:
            if p not in cur or not isinstance(cur[p], dict):
                cur[p] = {}
            cur = cur[p]
        cur[parts[-1]] = value

    @classmethod
    def _positional_index(cls, doc: dict, array_path: str, query: dict) -> Optional[int]:
        """Resolve the positional `$` element index using the query filter."""
        arr = cls._get_values(doc, array_path.split("."))
        arr = arr[0] if arr and isinstance(arr[0], list) else cls._get_values(doc, array_path.split("."))
        target = doc
        for p in array_path.split("."):
            target = target.get(p) if isinstance(target, dict) else None
            if target is None:
                return None
        if not isinstance(target, list):
            return None
        prefix = array_path + "."
        sub_conditions = {k[len(prefix):]: v for k, v in query.items() if k.startswith(prefix)}
        for idx, element in enumerate(target):
            if all(cls._condition_matches({"__e__": element}, "__e__." + sk, sv)
                   for sk, sv in sub_conditions.items()):
                return idx
        return None

    @classmethod
    def _apply_update(cls, doc: dict, update: dict, query: dict):
        for op, changes in update.items():
            if op == "$set":
                for path, value in changes.items():
                    if ".$." in path:
                        array_path, sub = path.split(".$.", 1)
                        idx = cls._positional_index(doc, array_path, query)
                        if idx is None:
                            continue
                        target = doc
                        for p in array_path.split("."):
                            target = target[p]
                        cls._set_path(target[idx], sub, value)
                    else:
                        cls._set_path(doc, path, value)
            elif op == "$push":
                for path, value in changes.items():
                    parts = path.split(".")
                    cur = doc
                    for p in parts[:-1]:
                        cur = cur.setdefault(p, {})
                    cur.setdefault(parts[-1], [])
                    if isinstance(value, dict) and "$each" in value:
                        cur[parts[-1]].extend(value["$each"])
                    else:
                        cur[parts[-1]].append(value)
            elif op == "$unset":
                for path in changes:
                    parts = path.split(".")
                    cur = doc
                    ok = True
                    for p in parts[:-1]:
                        if isinstance(cur, dict) and p in cur:
                            cur = cur[p]
                        else:
                            ok = False
                            break
                    if ok and isinstance(cur, dict):
                        cur.pop(parts[-1], None)
            elif op == "$inc":
                for path, delta in changes.items():
                    vals = cls._get_values(doc, path.split("."))
                    base = vals[0] if vals and isinstance(vals[0], (int, float)) else 0
                    cls._set_path(doc, path, base + delta)
            elif not op.startswith("$"):
                # plain replacement field
                cls._set_path(doc, op, changes)
        return doc

    # ── public API (mirrors VTPermStorage/Mongo) ─────────────────────────────
    def get_one(self, database=None, collection=None, query=None, projection=None):
        for doc in self._load(database, collection):
            if self._matches(doc, query):
                return doc
        return None

    def get_many(self, database=None, collection=None, query=None, limit=20,
                 projection=None, start=0, sort=None, make_list=True):
        docs = [d for d in self._load(database, collection) if self._matches(d, query)]
        docs = self._sort(docs, sort)
        if start:
            docs = docs[start:]
        if limit:
            docs = docs[:limit]
        return docs

    def get_all(self, database=None, collection=None, query=None, projection=None, sort=None):
        docs = [d for d in self._load(database, collection) if self._matches(d, query)]
        return self._sort(docs, sort)

    @staticmethod
    def _sort(docs: list, sort):
        if not sort:
            return docs
        for field, direction in reversed(sort):
            docs = sorted(
                docs,
                key=lambda d: (LocalDocStore._get_values(d, field.split(".")) or [None])[0] or "",
                reverse=direction < 0,
            )
        return docs

    def count(self, database=None, collection=None, query=None):
        return sum(1 for d in self._load(database, collection) if self._matches(d, query))

    def insert_one(self, database=None, collection=None, set_object=None):
        doc = dict(set_object or {})
        if "_id" not in doc:
            from uuid import uuid4
            doc["_id"] = str(uuid4())
        self._put(database, collection, doc)
        return {"acknowledged": True, "inserted_id": doc["_id"], "document_id": doc["_id"]}

    def insert_many(self, database=None, collection=None, items=None):
        ids = []
        for item in items or []:
            ids.append(self.insert_one(database=database, collection=collection, set_object=item)["inserted_id"])
        return {"acknowledged": True, "inserted_ids": ids}

    def update_one(self, database=None, collection=None, query=None, set_object=None, options=None):
        for doc in self._load(database, collection):
            if self._matches(doc, query):
                self._apply_update(doc, set_object or {}, query or {})
                self._put(database, collection, doc)
                return {"matched_count": 1, "modified_count": 1}
        if options and options.get("upsert"):
            base = {}
            for op, changes in (set_object or {}).items():
                if op == "$set":
                    base.update(changes)
            for k, v in (query or {}).items():
                if not k.startswith("$") and "." not in k:
                    base.setdefault(k, v)
            self.insert_one(database=database, collection=collection, set_object=base)
            return {"matched_count": 0, "modified_count": 0, "upserted_id": base.get("_id")}
        return {"matched_count": 0, "modified_count": 0}

    def update_many(self, database=None, collection=None, query=None, set_object=None):
        matched = 0
        for doc in self._load(database, collection):
            if self._matches(doc, query):
                self._apply_update(doc, set_object or {}, query or {})
                self._put(database, collection, doc)
                matched += 1
        return {"matched_count": matched, "modified_count": matched}

    def find_one_and_update(self, database=None, collection=None, query=None, set_object=None, options=None):
        for doc in self._load(database, collection):
            if self._matches(doc, query):
                self._apply_update(doc, set_object or {}, query or {})
                self._put(database, collection, doc)
                return doc
        return None

    def replace_one(self, database=None, collection=None, query=None, set_object=None, upsert=False):
        for doc in self._load(database, collection):
            if self._matches(doc, query):
                new_doc = dict(set_object or {})
                new_doc["_id"] = doc.get("_id")
                self._put(database, collection, new_doc)
                return {"matched_count": 1, "modified_count": 1}
        if upsert:
            return {"matched_count": 0, "modified_count": 0,
                    "upserted_id": self.insert_one(database=database, collection=collection,
                                                   set_object=dict(set_object or {}))["inserted_id"]}
        return {"matched_count": 0, "modified_count": 0}

    def delete_one(self, database=None, collection=None, query=None):
        for doc in self._load(database, collection):
            if self._matches(doc, query):
                self._delete_ids(database, collection, [doc.get("_id")])
                return {"deleted_count": 1}
        return {"deleted_count": 0}

    def delete_many(self, database=None, collection=None, query=None):
        ids = [d.get("_id") for d in self._load(database, collection) if self._matches(d, query)]
        self._delete_ids(database, collection, ids)
        return {"deleted_count": len(ids)}

    def ensure_index(self, *args, **kwargs):
        return None

    def aggregate(self, database=None, collection=None, pipeline=None):
        return []
