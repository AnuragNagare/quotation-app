/**
 * In-memory quotation store for shareable public quote links.
 * Stores QuotationDetail objects keyed by a short random ID.
 * Data persists for the lifetime of the browser session.
 */
import type { QuotationDetail } from "@/types";

const store = new Map<string, QuotationDetail>();

function generateId(): string {
  return Math.random().toString(36).slice(2, 9).toUpperCase();
}

export function saveQuotation(detail: QuotationDetail): string {
  // Reuse same ID if this quotation was already saved
  for (const [id, saved] of store.entries()) {
    if (saved.id === detail.id) {
      store.set(id, detail); // update
      return id;
    }
  }
  const id = generateId();
  store.set(id, detail);
  return id;
}

export function getQuotation(shareId: string): QuotationDetail | undefined {
  return store.get(shareId);
}
