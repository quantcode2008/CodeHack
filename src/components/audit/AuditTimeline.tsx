"use client";

import * as React from "react";
import {
  ShieldCheck,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Camera,
  Hash,
  Download,
  Printer,
  Copy,
  Check,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  FileText,
  Lock,
} from "lucide-react";
import { type AuditRecord, type AuditActorRole } from "@/lib/audit/types";
import { useAudit } from "@/context/AuditContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AuditTimelineProps {
  records: AuditRecord[];
  entityTitle?: string;
  allowExport?: boolean;
  className?: string;
  compact?: boolean;
}

export function AuditTimeline({
  records,
  entityTitle = "Campus Resource Journey",
  allowExport = true,
  className,
  compact = false,
}: AuditTimelineProps) {
  const { exportAuditCsv, exportAuditPdf } = useAudit();
  const [searchFilter, setSearchFilter] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [copiedHash, setCopiedHash] = React.useState<string | null>(null);

  // Filter records
  const filteredRecords = React.useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        r.actionLabel.toLowerCase().includes(searchFilter.toLowerCase()) ||
        r.actorName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (r.reason || "").toLowerCase().includes(searchFilter.toLowerCase()) ||
        r.hash.toLowerCase().includes(searchFilter.toLowerCase());

      const matchesRole = roleFilter === "all" ? true : r.actorRole === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [records, searchFilter, roleFilter]);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    toast.success("Ledger hash copied to clipboard");
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const getActorBadgeStyle = (role: AuditActorRole) => {
    switch (role) {
      case "student":
        return "bg-bone text-ink border-line";
      case "owner":
        return "bg-[#FDF5F2] text-terracotta border-[#F1D0C4]";
      case "manager":
        return "bg-[#F4F6F2] text-sage-dark border-[#D4DDCF]";
      case "admin":
        return "bg-ink text-surface border-ink";
      case "system":
        return "bg-[#FDF9EE] text-[#8C6114] border-[#EAD9B8]";
      default:
        return "bg-bone text-ink border-line";
    }
  };

  const getActionIcon = (action: string, role: AuditActorRole) => {
    if (action.includes("overdue") || action.includes("incident")) {
      return <AlertTriangle className="w-4 h-4 text-danger" />;
    }
    if (action.includes("returned") || action.includes("completed")) {
      return <CheckCircle2 className="w-4 h-4 text-success" />;
    }
    if (action.includes("checked_in") || action.includes("photo")) {
      return <Camera className="w-4 h-4 text-terracotta" />;
    }
    if (action.includes("credential") || action.includes("eligibility")) {
      return <ShieldCheck className="w-4 h-4 text-sage-dark" />;
    }
    if (role === "system") {
      return <Lock className="w-4 h-4 text-warning" />;
    }
    return <Clock className="w-4 h-4 text-terracotta" />;
  };

  return (
    <div className={cn("space-y-6 text-ink", className)}>
      {/* Header & Export Controls */}
      {allowExport && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-surface border border-line rounded-editorial shadow-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-mono-label uppercase text-ink-muted font-bold tracking-wider">
                Postgres Append-Only Ledger
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-success/10 text-success border border-success/20">
                <Check className="w-3 h-3" />
                Immutable
              </span>
            </div>
            <h3 className="font-display text-xl sm:text-2xl text-ink font-normal">
              Transaction Audit Trail
            </h3>
            <p className="text-xs text-ink-muted">
              {filteredRecords.length} cryptographic milestone{filteredRecords.length === 1 ? "" : "s"} sealed into the campus chain.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5 text-terracotta" />}
              onClick={() => exportAuditCsv(filteredRecords, `${entityTitle.toLowerCase().replace(/\s+/g, "-")}-audit.csv`)}
              className="min-h-[38px] text-xs flex-1 sm:flex-initial"
            >
              Export CSV
            </Button>
            <Button
              variant="accent"
              size="sm"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              onClick={() => exportAuditPdf(filteredRecords, entityTitle)}
              className="min-h-[38px] text-xs flex-1 sm:flex-initial"
            >
              Print Certificate
            </Button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar (when not compact) */}
      {!compact && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search action, actor, or hash..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full h-9 pl-9 pr-3 bg-bone/50 border border-line rounded-editorial text-xs text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-terracotta"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <span className="text-[11px] font-mono text-ink-muted uppercase mr-1">Actor:</span>
            {["all", "student", "owner", "manager", "system"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={cn(
                  "px-2.5 py-1 rounded-md capitalize font-mono text-[11px] transition-colors min-h-[32px]",
                  roleFilter === r
                    ? "bg-ink text-bone font-semibold"
                    : "bg-surface border border-line text-ink-muted hover:text-ink"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Vertical Archival Timeline */}
      {filteredRecords.length === 0 ? (
        <div className="p-8 text-center bg-surface border border-line rounded-editorial text-xs text-ink-muted space-y-2">
          <ShieldAlert className="w-8 h-8 text-ink-muted/40 mx-auto" />
          <p>No audit events match your filter criteria.</p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-[11px] sm:before:left-[15px] before:top-3 before:bottom-3 before:w-[2px] before:bg-line">
          {filteredRecords.map((record, idx) => {
            const hasDiff =
              (record.before && Object.keys(record.before).length > 0) ||
              (record.after && Object.keys(record.after).length > 0);

            return (
              <div key={record.id} className="relative group">
                {/* Timeline Node Marker */}
                <div className="absolute -left-[23px] sm:-left-[27px] top-1.5 w-6 h-6 rounded-full bg-surface border-2 border-line group-hover:border-terracotta flex items-center justify-center z-10 transition-colors shadow-2xs">
                  {getActionIcon(record.action, record.actorRole)}
                </div>

                {/* Milestone Card */}
                <div className="bg-surface border border-line rounded-editorial p-4 sm:p-5 shadow-xs hover:border-terracotta/30 transition-all space-y-3">
                  {/* Top Header: Actor & Timestamps */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      {record.actorAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={record.actorAvatar}
                          alt={record.actorName}
                          className="w-6 h-6 rounded-full object-cover border border-line"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-bone border border-line flex items-center justify-center font-mono text-[10px] font-bold text-terracotta">
                          {record.actorName.charAt(0)}
                        </div>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-xs text-ink font-semibold">
                          {record.actorName}
                        </strong>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border",
                            getActorBadgeStyle(record.actorRole)
                          )}
                        >
                          {record.actorRole}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-ink-muted font-mono">
                      <Clock className="w-3.5 h-3.5 text-terracotta" />
                      <span>
                        {new Date(record.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        ·{" "}
                        {new Date(record.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Action Heading */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-display text-lg text-ink font-normal leading-snug">
                        {record.actionLabel}
                      </h4>
                      <span className="text-[10px] font-mono text-ink-muted/80 px-2 py-0.5 rounded bg-bone border border-line/60">
                        {record.action}
                      </span>
                    </div>

                    {/* Stated Reason Quote */}
                    {record.reason && (
                      <p className="text-xs text-ink/90 italic bg-bone/60 p-3 rounded-editorial border border-line/70 leading-relaxed">
                        &ldquo;{record.reason}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Before / After Diff Chips */}
                  {hasDiff && (
                    <div className="pt-2 border-t border-line/60 space-y-2">
                      <span className="text-[10px] font-mono uppercase text-ink-muted font-bold block">
                        State Transition Diff
                      </span>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {record.before &&
                          Object.entries(record.before).map(([key, val]) => {
                            const afterVal = record.after ? record.after[key] : undefined;
                            if (afterVal === undefined || afterVal === val) return null;
                            return (
                              <div
                                key={key}
                                className="inline-flex items-center gap-1.5 p-1.5 px-2.5 rounded-editorial bg-bone/70 border border-line text-[11px] font-mono"
                              >
                                <span className="text-ink-muted font-semibold">{key}:</span>
                                <span className="line-through text-danger opacity-80">
                                  {String(val)}
                                </span>
                                <ArrowRight className="w-3 h-3 text-terracotta shrink-0" />
                                <span className="text-success font-bold">
                                  {String(afterVal)}
                                </span>
                              </div>
                            );
                          })}

                        {/* Additional newly set after keys */}
                        {record.after &&
                          Object.entries(record.after).map(([key, val]) => {
                            if (record.before && record.before[key] !== undefined) return null;
                            return (
                              <div
                                key={key}
                                className="inline-flex items-center gap-1.5 p-1.5 px-2.5 rounded-editorial bg-[#F0F5F1] border border-[#C6DBCB] text-[11px] font-mono text-[#2F5338]"
                              >
                                <span className="font-semibold">{key}:</span>
                                <span className="font-bold">{String(val)}</span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Footer: Immutable Cryptographic Hash & Copy Button */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-line/40 text-[11px] font-mono text-ink-muted">
                    <div className="flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-terracotta shrink-0" />
                      <span className="truncate max-w-[200px] sm:max-w-xs">{record.hash}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyHash(record.hash)}
                        className="p-1 hover:text-ink transition-colors rounded min-h-[28px] min-w-[28px] flex items-center justify-center"
                        title="Copy cryptographic hash"
                      >
                        {copiedHash === record.hash ? (
                          <Check className="w-3 h-3 text-success" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    <div className="text-[10px] text-ink-muted/80">
                      Entity: <span className="font-semibold text-ink">{record.entityType}</span> · Ref: {record.entityId.slice(0, 12)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

