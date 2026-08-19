import { api } from "@/lib/apiClient";
import type { Enquiry, EnquiryLineItem, Profile } from "@/types/database";

export async function createEnquiry(
  items: { catalogItemId: string; companyId: string; quantity: number }[],
  notes?: string
): Promise<string> {
  const data = await api.post<{ id: string }>("/enquiries", { items, notes });
  return data.id;
}

export async function businessCreateEnquiry(
  clientId: string,
  items: { catalogItemId: string; companyId: string; quantity: number }[],
  notes?: string
): Promise<string> {
  const data = await api.post<{ id: string }>("/enquiries", {
    items,
    notes,
    onBehalfOfClientId: clientId,
  });
  return data.id;
}

export async function searchClients(query: string): Promise<Profile[]> {
  const data = await api.get<{ clients: Profile[] }>(
    `/clients?q=${encodeURIComponent(query)}`
  );
  return data.clients;
}

export async function listMyEnquiries(_clientId: string): Promise<Enquiry[]> {
  const data = await api.get<{ enquiries: Enquiry[] }>("/enquiries?scope=mine");
  return data.enquiries;
}

export async function listBizEnquiries(): Promise<Enquiry[]> {
  const data = await api.get<{ enquiries: Enquiry[] }>("/enquiries?scope=biz");
  return data.enquiries;
}

export async function getEnquiriesByIds(ids: string[]): Promise<Enquiry[]> {
  if (ids.length === 0) return [];
  const data = await api.get<{ enquiries: Enquiry[] }>(
    `/enquiries?ids=${ids.map(encodeURIComponent).join(",")}`
  );
  return data.enquiries;
}

export async function getClientProfiles(clientIds: string[]): Promise<Map<string, Profile>> {
  if (clientIds.length === 0) return new Map();
  const data = await api.get<{ clients: Profile[] }>(
    `/clients?ids=${clientIds.map(encodeURIComponent).join(",")}`
  );
  return new Map(data.clients.map((p) => [p.id, p]));
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
  const data = await api.get<{ items: EnquiryLineItemDetail[] }>(
    `/enquiry-line-items?enquiryIds=${enquiryIds.map(encodeURIComponent).join(",")}`
  );
  return data.items;
}
