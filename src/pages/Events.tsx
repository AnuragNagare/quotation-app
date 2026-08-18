import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, X } from "lucide-react";

import { EventHeader } from "@/components/events/EventHeader";
import { VenueSnapshotCard } from "@/components/events/VenueSnapshotCard";
import { PackingChecklist } from "@/components/events/PackingChecklist";
import { StaffAssignmentCard } from "@/components/events/StaffAssignmentCard";
import { LogisticsCard } from "@/components/events/LogisticsCard";
import { DispatchTimeline } from "@/components/events/DispatchTimeline";
import { EventsListTable } from "@/components/events/EventsListTable";
import { eventOperation as seedEvent } from "@/data/mockData";
import { loadStorage, saveStorage } from "@/lib/storage";
import type {
  EventOperation,
  EventOperationStatus,
  PackingStatus,
} from "@/types";

const STORAGE_KEY = "roxy_events_list";

const seedEventsList: EventOperation[] = [
  seedEvent,
  {
    id: "EVT-2026-090",
    linkedQuoteId: "QT-1015",
    clientType: "hotel",
    status: "confirmed",
    eventName: "Tech Innovation Summit",
    venue: "JW Marriott Juhu",
    venueAddress: "Juhu Tara Road, Mumbai – 400049",
    eventDate: "19 May 2026",
    setupTime: "08:00 AM",
    specialInstructions: "Setup 4K Projector and Line Array Sound System by 09:30 AM for keynote.",
    packingItems: [
      { id: "pi-20", name: "4K Projector", category: "Visual", requiredQty: 2, availabilityStatus: "in_warehouse", packingStatus: "packed", checked: true },
      { id: "pi-21", name: '100" Projector Screen', category: "Visual", requiredQty: 2, availabilityStatus: "in_warehouse", packingStatus: "packed", checked: true },
      { id: "pi-22", name: "PA Sound System (Large)", category: "Audio", requiredQty: 1, availabilityStatus: "in_warehouse", packingStatus: "pending", checked: false },
    ],
    leadEngineer: { id: "arjun", name: "Arjun Patel" },
    crewMembers: [{ id: "rohit", name: "Rohit Verma" }],
    fieldContact: "+91 90000 22222",
    vehicleId: "MH-02-EQ-9920",
    driverName: "Suresh Shinde",
    driverPhone: "+91 98200 44444",
    estimatedDispatchTime: "19 May 2026, 06:00 AM",
    dispatchStages: [
      { id: "ds-1", label: "Quote Approved", sublabel: "16 May 2026", status: "completed" },
      { id: "ds-2", label: "Materials Allocated", sublabel: "17 May 2026", status: "completed" },
      { id: "ds-3", label: "Packed & Checked", sublabel: "In Progress", status: "in_progress" },
      { id: "ds-4", label: "Out for Delivery", sublabel: "Pending", status: "pending" },
      { id: "ds-5", label: "Setup Completed at Venue", sublabel: "Pending", status: "pending" },
    ],
  },
  {
    id: "EVT-2026-091",
    linkedQuoteId: "QT-1019",
    clientType: "hotel",
    status: "dispatched",
    eventName: "Healthcare Leadership Forum",
    venue: "The Leela Palace",
    venueAddress: "Sahar Airport Road, Andheri East, Mumbai – 400059",
    eventDate: "15 May 2026",
    setupTime: "10:00 AM",
    specialInstructions: "Stage platform deck 12x10 with drape frame background.",
    packingItems: [
      { id: "pi-30", name: "Stage Platform 12x10", category: "Stage", requiredQty: 1, availabilityStatus: "in_warehouse", packingStatus: "loaded", checked: true },
      { id: "pi-31", name: "Backdrop Frame with Drape", category: "Stage", requiredQty: 1, availabilityStatus: "in_warehouse", packingStatus: "loaded", checked: true },
    ],
    leadEngineer: { id: "riya", name: "Riya Mehta" },
    crewMembers: [],
    fieldContact: "+91 90000 33333",
    vehicleId: "MH-02-EQ-1102",
    driverName: "Ganesh Patil",
    driverPhone: "+91 98190 55555",
    estimatedDispatchTime: "15 May 2026, 08:00 AM",
    dispatchStages: [
      { id: "ds-1", label: "Quote Approved", sublabel: "14 May 2026", status: "completed" },
      { id: "ds-2", label: "Materials Allocated", sublabel: "14 May 2026", status: "completed" },
      { id: "ds-3", label: "Packed & Checked", sublabel: "15 May 2026, 07:30 AM", status: "completed" },
      { id: "ds-4", label: "Out for Delivery", sublabel: "15 May 2026, 08:15 AM", status: "completed" },
      { id: "ds-5", label: "Setup Completed at Venue", sublabel: "In Progress", status: "in_progress" },
    ],
  },
];

function DispatchToast({ onClose, leadName }: { onClose: () => void; leadName?: string }) {
  return (
    <div className="animate-in slide-in-from-top-4 fade-in fixed right-6 top-6 z-50 flex items-start gap-3 rounded-2xl border border-success/20 bg-white px-5 py-4 shadow-soft-lg duration-300">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success-light text-success">
        <CheckCircle2 className="size-5" />
      </div>
      <div>
        <p className="text-sm font-extrabold text-charcoal">Dispatched Successfully!</p>
        <p className="mt-0.5 text-xs text-charcoal-soft">
          Alert sent to assigned lead engineer — {leadName || "Lead Engineer"}.
        </p>
      </div>
      <button
        onClick={onClose}
        className="ml-2 flex size-6 items-center justify-center rounded-full text-muted transition-colors hover:bg-cream-soft hover:text-charcoal"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function Events() {
  const [eventsList, setEventsList] = useState<EventOperation[]>(() =>
    loadStorage(STORAGE_KEY, seedEventsList)
  );

  useEffect(() => {
    saveStorage(STORAGE_KEY, eventsList);
  }, [eventsList]);

  const [activeEvent, setActiveEvent] = useState<EventOperation | null>(null);
  const [showToast, setShowToast] = useState(false);

  function updateActiveEvent(patch: Partial<EventOperation>) {
    if (!activeEvent) return;
    const updated = { ...activeEvent, ...patch };
    setActiveEvent(updated);
    setEventsList((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  }

  function handleToggleCheck(id: string) {
    if (!activeEvent) return;
    const updatedItems = activeEvent.packingItems.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    updateActiveEvent({ packingItems: updatedItems });
  }

  function handlePackingStatusChange(id: string, status: PackingStatus) {
    if (!activeEvent) return;
    const updatedItems = activeEvent.packingItems.map((item) =>
      item.id === id ? { ...item, packingStatus: status } : item
    );
    updateActiveEvent({ packingItems: updatedItems });
  }

  function handleMarkDispatched(targetId?: string) {
    const eventId = targetId || activeEvent?.id;
    if (!eventId) return;

    const now = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setEventsList((prev) =>
      prev.map((evt) => {
        if (evt.id === eventId) {
          const nextStages = evt.dispatchStages.map((stage) => {
            if (stage.id === "ds-3") return { ...stage, status: "completed" as const, sublabel: `Today, ${now}` };
            if (stage.id === "ds-4") return { ...stage, status: "in_progress" as const, sublabel: "In Progress" };
            return stage;
          });
          return { ...evt, status: "dispatched" as EventOperationStatus, dispatchStages: nextStages };
        }
        return evt;
      })
    );

    if (activeEvent && activeEvent.id === eventId) {
      const nextStages = activeEvent.dispatchStages.map((stage) => {
        if (stage.id === "ds-3") return { ...stage, status: "completed" as const, sublabel: `Today, ${now}` };
        if (stage.id === "ds-4") return { ...stage, status: "in_progress" as const, sublabel: "In Progress" };
        return stage;
      });
      setActiveEvent({ ...activeEvent, status: "dispatched", dispatchStages: nextStages });
    }

    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  }

  function handlePrint() {
    window.print();
  }

  // Render Events Table View
  if (!activeEvent) {
    return (
      <EventsListTable
        events={eventsList}
        onSelectEvent={(evt) => setActiveEvent(evt)}
        onMarkDispatched={(id) => handleMarkDispatched(id)}
      />
    );
  }

  // Render Event Runsheet View
  return (
    <>
      {showToast && (
        <DispatchToast
          onClose={() => setShowToast(false)}
          leadName={activeEvent.leadEngineer?.name}
        />
      )}

      <div className="flex flex-col gap-6">
        {/* Back button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveEvent(null)}
            className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-charcoal shadow-soft transition-transform hover:-translate-y-0.5"
          >
            <ArrowLeft className="size-4" />
            Back to Events Directory
          </button>
        </div>

        {/* Header */}
        <EventHeader
          eventId={activeEvent.id}
          eventName={activeEvent.eventName}
          linkedQuoteId={activeEvent.linkedQuoteId}
          clientType={activeEvent.clientType}
          status={activeEvent.status}
          onPrint={handlePrint}
          onMarkDispatched={() => handleMarkDispatched(activeEvent.id)}
          isDispatched={activeEvent.status === "dispatched"}
        />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
          <div className="flex flex-col gap-6 lg:col-span-7">
            <VenueSnapshotCard
              venue={activeEvent.venue}
              venueAddress={activeEvent.venueAddress}
              eventDate={activeEvent.eventDate}
              setupTime={activeEvent.setupTime}
              specialInstructions={activeEvent.specialInstructions}
            />

            <PackingChecklist
              items={activeEvent.packingItems}
              onToggleCheck={handleToggleCheck}
              onPackingStatusChange={handlePackingStatusChange}
            />
          </div>

          <div className="flex flex-col gap-6 lg:col-span-3">
            <StaffAssignmentCard
              initialLeadEngineer={activeEvent.leadEngineer}
              initialCrewMembers={activeEvent.crewMembers}
              initialFieldContact={activeEvent.fieldContact}
            />

            <LogisticsCard
              initialVehicleId={activeEvent.vehicleId}
              initialDriverName={activeEvent.driverName}
              initialDriverPhone={activeEvent.driverPhone}
              initialDispatchTime={activeEvent.estimatedDispatchTime}
            />

            <DispatchTimeline stages={activeEvent.dispatchStages} />
          </div>
        </div>
      </div>
    </>
  );
}
