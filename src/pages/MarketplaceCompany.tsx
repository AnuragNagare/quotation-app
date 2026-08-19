import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCompanyById } from "@/lib/companies";
import { listCatalogItems, listCategories } from "@/lib/catalog";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";
import type { CatalogItem, CatalogType, Category, Company } from "@/types/database";

export function MarketplaceCompany() {
  const { companyId } = useParams<{ companyId: string }>();
  const { addItem, items: cartItems } = useCart();

  const [company, setCompany] = useState<Company | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [type, setType] = useState<CatalogType>("product");
  const [loading, setLoading] = useState(true);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    Promise.all([getCompanyById(companyId), listCategories(companyId), listCatalogItems(companyId)])
      .then(([c, cats, catalogItems]) => {
        setCompany(c);
        setCategories(cats);
        setItems(catalogItems.filter((i) => i.is_active));
      })
      .finally(() => setLoading(false));
  }, [companyId]);

  const itemsForType = useMemo(() => items.filter((i) => i.type === type), [items, type]);
  const categoriesById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  function handleAddToCart(item: CatalogItem) {
    if (!company) return;
    addItem({
      catalogItemId: item.id,
      companyId: company.id,
      companyName: company.name,
      name: item.name,
      price: item.price,
      unit: item.unit,
    });
    setJustAddedId(item.id);
    setTimeout(() => setJustAddedId(null), 1500);
  }

  if (loading) {
    return <p className="text-sm font-semibold text-muted">Loading catalog…</p>;
  }

  if (!company) {
    return (
      <div className="rounded-card border border-dashed border-cream-deep bg-white p-12 text-center">
        <p className="text-sm font-bold text-charcoal">Company not found</p>
        <Button asChild className="mt-4" size="sm">
          <Link to="/marketplace">Back to Marketplace</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/marketplace"
        className="flex w-fit items-center gap-1.5 text-xs font-semibold text-muted hover:text-charcoal"
      >
        <ArrowLeft className="size-3.5" />
        All Companies
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold text-charcoal sm:text-3xl">{company.name}</h1>
        {company.description && <p className="mt-1 text-sm text-muted">{company.description}</p>}
      </div>

      <Tabs value={type} onValueChange={(v) => setType(v as CatalogType)}>
        <TabsList>
          <TabsTrigger value="product">Product</TabsTrigger>
          <TabsTrigger value="service">Service</TabsTrigger>
        </TabsList>
      </Tabs>

      {itemsForType.length === 0 ? (
        <div className="rounded-card border border-dashed border-cream-deep bg-white p-10 text-center">
          <p className="text-sm font-bold text-charcoal">No {type} items yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {itemsForType.map((item) => {
            const inCart = cartItems.some((c) => c.catalogItemId === item.id);
            const justAdded = justAddedId === item.id;
            return (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-card border border-black/[0.03] bg-white p-5 shadow-soft"
              >
                <div>
                  <p className="text-xs font-semibold text-muted">
                    {categoriesById.get(item.category_id)?.name ?? "Uncategorized"}
                  </p>
                  <p className="mt-0.5 text-base font-bold text-charcoal">{item.name}</p>
                  {item.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted">{item.description}</p>
                  )}
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <p className="text-base font-extrabold text-charcoal">
                    {formatINR(item.price)}
                    {item.unit && <span className="text-xs font-medium text-muted"> / {item.unit}</span>}
                  </p>
                  <Button size="sm" variant={inCart ? "secondary" : "default"} onClick={() => handleAddToCart(item)}>
                    {justAdded ? <Check className="size-4" /> : <Plus className="size-4" />}
                    {inCart ? "Add More" : "Add"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
