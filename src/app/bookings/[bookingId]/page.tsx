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
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useBookings, type BookingRecord } from "@/context/BookingContext";
import { Stepper, type StepItem } from "@/components/ui/Stepper";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.bookingId as string;
  const { user } = useAuth();
  const { getBookingById, cancelBooking, extendBooking } = useBookings();

  const booking = getBookingById(bookingId);

  // Dialog States
  const [isCancelOpen, setIsCancelOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("");
  const [isExtendOpen, setIsExtendOpen] = React.useState(false);
  const [extendHours, setExtendHours] = React.useState(1);
  const [isCheckinOpen, setIsCheckinOpen] = React.useState(false);

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

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8 text-ink">
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
            <div className="flex items-center gap-2">
              {booking.status === "approved" && (
                <Button
                  variant="accent"
                  leftIcon={<Camera className="w-4 h-4" />}
                  onClick={() =>
                    toast.info("Physical Photo Check-in", {
                      description: "Upload condition photos upon arriving at the lab bench to confirm custody.",
                    })
                  }
                >
                  Upload Arrival Photos
                </Button>
              )}

              {booking.status !== "cancelled" && booking.status !== "returned" && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<PlusCircle className="w-4 h-4 text-terracotta" />}
                  onClick={() => setIsExtendOpen(true)}
                >
                  Request Extension
                </Button>
              )}
            </div>

            {booking.status !== "cancelled" && booking.status !== "returned" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-danger hover:bg-danger/10 hover:text-danger"
                onClick={() => setIsCancelOpen(true)}
              >
                Cancel Reservation
              </Button>
            )}
          </div>
        </div>

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

        {/* Cancellation Dialog */}
        <Dialog
          isOpen={isCancelOpen}
          onClose={() => setIsCancelOpen(false)}
          title="Cancel Reservation"
          description="Please review cancellation policy rules."
        >
          <div className="space-y-4 pt-2 text-xs text-ink">
            <p className="text-small text-ink-muted">
              Cancelling releases this slot back to the public pool and notifies any waitlisted students immediately.
            </p>
            <div className="space-y-1">
              <label className="font-semibold block">Cancellation Reason (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Schedule adjustment"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full h-9 px-3 bg-surface border border-line rounded-editorial text-xs text-ink focus:outline-none focus:border-terracotta"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line/60">
              <Button variant="outline" onClick={() => setIsCancelOpen(false)}>
                Back
              </Button>
              <Button variant="danger" onClick={handleConfirmCancel}>
                Confirm Cancel
              </Button>
            </div>
          </div>
        </Dialog>

        {/* Extension Dialog */}
        <Dialog
          isOpen={isExtendOpen}
          onClose={() => setIsExtendOpen(false)}
          title="Request Session Extension"
          description="Subject to consecutive slot availability."
        >
          <div className="space-y-4 pt-2 text-xs text-ink">
            <div className="space-y-1.5">
              <label className="font-semibold block">Additional Duration</label>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setExtendHours(h)}
                    className={cn(
                      "py-2 px-3 rounded-editorial border text-center transition-all cursor-pointer font-medium",
                      extendHours === h
                        ? "bg-ink text-surface border-ink"
                        : "bg-surface hover:bg-bone border-line text-ink"
                    )}
                  >
                    +{h} Hour{h > 1 ? "s" : ""}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line/60">
              <Button variant="outline" onClick={() => setIsExtendOpen(false)}>
                Cancel
              </Button>
              <Button variant="accent" onClick={handleConfirmExtend}>
                Confirm Extension
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </AppShell>
  );
}
