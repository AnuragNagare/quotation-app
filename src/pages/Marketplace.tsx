import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Store } from "lucide-react";

import { listAllCompanies } from "@/lib/companies";
import type { Company } from "@/types/database";

export function Marketplace() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAllCompanies()
      .then(setCompanies)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-charcoal sm:text-3xl">Browse Companies</h1>
        <p className="mt-1 text-sm text-muted">
          Add products or services from any company to your enquiry — mix and match freely.
        </p>
      </div>

      {loading ? (
        <p className="text-sm font-semibold text-muted">Loading companies…</p>
      ) : companies.length === 0 ? (
        <div className="rounded-card border border-dashed border-cream-deep bg-white p-12 text-center">
          <Store className="mx-auto mb-3 size-8 text-muted" />
          <p className="text-sm font-bold text-charcoal">No companies listed yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Link
              key={company.id}
              to={`/marketplace/${company.id}`}
              className="flex flex-col gap-4 rounded-card border border-black/[0.03] bg-white p-5 shadow-soft transition-transform hover:-translate-y-0.5"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-gold-light text-gold-dark">
                <Store className="size-5" />
              </div>
              <div>
                <p className="text-base font-bold text-charcoal">{company.name}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted">
                  {company.description || "No description yet."}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
