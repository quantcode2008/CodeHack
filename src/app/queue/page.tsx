"use client";

import * as React from "react";
import Link from "next/link";
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Scale,
  Sparkles,
  Users,
  Award,
  Share2,
  Calendar,
  Building2,
  AlertCircle,
  RotateCcw,
  Star,
  FileWarning,
  Eye,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useBookings, type BookingRecord } from "@/context/BookingContext";
import { BookingTimer } from "@/components/booking/BookingTimer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Sheet } from "@/components/ui/Sheet";
import { Textarea } from "@/components/ui/Textarea";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type QueueFilter = "all" | "pending" | "approved" | "waitlisted" | "returns" | "rejected";

export default function OwnerQueuePage() {
  const { user, role, roleTitle } = useAuth();
  const { bookings, decideBooking, delegateBooking, completeBooking, disputeBooking } = useBookings();

  const [activeFilter, setActiveFilter] = React.useState<QueueFilter>("pending");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedBooking, setSelectedBooking] = React.useState<BookingRecord | null>(null);

  // Decision Dialog States
  const [isDecisionOpen, setIsDecisionOpen] = React.useState(false);
  const [decisionType, setDecisionType] = React.useState<"approved" | "rejected" | "waitlisted">("approved");
  const [decisionReasonCode, setDecisionReasonCode] = React.useState<string>("verified_credentials");
  const [decisionExplanation, setDecisionExplanation] = React.useState<string>("");
  const [decisionError, setDecisionError] = React.useState<string | null>(null);

  // Return Inspection Completion Dialog State
  const [isCompleteOpen, setIsCompleteOpen] = React.useState(false);
  const [verificationNotes, setVerificationNotes] = React.useState("Physical condition verified against baseline. Components holstered, optics clean.");
  const [ownerFeedbackRating, setOwnerFeedbackRating] = React.useState(5);
  const [ownerFeedbackNote, setOwnerFeedbackNote] = React.useState("Work area left clean and equipment properly shut down. Trust score credited.");
  const [isCompleting, setIsCompleting] = React.useState(false);

  // Return Dispute Dialog State
  const [isDisputeOpen, setIsDisputeOpen] = React.useState(false);
  const [disputeReason, setDisputeReason] = React.useState("");
  const [isDisputing, setIsDisputing] = React.useState(false);

  // Delegation Dialog State
  const [isDelegateOpen, setIsDelegateOpen] = React.useState(false);
  const [selectedDelegatee, setSelectedDelegatee] = React.useState({
    id: "33333333-3333-3333-3333-333333333333",
    name: "Imran Syed (Lab Monitor)",
  });

  // Filtered requests
  const filteredBookings = React.useMemo(() => {
    return bookings.filter((b) => {
      const matchesSearch =
        b.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.resourceTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.purpose.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        activeFilter === "all"
          ? true
          : activeFilter === "pending"
          ? b.status === "requested"
          : activeFilter === "returns"
          ? b.status === "returned" || b.status === "completed"
          : b.status === activeFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, activeFilter, searchQuery]);

  // Find competing requests for the same resource & day
  const competingBookings = React.useMemo(() => {
    if (!selectedBooking) return [];
    return bookings.filter(
      (b) =>
        b.id !== selectedBooking.id &&
        b.resourceId === selectedBooking.resourceId &&
        b.status === "requested"
    );
  }, [bookings, selectedBooking]);

  // Open Decision Dialog
  const handleOpenDecision = (type: "approved" | "rejected" | "waitlisted") => {
    setDecisionType(type);
    setDecisionExplanation(
      type === "approved"
        ? "Prerequisite safety certifications verified. Slotted for requested window. Please bring approved eyewear."
        : type === "waitlisted"
        ? "Slot is contested by senior capstone group. Placed in priority waitlist based on course urgency."
        : "Missing prerequisite safety training. Please complete orientation before re-applying."
    );
    setDecisionReasonCode(
      type === "approved"
        ? "verified_credentials"
        : type === "waitlisted"
        ? "slot_contested"
        : "prerequisite_missing"
    );
    setDecisionError(null);
    setIsDecisionOpen(true);
  };

  // Submit Decision
  const handleConfirmDecision = async () => {
    if (!selectedBooking) return;
    if (!decisionExplanation.trim() || decisionExplanation.trim().length < 8) {
      setDecisionError("A substantive written explanation is mandatory (minimum 8 characters).");
      return;
    }

    const success = await decideBooking(
      selectedBooking.id,
      decisionType,
      [decisionReasonCode],
      decisionExplanation
    );

    if (success) {
      setIsDecisionOpen(false);
      setSelectedBooking(null);
    }
  };

  // Confirm Complete Return with Feedback
  const handleConfirmComplete = async () => {
    if (!selectedBooking) return;
    setIsCompleting(true);

    const success = await completeBooking(
      selectedBooking.id,
      verificationNotes,
      {
        rating: ownerFeedbackRating,
        note: ownerFeedbackNote,
      }
    );

    setIsCompleting(false);
    if (success) {
      setIsCompleteOpen(false);
      setSelectedBooking(null);
    }
  };

  // Confirm Dispute Return
  const handleConfirmDispute = async () => {
    if (!selectedBooking) return;
    if (!disputeReason.trim()) {
      toast.error("Please explain the reason for raising this dispute.");
      return;
    }

    setIsDisputing(true);
    const success = await disputeBooking(
      selectedBooking.id,
      disputeReason,
      {
        id: `inc-disp-${Date.now()}`,
        bookingId: selectedBooking.id,
        resourceId: selectedBooking.resourceId,
        reportedBy: user?.id || "22222222-2222-2222-2222-222222222222",
        reportedByName: "Dr. Kavitha Rao (Lab Director)",
        type: "damage",
        severity: "medium",
        description: disputeReason,
        status: "under_review",
        createdAt: new Date().toISOString(),
      }
    );

    setIsDisputing(false);
    if (success) {
      setIsDisputeOpen(false);
      setSelectedBooking(null);
    }
  };

  // Confirm Delegation
  const handleConfirmDelegation = async () => {
    if (!selectedBooking) return;
    const success = await delegateBooking(
      selectedBooking.id,
      selectedDelegatee.id,
      selectedDelegatee.name
    );
    if (success) {
      setIsDelegateOpen(false);
      setSelectedBooking(null);
    }
  };

  const returnsPendingCount = bookings.filter((b) => b.status === "returned").length;

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 text-ink pb-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-line pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge status="active" showDot={false}>
                {roleTitle || "Lab Director"} Inbox
              </Badge>
              <span className="text-mono-label text-ink-muted">
                {bookings.filter((b) => b.status === "requested").length} Requests Awaiting Action
              </span>
            </div>
            <h1 className="font-display text-display-lg text-ink font-normal leading-tight">
              Resource Operations Queue
            </h1>
            <p className="text-small text-ink-muted leading-relaxed max-w-2xl">
              Inspect student eligibility credentials, compare contested slots, dispatch transparent explainable decisions, and inspect physical return condition reports.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-ink-muted bg-bone px-3 py-1.5 rounded-md border border-line">
              Postgres RPC Guard: Active
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student, tool, or purpose..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-bone/50 border border-line rounded-editorial text-small text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-terracotta"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-bone border border-line rounded-editorial text-xs">
            {[
              { id: "pending", label: "Pending", count: bookings.filter((b) => b.status === "requested").length },
              { id: "returns", label: "Returns Inspection", count: returnsPendingCount },
              { id: "approved", label: "Approved", count: bookings.filter((b) => b.status === "approved").length },
              { id: "waitlisted", label: "Waitlisted", count: bookings.filter((b) => b.status === "waitlisted").length },
              { id: "all", label: "All Records", count: bookings.length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as QueueFilter)}
                className={cn(
                  "px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 min-h-[36px]",
                  activeFilter === tab.id
                    ? "bg-surface text-ink font-semibold shadow-xs"
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

        {/* Main Master-Detail Queue Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ======================================================== */}
          {/* REQUESTS LIST COLUMN (5 COLS ON DESKTOP)                 */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 space-y-3">
            {filteredBookings.length === 0 ? (
              <EmptyState
                title="No items in this queue"
                description="There are currently no reservations matching your filter criteria."
              />
            ) : (
              filteredBookings.map((b) => {
                const isSelected = selectedBooking?.id === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBooking(b)}
                    className={cn(
                      "w-full text-left p-4 rounded-editorial border transition-all cursor-pointer space-y-3 min-h-[44px]",
                      isSelected
                        ? "bg-surface border-terracotta ring-2 ring-terracotta/20 shadow-xs"
                        : "bg-surface hover:bg-bone border-line shadow-xs"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={b.userAvatar}
                          alt={b.userName}
                          className="w-7 h-7 rounded-full object-cover border border-line"
                        />
                        <span className="font-semibold text-small text-ink">
                          {b.userName}
                        </span>
                      </div>
                      <Badge status={b.status} />
                    </div>

                    <div>
                      <h4 className="font-display text-lg text-ink font-normal leading-snug">
                        {b.resourceTitle}
                      </h4>
                      <p className="text-xs text-ink-muted flex items-center gap-1.5 pt-0.5">
                        <Clock className="w-3.5 h-3.5 text-terracotta shrink-0" />
                        <span>
                          {new Date(b.timeRangeStart).toLocaleDateString([], {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })} · {new Date(b.timeRangeStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ({b.durationHours}h)
                        </span>
                      </p>
                    </div>

                    <p className="text-xs text-ink-muted line-clamp-2 italic bg-bone/50 p-2 rounded-md border border-line/60">
                      &ldquo;{b.purpose}&rdquo;
                    </p>

                    {b.status === "returned" && (
                      <div className="text-[11px] font-mono font-bold text-success flex items-center gap-1">
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Physical return ready for inspection</span>
                      </div>
                    )}

                    {b.delegatedTo && (
                      <div className="text-[10px] text-terracotta font-medium flex items-center gap-1">
                        <Share2 className="w-3 h-3" />
                        <span>Delegated to: {b.delegatedTo.name}</span>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* ======================================================== */}
          {/* DETAIL INSPECTION PANEL (7 COLS ON DESKTOP)             */}
          {/* ======================================================== */}
          <div className="lg:col-span-7">
            {selectedBooking ? (
              <div className="bg-surface border border-line rounded-editorial p-6 space-y-6 shadow-xs sticky top-24">
                {/* Top Request Banner */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
                  <div className="space-y-0.5">
                    <span className="text-mono-label text-ink-muted uppercase">
                      Reservation Inspection #{selectedBooking.id}
                    </span>
                    <h3 className="font-display text-2xl text-ink font-normal">
                      {selectedBooking.resourceTitle}
                    </h3>
                  </div>
                  <Badge status={selectedBooking.status} />
                </div>

                {/* Live timer if checked in or overdue */}
                {(selectedBooking.status === "checked_in" || selectedBooking.status === "overdue") && (
                  <BookingTimer booking={selectedBooking} />
                )}

                {/* ======================================================== */}
                {/* SPECIAL INSPECTION VIEW FOR RETURNED BOOKINGS            */}
                {/* ======================================================== */}
                {selectedBooking.status === "returned" && (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-[#F0F5F1] border border-[#C6DBCB] rounded-editorial flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#2F5338]">
                        <RotateCcw className="w-4 h-4 text-success" />
                        <span>Returned by Borrower · Awaiting Custodian Signoff</span>
                      </div>
                      <span className="text-[11px] font-mono text-[#2F5338]">
                        {new Date(selectedBooking.returnedAt || selectedBooking.timeRangeEnd).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    {/* Side-by-Side Condition Inspection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Before */}
                      <div className="p-3.5 bg-bone/70 border border-line rounded-editorial space-y-2">
                        <div className="flex justify-between items-center border-b border-line/60 pb-1.5">
                          <strong className="text-ink uppercase font-mono text-[11px]">Arrival (Before)</strong>
                          <Badge status="approved">
                            {selectedBooking.conditionReports?.before?.overall.toUpperCase() || "EXCELLENT"}
                          </Badge>
                        </div>
                        <p className="italic text-ink-muted">
                          &ldquo;{selectedBooking.conditionReports?.before?.notes || "No defect reported"}&rdquo;
                        </p>
                        {selectedBooking.conditionReports?.before?.photos && selectedBooking.conditionReports.before.photos.length > 0 && (
                          <div className="grid grid-cols-2 gap-1.5 pt-1">
                            {selectedBooking.conditionReports.before.photos.map((p, i) => (
                              <div key={i} className="rounded border border-line overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={p} alt={`Before ${i}`} className="w-full h-20 object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* After */}
                      <div className="p-3.5 bg-bone/70 border border-line rounded-editorial space-y-2">
                        <div className="flex justify-between items-center border-b border-line/60 pb-1.5">
                          <strong className="text-ink uppercase font-mono text-[11px]">Departure (After)</strong>
                          <Badge
                            status={
                              selectedBooking.conditionReports?.after?.overall === "damaged"
                                ? "rejected"
                                : "approved"
                            }
                          >
                            {selectedBooking.conditionReports?.after?.overall.toUpperCase() || "GOOD"}
                          </Badge>
                        </div>
                        <p className="italic text-ink-muted">
                          &ldquo;{selectedBooking.conditionReports?.after?.notes || "Cleaned and shut down"}&rdquo;
                        </p>
                        {selectedBooking.conditionReports?.after?.photos && selectedBooking.conditionReports.after.photos.length > 0 && (
                          <div className="grid grid-cols-2 gap-1.5 pt-1">
                            {selectedBooking.conditionReports.after.photos.map((p, i) => (
                              <div key={i} className="rounded border border-line overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={p} alt={`After ${i}`} className="w-full h-20 object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Incidents if logged */}
                    {selectedBooking.incidents && selectedBooking.incidents.length > 0 && (
                      <div className="p-3 bg-[#FCF2F1] border border-danger/40 rounded-editorial text-xs text-danger space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <FileWarning className="w-4 h-4 text-danger" />
                          <span>Student Disclosed Incident / Maintenance Need</span>
                        </div>
                        {selectedBooking.incidents.map((inc, i) => (
                          <p key={i} className="text-ink-muted text-xs pl-5">
                            {inc.type.toUpperCase()}: {inc.description}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Custodian Verification Actions */}
                    <div className="p-4 bg-surface border border-line rounded-editorial space-y-3">
                      <span className="text-mono-label uppercase text-ink-muted font-bold block">
                        Custodian Verification Actions
                      </span>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          variant="accent"
                          leftIcon={<CheckCircle2 className="w-4 h-4" />}
                          onClick={() => setIsCompleteOpen(true)}
                          className="min-h-[44px]"
                        >
                          Confirm & Complete Return
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-danger hover:bg-danger/10 min-h-[44px]"
                          leftIcon={<AlertTriangle className="w-4 h-4" />}
                          onClick={() => setIsDisputeOpen(true)}
                        >
                          Raise Dispute / Log Damage
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 1. Requester Profile & Credentials */}
                <div className="p-4 bg-bone/70 border border-line rounded-editorial space-y-3">
                  <span className="text-mono-label uppercase text-ink-muted font-bold block">
                    Requester Credentials & Standing
                  </span>
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedBooking.userAvatar}
                      alt={selectedBooking.userName}
                      className="w-12 h-12 rounded-full object-cover border border-line shrink-0"
                    />
                    <div className="space-y-0.5 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <strong className="text-small text-ink">
                          {selectedBooking.userName}
                        </strong>
                        <ShieldCheck className="w-4 h-4 text-success" />
                      </div>
                      <span className="text-xs text-ink-muted block">
                        {selectedBooking.userEmail} · {selectedBooking.userAffiliation}
                      </span>
                    </div>
                  </div>

                  {/* Standing Metrics */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-line/60 text-xs">
                    <div>
                      <span className="text-[10px] text-ink-muted uppercase block">Weekly Quota</span>
                      <strong className="text-ink">3.5h / 8.0h used</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-ink-muted uppercase block">No-Show Record</span>
                      <strong className="text-success font-semibold">0 No-Shows</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-ink-muted uppercase block">Waitlist Priority</span>
                      <strong className="text-terracotta">1.25x Tier</strong>
                    </div>
                  </div>
                </div>

                {/* 2. Declared Academic Purpose */}
                <div className="space-y-1.5">
                  <span className="text-mono-label uppercase text-ink-muted font-bold block">
                    Declared Purpose
                  </span>
                  <p className="text-small text-ink leading-relaxed p-3.5 bg-bone/40 border border-line rounded-editorial">
                    {selectedBooking.purpose}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-ink-muted">
                    <span>Course Context: <strong>{selectedBooking.courseContext || "Senior Capstone"}</strong></span>
                  </div>
                </div>

                {/* 3. Competing Requests for the Same Slot (if requested) */}
                {selectedBooking.status === "requested" && competingBookings.length > 0 && (
                  <div className="border border-line rounded-editorial p-4 bg-bone/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                        <Users className="w-4 h-4 text-terracotta" />
                        <span>Competing Applications for This Window ({competingBookings.length})</span>
                      </div>
                      <span className="text-[11px] text-ink-muted">Ranked by Priority Algorithm</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {competingBookings.map((c) => (
                        <div
                          key={c.id}
                          className="p-2.5 bg-surface border border-line rounded-md flex items-center justify-between"
                        >
                          <div>
                            <strong className="text-ink block">{c.userName}</strong>
                            <span className="text-ink-muted text-[11px] truncate max-w-xs block">
                              {c.purpose}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-terracotta font-bold">
                              Score: {c.waitlistPriorityScore || 78} pts
                            </span>
                            <span className="text-[10px] text-ink-muted block">Position #2</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. AI-Free Recommended Action Based on Rules */}
                {selectedBooking.status === "requested" && (
                  <div className="p-3.5 bg-sage-light border border-sage/40 rounded-editorial flex items-start gap-3 text-xs">
                    <Sparkles className="w-4 h-4 text-sage-dark shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <strong className="text-ink block font-semibold">
                        Rule Recommendation: APPROVE
                      </strong>
                      <span className="text-ink-muted leading-relaxed">
                        Borrower holds verified safety certification, has remaining fair-use hours (3.5h used), 0 past violations, and holds highest priority standing for this window.
                      </span>
                    </div>
                  </div>
                )}

                {/* Standard Decision Actions for Pending Requests */}
                {selectedBooking.status === "requested" && (
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-line/60">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="accent"
                        size="sm"
                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                        onClick={() => handleOpenDecision("approved")}
                        className="min-h-[44px]"
                      >
                        Approve Request
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Scale className="w-4 h-4 text-warning" />}
                        onClick={() => handleOpenDecision("waitlisted")}
                        className="min-h-[44px]"
                      >
                        Waitlist
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger hover:bg-danger/10 hover:text-danger min-h-[44px]"
                        leftIcon={<XCircle className="w-4 h-4" />}
                        onClick={() => handleOpenDecision("rejected")}
                      >
                        Reject
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Share2 className="w-3.5 h-3.5 text-terracotta" />}
                      onClick={() => setIsDelegateOpen(true)}
                      className="min-h-[44px]"
                    >
                      Delegate Review
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-surface border border-line rounded-editorial p-12 text-center text-ink-muted space-y-2">
                <Inbox className="w-8 h-8 text-ink-muted/50 mx-auto" />
                <h4 className="font-display text-lg text-ink font-normal">
                  Select a reservation from the queue
                </h4>
                <p className="text-xs max-w-sm mx-auto">
                  Click any booking card on the left to inspect applicant credentials, competing slots, or verify condition returns.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RETURN COMPLETION & FEEDBACK MODAL                       */}
        {/* ======================================================== */}
        <Dialog
          isOpen={isCompleteOpen}
          onClose={() => setIsCompleteOpen(false)}
          title="Confirm Physical Return & Complete Journey"
          description="Verifies condition inspection and writes completion hash to audit log."
        >
          <div className="space-y-4 pt-2 text-xs text-ink">
            <div className="space-y-1.5">
              <label className="font-semibold block">Inspection & Verification Notes</label>
              <Textarea
                rows={2}
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="E.g., Honeycomb bed cleaned, lens intact, exhaust fan reset..."
              />
            </div>

            {/* Mutual Feedback */}
            <div className="p-3 bg-bone/70 border border-line rounded-editorial space-y-2.5">
              <label className="font-semibold text-terracotta block">
                Collegiate Peer Standing & Feedback (Unlocked)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setOwnerFeedbackRating(star)}
                    className="p-1 min-h-[40px] min-w-[40px] flex items-center justify-center"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={cn(
                        "w-5 h-5 transition-colors",
                        star <= ownerFeedbackRating
                          ? "fill-warning text-warning"
                          : "text-ink-muted/30"
                      )}
                    />
                  </button>
                ))}
              </div>

              <Textarea
                rows={2}
                value={ownerFeedbackNote}
                onChange={(e) => setOwnerFeedbackNote(e.target.value)}
                placeholder="Brief feedback regarding user's tool care, punctuality, and cleanup..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line/60">
              <Button variant="outline" onClick={() => setIsCompleteOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="accent"
                isLoading={isCompleting}
                onClick={handleConfirmComplete}
              >
                Sign Off & Seal Ledger
              </Button>
            </div>
          </div>
        </Dialog>

        {/* Return Dispute Modal */}
        <Dialog
          isOpen={isDisputeOpen}
          onClose={() => setIsDisputeOpen(false)}
          title="Escalate Return Dispute"
          description="Logs an administrative incident and flags the booking for departmental review."
        >
          <div className="space-y-4 pt-2 text-xs text-ink">
            <div className="space-y-1.5">
              <label className="font-semibold block">Dispute Basis & Damage Description</label>
              <Textarea
                rows={3}
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Explain the damage or violation observed during physical inspection..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line/60">
              <Button variant="outline" onClick={() => setIsDisputeOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                isLoading={isDisputing}
                onClick={handleConfirmDispute}
              >
                File Dispute
              </Button>
            </div>
          </div>
        </Dialog>

        {/* Mandatory Decision Modal */}
        <Dialog
          isOpen={isDecisionOpen}
          onClose={() => setIsDecisionOpen(false)}
          title={`Confirm Decision: ${decisionType.toUpperCase()}`}
          description="A substantive written explanation is mandatory and will be recorded in the audit log."
        >
          <div className="space-y-4 pt-2 text-xs text-ink">
            <div className="space-y-1">
              <label className="font-semibold block">Decision Reason Code</label>
              <select
                value={decisionReasonCode}
                onChange={(e) => setDecisionReasonCode(e.target.value)}
                className="w-full h-9 px-3 bg-surface border border-line rounded-editorial text-xs text-ink focus:outline-none focus:border-terracotta"
              >
                <option value="verified_credentials">Verified Prerequisites & Qualifications</option>
                <option value="academic_urgency">Capstone / Academic Urgency Clearance</option>
                <option value="slot_contested">Congested Slot Priority Recalibration</option>
                <option value="prerequisite_missing">Missing Required Safety Certification</option>
                <option value="quota_exceeded">Exceeds Weekly Category Fair-Use Cap</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold block flex items-center justify-between">
                <span>Written Explanation to Requester (Mandatory)</span>
                <span className="text-[10px] text-ink-muted">Min 8 characters</span>
              </label>
              <Textarea
                rows={3}
                value={decisionExplanation}
                onChange={(e) => {
                  setDecisionExplanation(e.target.value);
                  if (decisionError) setDecisionError(null);
                }}
                error={decisionError || undefined}
                placeholder="Explain the operational or safety basis for this decision..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line/60">
              <Button variant="outline" onClick={() => setIsDecisionOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={decisionType === "rejected" ? "danger" : "accent"}
                onClick={handleConfirmDecision}
              >
                Record Decision
              </Button>
            </div>
          </div>
        </Dialog>

        {/* Delegation Modal */}
        <Dialog
          isOpen={isDelegateOpen}
          onClose={() => setIsDelegateOpen(false)}
          title="Delegate Custody Review"
          description="Authorize a lab monitor or departmental coordinator to inspect this reservation."
        >
          <div className="space-y-4 pt-2 text-xs text-ink">
            <div className="space-y-1">
              <label className="font-semibold block">Assign Custodian</label>
              <select
                value={selectedDelegatee.id}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedDelegatee({
                    id,
                    name: id === "33333333-3333-3333-3333-333333333333" ? "Imran Syed (Lab Monitor)" : "Prof. Adler (Laser Safety Officer)",
                  });
                }}
                className="w-full h-9 px-3 bg-surface border border-line rounded-editorial text-xs text-ink focus:outline-none focus:border-terracotta"
              >
                <option value="33333333-3333-3333-3333-333333333333">Imran Syed (AV & Machine Shop Monitor)</option>
                <option value="66666666-6666-6666-6666-666666666666">Prof. Adler (Laser Safety Officer)</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line/60">
              <Button variant="outline" onClick={() => setIsDelegateOpen(false)}>
                Cancel
              </Button>
              <Button variant="accent" onClick={handleConfirmDelegation}>
                Confirm Delegation
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </AppShell>
  );
}
