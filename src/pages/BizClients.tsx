import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, UserRound, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCompanies } from "@/context/CompanyContext";
import { listClientsForCompany, type ClientSummary } from "@/lib/clients";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Avatar({ client }: { client: ClientSummary }) {
  return client.avatar_url ? (
    <img
      src={client.avatar_url}
      alt={client.full_name}
      className="size-10 shrink-0 rounded-lg border border-black/5 bg-white object-contain p-0.5"
    />
  ) : (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-cream-soft text-muted">
      <UserRound className="size-5" />
    </div>
  );
}

export function BizClients() {
  const { activeCompany, companies } = useCompanies();

  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!activeCompany) return;
    setLoading(true);
    setError(null);
    listClientsForCompany(activeCompany.id)
      .then(setClients)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCompany?.id]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.full_name.toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.phone ?? "").toLowerCase().includes(q)
    );
  }, [clients, query]);

  if (!activeCompany) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-cream-deep bg-white p-12 text-center">
        <Users className="size-8 text-muted" />
        <p className="text-sm font-bold text-charcoal">No company selected</p>
        <p className="max-w-sm text-xs text-muted">
          {companies.length === 0
            ? "Create a company first to start receiving clients."
            : "Choose a company to view its clients."}
        </p>
        <Button asChild className="mt-2">
          <Link to="/companies">Go to Companies</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-charcoal sm:text-3xl">Clients</h1>
          <p className="mt-1 text-sm text-muted">
            For <span className="font-semibold text-charcoal">{activeCompany.name}</span>
          </p>
        </div>
        <div className="rounded-card border border-black/[0.03] bg-white px-5 py-3 shadow-soft">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Total clients
          </p>
          <p className="text-2xl font-extrabold text-charcoal">{loading ? "…" : clients.length}</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email or phone…"
          className="pl-10"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>
      )}

      {loading ? (
        <p className="text-sm font-semibold text-muted">Loading clients…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-card border border-dashed border-cream-deep bg-white p-12 text-center">
          <Users className="mx-auto mb-3 size-8 text-muted" />
          <p className="text-sm font-bold text-charcoal">
            {clients.length === 0 ? "No clients yet" : "No clients match your search"}
          </p>
          {clients.length === 0 && (
            <p className="mt-1 text-xs text-muted">
              Clients appear here once they send an enquiry for {activeCompany.name}.
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-black/[0.03] bg-white shadow-soft">
          <table className="hidden w-full text-left text-sm md:table">
            <thead className="bg-cream-soft text-xs font-semibold text-charcoal-soft">
              <tr>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3 text-center">Enquiries</th>
                <th className="px-5 py-3 text-center">Quotes</th>
                <th className="px-5 py-3">Last enquiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03]">
              {filtered.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-cream-soft/50">
                  <td className="px-5 py-3">
                    <Link to={`/biz/clients/${c.id}`} className="flex items-center gap-3">
                      <Avatar client={c} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-charcoal hover:underline">
                          {c.full_name || "Unnamed"}
                        </p>
                        <p className="truncate text-xs text-muted">{c.email}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-charcoal-soft">{c.phone || "—"}</td>
                  <td className="px-5 py-3 text-center font-semibold text-charcoal">
                    {c.enquiry_count}
                  </td>
                  <td className="px-5 py-3 text-center font-semibold text-charcoal">
                    {c.quote_count}
                  </td>
                  <td className="px-5 py-3 text-charcoal-soft">{formatDate(c.last_enquiry_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="divide-y divide-black/[0.03] md:hidden">
            {filtered.map((c) => (
              <Link key={c.id} to={`/biz/clients/${c.id}`} className="flex flex-col gap-3 p-4">
                <div className="flex items-center gap-3">
                  <Avatar client={c} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-charcoal">{c.full_name || "Unnamed"}</p>
                    <p className="truncate text-xs text-muted">{c.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-cream-soft px-2 py-1.5">
                    <p className="text-base font-extrabold text-charcoal">{c.enquiry_count}</p>
                    <p className="text-[11px] font-semibold text-muted">Enquiries</p>
                  </div>
                  <div className="rounded-xl bg-cream-soft px-2 py-1.5">
                    <p className="text-base font-extrabold text-charcoal">{c.quote_count}</p>
                    <p className="text-[11px] font-semibold text-muted">Quotes</p>
                  </div>
                  <div className="rounded-xl bg-cream-soft px-2 py-1.5">
                    <p className="text-xs font-bold text-charcoal">{formatDate(c.last_enquiry_at)}</p>
                    <p className="text-[11px] font-semibold text-muted">Last</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
