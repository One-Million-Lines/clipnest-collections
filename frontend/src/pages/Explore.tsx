import { useState } from "react";
import { ArrowRight, Play, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { mockCollections, mockVideos, mockPages } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlatformIcon } from "@/components/video/PlatformIcon";
import { VideoModal } from "@/components/video/VideoModal";
import { Video } from "@/data/mockData";

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const filteredCollections = mockCollections.filter((col) =>
    col.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    col.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Link to="/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Explore Collections
            </h1>
            <p className="text-muted-foreground">
              Browse public collections curated by the community
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-md mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Collections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollections.map((collection) => {
              const collectionPages = mockPages.filter((p) =>
                p.collectionIds.includes(collection.id)
              );
              const collectionVideos = mockVideos.filter((v) =>
                collectionPages.some((p) => p.id === v.pageId)
              );
              const previewVideos = collectionVideos.slice(0, 4);

              return (
                <Link key={collection.id} to={`/explore/${collection.id}`}>
                  <Card className="group overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full">
                    {/* Preview Grid */}
                    <div className="aspect-video relative overflow-hidden bg-muted">
                      <div className="grid grid-cols-2 grid-rows-2 h-full">
                        {previewVideos.slice(0, 4).map((video, index) => (
                          <div key={video.id} className="relative overflow-hidden">
                            <img
                              src={video.thumbnail}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {previewVideos.length < 4 &&
                          Array.from({ length: 4 - previewVideos.length }).map((_, i) => (
                            <div key={`empty-${i}`} className="bg-muted" />
                          ))}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="font-semibold text-white text-lg">
                          {collection.name}
                        </h3>
                      </div>
                      <div className="absolute top-3 right-3">
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 text-white text-xs">
                          <Play className="h-3 w-3" />
                          {collectionVideos.length}
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {collection.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {collectionPages.slice(0, 3).map((page) => (
                            <div
                              key={page.id}
                              className="h-6 w-6 rounded-full border-2 border-background overflow-hidden"
                            >
                              <PlatformIcon platform={page.platform} size="sm" />
                            </div>
                          ))}
                          {collectionPages.length > 3 && (
                            <div className="h-6 w-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs">
                              +{collectionPages.length - 3}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {collectionPages.length} sources
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {filteredCollections.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No collections found</p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 text-center py-12 border-t border-border">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Want to create your own collections?
            </h2>
            <p className="text-muted-foreground mb-6">
              Sign up for free and start organizing your favorite content.
            </p>
            <Link to="/login">
              <Button size="lg" className="gap-2">
                Get Started
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
