import { useState } from "react";
import { ChevronDown, ChevronUp, FileSpreadsheet, Send, CheckCircle2 } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/format";
import type { HotelBatchGroup } from "@/types";

interface HotelEomBatchViewProps {
  groups: HotelBatchGroup[];
  onGenerateBatchInvoice: (groupId: string, hotelName: string, totalAmount: number) => void;
}

export function HotelEomBatchView({ groups, onGenerateBatchInvoice }: HotelEomBatchViewProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  function toggleCollapse(groupId: string) {
    setCollapsed((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-cream-soft bg-white pb-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-extrabold text-charcoal">
              End-of-Month Hotel Statements (May 2026)
            </CardTitle>
            <p className="text-xs text-muted">
              Completed jobs ready for automated monthly consolidation & billing.
            </p>
          </div>
          <Badge variant="gold">EOM Batch Cycle Active</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6 p-6">
        {groups.map((group) => {
          const isCollapsed = collapsed[group.id];
          const totalAmount = group.events.reduce((sum, e) => sum + e.amount, 0);
          const isAllIssued = group.events.every((e) => e.status === "issued" || e.status === "paid");

          return (
            <div
              key={group.id}
              className="rounded-2xl border border-cream-deep bg-cream-soft/30 overflow-hidden transition-all"
            >
              {/* Hotel Group Header */}
              <div
                onClick={() => toggleCollapse(group.id)}
                className="flex cursor-pointer flex-col gap-3 bg-white p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-cream-soft/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="flex size-7 items-center justify-center rounded-lg bg-cream-soft text-charcoal-soft"
                  >
                    {isCollapsed ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronUp className="size-4" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-charcoal">{group.hotelName}</h3>
                      <Badge variant="outline">{group.events.length} Events</Badge>
                      {isAllIssued && (
                        <Badge variant="success" className="gap-1">
                          <CheckCircle2 className="size-3" /> Batch Issued
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted">Statement Period: {group.month}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="text-right">
                    <p className="text-xs text-muted">Batch Total</p>
                    <p className="text-base font-extrabold text-gold-dark sm:text-lg">
                      {formatINR(totalAmount)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sub-table of completed jobs */}
              {!isCollapsed && (
                <div className="p-4 pt-2">
                  <div className="overflow-x-auto rounded-xl border border-cream-deep bg-white">
                    <table className="w-full min-w-[620px] border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-cream-soft text-left text-xs font-semibold text-muted">
                          <th className="px-4 py-3 font-semibold">Event Date</th>
                          <th className="px-4 py-3 font-semibold">Event Name</th>
                          <th className="px-4 py-3 font-semibold">Venue</th>
                          <th className="px-4 py-3 font-semibold">Linked Quote</th>
                          <th className="px-4 py-3 text-right font-semibold">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.events.map((event) => (
                          <tr
                            key={event.id}
                            className="border-b border-cream-soft text-sm transition-colors last:border-0 hover:bg-cream-soft/40"
                          >
                            <td className="px-4 py-3 font-semibold text-charcoal-soft">
                              {event.eventDate}
                            </td>
                            <td className="px-4 py-3 font-bold text-charcoal">
                              {event.eventName}
                            </td>
                            <td className="px-4 py-3 text-xs text-muted">{event.venue}</td>
                            <td className="px-4 py-3">
                              <span className="rounded-md bg-cream-soft px-2 py-0.5 text-xs font-bold text-charcoal-soft">
                                {event.linkedQuoteId}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-charcoal">
                              {formatINR(event.amount)}
                            </td>
                          </tr>
                        ))}

                        {/* Consolidated Subtotal Row */}
                        <tr className="bg-cream-soft/60 font-bold text-charcoal">
                          <td colSpan={3} className="px-4 py-3.5 text-sm">
                            <span className="text-charcoal">{group.hotelName} — Consolidated Summary</span>
                            <span className="ml-2 text-xs font-semibold text-muted">
                              (Total Events: {group.events.length})
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-muted">Consolidated Total:</td>
                          <td className="px-4 py-3.5 text-right text-base font-extrabold text-gold-dark">
                            {formatINR(totalAmount)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Group Action Button */}
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-white p-3.5 border border-cream-deep">
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <FileSpreadsheet className="size-4 text-gold-dark" />
                      <span>Consolidates {group.events.length} unbilled jobs into 1 invoice statement.</span>
                    </div>

                    <Button
                      disabled={isAllIssued}
                      onClick={() => onGenerateBatchInvoice(group.id, group.hotelName, totalAmount)}
                      size="default"
                      className="gap-2"
                    >
                      <Send className="size-4" />
                      {isAllIssued ? "Batch Invoice Issued" : "Generate & Send EOM Batch Invoice (Excel/PDF)"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
