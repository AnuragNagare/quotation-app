import { supabase } from "@/lib/supabaseClient";
import type { CatalogItem, CatalogType, Category } from "@/types/database";

// Categories & catalog items are publicly SELECT-able (marketplace browsing), scoped
// to a company explicitly. Write policies are enforced server-side via
// roxy_private.owns_company() — a non-owner's write simply gets rejected by RLS.

export async function listCategories(companyId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from("roxy_categories")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createCategory(input: {
  companyId: string;
  type: CatalogType;
  name: string;
}): Promise<Category> {
  const { data, error } = await supabase
    .from("roxy_categories")
    .insert({ company_id: input.companyId, type: input.type, name: input.name })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("roxy_categories").delete().eq("id", id);
  if (error) throw error;
}

export async function listCatalogItems(companyId: string): Promise<CatalogItem[]> {
  const { data, error } = await supabase
    .from("roxy_catalog_items")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createCatalogItem(input: {
  companyId: string;
  categoryId: string;
  type: CatalogType;
  name: string;
  description?: string;
  price: number;
  unit?: string;
}): Promise<CatalogItem> {
  const { data, error } = await supabase
    .from("roxy_catalog_items")
    .insert({
      company_id: input.companyId,
      category_id: input.categoryId,
      type: input.type,
      name: input.name,
      description: input.description || null,
      price: input.price,
      unit: input.unit || null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateCatalogItem(
  id: string,
  patch: Partial<
    Pick<CatalogItem, "name" | "description" | "price" | "unit" | "is_active" | "category_id">
  >
): Promise<CatalogItem> {
  const { data, error } = await supabase
    .from("roxy_catalog_items")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCatalogItem(id: string): Promise<void> {
  const { error } = await supabase.from("roxy_catalog_items").delete().eq("id", id);
  if (error) throw error;
}
