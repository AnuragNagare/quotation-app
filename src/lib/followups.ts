import type { FollowUpTimeSlot } from "@/types";

export function deriveFollowUpTimeSlot(time24: string): FollowUpTimeSlot {
  const hour = Number(time24.split(":")[0]);
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
