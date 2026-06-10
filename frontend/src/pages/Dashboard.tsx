import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Video } from "@/data/mockData";
import { AppLayout } from "@/components/layout/AppLayout";
import { VideoCard } from "@/components/video/VideoCard";
import { VideoModal } from "@/components/video/VideoModal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Dashboard() {
  const { videos, pages, collections, tags } = useData();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [collectionFilter, setCollectionFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  const filteredVideos = useMemo(() => {
    return videos
      .filter((video) => {
        const page = pages.find((p) => p.id === video.pageId);
        if (!page) return false;

        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          if (
            !video.title.toLowerCase().includes(query) &&
            !page.name.toLowerCase().includes(query)
          ) {
            return false;
          }
        }

        // Collection filter
        if (collectionFilter !== "all") {
          if (!page.collectionIds.includes(collectionFilter)) {
            return false;
          }
        }

        // Tag filter
        if (tagFilter !== "all") {
          if (!page.tagIds.includes(tagFilter)) {
            return false;
          }
        }

        // Platform filter
        if (platformFilter !== "all") {
          if (page.platform !== platformFilter) {
            return false;
          }
        }

        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
  }, [videos, pages, searchQuery, collectionFilter, tagFilter, platformFilter]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Latest videos from your followed pages
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={collectionFilter} onValueChange={setCollectionFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Collection" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Collections</SelectItem>
              {collections.map((col) => (
                <SelectItem key={col.id} value={col.id}>
                  {col.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag.id} value={tag.id}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Video Grid */}
        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onWatch={setSelectedVideo}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No videos found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your filters
            </p>
          </div>
        )}
      </div>

      <VideoModal
        video={selectedVideo}
        open={!!selectedVideo}
        onOpenChange={(open) => !open && setSelectedVideo(null)}
      />
    </AppLayout>
  );
}
