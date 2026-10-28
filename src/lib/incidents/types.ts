import type { IncidentType, IncidentSeverity, IncidentStatus } from "@/lib/supabase/types";

export type PenaltyAction = "none" | "warning" | "credit_deduction" | "temporary_suspension";

export interface IncidentTimelineEvent {
  id: string;
  incidentId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  action: string;
  note: string;
  timestamp: string;
  statusShift?: {
    from: IncidentStatus;
    to: IncidentStatus;
  };
  penaltyApplied?: {
    action: PenaltyAction;
    justification: string;
  };
  photos?: string[];
}

export interface IncidentRecord {
  id: string;
  bookingId?: string;
  resourceId: string;
  resourceTitle: string;
  resourceSlug: string;
  resourceLocation: string;
  resourcePhoto?: string;
  reportedBy: string;
  reportedByName: string;
  reportedByRole: string;
  reportedByEmail?: string;
  reportedByAvatar?: string;
  type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  photos: string[];
  status: IncidentStatus;
  resolutionNote?: string;
  resolvedBy?: string;
  resolvedByName?: string;
  resolvedAt?: string;
  penaltyAction?: PenaltyAction;
  penaltyJustification?: string;
  isSystemGenerated?: boolean;
  overdueMinutes?: number;
  ai_summary?: string;
  ai_summarized_at?: string;
  timeline: IncidentTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

