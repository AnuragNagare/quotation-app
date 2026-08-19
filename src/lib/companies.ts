import { supabase } from "@/lib/supabaseClient";
import type { Company } from "@/types/database";

// Companies are publicly SELECT-able (RLS: catalog browsing must work pre-signup),
// so "my companies" always filters by owner_id explicitly — RLS does not do it for us here.
export async function listMyCompanies(ownerId: string): Promise<Company[]> {
  const { data, error } = await supabase
    .from("roxy_companies")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createCompany(input: {
  ownerId: string;
  name: string;
  description?: string;
}): Promise<Company> {
  const { data, error } = await supabase
    .from("roxy_companies")
    .insert({ owner_id: input.ownerId, name: input.name, description: input.description || null })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateCompany(
  id: string,
  patch: Partial<Pick<Company, "name" | "description">>
): Promise<Company> {
  const { data, error } = await supabase
    .from("roxy_companies")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCompany(id: string): Promise<void> {
  const { error } = await supabase.from("roxy_companies").delete().eq("id", id);
  if (error) throw error;
}

// Public marketplace listing — every company is SELECT-able by anon/authenticated (RLS).
export async function listAllCompanies(): Promise<Company[]> {
  const { data, error } = await supabase.from("roxy_companies").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getCompanyById(id: string): Promise<Company | null> {
  const { data, error } = await supabase.from("roxy_companies").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}
