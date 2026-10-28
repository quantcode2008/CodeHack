"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Camera,
  RotateCcw,
  PlusCircle,
  FileText,
  User,
  ShieldCheck,
  Hash,
  Share2,
  Sparkles,
  Star,
  FileWarning,
  MessageSquare,
  AlertOctagon,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useBookings, type BookingRecord } from "@/context/BookingContext";
import { useAudit } from "@/context/AuditContext";
import { BookingTimer } from "@/components/booking/BookingTimer";
import { AuditTimeline } from "@/components/audit/AuditTimeline";
import { ReportIncidentDialog } from "@/components/incident/ReportIncidentDialog";
import { Stepper, type StepItem } from "@/components/ui/Stepper";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Textarea } from "@/components/ui/Textarea";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = (params?.bookingId || params?.id) as string;
  const { user } = useAuth();
  const { getBookingById, cancelBooking, extendBooking, submitFeedback } = useBookings();
  const { getAuditByBooking } = useAudit();

  const booking = getBookingById(bookingId);
  const auditRecords = booking ? getAuditByBooking(booking.id) : [];

  // Tab State: Details vs History
  const [activeDetailTab, setActiveDetailTab] = React.useState<"details" | "history">("details");

  // Dialog States
  const [isCancelOpen, setIsCancelOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("");
  const [isExtendOpen, setIsExtendOpen] = React.useState(false);
  const [extendHours, setExtendHours] = React.useState(1);
  const [isReportIncidentOpen, setIsReportIncidentOpen] = React.useState(false);

  // Feedback Dialog State
  const [isFeedbackOpen, setIsFeedbackOpen] = React.useState(false);
  const [feedbackRating, setFeedbackRating] = React.useState(5);
  const [feedbackNote, setFeedbackNote] = React.useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = React.useState(false);

  if (!booking) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto px-4 py-16">
          <EmptyState
            title="Reservation Not Found"
            description="The requested booking ID does not exist in your account ledger."
            action={
              <Button variant="accent" onClick={() => router.push("/bookings")}>
                Return to Bookings
              </Button>
            }
          />
        </div>
      </AppShell>
    );
  }

  // 4-Phase Lifecycle Stepper Status
  const getLifecycleStep = (status: string): number => {
    switch (status) {
      case "requested":
        return 1;
      case "approved":
      case "waitlisted":
      case "rejected":
        return 2;
      case "checked_in":
        return 3;
      case "returned":
      case "completed":
        return 4;
      default:
        return 1;
    }
  };

  const currentStepNumber = getLifecycleStep(booking.status);

  const steps: StepItem[] = [
    {
      id: 1,
      title: "Requested",
      description: "Dispatched to custodian",
      status: currentStepNumber === 1 ? "current" : currentStepNumber > 1 ? "completed" : "upcoming",
    },
    {
      id: 2,
      title: "Decision",
      description: booking.status === "rejected" ? "Request rejected" : "Schedule clearance",
      status: currentStepNumber === 2 ? "current" : currentStepNumber > 2 ? "completed" : "upcoming",
    },
    {
      id: 3,
      title: "Photo Check-in",
      description: "Arrival condition baseline",
      status: currentStepNumber === 3 ? "current" : currentStepNumber > 3 ? "completed" : "upcoming",
    },
    {
      id: 4,
      title: "Return & Sealed",
      description: "Audit log closed",
      status: currentStepNumber === 4 ? "completed" : "upcoming",
    },
  ];

  const handleConfirmCancel = async () => {
    await cancelBooking(booking.id, cancelReason);
    setIsCancelOpen(false);
  };

  const handleConfirmExtend = async () => {
    await extendBooking(booking.id, extendHours);
    setIsExtendOpen(false);
  };

  const handleSubmitPeerFeedback = async () => {
    setIsSubmittingFeedback(true);
    await submitFeedback(booking.id, feedbackRating, feedbackNote);
    setIsSubmittingFeedback(false);
    setIsFeedbackOpen(false);
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8 text-ink pb-24">
        {/* Top Breadcrumb Header */}
        <div className="flex items-center justify-between border-b border-line pb-4">
          <Link
            href="/bookings"
            className="inline-flex items-center gap-2 text-small font-medium text-ink-muted hover:text-ink transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 text-terracotta group-hover:-translate-x-1 transition-transform" />
            <span>Return to All Bookings</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-ink-muted">Ref:</span>
            <span className="font-mono text-xs font-bold text-ink">{booking.id}</span>
          </div>
        </div>

        {/* Live Countdown Banner (When checked_in or overdue) */}
        {(booking.status === "checked_in" || booking.status === "overdue") && (
          <BookingTimer booking={booking} />
        )}

        {/* Tab Strip: Details & Handoff vs Audited History */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveDetailTab("details")}
              className={cn(
                "px-4 py-2 text-small font-medium border-b-2 -mb-1.5 transition-colors cursor-pointer",
                activeDetailTab === "details"
                  ? "border-terracotta text-terracotta font-semibold"
                  : "border-transparent text-ink-muted hover:text-ink hover:border-line"
              )}
            >
              Session Details & Handoff
            </button>
            <button
              type="button"
              onClick={() => setActiveDetailTab("history")}
              className={cn(
                "px-4 py-2 text-small font-medium border-b-2 -mb-1.5 transition-colors cursor-pointer flex items-center gap-2",
                activeDetailTab === "history"
                  ? "border-terracotta text-terracotta font-semibold"
                  : "border-transparent text-ink-muted hover:text-ink hover:border-line"
              )}
            >
              <span>Audited History & Ledger</span>
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                  activeDetailTab === "history"
                    ? "bg-terracotta/15 text-terracotta font-bold"
                    : "bg-bone text-ink-muted"
                )}
              >
                {auditRecords.length}
              </span>
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            leftIcon={<AlertOctagon className="w-3.5 h-3.5 text-danger" />}
            onClick={() => setIsReportIncidentOpen(true)}
            className="text-xs border border-danger/30 text-danger hover:bg-danger/10 min-h-[36px]"
          >
            Report Incident
          </Button>
        </div>

        {activeDetailTab === "history" ? (
          <AuditTimeline
            records={auditRecords}
            entityTitle={`${booking.resourceTitle} (Reservation ${booking.id})`}
            allowExport
          />
        ) : (
          <>
            {/* Lifecycle Stepper */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-line/60 pb-3">
                  <span className="text-mono-label uppercase text-ink-muted font-bold">
                    Booking Lifecycle Tracker
                  </span>
                  <Badge status={booking.status} />
                </div>
                <Stepper steps={steps} />
              </div>
            </Card>

        {/* ======================================================== */}
        {/* VERBATIM DECISION EXPLANATION BOX (IF DECIDED)           */}
        {/* ======================================================== */}
        {booking.decisionExplanation && (
          <div className="bg-surface border border-line rounded-editorial p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-line/60 pb-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-terracotta" />
                <span className="font-semibold text-small text-ink">
                  Custodian Decision Explanation (Verbatim Record)
                </span>
              </div>
              <span className="text-[11px] font-mono text-ink-muted">
                {booking.decidedByName || "Lab Director"}
              </span>
            </div>

            <p className="text-body text-ink leading-relaxed italic bg-bone/70 p-4 rounded-editorial border border-line/60">
              &ldquo;{booking.decisionExplanation}&rdquo;
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted pt-1">
              <span>Decision Reason Tags: {booking.decisionReasonCodes?.join(", ") || "Verified credentials"}</span>
              <span>Logged to Postgres audit log with immutable cryptographic timestamp</span>
            </div>
          </div>
        )}

        {/* Resource & Session Specification Card */}
        <div className="bg-surface border border-line rounded-editorial p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-line pb-4">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={booking.resourcePhoto}
                alt={booking.resourceTitle}
                className="w-16 h-16 rounded-editorial object-cover border border-line shrink-0"
              />
              <div className="space-y-0.5">
                <span className="text-mono-label text-ink-muted uppercase">
                  {booking.resourceCategory}
                </span>
                <h2 className="font-display text-2xl text-ink font-normal leading-tight">
                  {booking.resourceTitle}
                </h2>
                <p className="text-xs text-ink-muted flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-terracotta" />
                  <span>{booking.resourceLocation}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/resources/${booking.resourceSlug}`}>
                <Button size="sm" variant="outline">
                  View Catalog Listing
                </Button>
              </Link>
            </div>
          </div>

          {/* Time & Duration Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-bone/70 border border-line rounded-editorial text-xs">
            <div>
              <span className="text-[10px] text-ink-muted uppercase block">Reserved Time</span>
              <strong className="text-small font-semibold text-ink block">
                {new Date(booking.timeRangeStart).toLocaleDateString([], {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </strong>
              <span className="font-mono text-terracotta text-[11px]">
                {new Date(booking.timeRangeStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – {new Date(booking.timeRangeEnd).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-ink-muted uppercase block">Duration</span>
              <strong className="text-small font-semibold text-ink block">
                {booking.durationHours} Hours Allocated
              </strong>
              <span className="text-ink-muted text-[11px]">Within 8.0h fair-use cap</span>
            </div>
            <div>
              <span className="text-[10px] text-ink-muted uppercase block">Course Context</span>
              <strong className="text-small font-semibold text-ink block">
                {booking.courseContext || "Undergraduate Engineering"}
              </strong>
              <span className="text-success font-semibold text-[11px]">Priority Weighted</span>
            </div>
          </div>

          {/* Purpose Statement */}
          <div className="space-y-1.5">
            <span className="text-mono-label uppercase text-ink-muted font-bold block">
              Declared Purpose of Use
            </span>
            <p className="text-small text-ink leading-relaxed p-3 bg-bone/50 border border-line rounded-md">
              {booking.purpose}
            </p>
          </div>

          {/* Action Triggers */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-line/60">
            <div className="flex flex-wrap items-center gap-2">
              {booking.status === "approved" && (
                <Link href={`/bookings/${booking.id}/check-in`}>
                  <Button
                    variant="accent"
                    leftIcon={<Camera className="w-4 h-4" />}
                    className="min-h-[44px]"
                  >
                    Check In at Resource (Photo)
                  </Button>
                </Link>
              )}

              {(booking.status === "checked_in" || booking.status === "overdue") && (
                <Link href={`/bookings/${booking.id}/return`}>
                  <Button
                    variant="accent"
                    leftIcon={<RotateCcw className="w-4 h-4" />}
                    className="min-h-[44px]"
                  >
                    Return & Complete Checklist
                  </Button>
                </Link>
              )}

              {booking.status === "completed" && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Star className="w-4 h-4 text-terracotta" />}
                  onClick={() => setIsFeedbackOpen(true)}
                  className="min-h-[44px]"
                >
                  Collegiate Peer Feedback
                </Button>
              )}

              {booking.status !== "cancelled" &&
                booking.status !== "returned" &&
                booking.status !== "completed" && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<PlusCircle className="w-4 h-4 text-terracotta" />}
                    onClick={() => setIsExtendOpen(true)}
                    className="min-h-[44px]"
                  >
                    Request Extension
                  </Button>
                )}
            </div>

            {booking.status !== "cancelled" &&
              booking.status !== "returned" &&
              booking.status !== "completed" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger hover:bg-danger/10 hover:text-danger min-h-[44px]"
                  onClick={() => setIsCancelOpen(true)}
                >
                  Cancel Reservation
                </Button>
              )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* PHYSICAL CONDITION INSPECTION (BEFORE & AFTER)           */}
        {/* ======================================================== */}
        {(booking.conditionReports?.before || booking.conditionReports?.after) && (
          <div className="bg-surface border border-line rounded-editorial p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <span className="text-mono-label uppercase text-ink-muted font-bold">
                  Physical Condition Audit
                </span>
                <h3 className="font-display text-xl text-ink">
                  Condition Inspection Records
                </h3>
              </div>
              <span className="text-xs text-ink-muted">
                {booking.conditionReports?.after ? "Before & After Compared" : "Arrival Baseline"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Before Report */}
              {booking.conditionReports?.before && (
                <div className="p-4 bg-bone/60 border border-line rounded-editorial space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-line/60 pb-2">
                    <span className="font-mono uppercase font-bold text-ink">
                      Arrival Baseline (Before)
                    </span>
                    <Badge status="approved">
                      {booking.conditionReports.before.overall.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="italic text-ink-muted bg-surface p-2.5 rounded-editorial border border-line/60">
                    &ldquo;{booking.conditionReports.before.notes}&rdquo;
                  </p>

                  {booking.conditionReports.before.photos.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {booking.conditionReports.before.photos.map((photo, i) => (
                        <div key={i} className="rounded-editorial border border-line overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo} alt={`Arrival ${i + 1}`} className="w-full h-24 object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-[10px] font-mono text-ink-muted pt-1">
                    Recorded by {booking.conditionReports.before.recordedByName} at{" "}
                    {new Date(booking.conditionReports.before.recordedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              )}

              {/* After Report */}
              {booking.conditionReports?.after && (
                <div className="p-4 bg-bone/60 border border-line rounded-editorial space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-line/60 pb-2">
                    <span className="font-mono uppercase font-bold text-ink">
                      Departure Inspection (After)
                    </span>
                    <Badge
                      status={
                        booking.conditionReports.after.overall === "damaged"
                          ? "rejected"
                          : "approved"
                      }
                    >
                      {booking.conditionReports.after.overall.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="italic text-ink-muted bg-surface p-2.5 rounded-editorial border border-line/60">
                    &ldquo;{booking.conditionReports.after.notes}&rdquo;
                  </p>

                  {booking.conditionReports.after.photos.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {booking.conditionReports.after.photos.map((photo, i) => (
                        <div key={i} className="rounded-editorial border border-line overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo} alt={`Departure ${i + 1}`} className="w-full h-24 object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-[10px] font-mono text-ink-muted pt-1">
                    Recorded by {booking.conditionReports.after.recordedByName} at{" "}
                    {new Date(booking.conditionReports.after.recordedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Incident Callout if reported */}
            {booking.incidents && booking.incidents.length > 0 && (
              <div className="p-4 bg-[#FCF2F1] border border-danger/40 rounded-editorial space-y-2 text-xs text-danger">
                <div className="flex items-center gap-2 font-bold">
                  <FileWarning className="w-4 h-4 text-danger" />
                  <span>Logged Incident / Damage Flag</span>
                </div>
                {booking.incidents.map((inc, idx) => (
                  <div key={idx} className="p-2.5 bg-surface border border-danger/20 rounded-md space-y-1 text-ink">
                    <div className="flex justify-between items-center text-[11px]">
                      <strong className="text-danger uppercase font-mono">{inc.type} ({inc.severity})</strong>
                      <span className="font-mono text-ink-muted">{inc.status.toUpperCase()}</span>
                    </div>
                    <p className="text-xs text-ink-muted">{inc.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Peer Feedback Callout */}
            {booking.feedback && booking.feedback.length > 0 && (
              <div className="p-4 bg-bone/70 border border-line rounded-editorial space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-ink">
                  <MessageSquare className="w-4 h-4 text-terracotta" />
                  <span>Collegiate Mutual Feedback</span>
                </div>
                {booking.feedback.map((fb, idx) => (
                  <div key={idx} className="p-2.5 bg-surface border border-line rounded-editorial space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-ink">{fb.fromUserName} ({fb.fromRole})</span>
                      <div className="flex items-center gap-0.5 text-warning">
                        {Array.from({ length: fb.rating }).map((_, s) => (
                          <Star key={s} className="w-3.5 h-3.5 fill-warning text-warning" />
                        ))}
                      </div>
                    </div>
                    <p className="italic text-ink-muted">&ldquo;{fb.note}&rdquo;</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* IMMUTABLE AUDIT TRAIL TIMELINE                           */}
        {/* ======================================================== */}
        <div className="bg-surface border border-line rounded-editorial p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <span className="text-mono-label uppercase text-ink-muted font-bold">
                Immutable Ledger
              </span>
              <h3 className="font-display text-xl text-ink">
                Booking Audit Trail
              </h3>
            </div>
            <span className="text-xs text-ink-muted">
              {booking.historyTrail.length} Recorded Milestones
            </span>
          </div>

          <div className="relative pl-6 space-y-6">
            <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-line" />

            {booking.historyTrail.map((item, idx) => (
              <div key={idx} className="relative flex items-start gap-4 text-xs">
                <div className="w-4 h-4 rounded-full bg-surface border-2 border-terracotta -translate-x-[21px] mt-0.5 shrink-0 z-10" />
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="text-ink font-semibold">{item.action}</strong>
                    <span className="font-mono text-ink-muted text-[11px]">{item.timestamp}</span>
                  </div>
                  <p className="text-ink-muted">{item.notes}</p>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-ink-muted/80">
                    <Hash className="w-3 h-3 text-terracotta" />
                    <span>{item.hash}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    )}

        {/* Cancellation Dialog */}
        <Dialog
          isOpen={isCancelOpen}
          onClose={() => setIsCancelOpen(false)}
          title="Cancel Reservation"
          description="Please review cancellation policy rules."
        >
          <div className="space-y-4 pt-2 text-xs text-ink">
            <p className="text-ink-muted leading-relaxed">
              Cancellations submitted more than 2 hours before the session carry zero penalty.
              The slot is automatically re-allocated to the top student on the fair-use waitlist.
            </p>

            <div className="space-y-1.5">
              <label className="text-mono-label uppercase text-ink-muted font-bold block">
                Reason for Cancellation
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="E.g., CAD design revision required before cutting..."
                rows={3}
                className="w-full px-3 py-2 bg-bone/50 border border-line rounded-editorial text-xs text-ink focus:outline-none focus:ring-1 focus:ring-terracotta"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
              <Button variant="ghost" size="sm" onClick={() => setIsCancelOpen(false)}>
                Keep Reservation
              </Button>
              <Button variant="accent" size="sm" onClick={handleConfirmCancel}>
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </Dialog>

        {/* Extension Dialog */}
        <Dialog
          isOpen={isExtendOpen}
          onClose={() => setIsExtendOpen(false)}
          title="Request Session Extension"
          description="Check consecutive slot availability."
        >
          <div className="space-y-4 pt-2 text-xs text-ink">
            <p className="text-ink-muted leading-relaxed">
              Session extensions are granted if the subsequent time block has not been claimed
              by a competing reservation and does not exceed your 8.0h weekly fair-use balance.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setExtendHours(1)}
                className={cn(
                  "p-3 rounded-editorial border text-center transition-all min-h-[44px]",
                  extendHours === 1
                    ? "bg-terracotta text-white border-terracotta"
                    : "bg-surface border-line text-ink hover:border-terracotta/50"
                )}
              >
                <div className="font-bold text-xs">+1.0 Hour</div>
                <div className="text-[10px] opacity-80">Single slot</div>
              </button>
              <button
                type="button"
                onClick={() => setExtendHours(2)}
                className={cn(
                  "p-3 rounded-editorial border text-center transition-all min-h-[44px]",
                  extendHours === 2
                    ? "bg-terracotta text-white border-terracotta"
                    : "bg-surface border-line text-ink hover:border-terracotta/50"
                )}
              >
                <div className="font-bold text-xs">+2.0 Hours</div>
                <div className="text-[10px] opacity-80">Max allowance</div>
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
              <Button variant="ghost" size="sm" onClick={() => setIsExtendOpen(false)}>
                Cancel
              </Button>
              <Button variant="accent" size="sm" onClick={handleConfirmExtend}>
                Confirm Extension
              </Button>
            </div>
          </div>
        </Dialog>

        {/* Peer Feedback Dialog */}
        <Dialog
          isOpen={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
          title="Collegiate Peer Feedback"
          description="Submit a short trust note to confirm smooth handoff."
        >
          <div className="space-y-4 pt-2 text-xs text-ink">
            <div className="space-y-1.5">
              <label className="text-mono-label uppercase text-ink-muted font-bold block">
                Session Trust Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    className="p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={cn(
                        "w-6 h-6 transition-colors",
                        star <= feedbackRating
                          ? "fill-warning text-warning"
                          : "text-ink-muted/30"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-mono-label uppercase text-ink-muted font-bold block">
                Peer Review Note
              </label>
              <Textarea
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder="E.g., Lab equipment was in pristine condition, optical lenses clean, prompt and clear communication..."
                rows={3}
                className="text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
              <Button variant="ghost" size="sm" onClick={() => setIsFeedbackOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="accent"
                size="sm"
                isLoading={isSubmittingFeedback}
                onClick={handleSubmitPeerFeedback}
              >
                Submit Feedback
              </Button>
            </div>
          </div>
        </Dialog>

        {/* Global Incident Report Dialog for this Reservation */}
        <ReportIncidentDialog
          isOpen={isReportIncidentOpen}
          onClose={() => setIsReportIncidentOpen(false)}
          resourceId={booking.resourceId}
          resourceTitle={booking.resourceTitle}
          resourceSlug={booking.resourceSlug}
          resourceLocation={booking.resourceLocation}
          resourcePhoto={booking.resourcePhoto}
          bookingId={booking.id}
        />
      </div>
    </AppShell>
  );
}
