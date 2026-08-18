import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { QuotationHeader } from "@/components/quotations/QuotationHeader";
import { ClientEventCard } from "@/components/quotations/ClientEventCard";
import { LineItemsTable, lineTotal } from "@/components/quotations/LineItemsTable";
import { TermsTaxCard } from "@/components/quotations/TermsTaxCard";
import { OutputFormatCard } from "@/components/quotations/OutputFormatCard";
import { RevisionHistoryCard } from "@/components/quotations/RevisionHistoryCard";
import { StatusTrackerCard } from "@/components/quotations/StatusTrackerCard";
import { SendQuotationDialog } from "@/components/quotations/SendQuotationDialog";
import { QuotationsTable } from "@/components/quotations/QuotationsTable";
import { useCustomers } from "@/context/CustomerContext";
import { quotationDetail as mockQuotation } from "@/data/mockData";
import { loadStorage, saveStorage } from "@/lib/storage";
import type {
  CustomerAccount,
  Enquiry,
  FollowUpTask,
  QuotationDetail,
  QuotationRevisionEntry,
  QuotationStatus,
} from "@/types";

const STORAGE_KEY = "roxy_quotations_list";

const seedQuotationsList: QuotationDetail[] = [
  mockQuotation,
  {
    id: "QT-250517-002",
    enquiryId: "ENQ-2025-0148",
    status: "sent",
    revisionLabel: "Revision v1",
    clientName: "Hotel Royal",
    clientType: "hotel",
    recipientContact: "+91 90000 11111",
    eventName: "Corporate Event",
    eventDate: "02 Jun 2025",
    venue: "Hotel Royal, Andheri",
    lineItems: [
      { id: "li-10", name: "PA Sound System (Large)", category: "Audio", quantity: 1, unitPrice: 28000, discountPercent: 0 },
      { id: "li-11", name: '65" LED Screen', category: "Visual", quantity: 2, unitPrice: 15000, discountPercent: 5 },
    ],
    notes: "Hotel partner corporate pricing applied.",
    terms: "Payment within 30 days of EOM invoice.",
    taxRatePercent: 18,
    revisions: [{ version: "v1.0", label: "Original", date: "17 May 2025", isCurrent: true }],
  },
  {
    id: "QT-250516-005",
    enquiryId: "ENQ-2025-0140",
    status: "approved",
    revisionLabel: "Revision v1",
    clientName: "Manav Events",
    clientType: "direct",
    recipientContact: "manav.events@email.com",
    eventName: "Corporate Annual Meet",
    eventDate: "20 Jun 2025",
    venue: "Jio World Centre",
    lineItems: [
      { id: "li-12", name: "Stage Lighting Rig", category: "Lighting", quantity: 1, unitPrice: 35000, discountPercent: 0 },
      { id: "li-13", name: "DJ Mixer Console", category: "Audio", quantity: 1, unitPrice: 9000, discountPercent: 0 },
    ],
    notes: "Approved by client.",
    terms: "50% advance received.",
    taxRatePercent: 18,
    revisions: [{ version: "v1.0", label: "Original", date: "16 May 2025", isCurrent: true }],
  },
];

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
  const { customers } = useCustomers();

  const state = location.state as
    | { fromEnquiry?: Enquiry; fromCustomer?: CustomerAccount; fromFollowUp?: FollowUpTask }
    | null;
  const fromEnquiry = state?.fromEnquiry;
  const fromCustomer = state?.fromCustomer;
  const fromFollowUp = state?.fromFollowUp;

  const [quotationsList, setQuotationsList] = useState<QuotationDetail[]>(() =>
    loadStorage(STORAGE_KEY, seedQuotationsList)
  );

  useEffect(() => {
    saveStorage(STORAGE_KEY, quotationsList);
  }, [quotationsList]);

  // Handle incoming navigation state (from Enquiry, FollowUp, or Customer)
  const navDraft = useMemo(() => {
    if (fromFollowUp) return buildDraftFromFollowUp(fromFollowUp);
    if (fromEnquiry) return buildDraftFromEnquiry(fromEnquiry);
    if (fromCustomer) return buildDraftFromCustomer(fromCustomer);
    return null;
  }, [fromEnquiry, fromCustomer, fromFollowUp]);

  const [activeQuote, setActiveQuote] = useState<QuotationDetail | null>(navDraft);

  // Builder View State
  const [lineItems, setLineItems] = useState<QuotationDetail["lineItems"]>([]);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [taxRatePercent, setTaxRatePercent] = useState(18);
  const [status, setStatus] = useState<QuotationStatus>("draft");
  const [revisions, setRevisions] = useState<QuotationRevisionEntry[]>([]);
  const [sendOpen, setSendOpen] = useState(false);

  // Sync state when activeQuote changes
  useEffect(() => {
    if (activeQuote) {
      setLineItems(activeQuote.lineItems);
      setNotes(activeQuote.notes);
      setTerms(activeQuote.terms);
      setTaxRatePercent(activeQuote.taxRatePercent);
      setStatus(activeQuote.status);
      setRevisions(activeQuote.revisions);
    }
  }, [activeQuote]);

  // Rate Card Lock Detection
  const isRateLocked = useMemo(() => {
    if (!activeQuote) return false;
    const matchedCustomer = customers.find(
      (c) => c.name.toLowerCase() === activeQuote.clientName.toLowerCase()
    );
    return matchedCustomer ? matchedCustomer.status === "pending_billing" : false;
  }, [customers, activeQuote]);

  const subtotal = lineItems.reduce((sum, item) => sum + lineTotal(item), 0);
  const tax = (subtotal * taxRatePercent) / 100;
  const grandTotal = subtotal + tax;

  function handleCreateNew() {
    const newQuote: QuotationDetail = {
      id: `QT-2026-${Math.floor(100 + Math.random() * 900)}`,
      enquiryId: "—",
      status: "draft",
      revisionLabel: "Revision v1",
      clientName: "New Client",
      clientType: "direct",
      recipientContact: "client@example.com",
      eventName: "Custom Event",
      eventDate: "TBD",
      venue: "Mumbai",
      lineItems: [],
      notes: "",
      terms: "50% advance required to confirm booking.",
      taxRatePercent: 18,
      revisions: [{ version: "v1.0", label: "Original", date: "Today", isCurrent: true }],
    };
    setActiveQuote(newQuote);
  }

  function handleSaveDraft() {
    if (!activeQuote) return;
    const updated: QuotationDetail = {
      ...activeQuote,
      lineItems,
      notes,
      terms,
      taxRatePercent,
      status,
      revisions,
    };

    setQuotationsList((prev) => {
      const idx = prev.findIndex((q) => q.id === updated.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [updated, ...prev];
    });

    setActiveQuote(updated);
  }

  function handleDeleteQuote(id: string) {
    setQuotationsList((prev) => prev.filter((q) => q.id !== id));
    if (activeQuote?.id === id) {
      setActiveQuote(null);
    }
  }

  function handleDuplicateQuote(quote: QuotationDetail) {
    const copy: QuotationDetail = {
      ...quote,
      id: `QT-COPY-${Math.floor(100 + Math.random() * 900)}`,
      status: "draft",
      revisionLabel: "Revision v1",
      revisions: [{ version: "v1.0", label: "Duplicated", date: "Today", isCurrent: true }],
    };
    setQuotationsList((prev) => [copy, ...prev]);
  }

  function handleCreateRevision() {
    const nextVersion = `v${revisions.length + 1}.0`;
    setRevisions((prev) => [
      ...prev.map((r) => ({ ...r, isCurrent: false })),
      { version: nextVersion, label: "Manual revision", date: "Today", isCurrent: true },
    ]);
    setStatus("revision");
  }

  // Render Table View
  if (!activeQuote) {
    return (
      <QuotationsTable
        quotations={quotationsList}
        onSelectQuote={(quote) => setActiveQuote(quote)}
        onCreateNew={handleCreateNew}
        onDelete={handleDeleteQuote}
        onDuplicate={handleDuplicateQuote}
      />
    );
  }

  // Render Builder View
  return (
    <div className="flex flex-col gap-6">
      {/* Back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            handleSaveDraft();
            setActiveQuote(null);
          }}
          className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-charcoal shadow-soft transition-transform hover:-translate-y-0.5"
        >
          <ArrowLeft className="size-4" />
          Back to Quotations List
        </button>
      </div>

      <QuotationHeader
        quotationId={activeQuote.id}
        enquiryId={activeQuote.enquiryId}
        status={status}
        revisionLabel={activeQuote.revisionLabel}
        onSaveDraft={handleSaveDraft}
        onPreview={() => {}}
        onSend={() => setSendOpen(true)}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
        <div className="flex flex-col gap-6 lg:col-span-7">
          <ClientEventCard
            clientName={activeQuote.clientName}
            clientType={activeQuote.clientType}
            eventName={activeQuote.eventName}
            eventDate={activeQuote.eventDate}
            venue={activeQuote.venue}
          />
          <LineItemsTable lineItems={lineItems} onChange={setLineItems} isRateLocked={isRateLocked} />
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
          <OutputFormatCard clientType={activeQuote.clientType} />
          <RevisionHistoryCard revisions={revisions} onCreateRevision={handleCreateRevision} />
          <StatusTrackerCard status={status} onStatusChange={setStatus} />
        </div>
      </div>

      <SendQuotationDialog
        open={sendOpen}
        onOpenChange={setSendOpen}
        quotationId={activeQuote.id}
        clientType={activeQuote.clientType}
        recipientContact={activeQuote.recipientContact}
        quotationDetail={{
          ...activeQuote,
          lineItems,
          notes,
          terms,
          taxRatePercent,
          status,
          revisions,
        }}
        onConfirm={() => {
          setStatus("sent");
          handleSaveDraft();
        }}
      />
    </div>
  );
}
