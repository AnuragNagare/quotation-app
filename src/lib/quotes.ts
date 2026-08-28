import { api } from "@/lib/apiClient";
import type { Quote, QuoteLineItem, QuoteRevision } from "@/types/database";

export async function convertEnquiryToQuote(
  enquiryId: string,
  companyId: string,
  taxRatePercent = 18
): Promise<string> {
  const data = await api.post<{ id: string }>("/quotes", {
    enquiryId,
    companyId,
    taxRatePercent,
  });
  return data.id;
}

export async function getQuoteByEnquiryAndCompany(
  enquiryId: string,
  companyId: string
): Promise<Quote | null> {
  const data = await api.get<{ quote: Quote | null }>(
    `/quotes?enquiryId=${encodeURIComponent(enquiryId)}&companyId=${encodeURIComponent(companyId)}`
  );
  return data.quote;
}

export async function listQuotesForCompany(companyId: string): Promise<Quote[]> {
  const data = await api.get<{ quotes: Quote[] }>(
    `/quotes?scope=biz&companyId=${encodeURIComponent(companyId)}`
  );
  return data.quotes;
}

export async function updateQuote(
  id: string,
  patch: Partial<Pick<Quote, "status" | "tax_rate_percent" | "terms" | "notes">>
): Promise<Quote> {
  const data = await api.patch<{ quote: Quote }>(`/quotes?id=${encodeURIComponent(id)}`, patch);
  return data.quote;
}

export async function listQuoteLineItems(quoteId: string): Promise<QuoteLineItem[]> {
  const data = await api.get<{ items: QuoteLineItem[] }>(
    `/quote-line-items?quoteId=${encodeURIComponent(quoteId)}`
  );
  return data.items;
}

export async function addQuoteLineItem(input: {
  quoteId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
}): Promise<QuoteLineItem> {
  const data = await api.post<{ item: QuoteLineItem }>("/quote-line-items", input);
  return data.item;
}

export async function updateQuoteLineItem(
  id: string,
  patch: Partial<Pick<QuoteLineItem, "name" | "quantity" | "unit_price" | "discount_percent">>
): Promise<QuoteLineItem> {
  const data = await api.patch<{ item: QuoteLineItem }>(
    `/quote-line-items?id=${encodeURIComponent(id)}`,
    patch
  );
  return data.item;
}

export async function deleteQuoteLineItem(id: string): Promise<void> {
  await api.delete(`/quote-line-items?id=${encodeURIComponent(id)}`);
}

export async function listQuoteRevisions(quoteId: string): Promise<QuoteRevision[]> {
  const data = await api.get<{ revisions: QuoteRevision[] }>(
    `/quote-revisions?quoteId=${encodeURIComponent(quoteId)}`
  );
  return data.revisions;
}

export async function createRevision(
  quoteId: string,
  version: string,
  label: string
): Promise<QuoteRevision> {
  const data = await api.post<{ revision: QuoteRevision }>("/quote-revisions", {
    quoteId,
    version,
    label,
  });
  return data.revision;
}
