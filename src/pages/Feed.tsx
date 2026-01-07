import { useState, useRef, useEffect } from "react";
import { Play, Volume2, VolumeX, ChevronUp, ChevronDown } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Video } from "@/data/mockData";
import { AppLayout } from "@/components/layout/AppLayout";
import { PlatformIcon } from "@/components/video/PlatformIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function FeedVideoCard({ video, isActive }: { video: Video; isActive: boolean }) {
  const { pages, collections } = useData();
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  
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
    <div className="relative h-full w-full bg-black flex items-center justify-center">
      {/* Video/Thumbnail Container */}
      <div className="relative w-full h-full max-w-md mx-auto">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        
        {/* Play overlay */}
        <div 
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity cursor-pointer",
            isPlaying ? "opacity-0" : "opacity-100"
          )}
          onClick={() => setIsPlaying(!isPlaying)}
        >
          <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play className="h-10 w-10 text-white fill-white ml-1" />
          </div>
        </div>

        {/* Platform badge */}
        <div className="absolute top-4 left-4">
          <PlatformIcon platform={page.platform} size="lg" />
        </div>

        {/* Mute button */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/40 text-white hover:bg-black/60"
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>

        {/* Video info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white line-clamp-2">
              {video.title}
            </h2>
            <div className="flex items-center gap-2 text-white/80">
              <span className="font-medium">{page.name}</span>
              <span>•</span>
              <span>{formatViews(video.views)} views</span>
              <span>•</span>
              <span>{video.duration}</span>
            </div>
            {pageCollections.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {pageCollections.map((col) => (
                  <Badge
                    key={col.id}
                    variant="secondary"
                    className="bg-white/20 text-white border-0"
                  >
                    {col.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Feed() {
  const { videos, pages } = useData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const validVideos = videos.filter((v) => pages.find((p) => p.id === v.pageId));

  const scrollToIndex = (index: number) => {
    if (index < 0 || index >= validVideos.length) return;
    setCurrentIndex(index);
    const container = containerRef.current;
    if (container) {
      const children = container.children;
      if (children[index]) {
        children[index].scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "j") {
        scrollToIndex(currentIndex + 1);
      } else if (e.key === "ArrowUp" || e.key === "k") {
        scrollToIndex(currentIndex - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, validVideos.length]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    
    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / itemHeight);
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < validVideos.length) {
      setCurrentIndex(newIndex);
    }
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-4rem)] -m-6 relative bg-black">
        {/* Navigation buttons */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30"
            onClick={() => scrollToIndex(currentIndex - 1)}
            disabled={currentIndex === 0}
          >
            <ChevronUp className="h-6 w-6" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30"
            onClick={() => scrollToIndex(currentIndex + 1)}
            disabled={currentIndex === validVideos.length - 1}
          >
            <ChevronDown className="h-6 w-6" />
          </Button>
        </div>

        {/* Progress indicator */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-1">
          {validVideos.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-1 h-6 rounded-full transition-all cursor-pointer",
                index === currentIndex
                  ? "bg-white"
                  : "bg-white/30 hover:bg-white/50"
              )}
              onClick={() => scrollToIndex(index)}
            />
          ))}
        </div>

        {/* Video feed container */}
        <div
          ref={containerRef}
          className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide"
          onScroll={handleScroll}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {validVideos.map((video, index) => (
            <div
              key={video.id}
              className="h-full w-full snap-start snap-always"
            >
              <FeedVideoCard video={video} isActive={index === currentIndex} />
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
