import { X, ExternalLink } from "lucide-react";
import { Video, getPageById } from "@/data/mockData";
import { useData } from "@/contexts/DataContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlatformIcon } from "./PlatformIcon";

interface VideoModalProps {
  video: Video | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VideoModal({ video, open, onOpenChange }: VideoModalProps) {
  const { pages } = useData();
  
  if (!video) return null;

  const page = pages.find((p) => p.id === video.pageId);
  if (!page) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden">
        <div className="relative aspect-video bg-black">
          {/* Simulated video player */}
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-accent/90 flex items-center justify-center cursor-pointer hover:bg-accent transition-colors">
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8 text-accent-foreground fill-current ml-1"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
            <div className="flex-1 h-1 bg-white/30 rounded-full">
              <div className="w-0 h-full bg-accent rounded-full" />
            </div>
            <span className="text-white text-sm">{video.duration}</span>
          </div>
        </div>
        <div className="p-4">
          <DialogHeader className="mb-3">
            <DialogTitle className="text-lg leading-tight pr-8">
              {video.title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PlatformIcon platform={page.platform} />
              <div>
                <p className="text-sm font-medium">{page.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(video.publishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Open Original
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
