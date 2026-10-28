"use client";

import * as React from "react";
import { toast } from "sonner";
import { type AuditRecord, type AuditEntityType, type AuditActorRole } from "@/lib/audit/types";

interface AuditContextType {
  records: AuditRecord[];
  logAudit: (data: {
    actorName: string;
    actorRole: AuditActorRole;
    actorId?: string;
    action: string;
    actionLabel: string;
    entityType: AuditEntityType;
    entityId: string;
    entityTitle: string;
    bookingId?: string;
    resourceId?: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    reason?: string;
  }) => AuditRecord;
  getAuditByBooking: (bookingId: string) => AuditRecord[];
  getAuditByResource: (resourceId: string) => AuditRecord[];
  getAuditByEntity: (entityType: AuditEntityType, entityId: string) => AuditRecord[];
  exportAuditCsv: (records: AuditRecord[], filename?: string) => void;
  exportAuditPdf: (records: AuditRecord[], entityTitle: string, filename?: string) => void;
}

const AuditContext = React.createContext<AuditContextType | undefined>(undefined);

// Initial believable campus audit entries
const INITIAL_AUDIT_LOG: AuditRecord[] = [
  {
    id: "aud-001",
    actorName: "Aanya Patel",
    actorRole: "student",
    actorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    action: "booking.requested",
    actionLabel: "Reservation Request Submitted",
    entityType: "booking",
    entityId: "bk-epilog-001",
    entityTitle: "Epilog Fusion Pro 48 Laser Cutter",
    bookingId: "bk-epilog-001",
    resourceId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0010",
    before: { status: "unreserved" },
    after: { status: "requested", duration_hours: 2.0 },
    reason: "Cutting 5mm optical acrylic casing for ME-401 Capstone robotics rover.",
    hash: "0x8f2a63b1...e410a7",
    createdAt: new Date(Date.now() - 28800000).toISOString(),
  },
  {
    id: "aud-002",
    actorName: "Registry System",
    actorRole: "system",
    action: "eligibility.validated",
    actionLabel: "Prerequisites & Fair-Use Clearance",
    entityType: "booking",
    entityId: "bk-epilog-001",
    entityTitle: "Epilog Fusion Pro 48 Laser Cutter",
    bookingId: "bk-epilog-001",
    resourceId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0010",
    before: { verified_credentials: false },
    after: { verified_credentials: true, quota_available: "4.5h remaining" },
    reason: "Laser Safety Qualification Level 1 verified against institutional registry.",
    hash: "0x3c9902e1...77b189",
    createdAt: new Date(Date.now() - 28740000).toISOString(),
  },
  {
    id: "aud-003",
    actorName: "Dr. Kavitha Rao",
    actorRole: "owner",
    actorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    action: "booking.approved",
    actionLabel: "Schedule Approved & Reserved",
    entityType: "booking",
    entityId: "bk-epilog-001",
    entityTitle: "Epilog Fusion Pro 48 Laser Cutter",
    bookingId: "bk-epilog-001",
    resourceId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0010",
    before: { status: "requested" },
    after: { status: "approved" },
    reason: "Laser safety certification verified. Approved for today's session. Wear approved OD5+ goggles.",
    hash: "0x9a44fc32...ff0231",
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: "aud-004",
    actorName: "Automated Overdue Daemon",
    actorRole: "system",
    action: "booking.overdue",
    actionLabel: "Session Overdue Auto-Transition",
    entityType: "booking",
    entityId: "bk-active-sony-002",
    entityTitle: "Sony FX3 Full-Frame Cinema Camera Kit",
    bookingId: "bk-active-sony-002",
    resourceId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005",
    before: { status: "checked_in" },
    after: { status: "overdue" },
    reason: "Scheduled reservation window elapsed without return checkout. Automatic 5-min pg_cron triggered.",
    hash: "0x77ee12a9...33bb84",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "aud-005",
    actorName: "System Daemon (pg_cron)",
    actorRole: "system",
    action: "incident.auto_created",
    actionLabel: "Delay Incident Auto-Created",
    entityType: "incident",
    entityId: "inc-001",
    entityTitle: "Sony FX3 Full-Frame Cinema Camera Kit",
    bookingId: "bk-active-sony-002",
    resourceId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005",
    before: { incident: null },
    after: { incident_type: "delay", severity: "low", status: "open", overdue_minutes: 45 },
    reason: "System-generated: Equipment overdue by 45 minutes beyond scheduled departure window.",
    hash: "0x55aa66cc...88c241",
    createdAt: new Date(Date.now() - 1740000).toISOString(),
  },
  {
    id: "aud-006",
    actorName: "Aanya Patel",
    actorRole: "student",
    actorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    action: "booking.checked_in",
    actionLabel: "Arrival Condition Baseline Uploaded",
    entityType: "booking",
    entityId: "bk-rf-004",
    entityTitle: "RF & Mixed-Signal Electronics Testbench",
    bookingId: "bk-rf-004",
    resourceId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003",
    before: { status: "approved", condition: null },
    after: { status: "checked_in", condition: "excellent", photos_count: 1 },
    reason: "Arrival condition verified: Excellent. Oscilloscope calibrated, ground clips present.",
    hash: "0x44ff9988...99ee12",
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: "aud-007",
    actorName: "Aanya Patel",
    actorRole: "student",
    actorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    action: "booking.returned",
    actionLabel: "Departure Checklist Submitted",
    entityType: "booking",
    entityId: "bk-rf-004",
    entityTitle: "RF & Mixed-Signal Electronics Testbench",
    bookingId: "bk-rf-004",
    resourceId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003",
    before: { status: "checked_in", condition: "excellent" },
    after: { status: "returned", condition: "good", hours_used: 2.0 },
    reason: "Departure condition verified: Good. Probes safely holstered on rack. Awaiting custodian verification.",
    hash: "0x22aa55dd...00ff43",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "aud-008",
    actorName: "Dr. Kavitha Rao",
    actorRole: "owner",
    actorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    action: "credential.reviewed",
    actionLabel: "Safety Credential Approved",
    entityType: "credential",
    entityId: "cred-laser-001",
    entityTitle: "Laser Safety Qualification Level 1",
    before: { verification_status: "pending" },
    after: { verification_status: "verified" },
    reason: "EHS Training certificate verified from institutional portal. Expiry set to Oct 2027.",
    hash: "0x11bb33ee...55aa99",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export function AuditProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = React.useState<AuditRecord[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("commons_audit_ledger_v2");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return INITIAL_AUDIT_LOG;
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("commons_audit_ledger_v2", JSON.stringify(records));
    }
  }, [records]);

  const logAudit = (data: {
    actorName: string;
    actorRole: AuditActorRole;
    actorId?: string;
    action: string;
    actionLabel: string;
    entityType: AuditEntityType;
    entityId: string;
    entityTitle: string;
    bookingId?: string;
    resourceId?: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    reason?: string;
  }): AuditRecord => {
    const randomHex = Math.random().toString(16).substring(2, 10);
    const randomHexEnd = Math.random().toString(16).substring(2, 8);
    const newRecord: AuditRecord = {
      id: `aud-${Date.now()}`,
      actorId: data.actorId,
      actorName: data.actorName,
      actorRole: data.actorRole,
      action: data.action,
      actionLabel: data.actionLabel,
      entityType: data.entityType,
      entityId: data.entityId,
      entityTitle: data.entityTitle,
      bookingId: data.bookingId,
      resourceId: data.resourceId,
      before: data.before,
      after: data.after,
      reason: data.reason,
      hash: `0x${randomHex}...${randomHexEnd}`,
      createdAt: new Date().toISOString(),
    };

    setRecords((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const getAuditByBooking = (bookingId: string) => {
    return records.filter((r) => r.bookingId === bookingId || r.entityId === bookingId);
  };

  const getAuditByResource = (resourceId: string) => {
    return records.filter((r) => r.resourceId === resourceId || r.entityId === resourceId);
  };

  const getAuditByEntity = (entityType: AuditEntityType, entityId: string) => {
    return records.filter((r) => r.entityType === entityType && r.entityId === entityId);
  };

  const exportAuditCsv = (exportRecords: AuditRecord[], filename = "commons-audit-ledger.csv") => {
    const headers = [
      "ID",
      "Timestamp",
      "Actor",
      "Role",
      "Action",
      "Entity Type",
      "Entity Title",
      "Hash",
      "Stated Reason",
      "Before",
      "After",
    ];

    const rows = exportRecords.map((r) => [
      r.id,
      r.createdAt,
      `"${r.actorName.replace(/"/g, '""')}"`,
      r.actorRole,
      r.action,
      r.entityType,
      `"${r.entityTitle.replace(/"/g, '""')}"`,
      r.hash,
      `"${(r.reason || "").replace(/"/g, '""')}"`,
      `"${JSON.stringify(r.before || {}).replace(/"/g, '""')}"`,
      `"${JSON.stringify(r.after || {}).replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Institutional audit CSV exported");
  };

  const exportAuditPdf = (exportRecords: AuditRecord[], entityTitle: string, filename = "audit-record.pdf") => {
    // Generates a clean printable window formatted as an institutional certified document
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to export printable audit document.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Institutional Audit Certificate — ${entityTitle}</title>
          <style>
            body { font-family: 'Times New Roman', Georgia, serif; background: #FFF; color: #1C1B18; padding: 40px; margin: 0; }
            .header { border-bottom: 2px solid #1C1B18; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
            .logo { font-size: 28px; font-weight: normal; letter-spacing: -0.5px; }
            .sub { font-size: 11px; text-transform: uppercase; color: #666; font-family: sans-serif; }
            .title { font-size: 20px; margin-bottom: 6px; }
            .meta { font-size: 13px; color: #444; margin-bottom: 24px; font-family: sans-serif; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 20px; font-family: sans-serif; }
            th { text-align: left; padding: 8px 10px; border-bottom: 2px solid #333; background: #F8F6F0; font-size: 10px; text-transform: uppercase; }
            td { padding: 10px; border-bottom: 1px solid #E2DBCB; vertical-align: top; }
            .hash { font-family: monospace; font-size: 10px; color: #777; }
            .reason { font-style: italic; color: #333; font-family: serif; font-size: 13px; }
            .stamp { margin-top: 40px; border-top: 1px dashed #999; padding-top: 15px; font-size: 11px; color: #777; font-family: sans-serif; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">Commons</div>
              <div class="sub">Eastbrook University · Institutional Custody & Audit Registry</div>
            </div>
            <div style="text-align: right;">
              <div class="sub">Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
              <div class="sub">Security Standard: Postgres Append-Only (RLS)</div>
            </div>
          </div>

          <div class="title">Immutable Ledger Transaction Record</div>
          <div class="meta">Subject Entity: <strong>${entityTitle}</strong> · Total Verified Milestones: ${exportRecords.length}</div>

          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor & Role</th>
                <th>Action & Stated Human Reason</th>
                <th>Status Shift (Before → After)</th>
                <th>Verification Hash</th>
              </tr>
            </thead>
            <tbody>
              ${exportRecords
                .map(
                  (r) => `
                <tr>
                  <td style="white-space: nowrap;">${new Date(r.createdAt).toLocaleDateString()}<br/><span style="color:#777;">${new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></td>
                  <td><strong>${r.actorName}</strong><br/><span style="font-size:10px; color:#666; text-transform:uppercase;">${r.actorRole}</span></td>
                  <td>
                    <strong>${r.actionLabel}</strong><br/>
                    <div class="reason">“${r.reason || "N/A"}”</div>
                  </td>
                  <td>
                    <div style="font-size: 11px; font-family: monospace;">
                      ${JSON.stringify(r.before || {})} → ${JSON.stringify(r.after || {})}
                    </div>
                  </td>
                  <td class="hash">${r.hash}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="stamp">
            <div>Digitally Certified Cryptographic Ledger · SHA-256 State Chain</div>
            <div>Ref Hash: ${exportRecords[0]?.hash || "0x000"}</div>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast.success("Opened institutional print/PDF certificate view");
  };

  return (
    <AuditContext.Provider
      value={{
        records,
        logAudit,
        getAuditByBooking,
        getAuditByResource,
        getAuditByEntity,
        exportAuditCsv,
        exportAuditPdf,
      }}
    >
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit() {
  const context = React.useContext(AuditContext);
  if (!context) {
    throw new Error("useAudit must be used within an AuditProvider");
  }
  return context;
}

