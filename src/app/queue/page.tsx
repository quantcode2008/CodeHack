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
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useBookings, type BookingRecord } from "@/context/BookingContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Sheet } from "@/components/ui/Sheet";
import { Textarea } from "@/components/ui/Textarea";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type QueueFilter = "all" | "pending" | "approved" | "waitlisted" | "rejected";

export default function OwnerQueuePage() {
  const { user, role, roleTitle } = useAuth();
  const { bookings, decideBooking, delegateBooking } = useBookings();

  const [activeFilter, setActiveFilter] = React.useState<QueueFilter>("pending");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedBooking, setSelectedBooking] = React.useState<BookingRecord | null>(null);

  // Decision Dialog States
  const [isDecisionOpen, setIsDecisionOpen] = React.useState(false);
  const [decisionType, setDecisionType] = React.useState<"approved" | "rejected" | "waitlisted">("approved");
  const [decisionReasonCode, setDecisionReasonCode] = React.useState<string>("verified_credentials");
  const [decisionExplanation, setDecisionExplanation] = React.useState<string>("");
  const [decisionError, setDecisionError] = React.useState<string | null>(null);

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
      // Update selected booking preview
      setSelectedBooking((prev) =>
        prev
          ? {
              ...prev,
              status: decisionType as any,
              decisionExplanation,
              decidedByName: user?.fullName || "Dr. Kavitha Rao",
            }
          : null
      );
    }
  };

  const handleConfirmDelegation = async () => {
    if (!selectedBooking) return;
    await delegateBooking(
      selectedBooking.id,
      selectedDelegatee.id,
      selectedDelegatee.name
    );
    setIsDelegateOpen(false);
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 text-ink">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-line pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge status="active" showDot={false}>
                Custodian Management Desk
              </Badge>
              <span className="text-mono-label text-ink-muted">
                Role: {roleTitle}
              </span>
            </div>
            <h1 className="font-display text-display-lg text-ink font-normal leading-tight">
              Resource Request Queue
            </h1>
            <p className="text-small text-ink-muted leading-relaxed max-w-xl">
              Inspect student booking requests, evaluate competing applications, and issue explainable decisions that write permanently to the audit ledger.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-small text-ink-muted">Pending Review:</span>
            <Badge status="pending">
              {bookings.filter((b) => b.status === "requested").length} Awaiting Action
            </Badge>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface p-4 border border-line rounded-editorial shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
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
              { id: "pending", label: "Pending" },
              { id: "approved", label: "Approved" },
              { id: "waitlisted", label: "Waitlisted" },
              { id: "all", label: "All Requests" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as QueueFilter)}
                className={cn(
                  "px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap",
                  activeFilter === tab.id
                    ? "bg-surface text-ink font-semibold shadow-xs"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                {tab.label}
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
                title="No requests in this queue"
                description="There are currently no student booking applications matching your filter criteria."
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
                      "w-full text-left p-4 rounded-editorial border transition-all cursor-pointer space-y-3",
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

                    <div className="space-y-0.5">
                      <h4 className="font-display text-base text-ink font-normal leading-snug">
                        {b.resourceTitle}
                      </h4>
                      <p className="text-xs text-ink-muted font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-terracotta" />
                        <span>
                          {new Date(b.timeRangeStart).toLocaleDateString([], {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })} · {b.durationHours}h Session
                        </span>
                      </p>
                    </div>

                    <p className="text-xs text-ink-muted line-clamp-2 italic">
                      &ldquo;{b.purpose}&rdquo;
                    </p>

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
                      Request Inspection #{selectedBooking.id}
                    </span>
                    <h3 className="font-display text-2xl text-ink font-normal">
                      {selectedBooking.resourceTitle}
                    </h3>
                  </div>
                  <Badge status={selectedBooking.status} />
                </div>

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

                {/* 3. Competing Requests for the Same Slot */}
                {competingBookings.length > 0 && (
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

                {/* Verbatim Record Notice */}
                <div className="p-2.5 bg-bone/70 border border-line/60 rounded-md text-[11px] text-ink-muted flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-terracotta shrink-0" />
                  <span>
                    Notice: Your written explanation will be presented verbatim to the student borrower.
                  </span>
                </div>

                {/* Decision Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-line/60">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="accent"
                      size="sm"
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      onClick={() => handleOpenDecision("approved")}
                    >
                      Approve Request
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Scale className="w-4 h-4 text-warning" />}
                      onClick={() => handleOpenDecision("waitlisted")}
                    >
                      Waitlist
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger hover:bg-danger/10 hover:text-danger"
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
                  >
                    Delegate Review
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-surface border border-line rounded-editorial p-12 text-center text-ink-muted space-y-2">
                <Inbox className="w-8 h-8 text-ink-muted/50 mx-auto" />
                <h4 className="font-display text-lg text-ink font-normal">
                  Select a request from the queue
                </h4>
                <p className="text-xs max-w-sm mx-auto">
                  Click any booking card on the left to inspect applicant credentials, competing slots, and rule recommendations.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* MANDATORY EXPLANATION DECISION MODAL                     */}
        {/* ======================================================== */}
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

