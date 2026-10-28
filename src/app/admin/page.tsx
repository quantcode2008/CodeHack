"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useOwnerResources } from "@/context/OwnerResourceContext";
import { useIncidents } from "@/context/IncidentContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import {
  TrendingUp,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Building2,
  AlertOctagon,
  Users,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  FileText,
  Activity,
  Check,
  Filter,
  Eye,
  Sparkles,
} from "lucide-react";
import { useAudit } from "@/context/AuditContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { type FairUseFlaggedUser } from "@/lib/owner/types";

export default function AdminDashboardPage() {
  const { user, role, reviewQueue } = useAuth();
  const {
    adminMetrics,
    fairUseFlags,
    dismissFairUseFlag,
    applyFairUseAction,
    orgVerifications,
    verifyOrganization,
    resources,
  } = useOwnerResources();
  const { incidents } = useIncidents();

  const [activeFlagAction, setActiveFlagAction] = React.useState<{
    flagId: string;
    userName: string;
    recommendedAction: string;
  } | null>(null);
  const [actionNotes, setActionNotes] = React.useState("");
  const [isApplyingAction, setIsApplyingAction] = React.useState(false);
  const { logAudit } = useAudit();

  // AI Anomaly Explanations State
  const [aiExplanations, setAiExplanations] = React.useState<Record<string, string>>({});
  const [loadingExplFlagId, setLoadingExplFlagId] = React.useState<string | null>(null);

  const handleRequestAiExplanation = async (flag: FairUseFlaggedUser) => {
    setLoadingExplFlagId(flag.id);
    try {
      const res = await fetch("/api/ai/explain-anomaly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flag }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiExplanations((prev) => ({ ...prev, [flag.id]: data.explanation }));

        await logAudit({
          entityType: "booking",
          entityId: flag.userId,
          entityTitle: flag.userName,
          action: "AI_ANOMALY_EXPLANATION_GENERATED",
          actionLabel: "AI Pattern Context Synthesized",
          actorId: user?.id || "usr-admin",
          actorName: user?.fullName || "Campus Administrator",
          actorRole: "admin",
          reason: `Generated behavioral explanation for ${flag.flagType} via ${data.modelUsed}.`,
          before: undefined,
          after: { explanation: data.explanation, model: data.modelUsed },
        });

        toast.success("AI Explanation Ready", {
          description: `Synthesized behavioral analysis for ${flag.userName}.`,
        });
      }
    } catch {
      toast.error("Failed to generate AI explanation");
    } finally {
      setLoadingExplFlagId(null);
    }
  };

  // Computed overview
  const pendingCredentialsCount = reviewQueue.filter((c) => c.status === "pending").length;
  const openIncidents = incidents.filter((i) => i.status === "open" || i.status === "under_review");
  const pendingOrgsCount = orgVerifications.filter((o) => o.status === "pending").length;

  const handleConfirmAction = async () => {
    if (!activeFlagAction) return;
    setIsApplyingAction(true);
    await applyFairUseAction(activeFlagAction.flagId, actionNotes || "Standard administrative load-balancing policy.");
    setIsApplyingAction(false);
    setActiveFlagAction(null);
    setActionNotes("");
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        {/* Editorial Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-5">
          <div className="space-y-1">
            <span className="text-mono-label uppercase text-ink-muted">Campus Governance</span>
            <h1 className="font-display text-3xl sm:text-4xl text-ink font-normal tracking-tight">
              Administrative Oversight Dashboard
            </h1>
            <p className="text-xs text-ink-muted">
              Collegiate resource utilization, fair-use load balancing, and institutional compliance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/owner/resources">
              <Button variant="outline" size="sm">
                Manage Resources ({resources.length})
              </Button>
            </Link>
            <Link href="/admin/audit">
              <Button variant="accent" size="sm">
                Immutable Audit Trail
              </Button>
            </Link>
          </div>
        </div>

        {/* Key Operational KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-surface border border-line rounded-editorial space-y-1 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <TrendingUp className="w-3.5 h-3.5 text-terracotta" />
              <span>Campus Utilization</span>
            </div>
            <div className="font-display text-3xl sm:text-4xl text-ink font-normal">
              {adminMetrics.overallUtilizationRate}%
            </div>
            <span className="text-[11px] text-sage font-medium block">
              +16.2% vs prior semester
            </span>
          </div>

          <div className="p-4 bg-surface border border-line rounded-editorial space-y-1 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <Clock className="w-3.5 h-3.5 text-sage" />
              <span>Idle Hours Recovered</span>
            </div>
            <div className="font-display text-3xl sm:text-4xl text-ink font-normal">
              {adminMetrics.idleHoursRecoveredTotal}h
            </div>
            <span className="text-[11px] text-ink-muted block">
              142 faculty & student projects
            </span>
          </div>

          <div className="p-4 bg-surface border border-line rounded-editorial space-y-1 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <Activity className="w-3.5 h-3.5 text-terracotta" />
              <span>Avg Approval Speed</span>
            </div>
            <div className="font-display text-3xl sm:text-4xl text-ink font-normal">
              {adminMetrics.avgApprovalTimeHours}h
            </div>
            <span className="text-[11px] text-ink-muted block">
              Median custodian response
            </span>
          </div>

          <div className="p-4 bg-surface border border-line rounded-editorial space-y-1 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <ShieldCheck className="w-3.5 h-3.5 text-sage" />
              <span>No-Show Rate</span>
            </div>
            <div className="font-display text-3xl sm:text-4xl text-ink font-normal">
              {adminMetrics.noShowRatePct}%
            </div>
            <span className="text-[11px] text-sage font-medium block">
              Down from 5.7% (with merit scoring)
            </span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CHARTS SECTION (CLEAN SVG PALETTE)                           */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Monthly Semester Trend Chart (7 cols) */}
          <div className="lg:col-span-7 bg-surface border border-line rounded-editorial p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <span className="text-mono-label uppercase text-ink-muted">Semester Velocity</span>
                <h3 className="font-display text-xl text-ink">Utilisation & Recovered Hours</h3>
              </div>
              <div className="flex items-center gap-3 text-xs text-ink-muted">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-terracotta" />
                  <span>Utilisation %</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-sage" />
                  <span>Recovered Hours</span>
                </span>
              </div>
            </div>

            {/* Custom SVG Bar & Trendline Graphic */}
            <div className="pt-2">
              <div className="h-52 flex items-end justify-between gap-3 px-2 border-b border-line pb-2">
                {adminMetrics.monthlyTrend.map((item) => {
                  const maxHours = 400;
                  const barHeightPct = (item.hoursRecovered / maxHours) * 100;

                  return (
                    <div
                      key={item.month}
                      className="flex-1 flex flex-col items-center gap-2 group h-full justify-end cursor-pointer"
                    >
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono bg-ink text-surface px-1.5 py-0.5 rounded shadow-xs mb-1 pointer-events-none">
                        {item.utilizationPct}% ({item.hoursRecovered}h)
                      </div>

                      {/* Bar for hours recovered */}
                      <div
                        style={{ height: `${barHeightPct}%` }}
                        className="w-full max-w-[48px] bg-sage/35 border-t-2 border-sage rounded-t transition-all group-hover:bg-sage/55 relative"
                      >
                        {/* Dot indicator for utilization */}
                        <div
                          style={{ bottom: `${item.utilizationPct}%` }}
                          className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-terracotta ring-2 ring-surface shadow-xs"
                          title={`Utilization: ${item.utilizationPct}%`}
                        />
                      </div>

                      {/* Month label */}
                      <span className="text-[11px] font-mono text-ink-muted group-hover:text-ink font-semibold">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2 text-[11px] text-ink-muted">
                <span>Data certified by automated condition audit logs</span>
                <span className="font-mono">May – Oct 2026 Academic Term</span>
              </div>
            </div>
          </div>

          {/* Category Breakdown (5 cols) */}
          <div className="lg:col-span-5 bg-surface border border-line rounded-editorial p-5 space-y-4 shadow-xs">
            <div className="border-b border-line pb-3">
              <span className="text-mono-label uppercase text-ink-muted">Asset Distribution</span>
              <h3 className="font-display text-xl text-ink">Utilization by Discipline</h3>
            </div>

            <div className="space-y-3.5 pt-1">
              {adminMetrics.categoryBreakdown.map((cat) => (
                <div key={cat.category} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink">{cat.label}</span>
                    <span className="font-mono text-terracotta font-bold">
                      {cat.utilizationRate}%
                    </span>
                  </div>

                  {/* Clean Hairline Progress Bar */}
                  <div className="h-2 w-full bg-bone rounded-full overflow-hidden border border-line/60">
                    <div
                      style={{
                        width: `${cat.utilizationRate}%`,
                        backgroundColor: cat.color,
                      }}
                      className="h-full rounded-full transition-all duration-300"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-ink-muted">
                    <span>{cat.resourceCount} active departmental units</span>
                    <span>Demand: {cat.utilizationRate > 70 ? "High Peak" : "Steady"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* FAIR-USE MONITOR: SUSPICIOUS PATTERN FLAGS                   */}
        {/* ============================================================ */}
        <div className="bg-surface border border-line rounded-editorial p-6 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-mono-label uppercase text-ink-muted">Algorithmic Load Balancer</span>
                <Badge status="requested">
                  Rule-Based Flags Only
                </Badge>
              </div>
              <h2 className="font-display text-2xl text-ink">Fair-Use Anomaly Monitor</h2>
            </div>
            <span className="text-xs text-ink-muted">
              Zero black-box AI — strictly deterministic policy thresholds
            </span>
          </div>

          {/* AI Behavioral Safeguard Banner */}
          <div className="p-3 bg-bone border border-line rounded-editorial flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-ink-muted">
              <Sparkles className="w-4 h-4 text-terracotta shrink-0" />
              <span>
                <strong className="text-ink">Human Oversight Mandatory: </strong>
                AI explanations provide behavioral context only. Suspicious pattern alerts are surfaced strictly as &quot;Needs Review&quot; and never trigger automatic penalties or restrictions.
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {fairUseFlags.map((flag) => (
              <div
                key={flag.id}
                className={cn(
                  "p-4 rounded-editorial border transition-all text-xs space-y-3",
                  flag.status === "dismissed"
                    ? "bg-bone/40 border-line/50 opacity-60"
                    : flag.status === "reviewed"
                    ? "bg-success-light/40 border-success/30"
                    : "bg-surface border-line shadow-xs hover:border-terracotta/40"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-bone border border-line flex items-center justify-center font-display text-ink font-bold text-sm">
                      {flag.userName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-ink text-sm font-semibold">{flag.userName}</strong>
                        <Badge
                          status={
                            flag.severity === "high"
                              ? "rejected"
                              : flag.severity === "medium"
                              ? "requested"
                              : "neutral"
                          }
                        >
                          {flag.flagType.replace(/_/g, " ")}
                        </Badge>
                        <span className="text-ink-muted text-[11px]">{flag.department}</span>
                      </div>
                      <span className="text-[11px] text-terracotta font-mono font-medium block">
                        {flag.metricDetail}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {!aiExplanations[flag.id] && flag.status === "flagged" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        isLoading={loadingExplFlagId === flag.id}
                        onClick={() => handleRequestAiExplanation(flag)}
                        className="text-xs text-terracotta hover:bg-terracotta/10 min-h-[36px]"
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1" />
                        AI Analysis
                      </Button>
                    )}

                    {flag.status === "flagged" ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissFairUseFlag(flag.id)}
                          className="text-xs text-ink-muted hover:text-ink min-h-[36px]"
                        >
                          Dismiss
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setActiveFlagAction({
                              flagId: flag.id,
                              userName: flag.userName,
                              recommendedAction: flag.recommendedRuleAction,
                            })
                          }
                          className="text-xs border-terracotta/40 text-terracotta hover:bg-terracotta/10 min-h-[36px]"
                        >
                          {flag.recommendedRuleAction}
                        </Button>
                      </>
                    ) : (
                      <Badge status="approved">
                        Action Applied
                      </Badge>
                    )}
                  </div>
                </div>

                {/* AI Behavioral Explanation Block */}
                {aiExplanations[flag.id] && (
                  <div className="p-3 bg-bone border border-line rounded-editorial text-xs space-y-1 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-[10px] text-terracotta font-mono font-bold uppercase">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-terracotta" />
                        AI Behavioral Context (Advisory)
                      </span>
                      <span className="text-ink-muted">Needs Review</span>
                    </div>
                    <p className="text-ink leading-relaxed">
                      {aiExplanations[flag.id]}
                    </p>
                  </div>
                )}

                <p className="text-ink-muted text-[11px] leading-relaxed bg-bone/60 p-2.5 rounded-editorial border border-line/60">
                  <strong className="text-ink">Policy Citation: </strong>
                  {flag.ruleExplanation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* THREE ADMINISTRATIVE WORK QUEUES                             */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Queue 1: Pending Credentials */}
          <div className="bg-surface border border-line rounded-editorial p-5 space-y-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <span className="font-semibold text-xs text-ink flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-terracotta" />
                  <span>Pending Credentials</span>
                </span>
                <Badge status="requested">
                  {pendingCredentialsCount} Needs Review
                </Badge>
              </div>
              <p className="text-xs text-ink-muted">
                Student training certificates, safety proctor qualifications, and course enrollments.
              </p>
            </div>

            <Link href="/admin/credentials" className="pt-2">
              <Button variant="outline" size="md" className="w-full justify-between">
                <span>Open Credentials Queue</span>
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Queue 2: Open Incidents & Disputes */}
          <div className="bg-surface border border-line rounded-editorial p-5 space-y-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <span className="font-semibold text-xs text-ink flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-danger" />
                  <span>Open Incidents</span>
                </span>
                <Badge status="rejected">
                  {openIncidents.length} Active
                </Badge>
              </div>
              <p className="text-xs text-ink-muted">
                Equipment damage reports, overdue returns, and condition discrepancy reviews.
              </p>
            </div>

            <Link href="/incidents" className="pt-2">
              <Button variant="outline" size="md" className="w-full justify-between">
                <span>Open Incident Queue</span>
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Queue 3: Organisation & Facility Verification */}
          <div className="bg-surface border border-line rounded-editorial p-5 space-y-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <span className="font-semibold text-xs text-ink flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-sage" />
                  <span>Lab Accreditations</span>
                </span>
                <Badge status={pendingOrgsCount > 0 ? "requested" : "approved"}>
                  {pendingOrgsCount} Pending
                </Badge>
              </div>
              <div className="space-y-2 text-xs">
                {orgVerifications.map((org) => (
                  <div
                    key={org.id}
                    className="p-2 bg-bone rounded border border-line flex items-center justify-between gap-2"
                  >
                    <div className="truncate">
                      <strong className="block text-ink truncate">{org.orgName}</strong>
                      <span className="text-[10px] text-ink-muted block truncate">
                        {org.department}
                      </span>
                    </div>

                    {org.status === "pending" ? (
                      <Button
                        size="sm"
                        variant="accent"
                        onClick={() => verifyOrganization(org.id)}
                        className="text-[10px] min-h-[30px] px-2 py-0.5 shrink-0"
                      >
                        Accredit
                      </Button>
                    ) : (
                      <Badge status="approved">
                        Verified
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Link href="/owner/resources" className="pt-2">
              <Button variant="outline" size="md" className="w-full justify-between">
                <span>View Campus Facilities</span>
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Action Confirmation Dialog */}
        <Dialog
          isOpen={Boolean(activeFlagAction)}
          onClose={() => setActiveFlagAction(null)}
          title={`Enforce Policy: ${activeFlagAction?.recommendedAction}`}
          description={`Apply collegiate fair-use countermeasure to borrower ${activeFlagAction?.userName}.`}
        >
          <div className="space-y-4 pt-2 text-xs">
            <p className="text-ink-muted leading-relaxed">
              Applying this rule action updates the borrower&apos;s active booking cooldown balance and
              records an immutable cryptographic audit entry in the institutional log.
            </p>

            <div className="space-y-1">
              <label className="font-semibold text-ink block">
                Administrative Justification (Mandatory)
              </label>
              <textarea
                rows={3}
                placeholder="Detail academic reason or specific schedule impact..."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="w-full px-3 py-2 bg-bone border border-line rounded-editorial text-xs text-ink focus:outline-none focus:ring-1 focus:ring-terracotta"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveFlagAction(null)}
              >
                Cancel
              </Button>
              <Button
                variant="accent"
                size="sm"
                isLoading={isApplyingAction}
                onClick={handleConfirmAction}
              >
                Confirm Enforcement
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </AppShell>
  );
}
