// Mock User
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
}

export const mockUser: User = {
  id: "user-1",
  name: "Alex Morgan",
  email: "alex@example.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  createdAt: "2024-01-15",
};

// Tags
export interface Tag {
  id: string;
  name: string;
  color: string;
}

export const mockTags: Tag[] = [
  { id: "tag-1", name: "Education", color: "hsl(205, 80%, 55%)" },
  { id: "tag-2", name: "Entertainment", color: "hsl(280, 60%, 55%)" },
  { id: "tag-3", name: "DIY", color: "hsl(145, 60%, 42%)" },
  { id: "tag-4", name: "Language", color: "hsl(38, 92%, 50%)" },
  { id: "tag-5", name: "Fitness", color: "hsl(0, 72%, 51%)" },
  { id: "tag-6", name: "Cooking", color: "hsl(25, 80%, 50%)" },
  { id: "tag-7", name: "Technology", color: "hsl(200, 70%, 45%)" },
  { id: "tag-8", name: "Business", color: "hsl(260, 50%, 50%)" },
];

// Platforms
export type Platform = "youtube" | "facebook" | "tiktok" | "instagram";

export const platformLabels: Record<Platform, string> = {
  youtube: "YouTube",
  facebook: "Facebook",
  tiktok: "TikTok",
  instagram: "Instagram",
};

// Pages (Sources)
export interface Page {
  id: string;
  name: string;
  platform: Platform;
  tagIds: string[];
  collectionIds: string[];
  thumbnail: string;
  followedAt: string;
}

export const mockPages: Page[] = [
  {
    id: "page-1",
    name: "Learn German Daily",
    platform: "youtube",
    tagIds: ["tag-1", "tag-4"],
    collectionIds: ["col-1"],
    thumbnail: "https://images.unsplash.com/photo-1527866959252-deab85ef7d1b?w=200&h=200&fit=crop",
    followedAt: "2024-02-01",
  },
  {
    id: "page-2",
    name: "5-Minute Crafts",
    platform: "facebook",
    tagIds: ["tag-2", "tag-3"],
    collectionIds: ["col-3"],
    thumbnail: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=200&h=200&fit=crop",
    followedAt: "2024-02-05",
  },
  {
    id: "page-3",
    name: "Quick Fitness Pro",
    platform: "youtube",
    tagIds: ["tag-5"],
    collectionIds: ["col-2"],
    thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&h=200&fit=crop",
    followedAt: "2024-02-10",
  },
  {
    id: "page-4",
    name: "Tasty Bites",
    platform: "tiktok",
    tagIds: ["tag-6", "tag-2"],
    collectionIds: ["col-3"],
    thumbnail: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop",
    followedAt: "2024-02-12",
  },
  {
    id: "page-5",
    name: "Tech Explained",
    platform: "youtube",
    tagIds: ["tag-1", "tag-7"],
    collectionIds: ["col-4"],
    thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop",
    followedAt: "2024-02-15",
  },
  {
    id: "page-6",
    name: "Business Shorts",
    platform: "facebook",
    tagIds: ["tag-8", "tag-1"],
    collectionIds: ["col-4"],
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    followedAt: "2024-02-18",
  },
  {
    id: "page-7",
    name: "HIIT Workouts",
    platform: "tiktok",
    tagIds: ["tag-5"],
    collectionIds: ["col-2"],
    thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop",
    followedAt: "2024-02-20",
  },
  {
    id: "page-8",
    name: "German with Anja",
    platform: "youtube",
    tagIds: ["tag-1", "tag-4"],
    collectionIds: ["col-1"],
    thumbnail: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=200&h=200&fit=crop",
    followedAt: "2024-02-22",
  },
];

// Collections
export interface Collection {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  createdAt: string;
}

export const mockCollections: Collection[] = [
  {
    id: "col-1",
    name: "Learn German",
    description: "German language learning resources and lessons",
    thumbnail: "https://images.unsplash.com/photo-1527866959252-deab85ef7d1b?w=400&h=300&fit=crop",
    createdAt: "2024-01-20",
  },
  {
    id: "col-2",
    name: "Fitness",
    description: "Quick workout videos and exercise routines",
    thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop",
    createdAt: "2024-01-22",
  },
  {
    id: "col-3",
    name: "Cooking & DIY",
    description: "Recipes, crafts, and creative projects",
    thumbnail: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    createdAt: "2024-01-25",
  },
  {
    id: "col-4",
    name: "Professional Growth",
    description: "Tech and business insights for career development",
    thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
    createdAt: "2024-01-28",
  },
];

// Videos
export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  pageId: string;
  publishedAt: string;
  views: number;
  url?: string;
  platform?: Platform;
}

export const mockVideos: Video[] = [
  {
    id: "vid-1",
    title: "10 German Phrases You Need to Know",
    thumbnail: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=225&fit=crop",
    duration: "0:58",
    pageId: "page-1",
    publishedAt: "2024-03-01",
    views: 125000,
  },
  {
    id: "vid-2",
    title: "DIY Phone Stand in 30 Seconds",
    thumbnail: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=225&fit=crop",
    duration: "0:32",
    pageId: "page-2",
    publishedAt: "2024-03-02",
    views: 89000,
  },
  {
    id: "vid-3",
    title: "5-Minute Full Body Burn",
    thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=225&fit=crop",
    duration: "5:00",
    pageId: "page-3",
    publishedAt: "2024-03-03",
    views: 234000,
  },
  {
    id: "vid-4",
    title: "15-Second Pasta Hack",
    thumbnail: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=225&fit=crop",
    duration: "0:15",
    pageId: "page-4",
    publishedAt: "2024-03-04",
    views: 567000,
  },
  {
    id: "vid-5",
    title: "How AI Actually Works",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=225&fit=crop",
    duration: "1:00",
    pageId: "page-5",
    publishedAt: "2024-03-05",
    views: 178000,
  },
  {
    id: "vid-6",
    title: "3 Habits of Successful Founders",
    thumbnail: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=225&fit=crop",
    duration: "0:45",
    pageId: "page-6",
    publishedAt: "2024-03-06",
    views: 92000,
  },
  {
    id: "vid-7",
    title: "30-Second Ab Workout",
    thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=225&fit=crop",
    duration: "0:30",
    pageId: "page-7",
    publishedAt: "2024-03-07",
    views: 445000,
  },
  {
    id: "vid-8",
    title: "German Greetings for Beginners",
    thumbnail: "https://images.unsplash.com/photo-1503917988258-f87a78e3c995?w=400&h=225&fit=crop",
    duration: "0:55",
    pageId: "page-8",
    publishedAt: "2024-03-08",
    views: 67000,
  },
  {
    id: "vid-9",
    title: "Quick German Numbers 1-20",
    thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=225&fit=crop",
    duration: "0:42",
    pageId: "page-1",
    publishedAt: "2024-03-09",
    views: 88000,
  },
  {
    id: "vid-10",
    title: "Easy Origami Box",
    thumbnail: "https://images.unsplash.com/photo-1582808384873-d06a6f0a3c4e?w=400&h=225&fit=crop",
    duration: "0:48",
    pageId: "page-2",
    publishedAt: "2024-03-10",
    views: 123000,
  },
  {
    id: "vid-11",
    title: "Morning Stretch Routine",
    thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=225&fit=crop",
    duration: "3:00",
    pageId: "page-3",
    publishedAt: "2024-03-11",
    views: 198000,
  },
  {
    id: "vid-12",
    title: "One-Pan Egg Recipe",
    thumbnail: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=225&fit=crop",
    duration: "0:25",
    pageId: "page-4",
    publishedAt: "2024-03-12",
    views: 334000,
  },
  {
    id: "vid-13",
    title: "Blockchain in 60 Seconds",
    thumbnail: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=225&fit=crop",
    duration: "1:00",
    pageId: "page-5",
    publishedAt: "2024-03-13",
    views: 145000,
  },
  {
    id: "vid-14",
    title: "Negotiation Tip #1",
    thumbnail: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=225&fit=crop",
    duration: "0:38",
    pageId: "page-6",
    publishedAt: "2024-03-14",
    views: 76000,
  },
  {
    id: "vid-15",
    title: "Plank Challenge",
    thumbnail: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&h=225&fit=crop",
    duration: "1:00",
    pageId: "page-7",
    publishedAt: "2024-03-15",
    views: 289000,
  },
  {
    id: "vid-16",
    title: "German Colors Song",
    thumbnail: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=225&fit=crop",
    duration: "0:50",
    pageId: "page-8",
    publishedAt: "2024-03-16",
    views: 54000,
  },
  {
    id: "vid-17",
    title: "Quick Cardio Burst",
    thumbnail: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&h=225&fit=crop",
    duration: "2:00",
    pageId: "page-3",
    publishedAt: "2024-03-17",
    views: 167000,
  },
  {
    id: "vid-18",
    title: "Chocolate Mug Cake",
    thumbnail: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=225&fit=crop",
    duration: "0:40",
    pageId: "page-4",
    publishedAt: "2024-03-18",
    views: 421000,
  },
];

// Helper functions
export const getPageById = (id: string) => mockPages.find((p) => p.id === id);
export const getTagById = (id: string) => mockTags.find((t) => t.id === id);
export const getCollectionById = (id: string) => mockCollections.find((c) => c.id === id);
export const getVideosByPageId = (pageId: string) => mockVideos.filter((v) => v.pageId === pageId);
export const getPagesByCollectionId = (collectionId: string) =>
  mockPages.filter((p) => p.collectionIds.includes(collectionId));
export const getPagesByTagId = (tagId: string) => mockPages.filter((p) => p.tagIds.includes(tagId));
export const getVideosByCollectionId = (collectionId: string) => {
  const pageIds = getPagesByCollectionId(collectionId).map((p) => p.id);
  return mockVideos.filter((v) => pageIds.includes(v.pageId));
};
