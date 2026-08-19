import { supabase } from "@/lib/supabaseClient";
import type { Quote, QuoteLineItem, QuoteRevision } from "@/types/database";

export async function convertEnquiryToQuote(
  enquiryId: string,
  companyId: string,
  taxRatePercent = 18
): Promise<string> {
  const { data, error } = await supabase.rpc("roxy_convert_enquiry_to_quote", {
    _enquiry_id: enquiryId,
    _company_id: companyId,
    _tax_rate_percent: taxRatePercent,
  });
  if (error) throw error;
  return data as string;
}

export async function getQuoteByEnquiryAndCompany(
  enquiryId: string,
  companyId: string
): Promise<Quote | null> {
  const { data, error } = await supabase
    .from("roxy_quotes")
    .select("*")
    .eq("enquiry_id", enquiryId)
    .eq("company_id", companyId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listQuotesForCompany(companyId: string): Promise<Quote[]> {
  const { data, error } = await supabase
    .from("roxy_quotes")
    .select("*")
    .eq("company_id", companyId);
  if (error) throw error;
  return data ?? [];
}

export async function updateQuote(
  id: string,
  patch: Partial<Pick<Quote, "status" | "tax_rate_percent" | "terms" | "notes">>
): Promise<Quote> {
  const { data, error } = await supabase
    .from("roxy_quotes")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function listQuoteLineItems(quoteId: string): Promise<QuoteLineItem[]> {
  const { data, error } = await supabase
    .from("roxy_quote_line_items")
    .select("*")
    .eq("quote_id", quoteId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function addQuoteLineItem(input: {
  quoteId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
}): Promise<QuoteLineItem> {
  const { data, error } = await supabase
    .from("roxy_quote_line_items")
    .insert({
      quote_id: input.quoteId,
      name: input.name,
      quantity: input.quantity,
      unit_price: input.unitPrice,
      discount_percent: input.discountPercent ?? 0,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateQuoteLineItem(
  id: string,
  patch: Partial<Pick<QuoteLineItem, "name" | "quantity" | "unit_price" | "discount_percent">>
): Promise<QuoteLineItem> {
  const { data, error } = await supabase
    .from("roxy_quote_line_items")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteQuoteLineItem(id: string): Promise<void> {
  const { error } = await supabase.from("roxy_quote_line_items").delete().eq("id", id);
  if (error) throw error;
}

export async function listQuoteRevisions(quoteId: string): Promise<QuoteRevision[]> {
  const { data, error } = await supabase
    .from("roxy_quote_revisions")
    .select("*")
    .eq("quote_id", quoteId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createRevision(
  quoteId: string,
  version: string,
  label: string
): Promise<QuoteRevision> {
  await supabase
    .from("roxy_quote_revisions")
    .update({ is_current: false })
    .eq("quote_id", quoteId);

  const { data, error } = await supabase
    .from("roxy_quote_revisions")
    .insert({ quote_id: quoteId, version, label, is_current: true })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
