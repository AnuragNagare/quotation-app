import { api } from "@/lib/apiClient";
import type { Enquiry, Profile, Quote } from "@/types/database";

export async function listProfilesByRole(role: "client" | "business_user"): Promise<Profile[]> {
  const data = await api.get<{ profiles: Profile[] }>(`/admin-profiles?role=${role}`);
  return data.profiles;
}

export async function adminUpdateProfile(
  id: string,
  patch: Partial<Pick<Profile, "full_name" | "phone" | "email">>
): Promise<Profile> {
  const data = await api.patch<{ profile: Profile }>(
    `/admin-profiles?id=${encodeURIComponent(id)}`,
    patch
  );
  return data.profile;
}

export async function adminDeleteProfile(id: string): Promise<void> {
  await api.delete(`/admin-profiles?id=${encodeURIComponent(id)}`);
}

export async function listAllEnquiriesAdmin(): Promise<Enquiry[]> {
  const data = await api.get<{ enquiries: Enquiry[] }>("/enquiries?scope=admin");
  return data.enquiries;
}

export async function adminDeleteEnquiry(id: string): Promise<void> {
  await api.delete(`/enquiries?id=${encodeURIComponent(id)}`);
}

export async function listAllQuotesAdmin(): Promise<Quote[]> {
  const data = await api.get<{ quotes: Quote[] }>("/quotes?scope=admin");
  return data.quotes;
}

export async function adminDeleteQuote(id: string): Promise<void> {
  await api.delete(`/quotes?id=${encodeURIComponent(id)}`);
}
