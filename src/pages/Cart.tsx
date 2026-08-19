import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";

export function Cart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, totalAmount } = useCart();

  const groupedByCompany = useMemo(() => {
    const groups = new Map<string, { companyName: string; items: typeof items }>();
    for (const item of items) {
      if (!groups.has(item.companyId)) {
        groups.set(item.companyId, { companyName: item.companyName, items: [] });
      }
      groups.get(item.companyId)!.items.push(item);
    }
    return [...groups.entries()];
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-cream-deep bg-white p-12 text-center">
        <ShoppingCart className="size-8 text-muted" />
        <p className="text-sm font-bold text-charcoal">Your cart is empty</p>
        <Button asChild className="mt-2">
          <Link to="/marketplace">Browse the Marketplace</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-charcoal sm:text-3xl">Your Enquiry Cart</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {groupedByCompany.map(([companyId, group]) => (
            <div
              key={companyId}
              className="overflow-hidden rounded-card border border-black/[0.03] bg-white shadow-soft"
            >
              <div className="border-b border-black/[0.03] bg-cream-soft px-5 py-3">
                <p className="text-sm font-bold text-charcoal">{group.companyName}</p>
              </div>
              <div className="divide-y divide-black/[0.03]">
                {group.items.map((item) => (
                  <div key={item.catalogItemId} className="flex items-center gap-4 px-5 py-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-charcoal">{item.name}</p>
                      <p className="text-xs text-muted">
                        {formatINR(item.price)}
                        {item.unit && ` / ${item.unit}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.catalogItemId, item.quantity - 1)}
                        className="flex size-7 items-center justify-center rounded-lg bg-cream-soft text-charcoal-soft hover:bg-cream-deep"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold text-charcoal">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.catalogItemId, item.quantity + 1)}
                        className="flex size-7 items-center justify-center rounded-lg bg-cream-soft text-charcoal-soft hover:bg-cream-deep"
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <p className="w-24 text-right text-sm font-bold text-charcoal">
                      {formatINR(item.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeItem(item.catalogItemId)}
                      className="flex size-8 items-center justify-center rounded-lg text-danger hover:bg-danger-light"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-card border border-black/[0.03] bg-white p-5 shadow-soft">
          <p className="text-sm font-bold text-charcoal">Summary</p>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted">Estimated total</span>
            <span className="font-extrabold text-charcoal">{formatINR(totalAmount)}</span>
          </div>
          <p className="mt-1 text-xs text-muted">
            Final pricing is confirmed by each company on their quote.
          </p>
          <Button size="lg" className="mt-5 w-full" onClick={() => navigate("/checkout")}>
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
