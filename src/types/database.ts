// App-facing aliases over the raw generated `Database` type (src/types/supabase.ts).
// Only the roxy_* tables are relevant here — the shared Supabase project also hosts
// an unrelated app's tables, which we never touch.
import type { Tables, TablesInsert, TablesUpdate } from "@/types/supabase";

export type Role = "admin" | "business_user" | "client";
export type CatalogType = "product" | "service";
export type EnquiryStatus = "open" | "quoted" | "closed";
export type QuoteStatus = "draft" | "sent" | "pending" | "approved" | "cancelled" | "revision";

export type Profile = Tables<"roxy_profiles">;
export type ProfileInsert = TablesInsert<"roxy_profiles">;
export type ProfileUpdate = TablesUpdate<"roxy_profiles">;

export type Company = Tables<"roxy_companies">;
export type CompanyInsert = TablesInsert<"roxy_companies">;
export type CompanyUpdate = TablesUpdate<"roxy_companies">;

export type Category = Tables<"roxy_categories">;
export type CategoryInsert = TablesInsert<"roxy_categories">;
export type CategoryUpdate = TablesUpdate<"roxy_categories">;

export type CatalogItem = Tables<"roxy_catalog_items">;
export type CatalogItemInsert = TablesInsert<"roxy_catalog_items">;
export type CatalogItemUpdate = TablesUpdate<"roxy_catalog_items">;

export type Enquiry = Tables<"roxy_enquiries">;
export type EnquiryInsert = TablesInsert<"roxy_enquiries">;
export type EnquiryUpdate = TablesUpdate<"roxy_enquiries">;

export type EnquiryLineItem = Tables<"roxy_enquiry_line_items">;
export type EnquiryLineItemInsert = TablesInsert<"roxy_enquiry_line_items">;
export type EnquiryLineItemUpdate = TablesUpdate<"roxy_enquiry_line_items">;

export type Quote = Tables<"roxy_quotes">;
export type QuoteInsert = TablesInsert<"roxy_quotes">;
export type QuoteUpdate = TablesUpdate<"roxy_quotes">;

export type QuoteLineItem = Tables<"roxy_quote_line_items">;
export type QuoteLineItemInsert = TablesInsert<"roxy_quote_line_items">;
export type QuoteLineItemUpdate = TablesUpdate<"roxy_quote_line_items">;

export type QuoteRevision = Tables<"roxy_quote_revisions">;
export type QuoteRevisionInsert = TablesInsert<"roxy_quote_revisions">;
export type QuoteRevisionUpdate = TablesUpdate<"roxy_quote_revisions">;
