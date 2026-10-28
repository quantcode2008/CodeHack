import { type CampusResource, type AvailabilitySlot, type ResourceRequirementItem, type FairUsePolicy } from "@/lib/resources/data";
import { type ResourceCategory } from "@/lib/supabase/types";

export type OwnerResourceStatus = "listed" | "draft" | "paused" | "maintenance" | "archived";

export interface ScopedPermissions {
  canApproveBookings: boolean;
  canVerifyHandoff: boolean;
  canModifySchedule: boolean;
  canManageIncidents: boolean;
}

export interface ResourceManager {
  id: string;
  resourceId: string;
  name: string;
  email: string;
  roleTitle: string;
  avatarUrl?: string;
  status: "active" | "pending_invite";
  invitedAt: string;
  permissions: ScopedPermissions;
}

export interface HeatmapHourSlot {
  hour: number; // 8 to 22 (8:00 to 22:00)
  utilizationPct: number; // 0 to 100
  status: "idle" | "light" | "moderate" | "peak" | "blackout";
  bookedHours: number;
  sessionsCount: number;
}

export interface HeatmapDayRow {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  dayLabel: string;
  hours: HeatmapHourSlot[];
}

export interface ResourceUtilisationData {
  resourceId: string;
  utilizationRate: number; // e.g. 74%
  idleHoursRecovered: number; // e.g. 48.5
  totalHoursBooked: number; // e.g. 62.0
  totalSessions: number; // e.g. 19
  peakHourRange: string; // e.g. "14:00 - 17:00"
  mostIdleWindow: string; // e.g. "08:00 - 10:00"
  sparkline: number[]; // 7-day trend array [45, 55, 70, 68, 85, 62, 74]
  heatmap: HeatmapDayRow[];
}

export interface AdminMetrics {
  overallUtilizationRate: number; // e.g. 68.4
  idleHoursRecoveredTotal: number; // e.g. 1420
  avgApprovalTimeHours: number; // e.g. 1.8
  noShowRatePct: number; // e.g. 1.2
  activeListingsCount: number;
  activeBorrowersCount: number;
  monthlyTrend: {
    month: string;
    utilizationPct: number;
    hoursRecovered: number;
    bookingsCount: number;
  }[];
  categoryBreakdown: {
    category: ResourceCategory;
    label: string;
    resourceCount: number;
    utilizationRate: number;
    color: string;
  }[];
}

export type FairUseFlagType =
  | "WEEKLY_CAP_EXCEEDED"
  | "HIGH_CANCELLATION_RATE"
  | "CONSECUTIVE_OVERBOOK"
  | "REPEAT_LATE_RETURN"
  | "CONCURRENT_HOLD_SPIKE";

export interface FairUseFlaggedUser {
  id: string;
  userId: string;
  userName: string;
  email: string;
  department: string;
  role: "student" | "researcher" | "faculty";
  avatarUrl?: string;
  flagType: FairUseFlagType;
  severity: "low" | "medium" | "high";
  metricDetail: string;
  ruleExplanation: string;
  recommendedRuleAction: "Apply 24h Cooldown" | "Notify Borrower" | "Require Manager Signoff" | "Temporarily Restrict Device Category";
  detectedAt: string;
  status: "flagged" | "reviewed" | "dismissed";
}

export interface OrgVerificationItem {
  id: string;
  orgName: string;
  department: string;
  contactEmail: string;
  campusAffiliation: string;
  submittedAt: string;
  status: "pending" | "verified" | "rejected";
  resourcesCount: number;
}
