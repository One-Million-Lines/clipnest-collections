import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  mockTags,
  mockPages,
  mockCollections,
  mockVideos,
  Tag,
  Page,
  Collection,
  Video,
} from "@/data/mockData";
import { clipnestApi, CollectResult } from "@/lib/api";

interface DataContextType {
  tags: Tag[];
  pages: Page[];
  collections: Collection[];
  videos: Video[];
  online: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  collectFromUrl: (url: string, tagIds?: string[], collectionIds?: string[]) => Promise<CollectResult>;
  addTag: (name: string, color: string) => void;
  updateTag: (id: string, name: string) => void;
  deleteTag: (id: string) => void;
  addPage: (page: Omit<Page, "id" | "followedAt">) => void;
  updatePage: (id: string, updates: Partial<Page>) => void;
  deletePage: (id: string) => void;
  addCollection: (collection: Omit<Collection, "id" | "createdAt">) => void;
  updateCollection: (id: string, updates: Partial<Collection>) => void;
  deleteCollection: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [tags, setTags] = useState<Tag[]>(mockTags);
  const [pages, setPages] = useState<Page[]>(mockPages);
  const [collections, setCollections] = useState<Collection[]>(mockCollections);
  const [videos, setVideos] = useState<Video[]>(mockVideos);
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await clipnestApi.bootstrap();
      setTags(data.tags);
      setPages(data.pages);
      setCollections(data.collections);
      setVideos(data.videos);
      setOnline(true);
    } catch {
      // Backend unreachable — keep working with in-memory mock data.
      setOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const collectFromUrl = async (url: string, tagIds: string[] = [], collectionIds: string[] = []) => {
    const result = await clipnestApi.collectPage(url, tagIds, collectionIds);
    await refresh();
    return result;
  };

  // ── Tags ──────────────────────────────────────────────────────────────────
  const addTag = async (name: string, color: string) => {
    if (online) {
      try {
        const tag = await clipnestApi.createTag(name, color);
        setTags((t) => [...t, tag]);
        return;
      } catch { /* fall through to local */ }
    }
    setTags((t) => [...t, { id: `tag-${Date.now()}`, name, color }]);
  };

  const updateTag = (id: string, name: string) => {
    setTags((t) => t.map((x) => (x.id === id ? { ...x, name } : x)));
    if (online) clipnestApi.updateTag(id, { name }).catch(() => {});
  };

  const deleteTag = (id: string) => {
    setTags((t) => t.filter((x) => x.id !== id));
    setPages((p) => p.map((x) => ({ ...x, tagIds: x.tagIds.filter((tid) => tid !== id) })));
    if (online) clipnestApi.deleteTag(id).catch(() => {});
  };

  // ── Pages ─────────────────────────────────────────────────────────────────
  const addPage = async (page: Omit<Page, "id" | "followedAt">) => {
    if (online) {
      try {
        const created = await clipnestApi.createPage(page);
        setPages((p) => [...p, created]);
        return;
      } catch { /* fall through */ }
    }
    setPages((p) => [
      ...p,
      { ...page, id: `page-${Date.now()}`, followedAt: new Date().toISOString().split("T")[0] },
    ]);
  };

  const updatePage = (id: string, updates: Partial<Page>) => {
    setPages((p) => p.map((x) => (x.id === id ? { ...x, ...updates } : x)));
    if (online) clipnestApi.updatePage(id, updates).catch(() => {});
  };

  const deletePage = (id: string) => {
    setPages((p) => p.filter((x) => x.id !== id));
    setVideos((v) => v.filter((x) => x.pageId !== id));
    if (online) clipnestApi.deletePage(id).catch(() => {});
  };

  // ── Collections ─────────────────────────────────────────────────────────────
  const addCollection = async (collection: Omit<Collection, "id" | "createdAt">) => {
    if (online) {
      try {
        const created = await clipnestApi.createCollection(collection);
        setCollections((c) => [...c, created]);
        return;
      } catch { /* fall through */ }
    }
    setCollections((c) => [
      ...c,
      { ...collection, id: `col-${Date.now()}`, createdAt: new Date().toISOString().split("T")[0] },
    ]);
  };

  const updateCollection = (id: string, updates: Partial<Collection>) => {
    setCollections((c) => c.map((x) => (x.id === id ? { ...x, ...updates } : x)));
    if (online) clipnestApi.updateCollection(id, updates).catch(() => {});
  };

  const deleteCollection = (id: string) => {
    setCollections((c) => c.filter((x) => x.id !== id));
    setPages((p) => p.map((x) => ({ ...x, collectionIds: x.collectionIds.filter((cid) => cid !== id) })));
    if (online) clipnestApi.deleteCollection(id).catch(() => {});
  };

  return (
    <DataContext.Provider
      value={{
        tags,
        pages,
        collections,
        videos,
        online,
        loading,
        refresh,
        collectFromUrl,
        addTag,
        updateTag,
        deleteTag,
        addPage,
        updatePage,
        deletePage,
        addCollection,
        updateCollection,
        deleteCollection,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
