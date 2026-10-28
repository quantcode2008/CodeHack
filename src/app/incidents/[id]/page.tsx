"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertOctagon,
  AlertTriangle,
  Clock,
  ShieldCheck,
  User,
  CheckCircle2,
  XCircle,
  Bot,
  Camera,
  Layers,
  Send,
  Building2,
  FileText,
  MapPin,
  ExternalLink,
  MessageSquare,
  Scale,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useIncidents } from "@/context/IncidentContext";
import { useAuth } from "@/context/AuthContext";
import { useAudit } from "@/context/AuditContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { type IncidentStatus } from "@/lib/supabase/types";
import { type PenaltyAction } from "@/lib/incidents/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const incidentId = params?.id as string;
  const { user, role, roleTitle } = useAuth();
  const { logAudit } = useAudit();
  const { getIncidentById, updateIncidentStatus, addTimelineComment, saveIncidentAiSummary } = useIncidents();

  const incident = getIncidentById(incidentId);

  // Review & Resolution form state
  const [newStatus, setNewStatus] = React.useState<IncidentStatus>("under_review");
  const [resolutionNote, setResolutionNote] = React.useState("");
  const [penaltyAction, setPenaltyAction] = React.useState<PenaltyAction>("none");
  const [penaltyJustification, setPenaltyJustification] = React.useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);

  // AI Summary State
  const [isGeneratingAiSummary, setIsGeneratingAiSummary] = React.useState(false);

  // Timeline note state
  const [newComment, setNewComment] = React.useState("");
  const [isAddingComment, setIsAddingComment] = React.useState(false);

  // Photo viewer modal state
  const [selectedPhoto, setSelectedPhoto] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (incident) {
      setNewStatus(
        incident.status === "open"
          ? "under_review"
          : incident.status === "under_review"
          ? "resolved"
          : incident.status
      );
    }
  }, [incident]);

  if (!incident) {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto px-4 py-16">
          <EmptyState
            title="Incident Not Found"
            description="Could not locate this incident record in the custody ledger."
            action={
              <Button variant="accent" onClick={() => router.push("/incidents")}>
                Return to Incidents
              </Button>
            }
          />
        </div>
      </AppShell>
    );
  }

  const handleStatusUpdate = async () => {
    setIsUpdatingStatus(true);
    const success = await updateIncidentStatus(
      incident.id,
      newStatus,
      resolutionNote,
      penaltyAction,
      penaltyJustification
    );
    setIsUpdatingStatus(false);
    if (success) {
      setResolutionNote("");
      setPenaltyJustification("");
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setIsAddingComment(true);
    await addTimelineComment(incident.id, newComment, roleTitle || "Lab Director");
    setIsAddingComment(false);
    setNewComment("");
  };

  const handleGenerateAiSummary = async () => {
    setIsGeneratingAiSummary(true);
    try {
      const res = await fetch("/api/ai/incident-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incident,
          timeline: incident.timeline,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        await saveIncidentAiSummary(incident.id, data.summary);

        await logAudit({
          entityType: "incident",
          entityId: incident.id,
          entityTitle: incident.resourceTitle,
          action: "AI_INCIDENT_SUMMARY_GENERATED",
          actionLabel: "AI Incident Summary Generated",
          actorId: user?.id || "usr-custodian",
          actorName: user?.fullName || "Facility Custodian",
          actorRole: (user?.role as any) || "owner",
          reason: `Generated 3-sentence advisory incident summary via ${data.modelUsed}.`,
          before: undefined,
          after: { summary: data.summary, model: data.modelUsed },
        });

        toast.success("AI Summary Generated", {
          description: "Synthesized neutral 3-sentence review for custodian verification.",
        });
      }
    } catch {
      toast.error("Failed to generate AI incident summary");
    } finally {
      setIsGeneratingAiSummary(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8 text-ink pb-24">
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between border-b border-line pb-4">
          <Link
            href="/incidents"
            className="inline-flex items-center gap-2 text-small font-medium text-ink-muted hover:text-ink transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 text-terracotta group-hover:-translate-x-1 transition-transform" />
            <span>Return to All Incidents</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-ink-muted">Incident Ref:</span>
            <span className="font-mono text-xs font-bold text-ink">{incident.id}</span>
          </div>
        </div>

        {/* System-Generated Alert Banner */}
        {incident.isSystemGenerated && (
          <div className="p-4 bg-[#FCF2F1] border border-danger/40 rounded-editorial space-y-1.5 text-xs text-danger shadow-xs">
            <div className="flex items-center gap-2 font-bold text-small">
              <Bot className="w-5 h-5 text-danger shrink-0" />
              <span>System-Generated Overdue Delay · Needs Custodian Review</span>
            </div>
            <p className="leading-relaxed text-ink/90">
              This incident was triggered automatically by the scheduled Postgres pg_cron job when equipment exceeded its reservation window without departure checkout. Please inspect return status and review borrower record.
            </p>
          </div>
        )}

        {/* AI Neutral Incident Summary Box */}
        <div className="p-5 bg-surface border border-line rounded-editorial space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-terracotta/15 text-terracotta border border-terracotta/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-terracotta" />
                AI summary — verify before acting
              </span>
              <span className="text-[11px] text-ink-muted">Advisory Synthesis</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              isLoading={isGeneratingAiSummary}
              onClick={handleGenerateAiSummary}
              className="text-xs min-h-[32px] px-2.5"
            >
              <Sparkles className="w-3 h-3 mr-1 text-terracotta" />
              {incident.ai_summary ? "Refresh AI Summary" : "Generate AI Summary"}
            </Button>
          </div>

          <p className="text-xs sm:text-small text-ink leading-relaxed font-sans bg-bone/70 p-3.5 rounded-editorial border border-line/60">
            {incident.ai_summary ||
              "No AI summary generated yet. Click 'Generate AI Summary' above to synthesize a 3-sentence factual report from inspection records and timeline entries."}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-ink-muted pt-1">
            <span>
              <strong className="text-ink">Governance Policy: </strong>AI never makes final decisions. Physical evidence must be confirmed by human custodians before imposing any status shifts or penalties.
            </span>
            {incident.ai_summarized_at && (
              <span className="font-mono shrink-0">
                Synthesized {new Date(incident.ai_summarized_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
        </div>

        {/* Header Summary */}
        <div className="bg-surface border border-line rounded-editorial p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line/60 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-danger/10 text-danger border border-danger/30">
                {incident.severity} Severity
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-bone border border-line font-semibold">
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
            </div>

            <div className="text-xs font-mono text-ink-muted flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-terracotta" />
              <span>Logged {new Date(incident.createdAt).toLocaleDateString()} {new Date(incident.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-mono-label text-ink-muted uppercase">
              Incident Investigation
            </span>
            <h1 className="font-display text-2xl sm:text-3xl text-ink font-normal leading-tight">
              {incident.resourceTitle}
            </h1>
            <p className="text-xs text-ink-muted flex items-center gap-1.5 pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-terracotta" />
              <span>{incident.resourceLocation}</span>
            </p>
          </div>

          <p className="text-body text-ink leading-relaxed p-4 bg-bone/60 border border-line rounded-editorial">
            {incident.description}
          </p>

          {/* Evidence Photos Gallery */}
          {incident.photos.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-mono-label uppercase text-ink-muted font-bold block">
                Evidence Photos ({incident.photos.length})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {incident.photos.map((photo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPhoto(photo)}
                    className="rounded-editorial border border-line overflow-hidden group relative hover:border-terracotta transition-colors min-h-[44px]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt={`Evidence ${idx + 1}`} className="w-full h-28 object-cover" />
                    <div className="absolute inset-0 bg-ink/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                      Zoom Photo
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reporter & Associated Booking Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-line/60 text-xs">
            <div className="p-3 bg-bone/40 border border-line rounded-editorial flex items-center justify-between">
              <div>
                <span className="text-[10px] text-ink-muted uppercase block">Reported By</span>
                <strong className="text-ink block">{incident.reportedByName}</strong>
                <span className="text-[11px] text-ink-muted capitalize">{incident.reportedByRole}</span>
              </div>
              <User className="w-5 h-5 text-ink-muted" />
            </div>

            {incident.bookingId ? (
              <div className="p-3 bg-bone/40 border border-line rounded-editorial flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-ink-muted uppercase block">Linked Reservation</span>
                  <strong className="text-ink font-mono block">{incident.bookingId}</strong>
                  <Link
                    href={`/bookings/${incident.bookingId}`}
                    className="text-[11px] text-terracotta font-semibold hover:underline flex items-center gap-1 pt-0.5"
                  >
                    <span>View Reservation Journey</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <FileText className="w-5 h-5 text-terracotta" />
              </div>
            ) : (
              <div className="p-3 bg-bone/40 border border-line rounded-editorial flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-ink-muted uppercase block">Direct Resource Flag</span>
                  <Link
                    href={`/resources/${incident.resourceSlug}`}
                    className="text-[11px] text-terracotta font-semibold hover:underline flex items-center gap-1 pt-0.5"
                  >
                    <span>Inspect Catalog Listing</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <Layers className="w-5 h-5 text-ink-muted" />
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* THREADED INCIDENT TIMELINE                               */}
        {/* ======================================================== */}
        <div className="bg-surface border border-line rounded-editorial p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <span className="text-mono-label uppercase text-ink-muted font-bold">
                Audited Investigation
              </span>
              <h2 className="font-display text-xl text-ink font-normal">
                Threaded Incident Timeline
              </h2>
            </div>
            <span className="text-xs text-ink-muted font-mono">
              {incident.timeline.length} Recorded Milestone{incident.timeline.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-line">
            {incident.timeline.map((event, idx) => (
              <div key={event.id || idx} className="relative space-y-1 text-xs">
                {/* Bullet */}
                <div className="absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full bg-surface border-2 border-terracotta z-10" />

                <div className="bg-bone/40 p-4 rounded-editorial border border-line space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/50 pb-2">
                    <div className="flex items-center gap-2">
                      <strong className="text-ink">{event.authorName}</strong>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.2 rounded bg-surface border border-line text-ink-muted font-bold">
                        {event.authorRole}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-ink-muted">{event.timestamp}</span>
                  </div>

                  <strong className="block text-terracotta text-small font-semibold">
                    {event.action}
                  </strong>

                  <p className="text-ink leading-relaxed italic">&ldquo;{event.note}&rdquo;</p>

                  {/* Penalty Citation Banner */}
                  {event.penaltyApplied && (
                    <div className="p-2.5 bg-[#FCF2F1] border border-danger/30 rounded-editorial text-danger space-y-0.5">
                      <strong className="block uppercase font-mono text-[11px]">
                        Penalty Citation Applied: {event.penaltyApplied.action.replace("_", " ")}
                      </strong>
                      <span className="text-[11px] text-ink-muted">
                        Written Justification: &ldquo;{event.penaltyApplied.justification}&rdquo;
                      </span>
                    </div>
                  )}

                  {/* Attached photos */}
                  {event.photos && event.photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {event.photos.map((p, pi) => (
                        <button
                          key={pi}
                          type="button"
                          onClick={() => setSelectedPhoto(p)}
                          className="rounded border border-line overflow-hidden hover:opacity-80 transition-opacity"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p} alt={`Photo ${pi + 1}`} className="w-full h-20 object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Note to Thread */}
          <div className="pt-4 border-t border-line/60 space-y-2">
            <span className="text-mono-label uppercase text-ink-muted font-bold block">
              Add Note or Observation to Record
            </span>
            <div className="flex gap-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Enter custodial inspection remarks, maintenance logs, or student communication..."
                rows={2}
                className="text-xs"
              />
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Send className="w-3.5 h-3.5 text-terracotta" />}
                isLoading={isAddingComment}
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                Add Timeline Note
              </Button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* OWNER / MANAGER RESOLUTION CARD                          */}
        {/* ======================================================== */}
        <div className="bg-surface border border-line rounded-editorial p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <span className="text-mono-label uppercase text-ink-muted font-bold">
                Resolution & Governance
              </span>
              <h2 className="font-display text-xl text-ink font-normal">
                Custodian Decision & Standing Assessment
              </h2>
            </div>
            <span className="text-xs font-mono text-ink-muted">Authority: Owner / Lab Director</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Status Selector */}
            <div className="space-y-1.5">
              <label className="text-mono-label uppercase text-ink-muted font-bold block">
                Target Incident Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "under_review", label: "Under Review", desc: "Investigation open" },
                  { id: "resolved", label: "Resolved", desc: "Issue addressed & sealed" },
                  { id: "dismissed", label: "Dismissed", desc: "No violation / cleared" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setNewStatus(opt.id as IncidentStatus)}
                    className={cn(
                      "p-3 rounded-editorial border text-left transition-all min-h-[44px]",
                      newStatus === opt.id
                        ? "bg-ink text-surface border-ink font-semibold shadow-xs"
                        : "bg-surface border-line text-ink hover:border-terracotta/50"
                    )}
                  >
                    <div className="font-bold text-xs">{opt.label}</div>
                    <div className="text-[10px] opacity-75">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution Note (Mandatory) */}
            <div className="space-y-1.5">
              <label className="text-mono-label uppercase text-ink-muted font-bold block flex items-center justify-between">
                <span>Formal Resolution Note (Mandatory)</span>
                <span className="text-[10px] text-ink-muted">Min 8 characters</span>
              </label>
              <Textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="State the findings, equipment repair actions, optical calibration, or student discussion..."
                rows={3}
                className="text-xs"
              />
            </div>

            {/* Penalty Action Selector (Requires explicit click & justification) */}
            <div className="p-4 bg-bone/60 border border-line rounded-editorial space-y-3">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-terracotta" />
                <span className="font-semibold text-xs text-ink uppercase tracking-wider font-mono">
                  Optional Collegiate Standing Penalty
                </span>
              </div>
              <p className="text-[11px] text-ink-muted leading-relaxed">
                Penalties require a human custodian click and a written justification. They are recorded transparently in the borrower&apos;s standing profile and the audit log.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                {[
                  { id: "none", label: "No Penalty", desc: "Standard resolution" },
                  { id: "warning", label: "Standing Warning", desc: "Formal notice logged" },
                  { id: "credit_deduction", label: "Quota Deduction", desc: "-2h weekly allowance" },
                  { id: "temporary_suspension", label: "14-Day Hold", desc: "Temporary reserve suspension" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPenaltyAction(p.id as PenaltyAction)}
                    className={cn(
                      "p-2.5 rounded-editorial border text-left transition-all min-h-[44px]",
                      penaltyAction === p.id
                        ? "bg-terracotta text-white border-terracotta shadow-xs font-semibold"
                        : "bg-surface border-line text-ink hover:border-terracotta/50"
                    )}
                  >
                    <div className="font-bold text-xs">{p.label}</div>
                    <div className="text-[10px] opacity-80 pt-0.5">{p.desc}</div>
                  </button>
                ))}
              </div>

              {penaltyAction !== "none" && (
                <div className="space-y-1.5 pt-2 border-t border-line/60">
                  <label className="text-mono-label uppercase text-ink-muted font-bold block flex items-center justify-between">
                    <span>Penalty Justification (Mandatory Written Explanation)</span>
                    <span className="text-[10px] text-danger font-bold">Required</span>
                  </label>
                  <Textarea
                    value={penaltyJustification}
                    onChange={(e) => setPenaltyJustification(e.target.value)}
                    placeholder="Provide explicit operational reasons why this penalty is warranted under campus fair-use policies..."
                    rows={2}
                    className="text-xs border-danger/40"
                  />
                </div>
              )}
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="accent"
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
                isLoading={isUpdatingStatus}
                onClick={handleStatusUpdate}
                className="min-h-[44px] px-6"
              >
                Apply Decision & Record to Ledger
              </Button>
            </div>
          </div>
        </div>

        {/* Photo Zoom Modal */}
        <Dialog
          isOpen={Boolean(selectedPhoto)}
          onClose={() => setSelectedPhoto(null)}
          title="Evidence Inspection View"
        >
          {selectedPhoto && (
            <div className="space-y-3 pt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPhoto}
                alt="Zoomed inspection photo"
                className="w-full max-h-[70vh] object-contain rounded-editorial border border-line bg-ink"
              />
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setSelectedPhoto(null)}>
                  Close Viewer
                </Button>
              </div>
            </div>
          )}
        </Dialog>
      </div>
    </AppShell>
  );
}

