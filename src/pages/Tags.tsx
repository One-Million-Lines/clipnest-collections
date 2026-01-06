import { useState } from "react";
import { Plus, Pencil, Trash2, Tags as TagsIcon } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { AppLayout } from "@/components/layout/AppLayout";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const tagColors = [
  "hsl(205, 80%, 55%)",
  "hsl(280, 60%, 55%)",
  "hsl(145, 60%, 42%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 72%, 51%)",
  "hsl(25, 80%, 50%)",
  "hsl(200, 70%, 45%)",
  "hsl(260, 50%, 50%)",
];

export default function Tags() {
  const { tags, pages, addTag, updateTag, deleteTag } = useData();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<{ id: string; name: string } | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(tagColors[0]);

  const getTagPageCount = (tagId: string) => {
    return pages.filter((p) => p.tagIds.includes(tagId)).length;
  };

  const handleCreate = () => {
    if (newTagName.trim()) {
      addTag(newTagName.trim(), selectedColor);
      setNewTagName("");
      setSelectedColor(tagColors[Math.floor(Math.random() * tagColors.length)]);
      setIsCreateOpen(false);
    }
  };

  const handleUpdate = () => {
    if (editingTag && editingTag.name.trim()) {
      updateTag(editingTag.id, editingTag.name.trim());
      setEditingTag(null);
    }
  };

  const handleDelete = (id: string) => {
    deleteTag(id);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tags</h1>
            <p className="text-muted-foreground">
              Label your pages for easy filtering
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Tag
          </Button>
        </div>

        {tags.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tags.map((tag) => (
              <Card key={tag.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <div>
                        <p className="font-medium">{tag.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {getTagPageCount(tag.id)} pages
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          setEditingTag({ id: tag.id, name: tag.name })
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(tag.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <TagsIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No tags created yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create tags to categorize your pages
            </p>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Tag</DialogTitle>
            <DialogDescription>
              Add a new tag to categorize your pages
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tagName">Tag Name</Label>
              <Input
                id="tagName"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="e.g., Productivity"
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {tagColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`h-8 w-8 rounded-full transition-transform ${
                      selectedColor === color
                        ? "ring-2 ring-offset-2 ring-accent scale-110"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newTagName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingTag} onOpenChange={(open) => !open && setEditingTag(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Tag</DialogTitle>
            <DialogDescription>Enter a new name for this tag</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="editTagName">Tag Name</Label>
            <Input
              id="editTagName"
              value={editingTag?.name || ""}
              onChange={(e) =>
                setEditingTag((prev) =>
                  prev ? { ...prev, name: e.target.value } : null
                )
              }
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTag(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={!editingTag?.name.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
