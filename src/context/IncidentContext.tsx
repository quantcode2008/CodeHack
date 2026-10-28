"use client";

import * as React from "react";
import { toast } from "sonner";
import { type IncidentRecord, type PenaltyAction, type IncidentTimelineEvent } from "@/lib/incidents/types";
import { type IncidentType, type IncidentSeverity, type IncidentStatus } from "@/lib/supabase/types";
import { useAudit } from "@/context/AuditContext";
import { useNotifications } from "@/context/NotificationContext";

interface IncidentContextType {
  incidents: IncidentRecord[];
  reportIncident: (data: {
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
    type: IncidentType;
    severity: IncidentSeverity;
    description: string;
    photos?: string[];
  }) => Promise<IncidentRecord>;
  updateIncidentStatus: (
    incidentId: string,
    status: IncidentStatus,
    resolutionNote: string,
    penaltyAction?: PenaltyAction,
    penaltyJustification?: string
  ) => Promise<boolean>;
  addTimelineComment: (incidentId: string, comment: string, authorName?: string) => Promise<boolean>;
  saveIncidentAiSummary: (incidentId: string, summary: string) => Promise<void>;
  getIncidentById: (id: string) => IncidentRecord | undefined;
}

const IncidentContext = React.createContext<IncidentContextType | undefined>(undefined);

const INITIAL_INCIDENTS: IncidentRecord[] = [
  // 1. System-Generated Delay Incident (Needs Review)
  {
    id: "inc-001",
    bookingId: "bk-active-sony-002",
    resourceId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005",
    resourceTitle: "Sony FX3 Full-Frame Cinema Camera Kit",
    resourceSlug: "sony-fx3-cinema-kit",
    resourceLocation: "AV Equipment Vault, Library Basement Room B12",
    resourcePhoto: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
    reportedBy: "00000000-0000-0000-0000-000000000000",
    reportedByName: "System Daemon (pg_cron)",
    reportedByRole: "system",
    type: "delay",
    severity: "low",
    description: "System-generated: Equipment overdue by 45 minutes beyond scheduled checkout window. No departure condition checklist submitted.",
    photos: [],
    status: "open",
    isSystemGenerated: true,
    overdueMinutes: 45,
    ai_summary: "Automated alert triggered when equipment checkout exceeded reservation window by 45 minutes without return checklist submission. Physical return has not yet been reconciled against door access records. Custodian review required to verify possession status before resolution.",
    ai_summarized_at: new Date(Date.now() - 1800000).toISOString(),
    createdAt: new Date(Date.now() - 2700000).toISOString(), // 45m ago
    updatedAt: new Date(Date.now() - 2700000).toISOString(),
    timeline: [
      {
        id: "tl-001",
        incidentId: "inc-001",
        authorName: "System Daemon (pg_cron)",
        authorRole: "system",
        action: "Incident Auto-Created by System",
        note: "Triggered automatically by 5-minute recurrence job mark_overdue_bookings(). Booking status set to 'overdue'.",
        timestamp: "45 minutes ago",
      },
    ],
  },

  // 2. Damage Incident under review
  {
    id: "inc-002",
    bookingId: "bk-epilog-001",
    resourceId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0010",
    resourceTitle: "Epilog Fusion Pro 48 Laser Cutter",
    resourceSlug: "epilog-fusion-pro-laser",
    resourceLocation: "Fabrication Lab, Room 104, East Engineering Wing",
    resourcePhoto: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80",
    reportedBy: "11111111-1111-1111-1111-111111111111",
    reportedByName: "Aanya Patel",
    reportedByRole: "student",
    reportedByEmail: "aanya@eastbrook.edu",
    type: "damage",
    severity: "medium",
    description: "Hairline stress fissure observed along bottom acrylic guide bracket on honeycomb bed. Disclosed voluntarily before starting job.",
    photos: [
      "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=800&q=80",
    ],
    status: "under_review",
    isSystemGenerated: false,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    timeline: [
      {
        id: "tl-002a",
        incidentId: "inc-002",
        authorName: "Aanya Patel",
        authorRole: "student",
        action: "Damage Disclosed at Physical Arrival",
        note: "Disclosed during arrival inspection. 1 photo attached.",
        timestamp: "4 hours ago",
        photos: [
          "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=800&q=80",
        ],
      },
      {
        id: "tl-002b",
        incidentId: "inc-002",
        authorName: "Dr. Kavitha Rao",
        authorRole: "owner",
        action: "Moved to Under Review",
        note: "Scheduled inspection with machine shop technician to assess structural integrity of guide rail before Capstone run.",
        timestamp: "2 hours ago",
        statusShift: {
          from: "open",
          to: "under_review",
        },
      },
    ],
  },

  // 3. Resolved Incident with penalty warning
  {
    id: "inc-003",
    bookingId: "bk-prusa-002",
    resourceId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001",
    resourceTitle: "Prusa MK4 Precision 3D Printer (Bench A)",
    resourceSlug: "prusa-mk4-bench-a",
    resourceLocation: "Fabrication Lab, Room 104, East Engineering Wing",
    resourcePhoto: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    reportedBy: "33333333-3333-3333-3333-333333333333",
    reportedByName: "Imran Syed",
    reportedByRole: "manager",
    type: "misuse",
    severity: "low",
    description: "Print bed scraped with metal spatula before reaching cooldown temperature, leaving minor mark on PEI coating.",
    photos: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    ],
    status: "resolved",
    resolutionNote: "PEI sheet flipped to textured B-side. Cleaned with 99% isopropanol. No heating element damage.",
    resolvedBy: "22222222-2222-2222-2222-222222222222",
    resolvedByName: "Dr. Kavitha Rao",
    resolvedAt: new Date(Date.now() - 86400000).toISOString(),
    penaltyAction: "warning",
    penaltyJustification: "First occurrence. Student reminded that PEI plates must cool naturally to 35°C before part release.",
    isSystemGenerated: false,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    timeline: [
      {
        id: "tl-003a",
        incidentId: "inc-003",
        authorName: "Imran Syed",
        authorRole: "manager",
        action: "Misuse Incident Reported",
        note: "Metal scraper mark found on smooth PEI sheet.",
        timestamp: "2 days ago",
      },
      {
        id: "tl-003b",
        incidentId: "inc-003",
        authorName: "Dr. Kavitha Rao",
        authorRole: "owner",
        action: "Incident Resolved with Warning Citation",
        note: "PEI sheet flipped to textured B-side. Re-leveled. Formal warning logged to student profile.",
        timestamp: "Yesterday",
        statusShift: {
          from: "under_review",
          to: "resolved",
        },
        penaltyApplied: {
          action: "warning",
          justification: "First occurrence. Reminded to allow thermal release below 35°C.",
        },
      },
    ],
  },
];

export function IncidentProvider({ children }: { children: React.ReactNode }) {
  const { logAudit } = useAudit();
  const { sendNotification } = useNotifications();

  const [incidents, setIncidents] = React.useState<IncidentRecord[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("commons_incidents_ledger_v2");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return INITIAL_INCIDENTS;
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("commons_incidents_ledger_v2", JSON.stringify(incidents));
    }
  }, [incidents]);

  const reportIncident = async (data: {
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
    type: IncidentType;
    severity: IncidentSeverity;
    description: string;
    photos?: string[];
  }): Promise<IncidentRecord> => {
    const newId = `inc-${Date.now().toString(36)}`;
    const nowIso = new Date().toISOString();

    const newRecord: IncidentRecord = {
      id: newId,
      bookingId: data.bookingId,
      resourceId: data.resourceId,
      resourceTitle: data.resourceTitle,
      resourceSlug: data.resourceSlug,
      resourceLocation: data.resourceLocation,
      resourcePhoto: data.resourcePhoto,
      reportedBy: data.reportedBy,
      reportedByName: data.reportedByName,
      reportedByRole: data.reportedByRole,
      reportedByEmail: data.reportedByEmail,
      type: data.type,
      severity: data.severity,
      description: data.description,
      photos: data.photos || [],
      status: "open",
      isSystemGenerated: false,
      createdAt: nowIso,
      updatedAt: nowIso,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          incidentId: newId,
          authorName: data.reportedByName,
          authorRole: data.reportedByRole,
          action: "Incident Reported",
          note: data.description,
          timestamp: "Just now",
          photos: data.photos,
        },
      ],
    };

    setIncidents((prev) => [newRecord, ...prev]);

    // Write to audit log
    logAudit({
      actorName: data.reportedByName,
      actorRole: data.reportedByRole as any,
      actorId: data.reportedBy,
      action: "incident.reported",
      actionLabel: `Incident Logged (${data.type.toUpperCase()})`,
      entityType: "incident",
      entityId: newId,
      entityTitle: data.resourceTitle,
      bookingId: data.bookingId,
      resourceId: data.resourceId,
      after: {
        type: data.type,
        severity: data.severity,
        status: "open",
        photos_count: (data.photos || []).length,
      },
      reason: data.description,
    });

    // Notify custodian
    sendNotification({
      type: "incident_update",
      title: `New Incident Reported: ${data.resourceTitle}`,
      body: `${data.reportedByName} reported a ${data.type} issue (${data.severity} severity).`,
      link: `/incidents/${newId}`,
    });

    toast.success("Incident report filed", {
      description: "Added to campus incident log and queued for review.",
    });

    return newRecord;
  };

  const updateIncidentStatus = async (
    incidentId: string,
    status: IncidentStatus,
    resolutionNote: string,
    penaltyAction: PenaltyAction = "none",
    penaltyJustification?: string
  ): Promise<boolean> => {
    if (!resolutionNote.trim() || resolutionNote.trim().length < 8) {
      toast.error("A substantive resolution note is mandatory (min 8 characters).");
      return false;
    }

    if (penaltyAction !== "none" && (!penaltyJustification || penaltyJustification.trim().length < 8)) {
      toast.error("Written justification is required whenever applying a collegiate penalty.");
      return false;
    }

    const targetIncident = incidents.find((i) => i.id === incidentId);
    if (!targetIncident) return false;

    const prevStatus = targetIncident.status;
    const nowIso = new Date().toISOString();

    const timelineEvent: IncidentTimelineEvent = {
      id: `tl-${Date.now()}`,
      incidentId,
      authorName: "Dr. Kavitha Rao",
      authorRole: "owner",
      action: `Status Shift: ${prevStatus.toUpperCase()} → ${status.toUpperCase()}`,
      note: resolutionNote,
      timestamp: "Just now",
      statusShift: {
        from: prevStatus,
        to: status,
      },
      penaltyApplied:
        penaltyAction !== "none"
          ? {
              action: penaltyAction,
              justification: penaltyJustification || "",
            }
          : undefined,
    };

    setIncidents((prev) =>
      prev.map((i) => {
        if (i.id !== incidentId) return i;
        return {
          ...i,
          status,
          resolutionNote,
          resolvedBy: "22222222-2222-2222-2222-222222222222",
          resolvedByName: "Dr. Kavitha Rao",
          resolvedAt: nowIso,
          penaltyAction,
          penaltyJustification,
          updatedAt: nowIso,
          timeline: [...i.timeline, timelineEvent],
        };
      })
    );

    // Write to audit log
    logAudit({
      actorName: "Dr. Kavitha Rao",
      actorRole: "owner",
      action: "incident.resolved",
      actionLabel: `Incident Status Updated (${status.toUpperCase()})`,
      entityType: "incident",
      entityId: incidentId,
      entityTitle: targetIncident.resourceTitle,
      bookingId: targetIncident.bookingId,
      resourceId: targetIncident.resourceId,
      before: { status: prevStatus },
      after: {
        status,
        penalty_action: penaltyAction,
        penalty_justification: penaltyJustification || null,
      },
      reason: resolutionNote,
    });

    // Notify borrower
    sendNotification({
      type: "incident_update",
      title: `Incident #${incidentId} Resolved`,
      body: `Review completed by Dr. Kavitha Rao: "${resolutionNote}"`,
      link: `/incidents/${incidentId}`,
    });

    toast.success(`Incident status updated to ${status.toUpperCase()}`);
    return true;
  };

  const addTimelineComment = async (
    incidentId: string,
    comment: string,
    authorName = "Dr. Kavitha Rao"
  ): Promise<boolean> => {
    if (!comment.trim()) return false;

    const timelineEvent: IncidentTimelineEvent = {
      id: `tl-${Date.now()}`,
      incidentId,
      authorName,
      authorRole: "owner",
      action: "Note Added to Record",
      note: comment,
      timestamp: "Just now",
    };

    setIncidents((prev) =>
      prev.map((i) => {
        if (i.id !== incidentId) return i;
        return {
          ...i,
          timeline: [...i.timeline, timelineEvent],
          updatedAt: new Date().toISOString(),
        };
      })
    );

    toast.success("Note added to incident timeline");
    return true;
  };

  const saveIncidentAiSummary = async (incidentId: string, summary: string): Promise<void> => {
    setIncidents((prev) =>
      prev.map((i) => {
        if (i.id !== incidentId) return i;
        return {
          ...i,
          ai_summary: summary,
          ai_summarized_at: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const getIncidentById = (id: string) => {
    return incidents.find((i) => i.id === id);
  };

  return (
    <IncidentContext.Provider
      value={{
        incidents,
        reportIncident,
        updateIncidentStatus,
        addTimelineComment,
        saveIncidentAiSummary,
        getIncidentById,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
}

export function useIncidents() {
  const context = React.useContext(IncidentContext);
  if (!context) {
    throw new Error("useIncidents must be used within an IncidentProvider");
  }
  return context;
}

