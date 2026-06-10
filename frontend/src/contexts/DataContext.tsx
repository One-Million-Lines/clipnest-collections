import { createContext, useContext, useState, ReactNode } from "react";
import {
  mockTags,
  mockPages,
  mockCollections,
  mockVideos,
  Tag,
  Page,
  Collection,
  Video,
  Platform,
} from "@/data/mockData";

interface DataContextType {
  tags: Tag[];
  pages: Page[];
  collections: Collection[];
  videos: Video[];
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
  const [videos] = useState<Video[]>(mockVideos);

  const addTag = (name: string, color: string) => {
    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      name,
      color,
    };
    setTags([...tags, newTag]);
  };

  const updateTag = (id: string, name: string) => {
    setTags(tags.map((t) => (t.id === id ? { ...t, name } : t)));
  };

  const deleteTag = (id: string) => {
    setTags(tags.filter((t) => t.id !== id));
    // Remove tag from pages
    setPages(pages.map((p) => ({ ...p, tagIds: p.tagIds.filter((tid) => tid !== id) })));
  };

  const addPage = (page: Omit<Page, "id" | "followedAt">) => {
    const newPage: Page = {
      ...page,
      id: `page-${Date.now()}`,
      followedAt: new Date().toISOString().split("T")[0],
    };
    setPages([...pages, newPage]);
  };

  const updatePage = (id: string, updates: Partial<Page>) => {
    setPages(pages.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deletePage = (id: string) => {
    setPages(pages.filter((p) => p.id !== id));
  };

  const addCollection = (collection: Omit<Collection, "id" | "createdAt">) => {
    const newCollection: Collection = {
      ...collection,
      id: `col-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setCollections([...collections, newCollection]);
  };

  const updateCollection = (id: string, updates: Partial<Collection>) => {
    setCollections(collections.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCollection = (id: string) => {
    setCollections(collections.filter((c) => c.id !== id));
    // Remove collection from pages
    setPages(pages.map((p) => ({ ...p, collectionIds: p.collectionIds.filter((cid) => cid !== id) })));
  };

  return (
    <DataContext.Provider
      value={{
        tags,
        pages,
        collections,
        videos,
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
