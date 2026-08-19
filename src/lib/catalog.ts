import { api } from "@/lib/apiClient";
import type { CatalogItem, CatalogType, Category } from "@/types/database";

export async function listCategories(companyId: string): Promise<Category[]> {
  const data = await api.get<{ categories: Category[]; items: CatalogItem[] }>(
    `/catalog?companyId=${encodeURIComponent(companyId)}`
  );
  return data.categories;
}

export async function createCategory(input: {
  companyId: string;
  type: CatalogType;
  name: string;
}): Promise<Category> {
  const data = await api.post<{ category: Category }>("/catalog?type=category", input);
  return data.category;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/catalog?id=${encodeURIComponent(id)}&type=category`);
}

export async function listCatalogItems(companyId: string): Promise<CatalogItem[]> {
  const data = await api.get<{ categories: Category[]; items: CatalogItem[] }>(
    `/catalog?companyId=${encodeURIComponent(companyId)}`
  );
  return data.items;
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
  const data = await api.post<{ item: CatalogItem }>("/catalog?type=item", input);
  return data.item;
}

export async function updateCatalogItem(
  id: string,
  patch: Partial<
    Pick<CatalogItem, "name" | "description" | "price" | "unit" | "is_active" | "category_id">
  >
): Promise<CatalogItem> {
  const data = await api.patch<{ item: CatalogItem }>(
    `/catalog?id=${encodeURIComponent(id)}`,
    patch
  );
  return data.item;
}

export async function deleteCatalogItem(id: string): Promise<void> {
  await api.delete(`/catalog?id=${encodeURIComponent(id)}&type=item`);
}
