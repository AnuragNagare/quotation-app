import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Pencil, Plus, Tag, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CatalogItemFormDialog } from "@/components/catalog/CatalogItemFormDialog";
import { useCompanies } from "@/context/CompanyContext";
import {
  createCatalogItem,
  createCategory,
  deleteCatalogItem,
  deleteCategory,
  listCatalogItems,
  listCategories,
  updateCatalogItem,
} from "@/lib/catalog";
import { formatINR } from "@/lib/format";
import type { CatalogItem, CatalogType, Category } from "@/types/database";

interface ToastAlert {
  id: string;
  title: string;
  message: string;
  type?: "success" | "info" | "warning";
}

export function Catalog() {
  const { companies, activeCompany, setActiveCompanyId } = useCompanies();

  const [type, setType] = useState<CatalogType>("product");
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);

  function addToast(title: string, message: string, type: ToastAlert["type"] = "success") {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }

  async function loadCatalog(companyId: string) {
    setLoading(true);
    try {
      const [cats, cItems] = await Promise.all([
        listCategories(companyId),
        listCatalogItems(companyId),
      ]);
      setCategories(cats);
      setItems(cItems);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (activeCompany) {
      loadCatalog(activeCompany.id);
      setSelectedCategoryId("all");
    } else {
      setCategories([]);
      setItems([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCompany?.id]);

  const categoriesForType = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  );

  const itemsForType = useMemo(
    () =>
      items.filter(
        (i) =>
          i.type === type &&
          (selectedCategoryId === "all" || i.category_id === selectedCategoryId)
      ),
    [items, type, selectedCategoryId]
  );

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!activeCompany || !newCategoryName.trim()) return;
    try {
      const category = await createCategory({
        companyId: activeCompany.id,
        type,
        name: newCategoryName.trim(),
      });
      setCategories((prev) => [...prev, category]);
      setNewCategoryName("");
      setCategoryDialogOpen(false);
      addToast("Category Added", `"${category.name}" created.`);
    } catch (err) {
      addToast("Couldn't Add Category", (err as Error).message, "warning");
    }
  }

  async function handleDeleteCategory(category: Category) {
    try {
      await deleteCategory(category.id);
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      setItems((prev) => prev.filter((i) => i.category_id !== category.id));
      if (selectedCategoryId === category.id) setSelectedCategoryId("all");
      addToast("Category Removed", `"${category.name}" and its items were deleted.`, "info");
    } catch (err) {
      addToast("Couldn't Delete Category", (err as Error).message, "warning");
    }
  }

  async function handleSaveItem(input: {
    name: string;
    categoryId: string;
    description: string;
    price: number;
    unit: string;
    isActive: boolean;
  }) {
    if (!activeCompany) return;
    try {
      if (editingItem) {
        const updated = await updateCatalogItem(editingItem.id, {
          name: input.name,
          category_id: input.categoryId,
          description: input.description || null,
          price: input.price,
          unit: input.unit || null,
          is_active: input.isActive,
        });
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
        addToast("Item Updated", `${updated.name} saved.`);
      } else {
        const created = await createCatalogItem({
          companyId: activeCompany.id,
          categoryId: input.categoryId,
          type,
          name: input.name,
          description: input.description,
          price: input.price,
          unit: input.unit,
        });
        setItems((prev) => [created, ...prev]);
        addToast("Item Added", `${created.name} added to the catalog.`);
      }
    } catch (err) {
      addToast("Couldn't Save Item", (err as Error).message, "warning");
    }
  }

  async function handleDeleteItem(item: CatalogItem) {
    try {
      await deleteCatalogItem(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      addToast("Item Removed", `${item.name} deleted from the catalog.`, "info");
    } catch (err) {
      addToast("Couldn't Delete Item", (err as Error).message, "warning");
    }
  }

  if (!activeCompany) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-cream-deep bg-white p-12 text-center">
        <Tag className="size-8 text-muted" />
        <p className="text-sm font-bold text-charcoal">No company selected</p>
        <p className="max-w-sm text-xs text-muted">
          {companies.length === 0
            ? "Create a company first, then come back to build its catalog."
            : "Choose a company to manage its catalog."}
        </p>
        <Button asChild className="mt-2">
          <Link to="/companies">Go to Companies</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="fixed right-6 top-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-in slide-in-from-top-4 fade-in flex max-w-sm items-start gap-3 rounded-2xl border border-black/[0.04] bg-white p-4 shadow-soft-lg duration-300"
          >
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                t.type === "warning"
                  ? "bg-warning-light text-warning"
                  : t.type === "info"
                  ? "bg-info-light text-info"
                  : "bg-success-light text-success"
              }`}
            >
              <CheckCircle2 className="size-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-extrabold text-charcoal">{t.title}</p>
              <p className="mt-0.5 text-xs text-charcoal-soft">{t.message}</p>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="p-1 text-muted transition-colors hover:text-charcoal"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-charcoal sm:text-3xl">Catalog</h1>
          <p className="mt-1 text-sm text-muted">
            Managing <span className="font-semibold text-charcoal">{activeCompany.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {companies.length > 1 && (
            <Select value={activeCompany.id} onValueChange={setActiveCompanyId}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            size="lg"
            onClick={() => {
              setEditingItem(null);
              setItemDialogOpen(true);
            }}
            disabled={categoriesForType.length === 0}
          >
            <Plus className="size-4" />
            New Item
          </Button>
        </div>
      </div>

      <Tabs value={type} onValueChange={(v) => setType(v as CatalogType)}>
        <TabsList>
          <TabsTrigger value="product">Product</TabsTrigger>
          <TabsTrigger value="service">Service</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedCategoryId("all")}
          className={`rounded-pill px-3 py-1.5 text-xs font-semibold transition-colors ${
            selectedCategoryId === "all"
              ? "bg-gold text-white"
              : "bg-cream-soft text-charcoal-soft hover:bg-cream-deep"
          }`}
        >
          All Categories
        </button>
        {categoriesForType.map((c) => (
          <div
            key={c.id}
            className={`group flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-xs font-semibold transition-colors ${
              selectedCategoryId === c.id
                ? "bg-gold text-white"
                : "bg-cream-soft text-charcoal-soft hover:bg-cream-deep"
            }`}
          >
            <button onClick={() => setSelectedCategoryId(c.id)}>{c.name}</button>
            <button
              onClick={() => handleDeleteCategory(c)}
              aria-label={`Delete ${c.name}`}
              className="opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
        <button
          onClick={() => setCategoryDialogOpen(true)}
          className="flex items-center gap-1 rounded-pill border border-dashed border-cream-deep px-3 py-1.5 text-xs font-semibold text-muted hover:border-gold hover:text-gold-dark"
        >
          <Plus className="size-3.5" />
          Category
        </button>
      </div>

      {loading ? (
        <p className="text-sm font-semibold text-muted">Loading catalog…</p>
      ) : categoriesForType.length === 0 ? (
        <div className="rounded-card border border-dashed border-cream-deep bg-white p-10 text-center">
          <p className="text-sm font-bold text-charcoal">
            No {type} categories yet
          </p>
          <p className="mt-1 text-xs text-muted">
            Add a category before creating {type} items.
          </p>
          <Button className="mt-4" size="sm" onClick={() => setCategoryDialogOpen(true)}>
            <Plus className="size-4" />
            New Category
          </Button>
        </div>
      ) : itemsForType.length === 0 ? (
        <div className="rounded-card border border-dashed border-cream-deep bg-white p-10 text-center">
          <p className="text-sm font-bold text-charcoal">No items yet</p>
          <p className="mt-1 text-xs text-muted">Add your first {type} item.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-black/[0.03] bg-white shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream-soft text-xs font-semibold text-charcoal-soft">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03]">
              {itemsForType.map((item) => {
                const category = categories.find((c) => c.id === item.category_id);
                return (
                  <tr key={item.id}>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-charcoal">{item.name}</p>
                      {item.description && (
                        <p className="line-clamp-1 text-xs text-muted">{item.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs text-charcoal-soft">
                      {category?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3 font-semibold text-charcoal">
                      {formatINR(item.price)}
                      {item.unit && <span className="text-xs text-muted"> / {item.unit}</span>}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={item.is_active ? "success" : "default"}>
                        {item.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setItemDialogOpen(true);
                          }}
                          className="flex size-8 items-center justify-center rounded-lg text-charcoal-soft hover:bg-cream-soft"
                          aria-label={`Edit ${item.name}`}
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="flex size-8 items-center justify-center rounded-lg text-danger hover:bg-danger-light"
                          aria-label={`Delete ${item.name}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New {type === "product" ? "Product" : "Service"} Category</DialogTitle>
          </DialogHeader>
          <form className="mt-4 flex flex-col gap-4" onSubmit={handleCreateCategory}>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
                Category name
              </label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Speakers, Photography"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setCategoryDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Category</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <CatalogItemFormDialog
        open={itemDialogOpen}
        onOpenChange={setItemDialogOpen}
        editingItem={editingItem}
        categories={categoriesForType}
        defaultCategoryId={selectedCategoryId !== "all" ? selectedCategoryId : undefined}
        onSave={handleSaveItem}
      />
    </div>
  );
}
