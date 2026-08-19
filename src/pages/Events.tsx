import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";

import { EventHeader } from "@/components/events/EventHeader";
import { VenueSnapshotCard } from "@/components/events/VenueSnapshotCard";
import { PackingChecklist } from "@/components/events/PackingChecklist";
import { StaffAssignmentCard } from "@/components/events/StaffAssignmentCard";
import { LogisticsCard } from "@/components/events/LogisticsCard";
import { DispatchTimeline } from "@/components/events/DispatchTimeline";
import { eventOperation as initialData } from "@/data/mockData";
import type {
  DispatchStageItem,
  EventOperationStatus,
  PackingItem,
  PackingStatus,
} from "@/types";

// ── Toast notification ─────────────────────────────────────────────────────────

function DispatchToast({ onClose }: { onClose: () => void }) {
  return (
    <div className="animate-in slide-in-from-top-4 fade-in fixed right-6 top-6 z-50 flex items-start gap-3 rounded-2xl border border-success/20 bg-white px-5 py-4 shadow-soft-lg duration-300">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success-light text-success">
        <CheckCircle2 className="size-5" />
      </div>
      <div>
        <p className="text-sm font-extrabold text-charcoal">
          Dispatched Successfully!
        </p>
        <p className="mt-0.5 text-xs text-charcoal-soft">
          Alert sent to assigned lead engineer — Arjun Patel.
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

// ── Page ───────────────────────────────────────────────────────────────────────

export function Events() {
  const [packingItems, setPackingItems] = useState<PackingItem[]>(
    initialData.packingItems
  );
  const [eventStatus, setEventStatus] = useState<EventOperationStatus>(
    initialData.status
  );
  const [dispatchStages, setDispatchStages] = useState<DispatchStageItem[]>(
    initialData.dispatchStages
  );
  const [isDispatched, setIsDispatched] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  function handleToggleCheck(id: string) {
    setPackingItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  }

  function handlePackingStatusChange(id: string, status: PackingStatus) {
    setPackingItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, packingStatus: status } : item
      )
    );
  }

  function handleMarkDispatched() {
    setIsDispatched(true);
    setEventStatus("dispatched");

    // Advance the timeline: stage 3 → completed, stage 4 → in_progress
    setDispatchStages((prev) =>
      prev.map((stage) => {
        if (stage.id === "ds-3") {
          const now = new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          });
          return { ...stage, status: "completed", sublabel: `Today, ${now}` };
        }
        if (stage.id === "ds-4") {
          return { ...stage, status: "in_progress", sublabel: "In Progress" };
        }
        return stage;
      })
    );

    // Show toast, auto-dismiss after 4 seconds
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  }

  function handlePrint() {
    window.print();
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Dispatch success toast */}
      {showToast && <DispatchToast onClose={() => setShowToast(false)} />}

      <div className="flex flex-col gap-6">
        {/* Header */}
        <EventHeader
          eventId={initialData.id}
          eventName={initialData.eventName}
          linkedQuoteId={initialData.linkedQuoteId}
          clientType={initialData.clientType}
          status={eventStatus}
          onPrint={handlePrint}
          onMarkDispatched={handleMarkDispatched}
          isDispatched={isDispatched}
        />

        {/* ── Two-column layout: 65% left / 35% right ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
          {/* LEFT COLUMN: Material Checklist & Venue */}
          <div className="flex flex-col gap-6 lg:col-span-7">
            <VenueSnapshotCard
              venue={initialData.venue}
              venueAddress={initialData.venueAddress}
              eventDate={initialData.eventDate}
              setupTime={initialData.setupTime}
              specialInstructions={initialData.specialInstructions}
            />

            <PackingChecklist
              items={packingItems}
              onToggleCheck={handleToggleCheck}
              onPackingStatusChange={handlePackingStatusChange}
            />
          </div>

          {/* RIGHT COLUMN: Staff, Logistics, Timeline */}
          <div className="flex flex-col gap-6 lg:col-span-3">
            <StaffAssignmentCard
              initialLeadEngineer={initialData.leadEngineer}
              initialCrewMembers={initialData.crewMembers}
              initialFieldContact={initialData.fieldContact}
            />

            <LogisticsCard
              initialVehicleId={initialData.vehicleId}
              initialDriverName={initialData.driverName}
              initialDriverPhone={initialData.driverPhone}
              initialDispatchTime={initialData.estimatedDispatchTime}
            />

            <DispatchTimeline stages={dispatchStages} />
          </div>
        </div>
      </div>
    </>
  );
}
