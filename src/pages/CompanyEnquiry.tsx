import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Minus, Plus, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCompanyById } from "@/lib/companies";
import { listCatalogItems, listCategories } from "@/lib/catalog";
import { submitPublicEnquiry } from "@/lib/enquiries";
import { DEFAULT_GST_PERCENT, formatINR } from "@/lib/format";
import type { CatalogItem, CatalogType, Category, Company } from "@/types/database";

const MAX_QTY = 100000;

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
        {label}
        {required ? <span className="text-danger"> *</span> : <span className="text-muted"> (optional)</span>}
      </label>
      {children}
    </div>
  );
}

// Public, no-login page where a visitor sends an enquiry to ONE company.
// Share the URL: /c/<companyId>
export function CompanyEnquiry() {
  const { companyId } = useParams<{ companyId: string }>();

  const [company, setCompany] = useState<Company | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [type, setType] = useState<CatalogType>("product");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    Promise.all([getCompanyById(companyId), listCategories(companyId), listCatalogItems(companyId)])
      .then(([c, cats, catalogItems]) => {
        setCompany(c);
        setCategories(cats);
        setItems(catalogItems.filter((i) => i.is_active));
      })
      .catch(() => setCompany(null))
      .finally(() => setLoading(false));
  }, [companyId]);

  const categoriesById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const itemsForType = useMemo(() => items.filter((i) => i.type === type), [items, type]);
  const hasServices = items.some((i) => i.type === "service");
  const hasProducts = items.some((i) => i.type === "product");

  const selected = useMemo(
    () => items.filter((i) => (quantities[i.id] ?? 0) > 0),
    [items, quantities]
  );
  const subtotal = selected.reduce((sum, i) => sum + Number(i.price) * quantities[i.id], 0);
  const gst = (subtotal * DEFAULT_GST_PERCENT) / 100;
  const total = subtotal + gst;

  function setQty(id: string, value: number) {
    const qty = Math.max(0, Math.min(MAX_QTY, Math.floor(Number.isFinite(value) ? value : 0)));
    setQuantities((prev) => ({ ...prev, [id]: qty }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!company) return;
    setError(null);
    if (selected.length === 0) {
      setError("Please add at least one product or service.");
      return;
    }
    setSubmitting(true);
    try {
      await submitPublicEnquiry({
        companyId: company.id,
        name: name.trim(),
        companyName: companyName.trim() || undefined,
        phone: phone.trim(),
        location: location.trim(),
        deliveryDate,
        notes: notes.trim() || undefined,
        items: selected.map((i) => ({ catalogItemId: i.id, quantity: quantities[i.id] })),
      });
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  function resetForAnother() {
    setQuantities({});
    setNotes("");
    setError(null);
    setSent(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-cream">
        <p className="text-sm font-semibold text-muted">Loading…</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3 bg-cream px-4 text-center">
        <Store className="size-8 text-muted" />
        <p className="text-sm font-bold text-charcoal">Company not found</p>
        <p className="text-xs text-muted">Check the link you were given and try again.</p>
      </div>
    );
  }

  const header = (
    <div className="flex items-center gap-3.5">
      <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-black/5 bg-white p-1 shadow-soft">
        {company.logo_url ? (
          <img src={company.logo_url} alt={company.name} className="h-full w-full object-contain" />
        ) : (
          <Store className="size-6 text-gold-dark" />
        )}
      </div>
      <div className="min-w-0">
        <h1 className="truncate text-xl font-extrabold text-charcoal sm:text-2xl">{company.name}</h1>
        {company.description && (
          <p className="line-clamp-2 text-xs text-muted">{company.description}</p>
        )}
      </div>
    </div>
  );

  if (sent) {
    return (
      <div className="min-h-svh bg-cream px-4 py-8">
        <div className="mx-auto flex max-w-lg flex-col gap-6">
          {header}
          <div className="flex flex-col items-center gap-3 rounded-card border border-black/[0.03] bg-white p-8 text-center shadow-soft">
            <div className="flex size-12 items-center justify-center rounded-full bg-success-light text-success">
              <CheckCircle2 className="size-6" />
            </div>
            <p className="text-lg font-extrabold text-charcoal">Enquiry sent</p>
            <p className="text-sm text-muted">
              Thank you, {name.trim()}. {company.name} will get in touch on {phone.trim()} with a
              quotation.
            </p>
            <Button variant="secondary" className="mt-2" onClick={resetForAnother}>
              Send another enquiry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-cream px-4 py-6 sm:py-10">
      <form className="mx-auto flex max-w-2xl flex-col gap-6" onSubmit={handleSubmit}>
        {header}

        <section className="flex flex-col gap-4 rounded-card border border-black/[0.03] bg-white p-5 shadow-soft">
          <h2 className="text-sm font-bold text-charcoal">Your details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Name" required>
              <Input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
            </Field>
            <Field label="Company name">
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                autoComplete="organization"
              />
            </Field>
            <Field label="Number" required>
              <Input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                minLength={7}
                autoComplete="tel"
              />
            </Field>
            <Field label="Date of delivery" required>
              <Input
                type="date"
                value={deliveryDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDeliveryDate(e.target.value)}
                required
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Location" required>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Venue / delivery address"
                  required
                />
              </Field>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-card border border-black/[0.03] bg-white p-5 shadow-soft">
          <h2 className="text-sm font-bold text-charcoal">Products &amp; services</h2>

          {items.length === 0 ? (
            <p className="text-sm text-muted">This company hasn't listed anything yet.</p>
          ) : (
            <>
              {hasProducts && hasServices && (
                <Tabs value={type} onValueChange={(v) => setType(v as CatalogType)}>
                  <TabsList>
                    <TabsTrigger value="product">Product</TabsTrigger>
                    <TabsTrigger value="service">Service</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
              <div className="divide-y divide-cream-soft rounded-xl border border-cream-deep">
                {(hasProducts && hasServices ? itemsForType : items).map((item) => {
                  const qty = quantities[item.id] ?? 0;
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-charcoal">{item.name}</p>
                        <p className="text-xs text-muted">
                          {categoriesById.get(item.category_id)?.name ?? "Uncategorized"}
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-charcoal">
                          {formatINR(Number(item.price))}
                          {item.unit && (
                            <span className="text-xs font-medium text-muted"> / {item.unit}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setQty(item.id, qty - 1)}
                            disabled={qty === 0}
                            className="flex size-9 items-center justify-center rounded-lg bg-cream-soft text-charcoal-soft disabled:opacity-40"
                            aria-label={`Decrease ${item.name}`}
                          >
                            <Minus className="size-4" />
                          </button>
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            max={MAX_QTY}
                            value={qty === 0 ? "" : qty}
                            placeholder="0"
                            onChange={(e) => setQty(item.id, Number(e.target.value))}
                            className="h-9 w-16 text-center text-sm"
                            aria-label={`Quantity of ${item.name}`}
                          />
                          <button
                            type="button"
                            onClick={() => setQty(item.id, qty + 1)}
                            className="flex size-9 items-center justify-center rounded-lg bg-cream-soft text-charcoal-soft"
                            aria-label={`Increase ${item.name}`}
                          >
                            <Plus className="size-4" />
                          </button>
                        </div>
                        <span className="w-24 text-right text-sm font-semibold text-charcoal">
                          {qty > 0 ? formatINR(Number(item.price) * qty) : "—"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        <section className="flex flex-col gap-4 rounded-card border border-black/[0.03] bg-white p-5 shadow-soft">
          <Field label="Notes">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </Field>

          <div className="flex flex-col gap-2 border-t border-cream-deep pt-4 text-sm">
            <div className="flex justify-between text-charcoal-soft">
              <span>
                Subtotal · {selected.length} item{selected.length !== 1 ? "s" : ""}
              </span>
              <span className="font-semibold">{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-charcoal-soft">
              <span>GST ({DEFAULT_GST_PERCENT}%)</span>
              <span className="font-semibold">{formatINR(gst)}</span>
            </div>
            <div className="flex justify-between border-t border-cream-deep pt-2 text-base font-extrabold text-charcoal">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
            <p className="text-[11px] text-muted">
              Estimate at standard rates. {company.name} will confirm final pricing in a quotation.
            </p>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Sending…" : "Send Enquiry"}
          </Button>
          <p className="text-center text-xs text-muted">
            Are you the business owner?{" "}
            <Link to="/login" className="font-semibold text-gold-dark hover:underline">
              Sign in
            </Link>
          </p>
        </section>
      </form>
    </div>
  );
}
