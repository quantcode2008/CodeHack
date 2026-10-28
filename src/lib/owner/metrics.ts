import {
  type ResourceUtilisationData,
  type HeatmapDayRow,
  type HeatmapHourSlot,
  type AdminMetrics,
  type FairUseFlaggedUser,
  type ResourceManager,
  type OrgVerificationItem,
} from "./types";

const DAYS: ("Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun")[] = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

const DAY_LABELS: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

/**
 * Generate deterministic weekday x hour heatmap for a resource based on ID
 */
export function generateResourceHeatmap(resourceId: string): HeatmapDayRow[] {
  // Use simple hash of ID to produce coherent yet distinct patterns
  const seed = resourceId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return DAYS.map((day, dIdx) => {
    const isWeekend = day === "Sat" || day === "Sun";
    const hours: HeatmapHourSlot[] = [];

    for (let hour = 8; hour <= 22; hour++) {
      // Academic curve: peaks between 13:00 and 18:00
      let baseLoad = 20;
      if (hour >= 13 && hour <= 18) baseLoad = 75;
      else if (hour >= 10 && hour < 13) baseLoad = 55;
      else if (hour > 18 && hour <= 21) baseLoad = 40;
      else baseLoad = 15;

      if (isWeekend) {
        baseLoad = Math.max(5, baseLoad - 35);
      }

      // Add pseudo-random deterministic variation
      const variance = ((seed * (dIdx + 1) * hour) % 35) - 15;
      let utilization = Math.min(100, Math.max(0, baseLoad + variance));

      // Occasional maintenance/blackout slot on Monday morning or Friday evening
      const isBlackout = (day === "Mon" && hour === 8) || (day === "Fri" && hour === 22 && seed % 2 === 0);

      let status: HeatmapHourSlot["status"] = "idle";
      if (isBlackout) {
        status = "blackout";
        utilization = 0;
      } else if (utilization >= 75) {
        status = "peak";
      } else if (utilization >= 50) {
        status = "moderate";
      } else if (utilization >= 20) {
        status = "light";
      }

      const bookedHours = isBlackout ? 0 : Number((utilization / 100).toFixed(1));
      const sessionsCount = utilization > 60 ? 2 : utilization > 20 ? 1 : 0;

      hours.push({
        hour,
        utilizationPct: Math.round(utilization),
        status,
        bookedHours,
        sessionsCount,
      });
    }

    return {
      day,
      dayLabel: DAY_LABELS[day],
      hours,
    };
  });
}

/**
 * Deterministic utilisation data per resource
 */
export function getResourceUtilisation(resourceId: string): ResourceUtilisationData {
  const seed = resourceId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseRate = 60 + (seed % 30); // 60% to 89%
  const recoveredHours = 32 + (seed % 40); // 32 to 71 hours

  // 7-day sparkline
  const sparkline = [
    Math.max(20, Math.min(100, baseRate - 15 + ((seed * 1) % 20))),
    Math.max(20, Math.min(100, baseRate - 5 + ((seed * 2) % 20))),
    Math.max(20, Math.min(100, baseRate + 10 - ((seed * 3) % 20))),
    Math.max(20, Math.min(100, baseRate + 5 + ((seed * 4) % 15))),
    Math.max(20, Math.min(100, baseRate + 15 - ((seed * 5) % 25))),
    Math.max(20, Math.min(100, baseRate - 20 + ((seed * 6) % 15))),
    baseRate,
  ];

  return {
    resourceId,
    utilizationRate: baseRate,
    idleHoursRecovered: recoveredHours,
    totalHoursBooked: Math.round(recoveredHours * 1.35),
    totalSessions: 14 + (seed % 15),
    peakHourRange: "13:00 – 17:00",
    mostIdleWindow: "08:00 – 10:00",
    sparkline,
    heatmap: generateResourceHeatmap(resourceId),
  };
}

/**
 * Seed managers per resource
 */
export const SEED_RESOURCE_MANAGERS: ResourceManager[] = [
  {
    id: "mgr-001",
    resourceId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001",
    name: "Dr. Elena Rostova",
    email: "e.rostova@eastbrook.edu",
    roleTitle: "Senior Lab Technician",
    status: "active",
    invitedAt: "2026-09-01T10:00:00Z",
    permissions: {
      canApproveBookings: true,
      canVerifyHandoff: true,
      canModifySchedule: true,
      canManageIncidents: true,
    },
  },
  {
    id: "mgr-002",
    resourceId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001",
    name: "Julian Vance",
    email: "j.vance@eastbrook.edu",
    roleTitle: "Graduate Lab Monitor",
    status: "active",
    invitedAt: "2026-09-15T14:30:00Z",
    permissions: {
      canApproveBookings: true,
      canVerifyHandoff: true,
      canModifySchedule: false,
      canManageIncidents: false,
    },
  },
  {
    id: "mgr-003",
    resourceId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002",
    name: "Aanya Patel",
    email: "aanya@eastbrook.edu",
    roleTitle: "Peer Safety Proctor",
    status: "pending_invite",
    invitedAt: "2026-10-20T09:15:00Z",
    permissions: {
      canApproveBookings: false,
      canVerifyHandoff: true,
      canModifySchedule: false,
      canManageIncidents: false,
    },
  },
];

/**
 * Seed rule-based fair-use flagged users
 */
export const SEED_FAIR_USE_FLAGS: FairUseFlaggedUser[] = [
  {
    id: "flag-001",
    userId: "usr-4910",
    userName: "Devon Chen",
    email: "d.chen@eastbrook.edu",
    department: "Robotics & Automation",
    role: "student",
    flagType: "WEEKLY_CAP_EXCEEDED",
    severity: "medium",
    metricDetail: "8.5 hrs logged (Weekly Cap: 8.0h limit)",
    ruleExplanation:
      "Automated balance check detected consecutive bookings across Hall B testbenches exceeding the collegiate weekly threshold.",
    recommendedRuleAction: "Apply 24h Cooldown",
    detectedAt: "2026-10-28T14:22:00Z",
    status: "flagged",
  },
  {
    id: "flag-002",
    userId: "usr-8192",
    userName: "Maya Lin",
    email: "m.lin@eastbrook.edu",
    department: "Media Arts & Cinema",
    role: "student",
    flagType: "HIGH_CANCELLATION_RATE",
    severity: "high",
    metricDetail: "4 cancellations within 2 hours of slot (42% rate)",
    ruleExplanation:
      "Late cancellation rule triggered: 4 prime weekend slots freed with less than 2h notice, starving waitlisted peers.",
    recommendedRuleAction: "Require Manager Signoff",
    detectedAt: "2026-10-27T18:10:00Z",
    status: "flagged",
  },
  {
    id: "flag-003",
    userId: "usr-1029",
    userName: "Prof. Kenneth Bailey",
    email: "k.bailey@eastbrook.edu",
    department: "Civil & Environmental Engineering",
    role: "faculty",
    flagType: "CONSECUTIVE_OVERBOOK",
    severity: "low",
    metricDetail: "4 consecutive days booked (Max limit: 3 days)",
    ruleExplanation:
      "Fair access rule requires a 24-hour turnaround interval after 3 consecutive days on heavy testing equipment.",
    recommendedRuleAction: "Notify Borrower",
    detectedAt: "2026-10-26T11:45:00Z",
    status: "reviewed",
  },
  {
    id: "flag-004",
    userId: "usr-3041",
    userName: "Lucas Thorne",
    email: "l.thorne@eastbrook.edu",
    department: "Mechanical Engineering",
    role: "student",
    flagType: "REPEAT_LATE_RETURN",
    severity: "high",
    metricDetail: "2 returns exceeded grace period by >30 mins",
    ruleExplanation:
      "Automated handoff timestamp recorded check-out 45m past scheduled conclusion without extension request.",
    recommendedRuleAction: "Apply 24h Cooldown",
    detectedAt: "2026-10-28T16:00:00Z",
    status: "flagged",
  },
];

/**
 * System-wide admin metrics
 */
export const SEED_ADMIN_METRICS: AdminMetrics = {
  overallUtilizationRate: 68.4,
  idleHoursRecoveredTotal: 1420,
  avgApprovalTimeHours: 1.8,
  noShowRatePct: 1.2,
  activeListingsCount: 14,
  activeBorrowersCount: 238,
  monthlyTrend: [
    { month: "May", utilizationPct: 52, hoursRecovered: 180, bookingsCount: 65 },
    { month: "Jun", utilizationPct: 58, hoursRecovered: 210, bookingsCount: 78 },
    { month: "Jul", utilizationPct: 61, hoursRecovered: 245, bookingsCount: 86 },
    { month: "Aug", utilizationPct: 64, hoursRecovered: 290, bookingsCount: 104 },
    { month: "Sep", utilizationPct: 71, hoursRecovered: 350, bookingsCount: 132 },
    { month: "Oct", utilizationPct: 68, hoursRecovered: 345, bookingsCount: 128 },
  ],
  categoryBreakdown: [
    {
      category: "device",
      label: "Prototyping & Precision Devices",
      resourceCount: 5,
      utilizationRate: 74,
      color: "#B8522E", // terracotta
    },
    {
      category: "space",
      label: "Specialized Studios & Rooms",
      resourceCount: 4,
      utilizationRate: 69,
      color: "#8A9A7B", // sage
    },
    {
      category: "equipment",
      label: "Heavy Fabrication Equipment",
      resourceCount: 3,
      utilizationRate: 62,
      color: "#B07A1E", // warning gold
    },
    {
      category: "tool",
      label: "Precision Hand Instruments",
      resourceCount: 2,
      utilizationRate: 58,
      color: "#6B675E", // muted ink
    },
  ],
};

/**
 * Organisation / Departmental accreditation queue
 */
export const SEED_ORG_VERIFICATIONS: OrgVerificationItem[] = [
  {
    id: "org-001",
    orgName: "Center for Autonomous Robotics",
    department: "Electrical & Computer Engineering",
    contactEmail: "robotics-core@eastbrook.edu",
    campusAffiliation: "Dean of Engineering Research Cluster",
    submittedAt: "2026-10-24T11:00:00Z",
    status: "pending",
    resourcesCount: 3,
  },
  {
    id: "org-002",
    orgName: "Sustainable Materials Testing Facility",
    department: "Materials Science",
    contactEmail: "matsci-lab@eastbrook.edu",
    campusAffiliation: "Northfield Sustainability Initiative",
    submittedAt: "2026-10-26T16:20:00Z",
    status: "pending",
    resourcesCount: 2,
  },
  {
    id: "org-003",
    orgName: "Digital Media Arts Guild",
    department: "Fine Arts & Humanities",
    contactEmail: "media-guild@eastbrook.edu",
    campusAffiliation: "Student Activities Council",
    submittedAt: "2026-10-15T09:30:00Z",
    status: "verified",
    resourcesCount: 4,
  },
];

