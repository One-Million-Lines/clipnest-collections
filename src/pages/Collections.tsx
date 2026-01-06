import { useState } from "react";
import { Plus, MoreVertical, Pencil, Trash2, FolderOpen } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Collection, Video } from "@/data/mockData";
import { AppLayout } from "@/components/layout/AppLayout";
import { VideoCard } from "@/components/video/VideoCard";
import { VideoModal } from "@/components/video/VideoModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Collections() {
  const { collections, pages, videos, addCollection, updateCollection, deleteCollection } = useData();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [viewingCollection, setViewingCollection] = useState<Collection | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const getCollectionPageCount = (collectionId: string) => {
    return pages.filter((p) => p.collectionIds.includes(collectionId)).length;
  };

  const getCollectionVideos = (collectionId: string) => {
    const pageIds = pages
      .filter((p) => p.collectionIds.includes(collectionId))
      .map((p) => p.id);
    return videos.filter((v) => pageIds.includes(v.pageId));
  };

  const handleCreate = () => {
    setFormData({ name: "", description: "" });
    setIsCreateOpen(true);
  };

  const handleEdit = (collection: Collection) => {
    setFormData({ name: collection.name, description: collection.description });
    setEditingCollection(collection);
  };

  const handleSave = () => {
    if (editingCollection) {
      updateCollection(editingCollection.id, formData);
      setEditingCollection(null);
    } else {
      addCollection({
        ...formData,
        thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop",
      });
      setIsCreateOpen(false);
    }
    setFormData({ name: "", description: "" });
  };

  const handleDelete = (id: string) => {
    deleteCollection(id);
  };

  if (viewingCollection) {
    const collectionVideos = getCollectionVideos(viewingCollection.id);
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setViewingCollection(null)}
              className="gap-2"
            >
              ← Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {viewingCollection.name}
              </h1>
              <p className="text-muted-foreground">
                {viewingCollection.description}
              </p>
            </div>
          </div>

          {collectionVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {collectionVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onWatch={setSelectedVideo}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No videos in this collection yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add pages to this collection to see their videos here
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Collections</h1>
            <p className="text-muted-foreground">
              Organize your content by intent
            </p>
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            New Collection
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <Card
              key={collection.id}
              className="group cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setViewingCollection(collection)}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
                <img
                  src={collection.thumbnail}
                  alt={collection.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(collection);
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(collection.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{collection.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {collection.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {getCollectionPageCount(collection.id)} pages
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateOpen || !!editingCollection}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingCollection(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCollection ? "Edit Collection" : "Create Collection"}
            </DialogTitle>
            <DialogDescription>
              {editingCollection
                ? "Update your collection details"
                : "Create a new collection to organize your content"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Learn Spanish"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="What's this collection for?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingCollection(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.name}>
              {editingCollection ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
