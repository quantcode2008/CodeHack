"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertOctagon,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Search,
  PlusCircle,
  FileText,
  User,
  ArrowRight,
  Filter,
  Camera,
  Layers,
  Sparkles,
  Bot,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useIncidents } from "@/context/IncidentContext";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ReportIncidentDialog } from "@/components/incident/ReportIncidentDialog";
import { CAMPUS_RESOURCES } from "@/lib/resources/data";
import { cn } from "@/lib/utils";

type IncidentFilter = "all" | "needs_review" | "open" | "under_review" | "resolved";

export default function IncidentsPage() {
  const { user, roleTitle } = useAuth();
  const { incidents } = useIncidents();

  const [activeFilter, setActiveFilter] = React.useState<IncidentFilter>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isReportOpen, setIsReportOpen] = React.useState(false);

  const defaultResource = CAMPUS_RESOURCES[0];

  const filteredIncidents = React.useMemo(() => {
    return incidents.filter((inc) => {
      const matchesSearch =
        inc.resourceTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.reportedByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        activeFilter === "all"
          ? true
          : activeFilter === "needs_review"
          ? inc.isSystemGenerated && inc.status === "open"
          : inc.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [incidents, activeFilter, searchQuery]);

  const systemNeedsReviewCount = incidents.filter(
    (i) => i.isSystemGenerated && i.status === "open"
  ).length;

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-danger text-surface border-danger font-bold";
      case "high":
        return "bg-[#FCF2F1] text-danger border-[#ECCAC7]";
      case "medium":
        return "bg-[#FDF9EE] text-[#8C6114] border-[#EAD9B8]";
      default:
        return "bg-bone text-ink-muted border-line";
    }
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8 text-ink pb-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-line pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-mono-label uppercase text-ink-muted font-bold tracking-wider">
                Custody & Incident Registry
              </span>
              {systemNeedsReviewCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-danger/15 text-danger border border-danger/30 flex items-center gap-1">
                  <Bot className="w-3 h-3" />
                  {systemNeedsReviewCount} System Delayed
                </span>
              )}
            </div>
            <h1 className="font-display text-display-lg text-ink font-normal leading-tight">
              Incident Reports & Delays
            </h1>
            <p className="text-small text-ink-muted leading-relaxed max-w-2xl">
              Track reported equipment damage, automatic overdue delay incidents, safety observations, and collegiate penalty citations with full immutable audit history.
            </p>
          </div>

          <Button
            variant="accent"
            leftIcon={<PlusCircle className="w-4 h-4" />}
            onClick={() => setIsReportOpen(true)}
            className="min-h-[44px]"
          >
            Report Incident
          </Button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search resource, reporter, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-bone/50 border border-line rounded-editorial text-small text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-terracotta"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-bone border border-line rounded-editorial text-xs">
            {[
              { id: "all", label: "All Incidents", count: incidents.length },
              {
                id: "needs_review",
                label: "Needs Review (System)",
                count: systemNeedsReviewCount,
                highlight: systemNeedsReviewCount > 0,
              },
              { id: "open", label: "Open", count: incidents.filter((i) => i.status === "open").length },
              {
                id: "under_review",
                label: "Under Review",
                count: incidents.filter((i) => i.status === "under_review").length,
              },
              {
                id: "resolved",
                label: "Resolved",
                count: incidents.filter((i) => i.status === "resolved" || i.status === "dismissed").length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as IncidentFilter)}
                className={cn(
                  "px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 min-h-[36px]",
                  activeFilter === tab.id
                    ? "bg-surface text-ink font-semibold shadow-xs"
                    : tab.highlight
                    ? "text-danger hover:bg-danger/10"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={cn(
                      "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                      activeFilter === tab.id
                        ? "bg-terracotta/15 text-terracotta font-bold"
                        : tab.highlight
                        ? "bg-danger text-surface font-bold"
                        : "bg-bone text-ink-muted"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Incidents List Display */}
        {filteredIncidents.length === 0 ? (
          <EmptyState
            title="No incident records found"
            description="All campus equipment is operating within normal parameters and all scheduled checkout returns are clear."
            action={
              <Button variant="outline" onClick={() => setIsReportOpen(true)}>
                File a Notice
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredIncidents.map((incident) => (
              <div
                key={incident.id}
                className={cn(
                  "bg-surface border rounded-editorial p-5 shadow-xs transition-all hover:border-terracotta/40 space-y-4",
                  incident.isSystemGenerated && incident.status === "open"
                    ? "border-danger/40 bg-[#FCF2F1]/30"
                    : "border-line"
                )}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line/60 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border",
                        getSeverityBadge(incident.severity)
                      )}
                    >
                      {incident.severity} Severity
                    </span>

                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-bone border border-line text-ink font-semibold">
                      {incident.type}
                    </span>

                    <Badge
                      status={
                        incident.status === "resolved"
                          ? "completed"
                          : incident.status === "under_review"
                          ? "pending"
                          : "rejected"
                      }
                    >
                      {incident.status.replace("_", " ").toUpperCase()}
                    </Badge>

                    {incident.isSystemGenerated && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-danger/10 text-danger border border-danger/30">
                        <Bot className="w-3 h-3" />
                        System-Generated · Needs Review
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-ink-muted">
                    <Clock className="w-3.5 h-3.5 text-terracotta" />
                    <span>
                      {new Date(incident.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      ·{" "}
                      {new Date(incident.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-line">|</span>
                    <span className="text-ink font-semibold">{incident.id}</span>
                  </div>
                </div>

                {/* Main Content Info */}
                <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="space-y-0.5">
                      <span className="text-mono-label text-ink-muted uppercase">
                        {incident.resourceLocation}
                      </span>
                      <h3 className="font-display text-xl text-ink font-normal leading-snug">
                        {incident.resourceTitle}
                      </h3>
                    </div>

                    <p className="text-xs text-ink leading-relaxed max-w-3xl bg-bone/50 p-3 rounded-editorial border border-line/60">
                      {incident.description}
                    </p>

                    {/* Penalty Tag if resolved with citation */}
                    {incident.penaltyAction && incident.penaltyAction !== "none" && (
                      <div className="p-2.5 bg-[#FCF2F1] border border-danger/30 rounded-editorial text-xs text-danger flex items-start gap-2">
                        <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-semibold uppercase font-mono text-[11px]">
                            Penalty Cited: {incident.penaltyAction.replace("_", " ")}
                          </strong>
                          <span className="text-[11px] text-ink-muted">
                            Justification: &ldquo;{incident.penaltyJustification}&rdquo;
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted pt-1">
                      <span>
                        Reported by: <strong className="text-ink">{incident.reportedByName}</strong> (
                        <span className="capitalize">{incident.reportedByRole}</span>)
                      </span>
                      {incident.photos.length > 0 && (
                        <span className="flex items-center gap-1 text-terracotta font-medium">
                          <Camera className="w-3.5 h-3.5" />
                          {incident.photos.length} photo{incident.photos.length === 1 ? "" : "s"} attached
                        </span>
                      )}
                      <span>·</span>
                      <span>{incident.timeline.length} timeline event{incident.timeline.length === 1 ? "" : "s"}</span>
                    </div>
                  </div>

                  {/* Right Button */}
                  <div className="shrink-0 w-full md:w-auto pt-2 md:pt-0">
                    <Link href={`/incidents/${incident.id}`}>
                      <Button
                        variant={incident.isSystemGenerated && incident.status === "open" ? "accent" : "outline"}
                        size="sm"
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        className="w-full md:w-auto min-h-[44px]"
                      >
                        Inspect & Resolve
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Global Report Dialog */}
        <ReportIncidentDialog
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          resourceId={defaultResource.id}
          resourceTitle={defaultResource.title}
          resourceSlug={defaultResource.slug}
          resourceLocation={defaultResource.locationText}
          resourcePhoto={defaultResource.photos[0]}
        />
      </div>
    </AppShell>
  );
}

