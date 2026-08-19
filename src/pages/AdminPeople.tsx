import { useEffect, useState } from "react";
import { Pencil, Trash2, UserRound } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditProfileDialog } from "@/components/admin/EditProfileDialog";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { adminDeleteProfile, adminUpdateProfile, listProfilesByRole } from "@/lib/admin";
import type { Profile } from "@/types/database";

type Segment = "client" | "business_user";

export function AdminPeople() {
  const [segment, setSegment] = useState<Segment>("client");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const [editTarget, setEditTarget] = useState<Profile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);

  async function load(seg: Segment) {
    setLoading(true);
    try {
      setProfiles(await listProfilesByRole(seg));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(segment);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segment]);

  async function handleSaveEdit(patch: { full_name: string; phone: string }) {
    if (!editTarget) return;
    const updated = await adminUpdateProfile(editTarget.id, patch);
    setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await adminDeleteProfile(deleteTarget.id);
    setProfiles((prev) => prev.filter((p) => p.id !== deleteTarget.id));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-charcoal sm:text-3xl">People</h1>
        <p className="mt-1 text-sm text-muted">
          Edit profiles or remove accounts. Enquiry and quote content is not editable here.
        </p>
      </div>

      <Tabs value={segment} onValueChange={(v) => setSegment(v as Segment)}>
        <TabsList>
          <TabsTrigger value="client">Clients</TabsTrigger>
          <TabsTrigger value="business_user">Business Users</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <p className="text-sm font-semibold text-muted">Loading…</p>
      ) : profiles.length === 0 ? (
        <div className="rounded-card border border-dashed border-cream-deep bg-white p-10 text-center">
          <UserRound className="mx-auto mb-3 size-8 text-muted" />
          <p className="text-sm font-bold text-charcoal">No {segment === "client" ? "clients" : "business users"} yet</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-black/[0.03] bg-white shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream-soft text-xs font-semibold text-charcoal-soft">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03]">
              {profiles.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3 font-semibold text-charcoal">
                    {p.full_name || "Unnamed"}
                  </td>
                  <td className="px-5 py-3 text-charcoal-soft">{p.email}</td>
                  <td className="px-5 py-3 text-charcoal-soft">{p.phone || "—"}</td>
                  <td className="px-5 py-3 text-charcoal-soft">
                    {new Date(p.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditTarget(p)}
                        className="flex size-8 items-center justify-center rounded-lg text-charcoal-soft hover:bg-cream-soft"
                        aria-label={`Edit ${p.full_name}`}
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="flex size-8 items-center justify-center rounded-lg text-danger hover:bg-danger-light"
                        aria-label={`Delete ${p.full_name}`}
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

      <EditProfileDialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        profile={editTarget}
        onSave={handleSaveEdit}
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.full_name || "this account"}?`}
        description={
          segment === "business_user"
            ? "This also deletes their companies, catalogs, and quotes. This cannot be undone."
            : "This also deletes their enquiries. This cannot be undone."
        }
        onConfirm={handleDelete}
      />
    </div>
  );
}
