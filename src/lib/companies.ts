import { api } from "@/lib/apiClient";
import type { Company } from "@/types/database";

export async function listAllCompanies(): Promise<Company[]> {
  const data = await api.get<{ companies: Company[] }>("/companies");
  return data.companies;
}

export async function getCompanyById(id: string): Promise<Company | null> {
  const companies = await listAllCompanies();
  return companies.find((c) => c.id === id) ?? null;
}

export async function createCompany(input: {
  name: string;
  description?: string;
}): Promise<Company> {
  const data = await api.post<{ company: Company }>("/companies", input);
  return data.company;
}

export async function updateCompany(
  id: string,
  patch: Partial<Pick<Company, "name" | "description">>
): Promise<Company> {
  const data = await api.patch<{ company: Company }>(
    `/companies?id=${encodeURIComponent(id)}`,
    patch
  );
  return data.company;
}

export async function deleteCompany(id: string): Promise<void> {
  await api.delete(`/companies?id=${encodeURIComponent(id)}`);
}
