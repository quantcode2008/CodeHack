import type { ConditionRating, ConditionPhase } from "@/lib/supabase/types";

export interface ConditionReport {
  id: string;
  bookingId: string;
  phase: ConditionPhase;
  overall: ConditionRating;
  notes: string;
  photos: string[];
  recordedBy: string;
  recordedByName: string;
  recordedAt: string;
}

export interface IncidentDraft {
  id: string;
  bookingId: string;
  resourceId: string;
  reportedBy: string;
  reportedByName: string;
  type: "damage" | "delay" | "misuse" | "safety" | "conflict" | "other";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  status: "open" | "under_review" | "resolved" | "dismissed";
  createdAt: string;
}

export interface BookingFeedback {
  id: string;
  bookingId: string;
  fromUserId: string;
  fromUserName: string;
  fromRole: "borrower" | "owner";
  rating: number; // 1 to 5
  note: string;
  createdAt: string;
}

