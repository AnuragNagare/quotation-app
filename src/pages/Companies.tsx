import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, CheckCircle2, Plus, Store, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCompanies } from "@/context/CompanyContext";
import { deleteCompany } from "@/lib/companies";

interface ToastAlert {
  id: string;
  title: string;
  message: string;
  type?: "success" | "info" | "warning";
}

export function Companies() {
  const navigate = useNavigate();
  const { companies, activeCompany, setActiveCompanyId, loading, refresh, createCompany } =
    useCompanies();

  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  function addToast(title: string, message: string, type: ToastAlert["type"] = "success") {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const company = await createCompany(name.trim(), description.trim());
      addToast("Company Created", `${company.name} is ready — start building its catalog.`);
      setFormOpen(false);
      setName("");
      setDescription("");
    } catch (err) {
      addToast("Couldn't Create Company", (err as Error).message, "warning");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, companyName: string) {
    try {
      await deleteCompany(id);
      await refresh();
      addToast("Company Removed", `${companyName} and its catalog have been deleted.`, "info");
    } catch (err) {
      addToast("Couldn't Delete Company", (err as Error).message, "warning");
    }
  }

  function openCatalog(id: string) {
    setActiveCompanyId(id);
    navigate("/catalog");
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
          <h1 className="text-2xl font-extrabold text-charcoal sm:text-3xl">Your Companies</h1>
          <p className="mt-1 text-sm text-muted">
            Each company gets its own isolated catalog and client pool.
          </p>
        </div>
        <Button size="lg" onClick={() => setFormOpen(true)}>
          <Plus className="size-4" />
          New Company
        </Button>
      </div>

      {loading && companies.length === 0 ? (
        <p className="text-sm font-semibold text-muted">Loading companies…</p>
      ) : companies.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-cream-deep bg-white p-12 text-center">
          <Building2 className="size-8 text-muted" />
          <p className="text-sm font-bold text-charcoal">No companies yet</p>
          <p className="max-w-sm text-xs text-muted">
            Create your first company to start building a product/service catalog.
          </p>
          <Button className="mt-2" onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            New Company
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <div
              key={company.id}
              className="flex flex-col gap-4 rounded-card border border-black/[0.03] bg-white p-5 shadow-soft"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gold-light text-gold-dark">
                  <Store className="size-5" />
                </div>
                {activeCompany?.id === company.id && <Badge variant="gold">Active</Badge>}
              </div>
              <div>
                <p className="text-base font-bold text-charcoal">{company.name}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted">
                  {company.description || "No description yet."}
                </p>
              </div>
              <div className="mt-auto flex items-center gap-2">
                <Button size="sm" className="flex-1" onClick={() => openCatalog(company.id)}>
                  Open Catalog
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-danger"
                  onClick={() => handleDelete(company.id, company.name)}
                  aria-label={`Delete ${company.name}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Company</DialogTitle>
          </DialogHeader>
          <form className="mt-4 flex flex-col gap-4" onSubmit={handleCreate}>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
                Company name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Roxy Audio Rentals"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
                Description (optional)
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What this company sells or offers"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating…" : "Create Company"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
