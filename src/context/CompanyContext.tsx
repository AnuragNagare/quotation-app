import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";

import { useAuth } from "@/context/AuthContext";
import {
  listMyCompanies,
  createCompany as createCompanyApi,
  updateCompany as updateCompanyApi,
} from "@/lib/companies";
import type { Company } from "@/types/database";

const ACTIVE_COMPANY_STORAGE_KEY = "etq_active_company_id";

interface CompanyContextValue {
  companies: Company[];
  activeCompany: Company | null;
  setActiveCompanyId: (id: string) => void;
  loading: boolean;
  refresh: () => Promise<void>;
  createCompany: (name: string, description?: string) => Promise<Company>;
  updateCompany: (id: string, patch: { name: string; description?: string | null }) => Promise<Company>;
}

const CompanyContext = createContext<CompanyContextValue | null>(null);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompanyId, setActiveCompanyIdState] = useState<string | null>(
    () => localStorage.getItem(ACTIVE_COMPANY_STORAGE_KEY)
  );
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!profile || profile.role !== "business_user") {
      setCompanies([]);
      return;
    }
    setLoading(true);
    try {
      const rows = await listMyCompanies(profile.id);
      setCompanies(rows);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (companies.length === 0) return;
    const stillExists = companies.some((c) => c.id === activeCompanyId);
    if (!stillExists) {
      setActiveCompanyIdState(companies[0].id);
    }
  }, [companies, activeCompanyId]);

  function setActiveCompanyId(id: string) {
    setActiveCompanyIdState(id);
    localStorage.setItem(ACTIVE_COMPANY_STORAGE_KEY, id);
  }

  async function createCompany(name: string, description?: string) {
    if (!profile) throw new Error("Not signed in");
    const company = await createCompanyApi({ ownerId: profile.id, name, description });
    setCompanies((prev) => [company, ...prev]);
    setActiveCompanyId(company.id);
    return company;
  }

  async function updateCompany(id: string, patch: { name: string; description?: string | null }) {
    const updated = await updateCompanyApi(id, patch);
    setCompanies((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    return updated;
  }

  const activeCompany = companies.find((c) => c.id === activeCompanyId) ?? null;

  return (
    <CompanyContext.Provider
      value={{
        companies,
        activeCompany,
        setActiveCompanyId,
        loading,
        refresh,
        createCompany,
        updateCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompanies() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompanies must be used within a CompanyProvider");
  return ctx;
}
