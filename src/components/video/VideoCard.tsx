import { Play } from "lucide-react";
import { Video, getPageById, Platform } from "@/data/mockData";
import { useData } from "@/contexts/DataContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlatformIcon } from "./PlatformIcon";

interface VideoCardProps {
  video: Video;
  onWatch: (video: Video) => void;
}

export function VideoCard({ video, onWatch }: VideoCardProps) {
  const { pages, collections } = useData();
  const page = pages.find((p) => p.id === video.pageId);
  
  if (!page) return null;

  const pageCollections = collections.filter((c) =>
    page.collectionIds.includes(c.id)
  );

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(0)}K`;
    return views.toString();
  };

  return (
    <Card className="group overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <Button
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity h-12 w-12 rounded-full bg-accent hover:bg-accent/90"
            onClick={() => onWatch(video)}
          >
            <Play className="h-5 w-5 fill-current" />
          </Button>
        </div>
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded">
          {video.duration}
        </div>
        <div className="absolute top-2 left-2">
          <PlatformIcon platform={page.platform} />
        </div>
      </div>
      <CardContent className="p-3">
        <h3 className="font-medium text-sm line-clamp-2 mb-2 leading-snug">
          {video.title}
        </h3>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-muted-foreground">{page.name}</span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">
            {formatViews(video.views)} views
          </span>
        </div>
        {pageCollections.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {pageCollections.slice(0, 2).map((col) => (
              <Badge
                key={col.id}
                variant="secondary"
                className="text-xs px-2 py-0"
              >
                {col.name}
              </Badge>
            ))}
            {pageCollections.length > 2 && (
              <Badge variant="secondary" className="text-xs px-2 py-0">
                +{pageCollections.length - 2}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
