import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { createClient, deleteClient, listClients, updateClient } from "@/lib/clients";
import type { Client } from "@/types/database";

export function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Client | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

  useEffect(() => {
    listClients()
      .then(setClients)
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditTarget(null);
    setFullName("");
    setEmail("");
    setPhone("");
    setError(null);
    setFormOpen(true);
  }

  function openEdit(client: Client) {
    setEditTarget(client);
    setFullName(client.full_name);
    setEmail(client.email ?? "");
    setPhone(client.phone ?? "");
    setError(null);
    setFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (editTarget) {
        const updated = await updateClient(editTarget.id, {
          full_name: fullName.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
        });
        setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const created = await createClient({
          fullName: fullName.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
        });
        setClients((prev) => [created, ...prev]);
      }
      setFormOpen(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteClient(deleteTarget.id);
    setClients((prev) => prev.filter((c) => c.id !== deleteTarget.id));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-charcoal sm:text-3xl">Clients</h1>
          <p className="mt-1 text-sm text-muted">
            Contacts that enquiries are raised for — added here or automatically when an open
            user submits an enquiry on the marketplace.
          </p>
        </div>
        <Button size="lg" onClick={openCreate}>
          <Plus className="size-4" />
          Add Client
        </Button>
      </div>

      {loading ? (
        <p className="text-sm font-semibold text-muted">Loading clients…</p>
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-cream-deep bg-white p-12 text-center">
          <UserRound className="size-8 text-muted" />
          <p className="text-sm font-bold text-charcoal">No clients yet</p>
          <p className="max-w-sm text-xs text-muted">
            Add a client here, or they'll appear automatically when someone submits a
            marketplace enquiry.
          </p>
          <Button className="mt-2" onClick={openCreate}>
            <Plus className="size-4" />
            Add Client
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-black/[0.03] bg-white shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream-soft text-xs font-semibold text-charcoal-soft">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Added</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03]">
              {clients.map((client) => (
                <tr key={client.id}>
                  <td className="px-5 py-3 font-semibold text-charcoal">{client.full_name}</td>
                  <td className="px-5 py-3 text-charcoal-soft">{client.email || "—"}</td>
                  <td className="px-5 py-3 text-charcoal-soft">{client.phone || "—"}</td>
                  <td className="px-5 py-3 text-charcoal-soft">
                    {new Date(client.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(client)}
                        className="flex size-8 items-center justify-center rounded-lg text-charcoal-soft hover:bg-cream-soft"
                        aria-label={`Edit ${client.full_name}`}
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(client)}
                        className="flex size-8 items-center justify-center rounded-lg text-danger hover:bg-danger-light"
                        aria-label={`Delete ${client.full_name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Client" : "Add Client"}</DialogTitle>
          </DialogHeader>
          {error && (
            <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
              {error}
            </p>
          )}
          <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
                Full name
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Client's name"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
                Email (optional)
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
                Phone (optional)
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91…"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving…" : editTarget ? "Save Changes" : "Add Client"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={`Delete "${deleteTarget?.full_name}"?`}
        description="This permanently deletes the client along with all of their enquiries and quotes. This cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  );
}
