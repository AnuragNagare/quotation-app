import { useState } from "react";
import type { ReactNode } from "react";
import { Mail, MessageCircle, Building2, Globe, FileText } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { staffMembers } from "@/data/mockData";
import { cn } from "@/lib/utils";
import type { ClientType, EnquirySource } from "@/types";

const CHANNELS: { value: EnquirySource; label: string; icon: typeof Mail }[] = [
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "email", label: "Email", icon: Mail },
  { value: "hotel_staff", label: "Hotel Staff", icon: Building2 },
  { value: "website", label: "Website", icon: Globe },
];

const EVENT_TYPES = [
  "Wedding",
  "Corporate Event",
  "Birthday Party",
  "Anniversary",
  "Engagement",
  "Reception",
  "Conference",
];

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-charcoal-soft">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {children}
    </div>
  );
}

interface AddEnquiryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateQuotation: () => void;
}

export function AddEnquiryDrawer({ open, onOpenChange, onCreateQuotation }: AddEnquiryDrawerProps) {
  const [channel, setChannel] = useState<EnquirySource>("whatsapp");
  const [clientType, setClientType] = useState<ClientType>("direct");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gold-light text-gold-dark">
            <FileText className="size-5" />
          </div>
          <div>
            <SheetTitle>Add New Enquiry</SheetTitle>
            <SheetDescription>Add enquiry details to get started</SheetDescription>
          </div>
        </SheetHeader>

        <SheetBody className="flex flex-col gap-5">
          <Field label="Channel Source" required>
            <div className="grid grid-cols-2 gap-2">
              {CHANNELS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setChannel(c.value)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors",
                    channel === c.value
                      ? "border-gold bg-gold-light text-gold-dark"
                      : "border-cream-deep bg-white text-charcoal-soft hover:bg-cream-soft"
                  )}
                >
                  <c.icon className="size-4" />
                  {c.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Customer Type">
            <div className="flex rounded-xl border border-cream-deep bg-white p-1">
              {(["direct", "hotel"] as ClientType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setClientType(type)}
                  className={cn(
                    "flex-1 rounded-lg py-2 text-sm font-semibold transition-colors",
                    clientType === type
                      ? "bg-gold text-white shadow-soft"
                      : "text-charcoal-soft hover:text-charcoal"
                  )}
                >
                  {type === "direct" ? "Direct Client" : "Hotel Partner"}
                </button>
              ))}
            </div>
          </Field>

          <Field label={clientType === "direct" ? "Customer Name" : "Hotel Name"} required>
            <Input placeholder="Enter full name" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone Number">
              <Input type="tel" placeholder="+91 98765 43210" />
            </Field>
            <Field label="Email Address">
              <Input type="email" placeholder="Enter email address" />
            </Field>
          </div>

          <Field label="Event Type" required>
            <Select>
              <SelectTrigger className="h-10 w-full text-sm">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Event Date" required>
              <Input type="date" />
            </Field>
            <Field label="Venue / Location">
              <Input placeholder="Enter venue" />
            </Field>
          </div>

          <Field label="Equipment Requirements / Notes">
            <Textarea
              rows={4}
              placeholder="Any special requests or details shared over WhatsApp/verbal..."
            />
          </Field>

          <Field label="Assign To">
            <Select>
              <SelectTrigger className="h-10 w-full text-sm">
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staffMembers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </SheetBody>

        <SheetFooter>
          <Button size="lg" onClick={onCreateQuotation}>
            Save & Create Quotation
          </Button>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Save as Draft
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
