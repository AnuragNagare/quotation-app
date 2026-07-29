import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { QuotationHeader } from "@/components/quotations/QuotationHeader";
import { ClientEventCard } from "@/components/quotations/ClientEventCard";
import { LineItemsTable, lineTotal } from "@/components/quotations/LineItemsTable";
import { TermsTaxCard } from "@/components/quotations/TermsTaxCard";
import { OutputFormatCard } from "@/components/quotations/OutputFormatCard";
import { RevisionHistoryCard } from "@/components/quotations/RevisionHistoryCard";
import { StatusTrackerCard } from "@/components/quotations/StatusTrackerCard";
import { SendQuotationDialog } from "@/components/quotations/SendQuotationDialog";
import { quotationDetail as mockQuotation } from "@/data/mockData";
import type {
  CustomerAccount,
  Enquiry,
  FollowUpTask,
  QuotationDetail,
  QuotationRevisionEntry,
  QuotationStatus,
} from "@/types";

function buildDraftFromEnquiry(enquiry: Enquiry): QuotationDetail {
  return {
    id: `QT-${enquiry.id.replace("ENQ-", "")}`,
    enquiryId: enquiry.id,
    status: "draft",
    revisionLabel: "Revision v1",
    clientName: enquiry.customerName,
    clientType: enquiry.clientType,
    recipientContact: enquiry.contact,
    eventName: enquiry.eventType,
    eventDate: enquiry.eventDate,
    venue: enquiry.venue,
    lineItems: [],
    notes: "",
    terms: "50% advance required to confirm booking. Balance due on the day of the event.",
    taxRatePercent: 18,
    revisions: [{ version: "v1.0", label: "Original", date: "Today", isCurrent: true }],
  };
}

function buildDraftFromFollowUp(task: FollowUpTask): QuotationDetail {
  return {
    id: task.quoteNumber,
    enquiryId: "—",
    status: "revision",
    revisionLabel: "Revision v2",
    clientName: task.customerName,
    clientType: task.clientType,
    recipientContact: task.contactPhone,
    eventName: task.eventName,
    eventDate: task.dateLabel,
    venue: task.venue,
    lineItems: [],
    notes: "Revision requested by client during follow-up — see conversation history for details.",
    terms: "50% advance required to confirm booking. Balance due on the day of the event.",
    taxRatePercent: 18,
    revisions: [
      { version: "v1.0", label: "Original", date: "Sent to client", isCurrent: false },
      { version: "v2.0", label: "Revision Requested", date: "Today", isCurrent: true },
    ],
  };
}

function buildDraftFromCustomer(customer: CustomerAccount): QuotationDetail {
  return {
    id: `QT-${customer.id.replace("cust-", "NEW-")}`,
    enquiryId: "—",
    status: "draft",
    revisionLabel: "Revision v1",
    clientName: customer.name,
    clientType: customer.clientType,
    recipientContact: customer.contactPerson.email || customer.contactPerson.phone,
    eventName: "New Event",
    eventDate: "TBD",
    venue: customer.location,
    lineItems: [],
    notes: "",
    terms: "50% advance required to confirm booking. Balance due on the day of the event.",
    taxRatePercent: 18,
    revisions: [{ version: "v1.0", label: "Original", date: "Today", isCurrent: true }],
  };
}

export function Quotations() {
  const location = useLocation();
  const state = location.state as
    | { fromEnquiry?: Enquiry; fromCustomer?: CustomerAccount; fromFollowUp?: FollowUpTask }
    | null;
  const fromEnquiry = state?.fromEnquiry;
  const fromCustomer = state?.fromCustomer;
  const fromFollowUp = state?.fromFollowUp;

  const initial = useMemo(() => {
    if (fromFollowUp) return buildDraftFromFollowUp(fromFollowUp);
    if (fromEnquiry) return buildDraftFromEnquiry(fromEnquiry);
    if (fromCustomer) return buildDraftFromCustomer(fromCustomer);
    return mockQuotation;
  }, [fromEnquiry, fromCustomer, fromFollowUp]);

  const [lineItems, setLineItems] = useState(initial.lineItems);
  const [notes, setNotes] = useState(initial.notes);
  const [terms, setTerms] = useState(initial.terms);
  const [taxRatePercent, setTaxRatePercent] = useState(initial.taxRatePercent);
  const [status, setStatus] = useState<QuotationStatus>(initial.status);
  const [revisions, setRevisions] = useState<QuotationRevisionEntry[]>(initial.revisions);
  const [sendOpen, setSendOpen] = useState(false);

  const subtotal = lineItems.reduce((sum, item) => sum + lineTotal(item), 0);
  const tax = (subtotal * taxRatePercent) / 100;
  const grandTotal = subtotal + tax;

  function handleCreateRevision() {
    const nextVersion = `v${revisions.length + 1}.0`;
    setRevisions((prev) => [
      ...prev.map((r) => ({ ...r, isCurrent: false })),
      { version: nextVersion, label: "Manual revision", date: "Today", isCurrent: true },
    ]);
    setStatus("revision");
  }

  return (
    <div className="flex flex-col gap-6">
      <QuotationHeader
        quotationId={initial.id}
        enquiryId={initial.enquiryId}
        status={status}
        revisionLabel={initial.revisionLabel}
        onSaveDraft={() => {}}
        onPreview={() => {}}
        onSend={() => setSendOpen(true)}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
        <div className="flex flex-col gap-6 lg:col-span-7">
          <ClientEventCard
            clientName={initial.clientName}
            clientType={initial.clientType}
            eventName={initial.eventName}
            eventDate={initial.eventDate}
            venue={initial.venue}
          />
          <LineItemsTable lineItems={lineItems} onChange={setLineItems} />
          <TermsTaxCard
            notes={notes}
            onNotesChange={setNotes}
            terms={terms}
            onTermsChange={setTerms}
            taxRatePercent={taxRatePercent}
            onTaxToggle={(enabled) => setTaxRatePercent(enabled ? 18 : 0)}
            subtotal={subtotal}
            tax={tax}
            grandTotal={grandTotal}
          />
        </div>

        <div className="flex flex-col gap-6 lg:col-span-3">
          <OutputFormatCard clientType={initial.clientType} />
          <RevisionHistoryCard revisions={revisions} onCreateRevision={handleCreateRevision} />
          <StatusTrackerCard status={status} onStatusChange={setStatus} />
        </div>
      </div>

      <SendQuotationDialog
        open={sendOpen}
        onOpenChange={setSendOpen}
        quotationId={initial.id}
        clientType={initial.clientType}
        recipientContact={initial.recipientContact}
        onConfirm={() => {
          setStatus("sent");
          setSendOpen(false);
        }}
      />
    </div>
  );
}
