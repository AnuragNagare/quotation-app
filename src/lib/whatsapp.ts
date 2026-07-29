import { formatINR } from "@/lib/format";

export function buildWhatsAppLink(
  phone: string,
  quoteNumber: string,
  eventName: string,
  amount: number
) {
  const digits = phone.replace(/[^0-9]/g, "");
  const message = `Hi! Following up on your quotation ${quoteNumber} for ${eventName} — total amount ${formatINR(
    amount
  )}. Please let us know if you have any questions or would like to proceed. — Team ROXY`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
