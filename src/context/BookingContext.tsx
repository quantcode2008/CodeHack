"use client";

import * as React from "react";
import { toast } from "sonner";
import { type BookingStatus } from "@/lib/supabase/types";
import { CAMPUS_RESOURCES, type CampusResource } from "@/lib/resources/data";

export interface BookingAuditEntry {
  id: string;
  action: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  notes: string;
  hash: string;
}

export interface BookingRecord {
  id: string;
  resourceId: string;
  resourceSlug: string;
  resourceTitle: string;
  resourceCategory: string;
  resourceLocation: string;
  resourcePhoto: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAffiliation: string;
  userAvatar: string;
  purpose: string;
  courseContext?: string;
  timeRangeStart: string; // ISO
  timeRangeEnd: string;   // ISO
  durationHours: number;
  status: BookingStatus;
  decisionReasonCodes?: string[];
  decisionExplanation?: string;
  decidedBy?: string;
  decidedByName?: string;
  decidedAt?: string;
  waitlistPriorityScore?: number;
  waitlistBreakdown?: {
    seniorityPts: number;
    usagePts: number;
    cleanStandingPts: number;
    courseNeedPts: number;
    position: number;
  };
  delegatedTo?: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: string;
  historyTrail: BookingAuditEntry[];
}

export interface BookingOutcome {
  outcome: "requested" | "blocked" | "waitlisted";
  bookingId?: string;
  booking?: BookingRecord;
  explanation: string;
  failedRules?: string[];
  fixActionLabel?: string;
  fixActionHref?: string;
  competingCount?: number;
  waitlistPosition?: number;
  waitlistScore?: number;
  nearestOpenSlots?: { day: string; dateStr: string; timeRange: string }[];
}

interface BookingContextType {
  bookings: BookingRecord[];
  requestBooking: (params: {
    resourceId: string;
    timeRangeStart: string;
    timeRangeEnd: string;
    durationHours: number;
    purpose: string;
    courseContext?: string;
    userCredsVerified: boolean;
    missingPrereqLabel?: string;
  }) => Promise<BookingOutcome>;
  decideBooking: (
    bookingId: string,
    decision: "approved" | "rejected" | "waitlisted",
    reasonCodes: string[],
    explanation: string
  ) => Promise<boolean>;
  cancelBooking: (bookingId: string, reason: string) => Promise<boolean>;
  extendBooking: (bookingId: string, additionalHours: number) => Promise<boolean>;
  delegateBooking: (
    bookingId: string,
    delegateeId: string,
    delegateeName: string
  ) => Promise<boolean>;
  getBookingById: (id: string) => BookingRecord | undefined;
}

const BookingContext = React.createContext<BookingContextType | undefined>(undefined);

// Initial believable seed bookings matching seed.sql
const INITIAL_BOOKINGS: BookingRecord[] = [
  {
    id: "bk-epilog-001",
    resourceId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0010",
    resourceSlug: "epilog-fusion-pro-laser",
    resourceTitle: "Epilog Fusion Pro 48 Laser Cutter",
    resourceCategory: "Heavy Equipment & CNC",
    resourceLocation: "Fabrication Lab, Room 104, East Engineering Wing",
    resourcePhoto: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80",
    userId: "11111111-1111-1111-1111-111111111111",
    userName: "Aanya Patel",
    userEmail: "aanya@eastbrook.edu",
    userAffiliation: "Dept of Mechanical Engineering (Year 3)",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    purpose: "Cutting 5mm optical acrylic casing and mounting tabs for ME-401 Capstone robotics rover.",
    courseContext: "ME-401 Senior Capstone",
    timeRangeStart: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    timeRangeEnd: new Date(Date.now() + 86400000 + 7200000).toISOString(),
    durationHours: 2.0,
    status: "approved",
    decisionReasonCodes: ["verified_credentials", "academic_urgency"],
    decisionExplanation:
      "Approved by Dr. Kavitha Rao: 'Laser safety certification verified. Slotted for tomorrow 14:00. Please wear approved OD5+ laser goggles.'",
    decidedBy: "22222222-2222-2222-2222-222222222222",
    decidedByName: "Dr. Kavitha Rao",
    decidedAt: new Date(Date.now() - 14400000).toISOString(),
    createdAt: new Date(Date.now() - 28800000).toISOString(),
    historyTrail: [
      {
        id: "aud-001",
        action: "Booking Request Initiated",
        actorName: "Aanya Patel",
        actorRole: "Student Borrower",
        timestamp: "Yesterday, 14:15 EST",
        notes: "Purpose declared for ME-401 Capstone.",
        hash: "0x8f2a...1e40",
      },
      {
        id: "aud-002",
        action: "Eligibility Checked & Validated",
        actorName: "Registry Engine",
        actorRole: "System RPC",
        timestamp: "Yesterday, 14:15 EST",
        notes: "Laser Safety Level 1 certification confirmed.",
        hash: "0x3c99...77b1",
      },
      {
        id: "aud-003",
        action: "Reservation Approved",
        actorName: "Dr. Kavitha Rao",
        actorRole: "Lab Director",
        timestamp: "Yesterday, 18:20 EST",
        notes: "Safety goggles mandatory. Digital key generated.",
        hash: "0x9a44...ff02",
      },
    ],
  },
  {
    id: "bk-prusa-002",
    resourceId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001",
    resourceSlug: "prusa-mk4-bench-a",
    resourceTitle: "Prusa MK4 Precision 3D Printer (Bench A)",
    resourceCategory: "Prototyping Device",
    resourceLocation: "Fabrication Lab, Room 104, East Engineering Wing",
    resourcePhoto: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    userId: "11111111-1111-1111-1111-111111111111",
    userName: "Aanya Patel",
    userEmail: "aanya@eastbrook.edu",
    userAffiliation: "Dept of Mechanical Engineering (Year 3)",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    purpose: "3D printing PETG planetary gear housings with 0.15mm layer height for rover drivetrain.",
    courseContext: "ME-401 Senior Capstone",
    timeRangeStart: new Date(Date.now() + 172800000).toISOString(),
    timeRangeEnd: new Date(Date.now() + 172800000 + 10800000).toISOString(),
    durationHours: 3.0,
    status: "requested",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    historyTrail: [
      {
        id: "aud-004",
        action: "Booking Request Initiated",
        actorName: "Aanya Patel",
        actorRole: "Student Borrower",
        timestamp: "Today, 10:30 EST",
        notes: "Awaiting lab director schedule review.",
        hash: "0x11bb...99aa",
      },
    ],
  },
  {
    id: "bk-sony-003",
    resourceId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005",
    resourceSlug: "sony-fx3-cinema-kit",
    resourceTitle: "Sony FX3 Full-Frame Cinema Camera Kit",
    resourceCategory: "Media & Cinema Apparatus",
    resourceLocation: "AV Equipment Vault, Library Basement Room B12",
    resourcePhoto: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
    userId: "11111111-1111-1111-1111-111111111111",
    userName: "Aanya Patel",
    userEmail: "aanya@eastbrook.edu",
    userAffiliation: "Dept of Mechanical Engineering (Year 3)",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    purpose: "Documentary recording of student robotics field trials on outdoor test course.",
    courseContext: "Robotics Club Media",
    timeRangeStart: new Date(Date.now() + 259200000).toISOString(),
    timeRangeEnd: new Date(Date.now() + 259200000 + 21600000).toISOString(),
    durationHours: 6.0,
    status: "waitlisted",
    waitlistPriorityScore: 82,
    waitlistBreakdown: {
      seniorityPts: 20,
      usagePts: 4,
      cleanStandingPts: 45,
      courseNeedPts: 15,
      position: 2,
    },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    historyTrail: [
      {
        id: "aud-005",
        action: "Slot Contested & Waitlisted",
        actorName: "Waitlist Priority Engine",
        actorRole: "System RPC",
        timestamp: "Today, 09:40 EST",
        notes: "Assigned Queue Position #2 (Score 82) behind Documentary Film Group.",
        hash: "0x66dd...33ff",
      },
    ],
  },
  {
    id: "bk-rf-004",
    resourceId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003",
    resourceSlug: "rf-electronics-testbench",
    resourceTitle: "RF & Mixed-Signal Electronics Testbench",
    resourceCategory: "Laboratory Bench",
    resourceLocation: "Maxwell Tower, Room 202, Bench 04",
    resourcePhoto: "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=1200&q=80",
    userId: "11111111-1111-1111-1111-111111111111",
    userName: "Aanya Patel",
    userEmail: "aanya@eastbrook.edu",
    userAffiliation: "Dept of Mechanical Engineering (Year 3)",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    purpose: "High-frequency oscilloscope probing of motor inverter PWM switching noise.",
    courseContext: "ECE-310 Embedded Systems",
    timeRangeStart: new Date(Date.now() - 86400000).toISOString(),
    timeRangeEnd: new Date(Date.now() - 75600000).toISOString(),
    durationHours: 3.0,
    status: "returned",
    decisionReasonCodes: ["verified_credentials"],
    decisionExplanation: "Approved by Imran Syed. Bench left in pristine condition.",
    decidedByName: "Imran Syed",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    historyTrail: [
      {
        id: "aud-006",
        action: "Physical Condition Checked Out",
        actorName: "Imran Syed",
        actorRole: "Lab Monitor",
        timestamp: "Yesterday, 17:30 EST",
        notes: "Probes safely holstered. Session sealed into immutable audit ledger.",
        hash: "0x55aa...88c2",
      },
    ],
  },
  // Competing request in queue for owner demonstration
  {
    id: "bk-epilog-compete-005",
    resourceId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0010",
    resourceSlug: "epilog-fusion-pro-laser",
    resourceTitle: "Epilog Fusion Pro 48 Laser Cutter",
    resourceCategory: "Heavy Equipment & CNC",
    resourceLocation: "Fabrication Lab, Room 104, East Engineering Wing",
    resourcePhoto: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80",
    userId: "55555555-5555-5555-5555-555555555555",
    userName: "Marcus Thorne",
    userEmail: "m.thorne@eastbrook.edu",
    userAffiliation: "School of Architecture (Year 4)",
    userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    purpose: "Architectural scale structural facade cutting in 4mm basswood and frosted acrylic sheets.",
    courseContext: "ARCH-502 Studio",
    timeRangeStart: new Date(Date.now() + 86400000).toISOString(),
    timeRangeEnd: new Date(Date.now() + 86400000 + 7200000).toISOString(),
    durationHours: 2.0,
    status: "requested",
    waitlistPriorityScore: 78,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    historyTrail: [
      {
        id: "aud-007",
        action: "Competing Request Submitted",
        actorName: "Marcus Thorne",
        actorRole: "Student Borrower",
        timestamp: "Today, 11:10 EST",
        notes: "Overlaps with Fab Lab Bench A slot. Priority score 78.",
        hash: "0x77bb...00cc",
      },
    ],
  },
];

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = React.useState<BookingRecord[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("commons_bookings_ledger");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return INITIAL_BOOKINGS;
  });

  // Sync to local storage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("commons_bookings_ledger", JSON.stringify(bookings));
    }
  }, [bookings]);

  /**
   * Submit a new booking request with dry-run fair-use check
   */
  const requestBooking = async (params: {
    resourceId: string;
    timeRangeStart: string;
    timeRangeEnd: string;
    durationHours: number;
    purpose: string;
    courseContext?: string;
    userCredsVerified: boolean;
    missingPrereqLabel?: string;
  }): Promise<BookingOutcome> => {
    const targetResource = CAMPUS_RESOURCES.find(
      (r) => r.id === params.resourceId || r.slug === params.resourceId
    );

    if (!targetResource) {
      return {
        outcome: "blocked",
        explanation: "Resource not found in campus registry.",
      };
    }

    // Rule Check 1: Prerequisites
    if (!params.userCredsVerified && params.missingPrereqLabel) {
      return {
        outcome: "blocked",
        explanation: `Blocked by Prerequisite Check: ${params.missingPrereqLabel} is required before booking this tool.`,
        failedRules: ["Prerequisite Training & Qualification"],
        fixActionLabel: "Upload Safety Certificate",
        fixActionHref: "/onboarding",
      };
    }

    // Rule Check 2: Max Hours Limit
    if (params.durationHours > targetResource.maxBookingHours) {
      return {
        outcome: "blocked",
        explanation: `Requested duration (${params.durationHours}h) exceeds the single-session ceiling of ${targetResource.maxBookingHours}h for this tool.`,
        failedRules: ["Single-Session Duration Ceiling"],
      };
    }

    // Check for slot contention (simulate waitlist outcome if slot is already reserved)
    const isSlotContested = targetResource.weeklySchedule.some(
      (s) => s.status === "booked" && s.timeRange.includes("14:00")
    );

    const newBookingId = `bk-${Date.now().toString(36)}`;
    const newBooking: BookingRecord = {
      id: newBookingId,
      resourceId: targetResource.id,
      resourceSlug: targetResource.slug,
      resourceTitle: targetResource.title,
      resourceCategory: targetResource.categoryLabel,
      resourceLocation: targetResource.locationText,
      resourcePhoto: targetResource.photos[0],
      userId: "11111111-1111-1111-1111-111111111111",
      userName: "Aanya Patel",
      userEmail: "aanya@eastbrook.edu",
      userAffiliation: "Dept of Mechanical Engineering (Year 3)",
      userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      purpose: params.purpose,
      courseContext: params.courseContext || "Undergraduate Engineering",
      timeRangeStart: params.timeRangeStart,
      timeRangeEnd: params.timeRangeEnd,
      durationHours: params.durationHours,
      status: isSlotContested ? "waitlisted" : "requested",
      waitlistPriorityScore: isSlotContested ? 85 : undefined,
      waitlistBreakdown: isSlotContested
        ? {
            seniorityPts: 20,
            usagePts: 4,
            cleanStandingPts: 45,
            courseNeedPts: 16,
            position: 2,
          }
        : undefined,
      createdAt: new Date().toISOString(),
      historyTrail: [
        {
          id: `aud-${Date.now()}`,
          action: isSlotContested ? "Waitlist Position Assigned" : "Booking Request Dispatched",
          actorName: "Aanya Patel",
          actorRole: "Student Borrower",
          timestamp: "Just now",
          notes: isSlotContested
            ? "Assigned position #2 via transparent waitlist algorithm."
            : `Routed to ${targetResource.owner.name} for schedule approval.`,
          hash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
        },
      ],
    };

    // Optimistic state update
    setBookings((prev) => [newBooking, ...prev]);

    if (isSlotContested) {
      return {
        outcome: "waitlisted",
        bookingId: newBookingId,
        booking: newBooking,
        waitlistPosition: 2,
        waitlistScore: 85,
        explanation:
          "Slot is currently held by a primary reservation. You have been placed at Queue Position #2 based on your 0 no-show record and capstone course enrollment.",
        nearestOpenSlots: [
          { day: "Tomorrow", dateStr: "Next Day", timeRange: "16:30 - 19:00" },
          { day: "Friday", dateStr: "Oct 30", timeRange: "09:00 - 12:00" },
        ],
      };
    }

    return {
      outcome: "requested",
      bookingId: newBookingId,
      booking: newBooking,
      explanation: `Your booking request has been routed to ${targetResource.owner.name} (${targetResource.owner.department}). Standard turnaround is < 2 hours.`,
    };
  };

  /**
   * Owner/Manager decision with mandatory explanation
   */
  const decideBooking = async (
    bookingId: string,
    decision: "approved" | "rejected" | "waitlisted",
    reasonCodes: string[],
    explanation: string
  ): Promise<boolean> => {
    if (!explanation.trim() || explanation.trim().length < 8) {
      toast.error("A substantive explanation is mandatory (minimum 8 characters).");
      return false;
    }

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;

        const newAuditEntry: BookingAuditEntry = {
          id: `aud-${Date.now()}`,
          action: `Decision: ${decision.toUpperCase()}`,
          actorName: "Dr. Kavitha Rao",
          actorRole: "Lab Director",
          timestamp: "Just now",
          notes: explanation,
          hash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
        };

        return {
          ...b,
          status: decision as BookingStatus,
          decisionReasonCodes: reasonCodes,
          decisionExplanation: explanation,
          decidedBy: "22222222-2222-2222-2222-222222222222",
          decidedByName: "Dr. Kavitha Rao",
          decidedAt: new Date().toISOString(),
          historyTrail: [...b.historyTrail, newAuditEntry],
        };
      })
    );

    toast.success(`Booking ${decision.toUpperCase()}`, {
      description: `Explanation recorded: "${explanation}"`,
    });
    return true;
  };

  /**
   * Cancel booking
   */
  const cancelBooking = async (bookingId: string, reason: string): Promise<boolean> => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;
        return {
          ...b,
          status: "cancelled",
          historyTrail: [
            ...b.historyTrail,
            {
              id: `aud-${Date.now()}`,
              action: "Booking Cancelled by User",
              actorName: b.userName,
              actorRole: "Borrower",
              timestamp: "Just now",
              notes: reason || "User released reservation slot.",
              hash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
            },
          ],
        };
      })
    );
    toast.info("Booking reservation cancelled", {
      description: "Slot returned to the campus public pool.",
    });
    return true;
  };

  /**
   * Extend booking session
   */
  const extendBooking = async (bookingId: string, additionalHours: number): Promise<boolean> => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;
        const currentEnd = new Date(b.timeRangeEnd).getTime();
        const newEnd = new Date(currentEnd + additionalHours * 3600000).toISOString();
        return {
          ...b,
          timeRangeEnd: newEnd,
          durationHours: b.durationHours + additionalHours,
          historyTrail: [
            ...b.historyTrail,
            {
              id: `aud-${Date.now()}`,
              action: `Session Extended (+${additionalHours}h)`,
              actorName: "Registry System",
              actorRole: "Automated Extension",
              timestamp: "Just now",
              notes: `Extension approved under consecutive slot availability.`,
              hash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
            },
          ],
        };
      })
    );
    toast.success(`Session extended by ${additionalHours} hour(s)`);
    return true;
  };

  /**
   * Delegate review to lab manager
   */
  const delegateBooking = async (
    bookingId: string,
    delegateeId: string,
    delegateeName: string
  ): Promise<boolean> => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;
        return {
          ...b,
          delegatedTo: {
            id: delegateeId,
            name: delegateeName,
            role: "Lab Monitor / Custodian",
          },
          historyTrail: [
            ...b.historyTrail,
            {
              id: `aud-${Date.now()}`,
              action: "Review Authority Delegated",
              actorName: "Dr. Kavitha Rao",
              actorRole: "Lab Director",
              timestamp: "Just now",
              notes: `Review delegated to ${delegateeName}.`,
              hash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
            },
          ],
        };
      })
    );
    toast.info(`Review delegated to ${delegateeName}`);
    return true;
  };

  const getBookingById = (id: string) => {
    return bookings.find((b) => b.id === id);
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        requestBooking,
        decideBooking,
        cancelBooking,
        extendBooking,
        delegateBooking,
        getBookingById,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const context = React.useContext(BookingContext);
  if (!context) {
    throw new Error("useBookings must be used within a BookingProvider");
  }
  return context;
}

