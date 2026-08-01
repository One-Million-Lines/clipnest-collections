import type { Tag, Page, Collection, Video } from "@/data/mockData";

const API_BASE = (import.meta.env.VITE_API_BASE as string) || "http://localhost:5201";

async function req<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      detail = j.detail || detail;
    } catch { /* ignore */ }
    throw new Error(detail);
  }
  return res.json();
}

export interface BootstrapData {
  tags: Tag[];
  pages: Page[];
  collections: Collection[];
  videos: Video[];
}

export interface CollectResult {
  pageId: string;
  page: Page;
  created: number;
  updated?: number;
  videos?: Video[];
}

export const clipnestApi = {
  bootstrap: () => req<BootstrapData>("/api/bootstrap"),

  createTag: (name: string, color: string) => req<Tag>("/api/tags", "POST", { name, color }),
  updateTag: (id: string, updates: Partial<Tag>) => req<Tag>(`/api/tags/${id}`, "PUT", updates),
  deleteTag: (id: string) => req(`/api/tags/${id}`, "DELETE"),

  createPage: (page: Omit<Page, "id" | "followedAt">) => req<Page>("/api/pages", "POST", page),
  updatePage: (id: string, updates: Partial<Page>) => req<Page>(`/api/pages/${id}`, "PUT", updates),
  deletePage: (id: string) => req(`/api/pages/${id}`, "DELETE"),

  createCollection: (c: Omit<Collection, "id" | "createdAt">) => req<Collection>("/api/collections", "POST", c),
  updateCollection: (id: string, updates: Partial<Collection>) => req<Collection>(`/api/collections/${id}`, "PUT", updates),
  deleteCollection: (id: string) => req(`/api/collections/${id}`, "DELETE"),

  collectPage: (url: string, tagIds: string[] = [], collectionIds: string[] = []) =>
    req<CollectResult>("/api/collect/page", "POST", { url, tagIds, collectionIds }),
};
