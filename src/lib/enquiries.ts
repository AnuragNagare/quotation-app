import { supabase } from "@/lib/supabaseClient";
import type { CatalogItem, Company, Enquiry, EnquiryLineItem, Profile } from "@/types/database";

export async function createEnquiry(
  items: { catalogItemId: string; companyId: string; quantity: number }[],
  notes?: string
): Promise<string> {
  const { data, error } = await supabase.rpc("roxy_create_enquiry", {
    items: items.map((i) => ({
      catalog_item_id: i.catalogItemId,
      company_id: i.companyId,
      quantity: i.quantity,
    })),
    notes: notes ?? undefined,
  });
  if (error) throw error;
  return data as string;
}

export async function businessCreateEnquiry(
  clientId: string,
  items: { catalogItemId: string; companyId: string; quantity: number }[],
  notes?: string
): Promise<string> {
  const { data, error } = await supabase.rpc("roxy_business_create_enquiry", {
    _client_id: clientId,
    items: items.map((i) => ({
      catalog_item_id: i.catalogItemId,
      company_id: i.companyId,
      quantity: i.quantity,
    })),
    notes: notes ?? undefined,
  });
  if (error) throw error;
  return data as string;
}

export async function searchClients(query: string): Promise<Profile[]> {
  let q = supabase.from("roxy_profiles").select("*").eq("role", "client").limit(10);
  if (query.trim()) {
    q = q.ilike("full_name", `%${query.trim()}%`);
  }
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function listMyEnquiries(clientId: string): Promise<Enquiry[]> {
  const { data, error } = await supabase
    .from("roxy_enquiries")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// RLS (enquiries_select_business_user) already scopes this to enquiries that
// touch at least one company the caller owns — no client-side filtering needed
// for "which enquiries can I see," only for "which of my companies."
export async function listBizEnquiries(): Promise<Enquiry[]> {
  const { data, error } = await supabase
    .from("roxy_enquiries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getClientProfiles(clientIds: string[]): Promise<Map<string, Profile>> {
  if (clientIds.length === 0) return new Map();
  const { data, error } = await supabase.from("roxy_profiles").select("*").in("id", clientIds);
  if (error) throw error;
  return new Map((data ?? []).map((p) => [p.id, p]));
}

export interface EnquiryLineItemDetail extends EnquiryLineItem {
  catalogItemName: string;
  catalogItemUnit: string | null;
  catalogItemPrice: number;
  companyName: string;
}

export async function listLineItemsForEnquiries(
  enquiryIds: string[]
): Promise<EnquiryLineItemDetail[]> {
  if (enquiryIds.length === 0) return [];

  const { data: items, error } = await supabase
    .from("roxy_enquiry_line_items")
    .select("*")
    .in("enquiry_id", enquiryIds);
  if (error) throw error;
  if (!items || items.length === 0) return [];

  const catalogItemIds = [...new Set(items.map((i) => i.catalog_item_id))];
  const companyIds = [...new Set(items.map((i) => i.company_id))];

  const [catalogRes, companyRes] = await Promise.all([
    supabase.from("roxy_catalog_items").select("*").in("id", catalogItemIds),
    supabase.from("roxy_companies").select("*").in("id", companyIds),
  ]);
  if (catalogRes.error) throw catalogRes.error;
  if (companyRes.error) throw companyRes.error;

  const catalogById = new Map<string, CatalogItem>((catalogRes.data ?? []).map((c) => [c.id, c]));
  const companyById = new Map<string, Company>((companyRes.data ?? []).map((c) => [c.id, c]));

  return items.map((item) => ({
    ...item,
    catalogItemName: catalogById.get(item.catalog_item_id)?.name ?? "Unknown item",
    catalogItemUnit: catalogById.get(item.catalog_item_id)?.unit ?? null,
    catalogItemPrice: catalogById.get(item.catalog_item_id)?.price ?? 0,
    companyName: companyById.get(item.company_id)?.name ?? "Unknown company",
  }));
}
