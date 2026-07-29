import { Calendar, MapPin, Phone, User } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SourceBadge } from "@/components/enquiries/SourceBadge";
import { StatusBadge } from "@/components/enquiries/StatusBadge";
import { getInitials } from "@/lib/format";
import type { Enquiry } from "@/types";

interface ViewEnquiryDrawerProps {
  enquiry: Enquiry | null;
  onOpenChange: (open: boolean) => void;
  onGenerateQuote: (enquiry: Enquiry) => void;
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-cream-soft text-charcoal-soft">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-xs font-semibold text-muted">{label}</p>
        <p className="text-sm font-semibold text-charcoal">{value}</p>
      </div>
    </div>
  );
}

export function ViewEnquiryDrawer({
  enquiry,
  onOpenChange,
  onGenerateQuote,
}: ViewEnquiryDrawerProps) {
  return (
    <Sheet open={enquiry !== null} onOpenChange={onOpenChange}>
      <SheetContent>
        {enquiry && (
          <>
            <SheetHeader>
              <Avatar className="size-11">
                <AvatarFallback>{getInitials(enquiry.customerName)}</AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle>{enquiry.customerName}</SheetTitle>
                <SheetDescription>{enquiry.id}</SheetDescription>
              </div>
            </SheetHeader>

            <SheetBody className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-2">
                <SourceBadge source={enquiry.source} />
                <StatusBadge status={enquiry.status} />
                <span className="rounded-md bg-cream-soft px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-charcoal-soft">
                  {enquiry.clientType === "direct" ? "Direct Client" : "Hotel Partner"}
                </span>
              </div>

              <Separator />

              <div className="flex flex-col gap-4">
                <DetailRow icon={Phone} label="Contact" value={enquiry.contact} />
                <DetailRow
                  icon={Calendar}
                  label="Event Date"
                  value={`${enquiry.eventType} · ${enquiry.eventDate}`}
                />
                <DetailRow icon={MapPin} label="Venue" value={enquiry.venue} />
                <DetailRow
                  icon={User}
                  label="Assigned Staff"
                  value={enquiry.assignedStaff?.name ?? "Unassigned"}
                />
              </div>

              <Separator />

              <div>
                <p className="mb-1 text-xs font-semibold text-muted">Received</p>
                <p className="text-sm font-semibold text-charcoal">{enquiry.createdDate}</p>
              </div>
            </SheetBody>

            <SheetFooter>
              <Button size="lg" onClick={() => onGenerateQuote(enquiry)}>
                Generate Quote
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
