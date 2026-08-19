import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CatalogItem, Category } from "@/types/database";

interface CatalogItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: CatalogItem | null;
  categories: Category[];
  defaultCategoryId?: string;
  onSave: (input: {
    name: string;
    categoryId: string;
    description: string;
    price: number;
    unit: string;
    isActive: boolean;
  }) => Promise<void>;
}

export function CatalogItemFormDialog({
  open,
  onOpenChange,
  editingItem,
  categories,
  defaultCategoryId,
  onSave,
}: CatalogItemFormDialogProps) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [unit, setUnit] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(editingItem?.name ?? "");
    setCategoryId(editingItem?.category_id ?? defaultCategoryId ?? categories[0]?.id ?? "");
    setDescription(editingItem?.description ?? "");
    setPrice(String(editingItem?.price ?? 0));
    setUnit(editingItem?.unit ?? "");
    setIsActive(editingItem?.is_active ?? true);
  }, [open, editingItem, defaultCategoryId, categories]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId) return;
    setSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        categoryId,
        description: description.trim(),
        price: Number(price) || 0,
        unit: unit.trim(),
        isActive,
      });
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingItem ? "Edit Item" : "New Catalog Item"}</DialogTitle>
        </DialogHeader>
        <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
              Category
            </label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {categories.length === 0 && (
              <p className="mt-1.5 text-xs text-danger">
                Create a category for this type first.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
                Price (₹)
              </label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
                Unit (optional)
              </label>
              <Input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. per day"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
              Description (optional)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-cream-soft px-3.5 py-2.5">
            <span className="text-xs font-semibold text-charcoal-soft">
              Active (visible to clients)
            </span>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !categoryId}>
              {submitting ? "Saving…" : editingItem ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
