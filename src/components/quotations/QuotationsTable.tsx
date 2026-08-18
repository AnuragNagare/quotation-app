import { useMemo, useState } from "react";
import { Copy, ExternalLink, MoreVertical, PencilLine, Plus, Search, Trash2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientTypeBadge } from "@/components/customers/ClientTypeBadge";
import { saveQuotation } from "@/data/quotationStore";
import { formatINR } from "@/lib/format";
import type { ClientType, QuotationDetail, QuotationStatus } from "@/types";

interface QuotationsTableProps {
  quotations: QuotationDetail[];
  onSelectQuote: (quote: QuotationDetail) => void;
  onCreateNew: () => void;
  onDelete: (id: string) => void;
  onDuplicate: (quote: QuotationDetail) => void;
}

function computeGrandTotal(quote: QuotationDetail) {
  const subtotal = quote.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice * (1 - item.discountPercent / 100),
    0
  );
  return subtotal + (subtotal * (quote.taxRatePercent || 0)) / 100;
}

function StatusBadge({ status }: { status: QuotationStatus }) {
  switch (status) {
    case "approved":
      return <Badge variant="success">Approved</Badge>;
    case "sent":
      return <Badge variant="info">Sent</Badge>;
    case "pending":
      return <Badge variant="warning">Pending</Badge>;
    case "cancelled":
      return <Badge variant="danger">Cancelled</Badge>;
    case "revision":
      return <Badge variant="purple">Revision</Badge>;
    default:
      return <Badge variant="outline">Draft</Badge>;
  }
}

export function QuotationsTable({
  quotations,
  onSelectQuote,
  onCreateNew,
  onDelete,
  onDuplicate,
}: QuotationsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return quotations.filter((quote) => {
      const matchesSearch =
        q.length === 0 ||
        quote.id.toLowerCase().includes(q) ||
        quote.clientName.toLowerCase().includes(q) ||
        quote.eventName.toLowerCase().includes(q) ||
        quote.venue.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
      const matchesType = typeFilter === "all" || quote.clientType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [quotations, search, statusFilter, typeFilter]);

  function handleShareLink(quote: QuotationDetail) {
    const shareId = saveQuotation(quote);
    const shareUrl = `${window.location.origin}/q/${shareId}`;
    navigator.clipboard.writeText(shareUrl);
    window.open(shareUrl, "_blank");
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Controls */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-charcoal sm:text-3xl">Quotations</h1>
          <p className="mt-1 text-sm text-muted">
            Manage, edit, and issue event quotations for clients and hotel partners.
          </p>
        </div>
        <Button size="lg" onClick={onCreateNew}>
          <Plus className="size-4" />
          New Quotation
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-soft sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by quote #, client, event, or venue..."
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="revision">Revision</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Client Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="direct">Direct Client</SelectItem>
              <SelectItem value="hotel">Hotel Partner</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-cream-soft text-left text-xs font-semibold text-muted">
                <th className="px-5 py-3 font-semibold">Quote #</th>
                <th className="px-5 py-3 font-semibold">Client / Customer</th>
                <th className="px-5 py-3 font-semibold">Event &amp; Venue</th>
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold">Amount (₹)</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((quote) => (
                <tr
                  key={quote.id}
                  onClick={() => onSelectQuote(quote)}
                  className="cursor-pointer border-b border-cream-soft transition-colors last:border-0 hover:bg-cream-soft/40"
                >
                  <td className="px-5 py-4 font-mono font-bold text-charcoal">
                    {quote.id}
                    <span className="block text-[11px] font-sans text-muted">
                      {quote.revisionLabel}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-charcoal">{quote.clientName}</p>
                    <p className="text-xs text-muted">{quote.recipientContact}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-charcoal-soft">{quote.eventName}</p>
                    <p className="text-xs text-muted">{quote.venue}</p>
                  </td>
                  <td className="px-5 py-4">
                    <ClientTypeBadge clientType={quote.clientType as ClientType} />
                  </td>
                  <td className="px-5 py-4 font-extrabold text-charcoal">
                    {formatINR(computeGrandTotal(quote))}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={quote.status} />
                  </td>
                  <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onSelectQuote(quote)}
                        className="text-xs font-bold text-gold-dark hover:underline"
                      >
                        Edit
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            aria-label="Actions"
                            className="flex size-8 items-center justify-center rounded-lg text-charcoal-soft transition-colors hover:bg-cream-soft hover:text-charcoal"
                          >
                            <MoreVertical className="size-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onSelectQuote(quote)}>
                            <PencilLine className="size-3.5" />
                            Open Builder
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShareLink(quote)}>
                            <ExternalLink className="size-3.5" />
                            Shareable Link
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDuplicate(quote)}>
                            <Copy className="size-3.5" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(quote.id)}
                            className="text-danger data-[highlighted]:bg-danger-light data-[highlighted]:text-danger"
                          >
                            <Trash2 className="size-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-sm text-muted">
                    No quotations match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
