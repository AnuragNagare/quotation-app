export type Role = "admin" | "business_user" | "client";
export type CatalogType = "product" | "service";
export type EnquiryStatus = "open" | "quoted" | "closed";
export type QuoteStatus = "draft" | "sent" | "pending" | "approved" | "cancelled" | "revision";

export interface Profile {
  id: string;
  email: string | null;
  role: Role;
  full_name: string;
  phone: string | null;
  created_at: string;
}

export interface Company {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  company_id: string;
  type: CatalogType;
  name: string;
  created_at: string;
}

export interface CatalogItem {
  id: string;
  company_id: string;
  category_id: string;
  type: CatalogType;
  name: string;
  description: string | null;
  price: number;
  unit: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Enquiry {
  id: string;
  client_id: string;
  status: EnquiryStatus;
  notes: string | null;
  created_at: string;
}

export interface EnquiryLineItem {
  id: string;
  enquiry_id: string;
  catalog_item_id: string;
  company_id: string;
  quantity: number;
  notes: string | null;
  created_at: string;
}

export interface Quote {
  id: string;
  enquiry_id: string;
  company_id: string;
  business_user_id: string;
  status: QuoteStatus;
  tax_rate_percent: number;
  terms: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteLineItem {
  id: string;
  quote_id: string;
  enquiry_line_item_id: string | null;
  name: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  created_at: string;
}

export interface QuoteRevision {
  id: string;
  quote_id: string;
  version: string;
  label: string | null;
  is_current: boolean;
  created_at: string;
}
