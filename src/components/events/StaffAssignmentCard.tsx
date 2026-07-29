import { useState } from "react";
import { Users, Phone, UserCog } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { staffMembers } from "@/data/mockData";
import { getInitials } from "@/lib/format";
import type { StaffMember } from "@/types";

interface StaffAssignmentCardProps {
  initialLeadEngineer: StaffMember | null;
  initialCrewMembers: StaffMember[];
  initialFieldContact: string;
}

export function StaffAssignmentCard({
  initialLeadEngineer,
  initialCrewMembers,
  initialFieldContact,
}: StaffAssignmentCardProps) {
  const [leadId, setLeadId] = useState<string>(
    initialLeadEngineer?.id ?? ""
  );
  const [selectedCrew, setSelectedCrew] = useState<Set<string>>(
    new Set(initialCrewMembers.map((m) => m.id))
  );
  const [fieldContact, setFieldContact] = useState(initialFieldContact);

  const lead = staffMembers.find((s) => s.id === leadId) ?? null;

  function toggleCrew(id: string) {
    setSelectedCrew((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const crewList = staffMembers.filter((s) => s.id !== leadId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="size-4 text-gold-dark" />
          <CardTitle>Staff & Crew Assignment</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {/* Lead Engineer */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <UserCog className="size-3.5 text-muted" />
            <label className="text-xs font-semibold text-charcoal-soft">
              Lead Engineer
            </label>
          </div>
          <Select value={leadId} onValueChange={setLeadId}>
            <SelectTrigger className="h-10 w-full text-sm">
              <SelectValue placeholder="Select lead engineer" />
            </SelectTrigger>
            <SelectContent>
              {staffMembers.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="size-5">
                      <AvatarFallback className="text-[9px]">
                        {getInitials(s.name)}
                      </AvatarFallback>
                    </Avatar>
                    {s.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {lead && (
            <div className="flex items-center gap-2.5 rounded-xl bg-gold-soft/60 px-3 py-2.5">
              <Avatar className="size-8">
                <AvatarFallback>{getInitials(lead.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-bold text-charcoal">{lead.name}</p>
                <p className="text-xs text-muted">Lead Engineer</p>
              </div>
            </div>
          )}
        </div>

        {/* Setup Crew Multi-Select */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-charcoal-soft">
            Setup Crew
          </label>
          <div className="flex flex-col gap-1.5 rounded-2xl border border-cream-deep bg-cream-soft/30 p-3">
            {crewList.map((member) => {
              const isSelected = selectedCrew.has(member.id);
              return (
                <button
                  key={member.id}
                  onClick={() => toggleCrew(member.id)}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    isSelected
                      ? "bg-gold-light"
                      : "bg-white hover:bg-cream-soft"
                  }`}
                >
                  {/* Custom checkbox */}
                  <span
                    className={`flex size-4 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                      isSelected
                        ? "border-gold bg-gold"
                        : "border-cream-deep bg-white"
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="size-2.5 text-white"
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <path
                          d="M1.5 5L4 7.5L8.5 2.5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <Avatar className="size-7">
                    <AvatarFallback className="text-[10px]">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={`text-sm font-semibold ${
                      isSelected ? "text-gold-dark" : "text-charcoal-soft"
                    }`}
                  >
                    {member.name}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted">
            {selectedCrew.size} crew member{selectedCrew.size !== 1 ? "s" : ""}{" "}
            selected
          </p>
        </div>

        {/* Field Contact */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <Phone className="size-3.5 text-muted" />
            <label className="text-xs font-semibold text-charcoal-soft">
              Field Contact (Venue Coordinator)
            </label>
          </div>
          <Input
            type="tel"
            value={fieldContact}
            onChange={(e) => setFieldContact(e.target.value)}
            placeholder="+91 98765 43210"
          />
        </div>
      </CardContent>
    </Card>
  );
}
