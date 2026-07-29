import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";

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
import { cn } from "@/lib/utils";
import type { ClientType, CustomerAccount } from "@/types";

interface CustomerFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCustomer: CustomerAccount | null;
  onSave: (customer: CustomerAccount) => void;
}

export function CustomerFormDrawer({
  open,
  onOpenChange,
  editingCustomer,
  onSave,
}: CustomerFormDrawerProps) {
  const [clientType, setClientType] = useState<ClientType>("direct");
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [taxDetails, setTaxDetails] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editingCustomer) {
      setClientType(editingCustomer.clientType);
      setName(editingCustomer.name);
      setContactName(editingCustomer.contactPerson.name);
      setPhone(editingCustomer.contactPerson.phone);
      setEmail(editingCustomer.contactPerson.email);
      setLocation(editingCustomer.location);
      setBillingAddress(editingCustomer.billingAddress);
      setTaxDetails(editingCustomer.taxDetails);
    } else {
      setClientType("direct");
      setName("");
      setContactName("");
      setPhone("");
      setEmail("");
      setLocation("");
      setBillingAddress("");
      setTaxDetails("");
    }
  }, [open, editingCustomer]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const isHotel = clientType === "hotel";

    onSave({
      id: editingCustomer?.id ?? `cust-${Date.now()}`,
      name: name.trim(),
      clientType,
      contactPerson: { name: contactName.trim(), phone: phone.trim(), email: email.trim() },
      location: location.trim(),
      billingAddress: billingAddress.trim(),
      taxDetails: taxDetails.trim(),
      bookedEvents: editingCustomer?.bookedEvents ?? 0,
      lifetimeValue: editingCustomer?.lifetimeValue ?? 0,
      status: editingCustomer?.status ?? "active",
      billingFormat: isHotel ? "excel" : "pdf",
      billingCycle: isHotel ? "eom" : "immediate",
      activeEnquiries: editingCustomer?.activeEnquiries ?? 0,
      hasOutstandingBalance: editingCustomer?.hasOutstandingBalance ?? false,
      isTopTier: editingCustomer?.isTopTier ?? false,
      quoteHistory: editingCustomer?.quoteHistory ?? [],
    });
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gold-light text-gold-dark">
            <UserPlus className="size-5" />
          </div>
          <div>
            <SheetTitle>{editingCustomer ? "Edit Customer" : "Add New Customer"}</SheetTitle>
            <SheetDescription>
              {editingCustomer
                ? "Update profile and contact details."
                : "Create a new direct client or hotel partner profile."}
            </SheetDescription>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <SheetBody className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-charcoal-soft">Customer Type</label>
              <div className="flex rounded-xl border border-cream-deep bg-white p-1">
                {(["direct", "hotel"] as ClientType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setClientType(type)}
                    className={cn(
                      "flex-1 rounded-lg py-2 text-xs font-bold transition-all",
                      clientType === type
                        ? "bg-gold text-white shadow-soft"
                        : "text-charcoal-soft hover:text-charcoal"
                    )}
                  >
                    {type === "direct" ? "Direct Client" : "Hotel Partner"}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted">
                {clientType === "hotel"
                  ? "Auto-sets Excel quotation output and End-of-Month billing."
                  : "Auto-sets PDF quotation output and same-day billing."}
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-charcoal-soft">
                {clientType === "direct" ? "Customer Name" : "Hotel Name"}{" "}
                <span className="text-danger">*</span>
              </label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={clientType === "direct" ? "e.g. John Doe" : "e.g. Taj Lands End"}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-charcoal-soft">Key Contact Person</label>
              <Input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Full name"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-charcoal-soft">Phone</label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-charcoal-soft">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-charcoal-soft">Location</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bandra West, Mumbai"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-charcoal-soft">Billing Address</label>
              <Textarea
                rows={2}
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                placeholder="Full billing address"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-charcoal-soft">
                Tax Details (GSTIN / PAN)
              </label>
              <Input
                value={taxDetails}
                onChange={(e) => setTaxDetails(e.target.value)}
                placeholder="e.g. GSTIN: 27AAACT2727Q1ZP"
              />
            </div>
          </SheetBody>

          <SheetFooter>
            <Button type="submit" size="lg">
              Save Customer
            </Button>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
