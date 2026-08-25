import { api } from "@/lib/apiClient";
import type { Enquiry, EnquiryLineItem } from "@/types/database";

export interface EnquiryItemInput {
  catalogItemId: string;
  companyId: string;
  quantity: number;
}

// Public marketplace submission — no account needed, just contact details.
export async function submitPublicEnquiry(
  contact: { fullName: string; email: string; phone: string },
  items: EnquiryItemInput[],
  notes?: string
): Promise<string> {
  const data = await api.post<{ id: string }>("/enquiries", { contact, items, notes });
  return data.id;
}

// Internal flow — an admin files an enquiry against an existing client.
export async function createEnquiryForClient(
  clientId: string,
  items: EnquiryItemInput[],
  notes?: string
): Promise<string> {
  const data = await api.post<{ id: string }>("/enquiries", { clientId, items, notes });
  return data.id;
}

export async function listEnquiries(): Promise<Enquiry[]> {
  const data = await api.get<{ enquiries: Enquiry[] }>("/enquiries");
  return data.enquiries;
}

export async function getEnquiriesByIds(ids: string[]): Promise<Enquiry[]> {
  if (ids.length === 0) return [];
  const data = await api.get<{ enquiries: Enquiry[] }>(
    `/enquiries?ids=${ids.map(encodeURIComponent).join(",")}`
  );
  return data.enquiries;
}

export async function deleteEnquiry(id: string): Promise<void> {
  await api.delete(`/enquiries?id=${encodeURIComponent(id)}`);
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
