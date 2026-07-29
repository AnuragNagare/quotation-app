import { MoreVertical, PencilLine, UserCog, NotebookPen, Trash2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SourceBadge } from "@/components/enquiries/SourceBadge";
import { StatusBadge } from "@/components/enquiries/StatusBadge";
import { getInitials } from "@/lib/format";
import type { Enquiry } from "@/types";

interface EnquiriesTableProps {
  enquiries: Enquiry[];
  onRowClick: (enquiry: Enquiry) => void;
  onGenerateQuote: (enquiry: Enquiry) => void;
}

export function EnquiriesTable({
  enquiries,
  onRowClick,
  onGenerateQuote,
}: EnquiriesTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse">
          <thead>
            <tr className="border-b border-cream-soft text-left text-xs font-semibold text-muted">
              <th className="px-5 py-4 font-semibold">Enquiry ID</th>
              <th className="px-5 py-4 font-semibold">Source</th>
              <th className="px-5 py-4 font-semibold">Customer / Hotel</th>
              <th className="px-5 py-4 font-semibold">Event Details</th>
              <th className="px-5 py-4 font-semibold">Assigned Staff</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map((enquiry) => (
              <tr
                key={enquiry.id}
                onClick={() => onRowClick(enquiry)}
                className="cursor-pointer border-b border-cream-soft text-sm transition-colors last:border-0 hover:bg-cream-soft/60"
              >
                <td className="px-5 py-4 font-bold text-charcoal">{enquiry.id}</td>
                <td className="px-5 py-4">
                  <SourceBadge source={enquiry.source} />
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-charcoal">{enquiry.customerName}</p>
                  <p className="text-xs text-muted">{enquiry.contact}</p>
                  <span className="mt-1 inline-block rounded-md bg-cream-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-charcoal-soft">
                    {enquiry.clientType === "direct" ? "Direct Client" : "Hotel Partner"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-charcoal">{enquiry.eventType}</p>
                  <p className="text-xs text-muted">
                    {enquiry.eventDate} · {enquiry.venue}
                  </p>
                </td>
                <td className="px-5 py-4">
                  {enquiry.assignedStaff ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7">
                        <AvatarFallback className="text-[10px]">
                          {getInitials(enquiry.assignedStaff.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-charcoal-soft">
                        {enquiry.assignedStaff.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-muted">Unassigned</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={enquiry.status} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" onClick={() => onGenerateQuote(enquiry)}>
                      Generate Quote
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          aria-label="More actions"
                          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-charcoal-soft transition-colors hover:bg-cream-soft hover:text-charcoal"
                        >
                          <MoreVertical className="size-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <PencilLine className="size-3.5" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserCog className="size-3.5" />
                          Assign Staff
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <NotebookPen className="size-3.5" />
                          Log Note
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-danger data-[highlighted]:bg-danger-light data-[highlighted]:text-danger">
                          <Trash2 className="size-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}

            {enquiries.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center text-sm text-muted">
                  No enquiries match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
