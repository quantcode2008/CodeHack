"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarClock,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Camera,
  RotateCcw,
  PlusCircle,
  FileText,
  User,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useBookings, type BookingRecord } from "@/context/BookingContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BookingTimer } from "@/components/booking/BookingTimer";
import { EmptyState } from "@/components/ui/EmptyState";
import { Dialog } from "@/components/ui/Dialog";
import { cn } from "@/lib/utils";

type BookingTab = "upcoming" | "pending" | "waitlisted" | "past";

export default function BookingsDashboardPage() {
  const { user } = useAuth();
  const { bookings, cancelBooking } = useBookings();

  const [activeTab, setActiveTab] = React.useState<BookingTab>("upcoming");
  const [cancelModalBooking, setCancelModalBooking] = React.useState<BookingRecord | null>(null);
  const [cancelReason, setCancelReason] = React.useState<string>("");

  // Filter bookings by active tab
  const filteredBookings = React.useMemo(() => {
    return bookings.filter((b) => {
      if (activeTab === "upcoming") {
        return b.status === "approved" || b.status === "checked_in" || b.status === "overdue";
      }
      if (activeTab === "pending") {
        return b.status === "requested";
      }
      if (activeTab === "waitlisted") {
        return b.status === "waitlisted";
      }
      if (activeTab === "past") {
        return (
          b.status === "returned" ||
          b.status === "completed" ||
          b.status === "cancelled" ||
          b.status === "rejected"
        );
      }
      return true;
    });
  }, [bookings, activeTab]);

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;
    await cancelBooking(cancelModalBooking.id, cancelReason);
    setCancelModalBooking(null);
    setCancelReason("");
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8 text-ink">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-line pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge status="active" showDot={false}>
                Student Reservations Desk
              </Badge>
              <span className="text-mono-label text-ink-muted">
                {bookings.length} Total Records
              </span>
            </div>
            <h1 className="font-display text-display-lg text-ink font-normal leading-tight">
              My Campus Bookings
            </h1>
            <p className="text-small text-ink-muted leading-relaxed max-w-xl">
              Track reservation requests, review custodian explanations, upload arrival condition photos, and monitor transparent waitlist standing.
            </p>
          </div>

          <Link href="/discover">
            <Button variant="accent" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Reserve Equipment
            </Button>
          </Link>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-2 border-b border-line/60 overflow-x-auto pb-1 text-small">
          {[
            {
              id: "upcoming",
              label: "Upcoming",
              count: bookings.filter((b) => b.status === "approved" || b.status === "checked_in" || b.status === "overdue").length,
            },
            {
              id: "pending",
              label: "Pending Review",
              count: bookings.filter((b) => b.status === "requested").length,
            },
            {
              id: "waitlisted",
              label: "Waitlisted",
              count: bookings.filter((b) => b.status === "waitlisted").length,
            },
            {
              id: "past",
              label: "Past & Completed",
              count: bookings.filter(
                (b) =>
                  b.status === "returned" ||
                  b.status === "completed" ||
                  b.status === "cancelled" ||
                  b.status === "rejected"
              ).length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as BookingTab)}
              className={cn(
                "px-4 py-2 font-medium border-b-2 -mb-1 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap",
                activeTab === tab.id
                  ? "border-terracotta text-terracotta font-semibold"
                  : "border-transparent text-ink-muted hover:text-ink hover:border-line"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                  activeTab === tab.id
                    ? "bg-terracotta/15 text-terracotta font-bold"
                    : "bg-bone text-ink-muted"
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Bookings List Display */}
        {filteredBookings.length === 0 ? (
          <EmptyState
            title={`No ${activeTab} reservations found`}
            description={
              activeTab === "pending"
                ? "You have no active requests awaiting custodian review."
                : activeTab === "waitlisted"
                ? "You are not currently waitlisted on any congested equipment slots."
                : "Explore our collegiate resource registry to schedule precision fabrication tools and labs."
            }
            action={
              <Link href="/discover">
                <Button variant="accent">Discover Available Resources</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => (
              <div
                key={b.id}
                className="bg-surface border border-line rounded-editorial p-5 shadow-xs hover:border-ink/20 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Left: Thumbnail & Main Info */}
                <div className="flex items-start gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.resourcePhoto}
                    alt={b.resourceTitle}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-editorial object-cover border border-line shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge status={b.status} />
                      {(b.status === "checked_in" || b.status === "overdue") && (
                        <BookingTimer booking={b} variant="compact" />
                      )}
                      <span className="text-[11px] text-ink-muted font-mono">
                        {b.id}
                      </span>
                      {b.waitlistPriorityScore && (
                        <span className="text-mono-label text-terracotta px-2 py-0.5 rounded bg-terracotta/10 border border-terracotta/20 font-bold">
                          Queue Rank #{b.waitlistBreakdown?.position || 2} ({b.waitlistPriorityScore} pts)
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/bookings/${b.id}`}
                      className="font-display text-xl text-ink hover:text-terracotta transition-colors block leading-snug"
                    >
                      {b.resourceTitle}
                    </Link>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                      <span className="flex items-center gap-1 font-medium text-ink">
                        <Clock className="w-3.5 h-3.5 text-terracotta" />
                        {new Date(b.timeRangeStart).toLocaleDateString([], {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })} · {new Date(b.timeRangeStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – {new Date(b.timeRangeEnd).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 truncate max-w-xs">
                        <MapPin className="w-3.5 h-3.5 text-ink-muted" />
                        {b.resourceLocation.split(",")[0]}
                      </span>
                    </div>

                    {/* Verbatim Decision Note Preview if available */}
                    {b.decisionExplanation && (
                      <p className="text-xs text-ink/90 italic bg-bone/70 p-2 rounded-md border border-line/60 max-w-2xl line-clamp-1">
                        &ldquo;{b.decisionExplanation}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-line/60">
                  {b.status === "approved" && (
                    <Link href={`/bookings/${b.id}/check-in`}>
                      <Button size="sm" variant="accent" leftIcon={<Camera className="w-4 h-4" />}>
                        Photo Check-in
                      </Button>
                    </Link>
                  )}

                  {(b.status === "checked_in" || b.status === "overdue") && (
                    <Link href={`/bookings/${b.id}/return`}>
                      <Button size="sm" variant="accent" leftIcon={<RotateCcw className="w-4 h-4" />}>
                        Return & Check Out
                      </Button>
                    </Link>
                  )}

                  {b.status === "requested" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-danger hover:bg-danger/10"
                      onClick={() => setCancelModalBooking(b)}
                    >
                      Cancel
                    </Button>
                  )}

                  <Link href={`/bookings/${b.id}`}>
                    <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancellation Confirmation Dialog */}
        <Dialog
          isOpen={Boolean(cancelModalBooking)}
          onClose={() => setCancelModalBooking(null)}
          title="Cancel Reservation Request"
          description="Please review our fair-use cancellation policy before proceeding."
        >
          <div className="space-y-4 pt-2 text-xs text-ink">
            <p className="text-small text-ink-muted leading-relaxed">
              Are you sure you want to cancel your reservation for <strong>{cancelModalBooking?.resourceTitle}</strong>?
            </p>

            <div className="p-3.5 bg-bone border border-line rounded-editorial space-y-1.5 leading-relaxed text-ink-muted">
              <strong className="text-ink block font-semibold">
                Collegiate Cancellation Policy:
              </strong>
              <span>
                Cancellations made with &gt; 2 hours notice do not incur standing penalties and immediately restore your weekly fair-use quota. Late cancellations or no-shows reduce your waitlist multiplier by 0.25x.
              </span>
            </div>

            <div className="space-y-1">
              <label className="font-semibold block">Optional Cancellation Reason</label>
              <input
                type="text"
                placeholder="e.g. Rescheduled capstone milestone with advisor"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full h-9 px-3 bg-surface border border-line rounded-editorial text-xs text-ink focus:outline-none focus:border-terracotta"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line/60">
              <Button variant="outline" onClick={() => setCancelModalBooking(null)}>
                Keep Reservation
              </Button>
              <Button variant="danger" onClick={handleConfirmCancel}>
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </AppShell>
  );
}

