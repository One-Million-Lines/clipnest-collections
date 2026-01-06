import { useState } from "react";
import { Plus, MoreVertical, Pencil, Trash2, Globe } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Page, Platform, platformLabels } from "@/data/mockData";
import { AppLayout } from "@/components/layout/AppLayout";
import { PlatformIcon } from "@/components/video/PlatformIcon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface PageFormData {
  name: string;
  platform: Platform;
  tagIds: string[];
  collectionIds: string[];
  thumbnail: string;
}

const defaultFormData: PageFormData = {
  name: "",
  platform: "youtube",
  tagIds: [],
  collectionIds: [],
  thumbnail: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=200&h=200&fit=crop",
};

export default function Pages() {
  const { pages, tags, collections, addPage, updatePage, deletePage } = useData();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [formData, setFormData] = useState<PageFormData>(defaultFormData);

  const handleCreate = () => {
    setFormData(defaultFormData);
    setIsCreateOpen(true);
  };

  const handleEdit = (page: Page) => {
    setFormData({
      name: page.name,
      platform: page.platform,
      tagIds: page.tagIds,
      collectionIds: page.collectionIds,
      thumbnail: page.thumbnail,
    });
    setEditingPage(page);
  };

  const handleSave = () => {
    if (editingPage) {
      updatePage(editingPage.id, formData);
      setEditingPage(null);
    } else {
      addPage(formData);
      setIsCreateOpen(false);
    }
    setFormData(defaultFormData);
  };

  const handleDelete = (id: string) => {
    deletePage(id);
  };

  const toggleTag = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  const toggleCollection = (collectionId: string) => {
    setFormData((prev) => ({
      ...prev,
      collectionIds: prev.collectionIds.includes(collectionId)
        ? prev.collectionIds.filter((id) => id !== collectionId)
        : [...prev.collectionIds, collectionId],
    }));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Followed Pages</h1>
            <p className="text-muted-foreground">
              Manage your content sources
            </p>
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Page
          </Button>
        </div>

        {pages.length > 0 ? (
          <div className="space-y-3">
            {pages.map((page) => {
              const pageTags = tags.filter((t) => page.tagIds.includes(t.id));
              const pageCollections = collections.filter((c) =>
                page.collectionIds.includes(c.id)
              );

              return (
                <Card key={page.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={page.thumbnail}
                        alt={page.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <PlatformIcon platform={page.platform} className="h-5 w-5" />
                          <h3 className="font-medium truncate">{page.name}</h3>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {pageTags.map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="outline"
                              className="text-xs"
                              style={{ borderColor: tag.color, color: tag.color }}
                            >
                              {tag.name}
                            </Badge>
                          ))}
                          {pageCollections.map((col) => (
                            <Badge
                              key={col.id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {col.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(page)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(page.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No pages followed yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add pages to start collecting videos
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateOpen || !!editingPage}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingPage(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPage ? "Edit Page" : "Add Page"}
            </DialogTitle>
            <DialogDescription>
              {editingPage
                ? "Update page settings"
                : "Follow a new page to collect its videos"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Page Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Daily German Lessons"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={formData.platform}
                onValueChange={(value: Platform) =>
                  setFormData({ ...formData, platform: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <label
                    key={tag.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={formData.tagIds.includes(tag.id)}
                      onCheckedChange={() => toggleTag(tag.id)}
                    />
                    <span className="text-sm">{tag.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Collections</Label>
              <div className="flex flex-wrap gap-2">
                {collections.map((col) => (
                  <label
                    key={col.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={formData.collectionIds.includes(col.id)}
                      onCheckedChange={() => toggleCollection(col.id)}
                    />
                    <span className="text-sm">{col.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingPage(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.name}>
              {editingPage ? "Save Changes" : "Add Page"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
