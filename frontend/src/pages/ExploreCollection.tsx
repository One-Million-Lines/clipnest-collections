import { useState } from "react";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { mockCollections, mockVideos, mockPages, Video } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlatformIcon } from "@/components/video/PlatformIcon";
import { VideoModal } from "@/components/video/VideoModal";

export default function ExploreCollection() {
  const { collectionId } = useParams<{ collectionId: string }>();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const collection = mockCollections.find((c) => c.id === collectionId);
  
  if (!collection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Collection not found</h1>
          <Link to="/explore">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Explore
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const collectionPages = mockPages.filter((p) =>
    p.collectionIds.includes(collection.id)
  );
  const collectionVideos = mockVideos.filter((v) =>
    collectionPages.some((p) => p.id === v.pageId)
  );

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(0)}K`;
    return views.toString();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground font-bold text-lg">
              C
            </div>
            <span className="font-semibold text-xl">ClipNest</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/explore">
              <Button variant="ghost">Explore</Button>
            </Link>
            <Link to="/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Link */}
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Collections
          </Link>

          {/* Collection Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {collection.name}
            </h1>
            <p className="text-muted-foreground mb-4">
              {collection.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{collectionPages.length} sources</span>
              <span>•</span>
              <span>{collectionVideos.length} videos</span>
            </div>
          </div>

          {/* Sources */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Sources</h2>
            <div className="flex flex-wrap gap-2">
              {collectionPages.map((page) => (
                <Badge key={page.id} variant="secondary" className="gap-2 py-1.5 px-3">
                  <PlatformIcon platform={page.platform} size="sm" />
                  {page.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Videos Grid */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Videos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {collectionVideos.map((video) => {
                const page = mockPages.find((p) => p.id === video.pageId);
                return (
                  <Card
                    key={video.id}
                    className="group overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity h-12 w-12 rounded-full bg-accent flex items-center justify-center">
                          <Play className="h-5 w-5 fill-current text-accent-foreground" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded">
                        {video.duration}
                      </div>
                      <div className="absolute top-2 left-2">
                        {page && <PlatformIcon platform={page.platform} />}
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm line-clamp-2 mb-2 leading-snug">
                        {video.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{page?.name}</span>
                        <span>•</span>
                        <span>{formatViews(video.views)} views</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {collectionVideos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No videos in this collection yet</p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 text-center py-12 border-t border-border">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Like this collection?
            </h2>
            <p className="text-muted-foreground mb-6">
              Sign up to create your own collections and follow your favorite creators.
            </p>
            <Link to="/login">
              <Button size="lg" className="gap-2">
                Create Your Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <VideoModal
        video={selectedVideo}
        open={!!selectedVideo}
        onOpenChange={(open) => !open && setSelectedVideo(null)}
      />
    </div>
  );
}
