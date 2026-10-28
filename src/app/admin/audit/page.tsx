"use client";

import * as React from "react";
import Link from "next/link";
import {
  Scroll,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Printer,
  Calendar,
  Layers,
  User,
  CheckCircle2,
  Lock,
  ArrowRight,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAudit } from "@/context/AuditContext";
import { useAuth } from "@/context/AuthContext";
import { AuditTimeline } from "@/components/audit/AuditTimeline";
import { type AuditRecord, type AuditEntityType, type AuditActorRole } from "@/lib/audit/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

type ViewMode = "timeline" | "table";

export default function AdminAuditPage() {
  const { user, role, roleTitle } = useAuth();
  const { records, exportAuditCsv, exportAuditPdf } = useAudit();

  const [viewMode, setViewMode] = React.useState<ViewMode>("timeline");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [entityFilter, setEntityFilter] = React.useState<string>("all");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [dateFilter, setDateFilter] = React.useState<string>("all");

  // Filtered records
  const filteredRecords = React.useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        r.actionLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.entityTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.reason || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.hash.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesEntity = entityFilter === "all" ? true : r.entityType === entityFilter;
      const matchesRole = roleFilter === "all" ? true : r.actorRole === roleFilter;

      let matchesDate = true;
      if (dateFilter === "today") {
        const recordDate = new Date(r.createdAt).toDateString();
        matchesDate = recordDate === new Date().toDateString();
      } else if (dateFilter === "7days") {
        const sevenDaysAgo = Date.now() - 7 * 86400000;
        matchesDate = new Date(r.createdAt).getTime() >= sevenDaysAgo;
      }

      return matchesSearch && matchesEntity && matchesRole && matchesDate;
    });
  }, [records, searchQuery, entityFilter, roleFilter, dateFilter]);

  // Statistics
  const bookingEvents = records.filter((r) => r.entityType === "booking").length;
  const incidentEvents = records.filter((r) => r.entityType === "incident").length;
  const credentialEvents = records.filter((r) => r.entityType === "credential").length;

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 text-ink pb-24">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-line pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-mono-label uppercase text-ink-muted font-bold tracking-wider">
                Institutional Compliance & Governance
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-success/10 text-success border border-success/30">
                <Lock className="w-3 h-3" />
                Append-Only RLS Enforced
              </span>
            </div>
            <h1 className="font-display text-display-lg text-ink font-normal leading-tight">
              Campus Audit Ledger
            </h1>
            <p className="text-small text-ink-muted leading-relaxed max-w-2xl">
              Complete chronological and cryptographic record of every booking, credential determination, physical condition report, and incident resolution across Eastbrook campus.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5 text-terracotta" />}
              onClick={() => exportAuditCsv(filteredRecords, "eastbrook-campus-full-audit.csv")}
              className="min-h-[44px]"
            >
              Export CSV
            </Button>
            <Button
              variant="accent"
              size="sm"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              onClick={() => exportAuditPdf(filteredRecords, "Eastbrook University Campus-Wide Ledger")}
              className="min-h-[44px]"
            >
              Print Institutional Certificate
            </Button>
          </div>
        </div>

        {/* Ledger Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-4 bg-surface border border-line rounded-editorial shadow-xs space-y-1">
            <span className="text-mono-label uppercase text-ink-muted block">Total Transactions</span>
            <strong className="text-2xl font-display text-ink block">{records.length}</strong>
            <span className="text-[10px] text-success font-mono font-bold">100% Hash Verified</span>
          </div>
          <div className="p-4 bg-surface border border-line rounded-editorial shadow-xs space-y-1">
            <span className="text-mono-label uppercase text-ink-muted block">Booking Events</span>
            <strong className="text-2xl font-display text-ink block">{bookingEvents}</strong>
            <span className="text-[10px] text-ink-muted">Requests, handoffs, returns</span>
          </div>
          <div className="p-4 bg-surface border border-line rounded-editorial shadow-xs space-y-1">
            <span className="text-mono-label uppercase text-ink-muted block">Incident Milestones</span>
            <strong className="text-2xl font-display text-ink block">{incidentEvents}</strong>
            <span className="text-[10px] text-terracotta">Delays & damage cases</span>
          </div>
          <div className="p-4 bg-surface border border-line rounded-editorial shadow-xs space-y-1">
            <span className="text-mono-label uppercase text-ink-muted block">Safety Credentials</span>
            <strong className="text-2xl font-display text-ink block">{credentialEvents}</strong>
            <span className="text-[10px] text-sage-dark">Certifications reviewed</span>
          </div>
        </div>

        {/* Filters & Search Control Bar */}
        <div className="p-4 bg-surface border border-line rounded-editorial shadow-xs space-y-3">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full lg:w-96">
              <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search action, actor, entity title, hash, or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-bone/50 border border-line rounded-editorial text-xs text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-terracotta"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-bone border border-line rounded-editorial text-xs w-full lg:w-auto justify-end">
              <button
                type="button"
                onClick={() => setViewMode("timeline")}
                className={cn(
                  "px-3 py-1.5 rounded-md font-medium transition-colors min-h-[36px]",
                  viewMode === "timeline"
                    ? "bg-surface text-ink font-semibold shadow-xs"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                Editorial Timeline
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={cn(
                  "px-3 py-1.5 rounded-md font-medium transition-colors min-h-[36px]",
                  viewMode === "table"
                    ? "bg-surface text-ink font-semibold shadow-xs"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                Data Grid
              </button>
            </div>
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t border-line/60 text-xs">
            {/* Entity Type Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-mono-label uppercase text-ink-muted font-bold text-[10px]">Entity:</span>
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                aria-label="Filter by Entity Type"
                className="h-8 px-2.5 bg-bone/70 border border-line rounded text-xs text-ink focus:outline-none focus:border-terracotta"
              >
                <option value="all">All Entities</option>
                <option value="booking">Bookings</option>
                <option value="incident">Incidents</option>
                <option value="credential">Credentials</option>
                <option value="resource">Resources</option>
              </select>
            </div>

            {/* Actor Role Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-mono-label uppercase text-ink-muted font-bold text-[10px]">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                aria-label="Filter by Actor Role"
                className="h-8 px-2.5 bg-bone/70 border border-line rounded text-xs text-ink focus:outline-none focus:border-terracotta"
              >
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="owner">Owner</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
                <option value="system">System Daemon</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-mono-label uppercase text-ink-muted font-bold text-[10px]">Date:</span>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                aria-label="Filter by Date Window"
                className="h-8 px-2.5 bg-bone/70 border border-line rounded text-xs text-ink focus:outline-none focus:border-terracotta"
              >
                <option value="all">All Time</option>
                <option value="today">Today Only</option>
                <option value="7days">Last 7 Days</option>
              </select>
            </div>

            {(searchQuery || entityFilter !== "all" || roleFilter !== "all" || dateFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setEntityFilter("all");
                  setRoleFilter("all");
                  setDateFilter("all");
                }}
                className="text-terracotta font-semibold hover:underline text-[11px]"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* View Mode: Timeline */}
        {viewMode === "timeline" ? (
          <AuditTimeline
            records={filteredRecords}
            entityTitle="Campus-Wide Operations"
            allowExport={false}
          />
        ) : (
          /* View Mode: Institutional Tabular Grid */
          <div className="bg-surface border border-line rounded-editorial overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-bone/80 border-b border-line text-[10px] font-mono uppercase text-ink-muted">
                    <th className="py-3 px-4 font-bold">Timestamp</th>
                    <th className="py-3 px-4 font-bold">Actor</th>
                    <th className="py-3 px-4 font-bold">Action / Stated Reason</th>
                    <th className="py-3 px-4 font-bold">Entity</th>
                    <th className="py-3 px-4 font-bold">Diff (Before → After)</th>
                    <th className="py-3 px-4 font-bold font-mono text-right">Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {filteredRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-bone/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap text-ink-muted">
                        <div>{new Date(r.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}</div>
                        <div className="text-[10px] opacity-75">{new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                      </td>
                      <td className="py-3 px-4">
                        <strong className="text-ink block">{r.actorName}</strong>
                        <span className="text-[10px] font-mono uppercase text-ink-muted">{r.actorRole}</span>
                      </td>
                      <td className="py-3 px-4 max-w-sm">
                        <strong className="text-ink block">{r.actionLabel}</strong>
                        {r.reason && (
                          <span className="text-[11px] text-ink-muted italic line-clamp-1">
                            &ldquo;{r.reason}&rdquo;
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-ink block truncate max-w-[150px]">{r.entityTitle}</span>
                        <span className="text-[10px] font-mono text-ink-muted uppercase">{r.entityType}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {r.before || r.after ? (
                          <span className="text-terracotta truncate max-w-[140px] block">
                            {JSON.stringify(r.after || {})}
                          </span>
                        ) : (
                          <span className="text-ink-muted">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[10px] text-ink-muted">
                        {r.hash}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

