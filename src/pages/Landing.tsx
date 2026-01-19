import { ArrowRight, Play, FolderOpen, Tags, Zap, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { mockCollections, mockVideos, mockPages } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlatformIcon } from "@/components/video/PlatformIcon";

const features = [
  {
    icon: FolderOpen,
    title: "Organize Your Way",
    description: "Create custom collections that match how you think. Learning German? Building a business? Keep it all sorted.",
  },
  {
    icon: Tags,
    title: "Smart Tagging",
    description: "Tag your sources however you want. Filter instantly across platforms and topics.",
  },
  {
    icon: Zap,
    title: "No Algorithms",
    description: "Watch what YOU chose to follow. No recommendations, no distractions, just your content.",
  },
  {
    icon: Shield,
    title: "Your Space",
    description: "Private by default. Curate your content library without the social noise.",
  },
];

export default function Landing() {
  const featuredCollections = mockCollections.slice(0, 3);
  const featuredVideos = mockVideos.slice(0, 6);

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

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-6">
            <Sparkles className="h-3 w-3 mr-1" />
            Watch on your terms. 
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 max-w-3xl mx-auto leading-tight">
            Your personal library for short videos
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Collect YouTube Shorts, Facebook Reels, and TikToks from your favorite creators. 
            Organize them your way. No algorithms, no distractions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="gap-2">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/explore">
              <Button size="lg" variant="outline" className="gap-2">
                <Play className="h-4 w-4" />
                Explore Collections
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Discover Collections
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Browse curated collections from the community. Find inspiration or dive straight into learning.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {featuredCollections.map((collection) => {
              const collectionPages = mockPages.filter((p) =>
                p.collectionIds.includes(collection.id)
              );
              const collectionVideos = mockVideos.filter((v) =>
                collectionPages.some((p) => p.id === v.pageId)
              );
              const previewVideo = collectionVideos[0];

              return (
                <Link key={collection.id} to={`/explore/${collection.id}`}>
                  <Card className="group overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full">
                    <div className="aspect-video relative overflow-hidden bg-muted">
                      {previewVideo && (
                        <img
                          src={previewVideo.thumbnail}
                          alt={collection.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="font-semibold text-white text-lg">
                          {collection.name}
                        </h3>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {collection.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {collectionPages.length} pages
                        </span>
                        <span className="text-muted-foreground">
                          {collectionVideos.length} videos
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Link to="/explore">
              <Button variant="outline" className="gap-2">
                View All Collections
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why ClipNest?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Take back control of your content consumption. Build a library that serves you.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center p-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Videos */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Fresh Content Daily
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Your followed pages, all in one place. No more jumping between apps.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
            {featuredVideos.map((video) => {
              const page = mockPages.find((p) => p.id === video.pageId);
              return (
                <div key={video.id} className="group cursor-pointer">
                  <div className="aspect-[9/16] relative overflow-hidden rounded-lg bg-muted">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute top-2 left-2">
                      {page && <PlatformIcon platform={page.platform} size="sm" />}
                    </div>
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded">
                      {video.duration}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {video.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to build your video library?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of users who've taken control of their content. Free to start.
          </p>
          <Link to="/login">
            <Button size="lg" className="gap-2">
              Create Your Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-accent-foreground font-bold text-sm">
              C
            </div>
            <span className="font-medium">ClipNest</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 ClipNest. Watch on your terms. by Alex Rada for <a href="https://onemillionlines.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OneMillionLines</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
