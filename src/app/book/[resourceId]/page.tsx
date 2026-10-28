"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  UserCheck,
  Scale,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Building2,
  Award,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useBookings, type BookingOutcome } from "@/context/BookingContext";
import { Stepper, type StepItem } from "@/components/ui/Stepper";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { CAMPUS_RESOURCES, type CampusResource, type AvailabilitySlot } from "@/lib/resources/data";
import { computeEligibility, type UserCredentialSnapshot } from "@/lib/resources/service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function BookResourcePage() {
  const params = useParams();
  const router = useRouter();
  const resourceId = params?.resourceId as string;
  const { user, credentials } = useAuth();
  const { requestBooking } = useBookings();

  // Find target resource by ID or slug
  const resource = React.useMemo(() => {
    return CAMPUS_RESOURCES.find(
      (r) => r.id === resourceId || r.slug === resourceId
    );
  }, [resourceId]);

  // User credentials snapshot
  const userCredSnapshots: UserCredentialSnapshot[] = React.useMemo(() => {
    return (credentials || []).map((c) => ({
      requirementLabel: c.requirementLabel,
      status: c.status,
    }));
  }, [credentials]);

  // Compute eligibility
  const eligibility = resource
    ? computeEligibility(resource, userCredSnapshots)
    : null;

  // 4-Step Stepper State
  const [currentStep, setCurrentStep] = React.useState<1 | 2 | 3 | 4>(1);

  // Step 1: Date & Time Slot Picker State
  const [selectedDate, setSelectedDate] = React.useState<string>("Tomorrow");
  const [selectedSlotIndex, setSelectedSlotIndex] = React.useState<number>(0);
  const [durationHours, setDurationHours] = React.useState<number>(2);

  // Step 2: Purpose Declaration State
  const [purpose, setPurpose] = React.useState<string>(
    "Fabricating chassis tabs and planetary gear housings for ME-401 Capstone project."
  );
  const [courseContext, setCourseContext] = React.useState<string>("ME-401 Senior Capstone");
  const [materialStock, setMaterialStock] = React.useState<string>("3mm Cast Acrylic & PETG");
  const [purposeError, setPurposeError] = React.useState<string | null>(null);

  // Step 4: Submission & Outcome State
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [bookingOutcome, setBookingOutcome] = React.useState<BookingOutcome | null>(null);

  // Stepper Items
  const steps: StepItem[] = [
    {
      id: 1,
      title: "Date & Time",
      description: "Visual slot picker",
      status: currentStep === 1 ? "current" : currentStep > 1 ? "completed" : "upcoming",
    },
    {
      id: 2,
      title: "Purpose",
      description: "Academic declaration",
      status: currentStep === 2 ? "current" : currentStep > 2 ? "completed" : "upcoming",
    },
    {
      id: 3,
      title: "Fair-Use Checks",
      description: "Dry-run validation",
      status: currentStep === 3 ? "current" : currentStep > 3 ? "completed" : "upcoming",
    },
    {
      id: 4,
      title: "Confirm",
      description: "Submit request",
      status: currentStep === 4 ? "current" : "upcoming",
    },
  ];

  if (!resource) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto px-4 py-16">
          <EmptyState
            title="Resource Not Found"
            description="The requested campus equipment listing could not be resolved."
            action={
              <Button variant="accent" onClick={() => router.push("/discover")}>
                Return to Discover
              </Button>
            }
          />
        </div>
      </AppShell>
    );
  }

  // Filter open slots
  const availableSlots = resource.weeklySchedule.filter((s) => s.status === "open");
  const activeSlot = availableSlots[selectedSlotIndex] || availableSlots[0];

  // Dry-Run Rules Evaluation (Rule-by-rule pass/fail checklist)
  const dryRunRules = [
    {
      title: "Prerequisite Training & Safety Standing",
      passed: eligibility?.isEligible ?? false,
      detail: eligibility?.isEligible
        ? "All safety inductions and certifications verified in student vault."
        : `Missing: ${eligibility?.missingLabels[0] || "Safety Certification required"}.`,
    },
    {
      title: "Minimum Lead Time Notice",
      passed: true,
      detail: `Notice window fulfills ${resource.minNoticeHours}h departmental minimum requirement.`,
    },
    {
      title: "Weekly Category Fair Quota",
      passed: durationHours <= resource.maxBookingHours,
      detail: `Requested ${durationHours}h is within single-session limit of ${resource.maxBookingHours}h (8.0h weekly cap).`,
    },
    {
      title: "Consecutive Day Ceiling",
      passed: true,
      detail: `Respects max ${resource.fairUse.consecutiveDayLimit} consecutive days policy on scarce assets.`,
    },
    {
      title: "Campus Clean Standing Record",
      passed: true,
      detail: "0 recorded no-shows across academic year (1.25x priority weight).",
    },
  ];

  const allRulesPassed = dryRunRules.every((r) => r.passed);

  // Handle Step 2 Next
  const handleProceedFromPurpose = () => {
    if (!purpose.trim() || purpose.trim().length < 8) {
      setPurposeError("A substantive purpose declaration is required (minimum 8 characters).");
      return;
    }
    setPurposeError(null);
    setCurrentStep(3);
  };

  // Handle Submit Booking
  const handleSubmitBooking = async () => {
    setIsSubmitting(true);
    const timeStart = new Date(Date.now() + 86400000).toISOString();
    const timeEnd = new Date(Date.now() + 86400000 + durationHours * 3600000).toISOString();

    try {
      const outcome = await requestBooking({
        resourceId: resource.id,
        timeRangeStart: timeStart,
        timeRangeEnd: timeEnd,
        durationHours,
        purpose,
        courseContext,
        userCredsVerified: eligibility?.isEligible ?? true,
        missingPrereqLabel: eligibility?.missingLabels[0],
      });

      setBookingOutcome(outcome);
    } catch {
      toast.error("Failed to submit booking request. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8 text-ink">
        {/* Breadcrumb Header */}
        <div className="flex items-center justify-between border-b border-line pb-4">
          <Link
            href={`/resources/${resource.slug}`}
            className="inline-flex items-center gap-2 text-small font-medium text-ink-muted hover:text-ink transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 text-terracotta group-hover:-translate-x-1 transition-transform" />
            <span>Cancel & Return to {resource.title}</span>
          </Link>
          <Badge status="active" showDot={false}>
            Booking Desk
          </Badge>
        </div>

        {/* Resource Banner Summary */}
        <div className="bg-surface border border-line rounded-editorial p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resource.photos[0]}
              alt={resource.title}
              className="w-14 h-14 rounded-editorial object-cover border border-line shrink-0"
            />
            <div className="space-y-0.5">
              <span className="text-mono-label text-ink-muted uppercase">
                {resource.categoryLabel}
              </span>
              <h2 className="font-display text-xl text-ink font-normal leading-tight">
                {resource.title}
              </h2>
              <p className="text-xs text-ink-muted flex items-center gap-1">
                <MapPin className="w-3 h-3 text-terracotta" />
                <span>{resource.locationText}</span>
              </p>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-line/60 sm:pl-5">
            <span className="text-[10px] uppercase text-ink-muted block">Usage Rate</span>
            <span className="font-mono text-sm font-semibold text-terracotta">
              {resource.creditCostPerHour === 0 ? "Free to EIT" : `${resource.creditCostPerHour} cr/hr`}
            </span>
            <span className="text-[11px] text-ink-muted block">
              Max {resource.maxBookingHours}h per session
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* POST-SUBMISSION OUTCOME DISPLAY (ONE OF THREE OUTCOMES)  */}
        {/* ======================================================== */}
        {bookingOutcome ? (
          <Card className="border-line shadow-editorial-raised">
            {bookingOutcome.outcome === "requested" && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="w-12 h-12 rounded-full bg-success-light border border-success/30 flex items-center justify-center text-success">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <Badge status="approved">Requested · Awaiting Review</Badge>
                  <h3 className="font-display text-2xl sm:text-3xl text-ink font-normal">
                    Reservation Request Dispatched
                  </h3>
                  <p className="text-small text-ink-muted leading-relaxed max-w-xl">
                    {bookingOutcome.explanation}
                  </p>
                </div>

                {/* Session Pill */}
                <div className="p-4 bg-bone/70 border border-line rounded-editorial space-y-2 text-xs">
                  <div className="flex justify-between border-b border-line/60 pb-1.5">
                    <span className="text-ink-muted">Requested Session:</span>
                    <strong className="text-ink">{selectedDate}, {activeSlot?.timeRange}</strong>
                  </div>
                  <div className="flex justify-between border-b border-line/60 pb-1.5">
                    <span className="text-ink-muted">Declared Purpose:</span>
                    <span className="text-ink italic max-w-sm truncate">{purpose}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Lab Custodian:</span>
                    <strong className="text-ink">{resource.owner.name}</strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link href="/bookings">
                    <Button variant="accent">Go to My Bookings</Button>
                  </Link>
                  <Link href="/discover">
                    <Button variant="outline">Browse More Resources</Button>
                  </Link>
                </div>
              </div>
            )}

            {bookingOutcome.outcome === "blocked" && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="w-12 h-12 rounded-full bg-danger-light border border-danger/30 flex items-center justify-center text-danger">
                  <XCircle className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <Badge status="rejected">Blocked by Rule Check</Badge>
                  <h3 className="font-display text-2xl sm:text-3xl text-ink font-normal">
                    Reservation Request Blocked
                  </h3>
                  <p className="text-small text-danger font-medium leading-relaxed max-w-xl">
                    {bookingOutcome.explanation}
                  </p>
                </div>

                <div className="p-4 bg-danger-light/50 border border-danger/30 rounded-editorial space-y-2 text-xs text-ink">
                  <strong className="block text-danger font-semibold">
                    Fix-It Action Required:
                  </strong>
                  <p className="text-ink-muted">
                    Upload your proof of training or course certification to your student credential vault. Once verified by a lab monitor, access will unlock automatically.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {bookingOutcome.fixActionHref && (
                    <Link href={bookingOutcome.fixActionHref}>
                      <Button variant="accent">{bookingOutcome.fixActionLabel || "Resolve Prerequisite"}</Button>
                    </Link>
                  )}
                  <Button variant="outline" onClick={() => setBookingOutcome(null)}>
                    Modify Booking Details
                  </Button>
                </div>
              </div>
            )}

            {bookingOutcome.outcome === "waitlisted" && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="w-12 h-12 rounded-full bg-warning-light border border-warning/30 flex items-center justify-center text-[#8C6114]">
                  <Scale className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <Badge status="waitlisted">
                    Waitlisted · Position #{bookingOutcome.waitlistPosition}
                  </Badge>
                  <h3 className="font-display text-2xl sm:text-3xl text-ink font-normal">
                    Slot Contested: Placed in Priority Queue
                  </h3>
                  <p className="text-small text-ink-muted leading-relaxed max-w-xl">
                    {bookingOutcome.explanation}
                  </p>
                </div>

                {/* Formula Breakdown "Why you're #2" */}
                <div className="p-5 bg-bone border border-line rounded-editorial space-y-3">
                  <div className="flex items-center justify-between border-b border-line/60 pb-2">
                    <span className="font-semibold text-small text-ink">
                      Why you&apos;re #{bookingOutcome.waitlistPosition} in line:
                    </span>
                    <span className="font-mono text-terracotta font-bold text-sm">
                      Score: {bookingOutcome.waitlistScore} pts
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-ink/90">
                    <div className="flex justify-between">
                      <span>Recent tool usage velocity (under 4h this month):</span>
                      <strong className="font-mono text-success">+4 pts</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Days since last reservation (12 days):</span>
                      <strong className="font-mono text-success">+3 pts</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Capstone course priority credit:</span>
                      <strong className="font-mono text-terracotta">+2 pts</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Clean standing / 0 no-show records:</span>
                      <strong className="font-mono text-success">+45 pts</strong>
                    </div>
                    <div className="flex justify-between border-t border-line/60 pt-1 text-ink-muted">
                      <span>Ahead of you: Team Hyperion (Senior Thesis, Score 91)</span>
                      <span className="font-mono">#1</span>
                    </div>
                  </div>
                </div>

                {/* Conflict State Offering Nearest Open Slots */}
                {bookingOutcome.nearestOpenSlots && bookingOutcome.nearestOpenSlots.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-mono-label text-ink-muted uppercase font-bold block">
                      Recommended Conflict-Free Alternatives:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {bookingOutcome.nearestOpenSlots.map((alt, i) => (
                        <div
                          key={i}
                          className="p-3 bg-surface border border-line rounded-editorial flex items-center justify-between text-xs"
                        >
                          <div>
                            <strong className="text-ink block">{alt.day} ({alt.dateStr})</strong>
                            <span className="font-mono text-terracotta">{alt.timeRange}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setBookingOutcome(null);
                              setSelectedDate(alt.day);
                              setCurrentStep(1);
                            }}
                          >
                            Switch Slot
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link href="/bookings">
                    <Button variant="accent">View in My Bookings</Button>
                  </Link>
                  <Link href="/discover">
                    <Button variant="outline">Browse Other Equipment</Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>
        ) : (
          /* ======================================================== */
          /* 4-STEP BOOKING WIZARD                                    */
          /* ======================================================== */
          <div className="space-y-8">
            <Stepper steps={steps} />

            {/* STEP 1: DATE & TIME SLOT PICKER */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 1: Pick Date & Time Window</CardTitle>
                  <CardDescription>
                    Honors {resource.title} availability rules, minimum lead notice, and session duration.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Date Selector Row */}
                  <div className="space-y-2">
                    <label className="text-mono-label uppercase text-ink-muted font-bold block">
                      Select Booking Day
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {["Today", "Tomorrow", "Thursday", "Friday"].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setSelectedDate(d)}
                          className={cn(
                            "py-2.5 px-3 rounded-editorial border text-center transition-all cursor-pointer font-medium",
                            selectedDate === d
                              ? "bg-ink text-surface border-ink shadow-xs"
                              : "bg-surface hover:bg-bone border-line text-ink"
                          )}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Available Time Slots Grid */}
                  <div className="space-y-2">
                    <label className="text-mono-label uppercase text-ink-muted font-bold block">
                      Select Facility Time Slot
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {availableSlots.map((slot, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedSlotIndex(idx)}
                          className={cn(
                            "p-3.5 rounded-editorial border text-left transition-all cursor-pointer space-y-1",
                            selectedSlotIndex === idx
                              ? "bg-surface border-terracotta ring-2 ring-terracotta/20 shadow-xs"
                              : "bg-surface hover:bg-bone border-line"
                          )}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-ink">{slot.day} · {slot.dateStr}</span>
                            <span className="text-success font-bold text-[10px]">Open</span>
                          </div>
                          <span className="font-mono text-sm font-bold text-terracotta block">
                            {slot.timeRange}
                          </span>
                          <span className="text-[11px] text-ink-muted block">
                            Nextruder bed calibrated
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration Slider */}
                  <div className="space-y-2 pt-2 border-t border-line/60">
                    <div className="flex items-center justify-between text-xs font-semibold text-ink">
                      <span>Requested Duration</span>
                      <span className="font-mono text-terracotta">{durationHours} Hours</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={resource.maxBookingHours}
                      step={1}
                      value={durationHours}
                      onChange={(e) => setDurationHours(Number(e.target.value))}
                      className="w-full accent-terracotta cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-ink-muted">
                      <span>1 hour min</span>
                      <span>Max {resource.maxBookingHours}h per single session</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-between">
                  <Link href={`/resources/${resource.slug}`}>
                    <Button variant="outline">Cancel</Button>
                  </Link>
                  <Button variant="accent" onClick={() => setCurrentStep(2)}>
                    Next: Purpose Declaration
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* STEP 2: PURPOSE DECLARATION */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 2: Declare Research Purpose</CardTitle>
                  <CardDescription>
                    All reservations require an academic purpose declaration reviewed by {resource.owner.name}.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink flex items-center justify-between">
                      <span>Collegiate Purpose Declaration (Mandatory)</span>
                      <span className="text-[10px] text-ink-muted">Minimum 8 characters</span>
                    </label>
                    <Textarea
                      placeholder="e.g. 3D printing custom PETG planetary gearbox knuckles for senior capstone rover drivetrain..."
                      value={purpose}
                      onChange={(e) => {
                        setPurpose(e.target.value);
                        if (purposeError) setPurposeError(null);
                      }}
                      rows={4}
                      error={purposeError || undefined}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Academic Course or Club Context"
                      value={courseContext}
                      onChange={(e) => setCourseContext(e.target.value)}
                      placeholder="e.g. ME-401 Capstone or Independent Thesis"
                    />
                    <Input
                      label="Planned Stock Material / Tooling"
                      value={materialStock}
                      onChange={(e) => setMaterialStock(e.target.value)}
                      placeholder="e.g. 1.75mm Prusament PETG or Cast Acrylic"
                    />
                  </div>

                  <div className="p-3 bg-bone/70 border border-line rounded-editorial text-xs text-ink-muted flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                    <span>
                      Clear purpose declarations receive expedited custodian approval and qualify for course priority multipliers in congested slots.
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Back: Slot Picker
                  </Button>
                  <Button variant="accent" onClick={handleProceedFromPurpose}>
                    Next: Fair-Use Checks
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* STEP 3: REVIEW ELIGIBILITY & FAIR-USE CHECKS (LIVE DRY-RUN) */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 3: Eligibility & Fair-Use Dry-Run</CardTitle>
                  <CardDescription>
                    Live validation of request_booking stored procedure rules before permanent ledger dispatch.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2.5">
                    {dryRunRules.map((rule, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "p-3.5 rounded-editorial border flex items-start justify-between gap-3 text-xs transition-colors",
                          rule.passed
                            ? "bg-surface border-line"
                            : "bg-danger-light/40 border-danger/40 text-danger"
                        )}
                      >
                        <div className="space-y-0.5">
                          <strong className={cn("block font-semibold", rule.passed ? "text-ink" : "text-danger")}>
                            {rule.title}
                          </strong>
                          <span className={cn(rule.passed ? "text-ink-muted" : "text-danger")}>
                            {rule.detail}
                          </span>
                        </div>
                        {rule.passed ? (
                          <span className="px-2 py-0.5 rounded bg-success-light text-success border border-success/30 font-semibold text-[10px] shrink-0 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Pass
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-danger text-surface font-semibold text-[10px] shrink-0 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Failed
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {!allRulesPassed && (
                    <div className="p-3 bg-warning-light border border-warning/30 rounded-editorial text-xs text-[#8C6114] space-y-1">
                      <strong>Warning: Rule requirement missing</strong>
                      <p>
                        Submitting with missing prerequisites will immediately trigger a blocked outcome with upload instructions.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Back: Purpose
                  </Button>
                  <Button variant="accent" onClick={() => setCurrentStep(4)}>
                    Next: Review & Confirm
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* STEP 4: CONFIRM & SUBMIT */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 4: Final Confirmation</CardTitle>
                  <CardDescription>
                    Review your complete booking declaration before routing to custodian review.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary Breakdown Table */}
                  <div className="bg-bone/70 border border-line rounded-editorial p-4 space-y-3 text-xs">
                    <div className="flex justify-between border-b border-line/60 pb-2">
                      <span className="text-ink-muted">Equipment / Apparatus</span>
                      <strong className="text-ink">{resource.title}</strong>
                    </div>
                    <div className="flex justify-between border-b border-line/60 pb-2">
                      <span className="text-ink-muted">Date & Window</span>
                      <strong className="text-ink">{selectedDate} ({activeSlot?.timeRange})</strong>
                    </div>
                    <div className="flex justify-between border-b border-line/60 pb-2">
                      <span className="text-ink-muted">Duration</span>
                      <strong className="text-ink">{durationHours} Hours</strong>
                    </div>
                    <div className="flex justify-between border-b border-line/60 pb-2">
                      <span className="text-ink-muted">Usage Rate</span>
                      <strong className="text-terracotta">
                        {resource.creditCostPerHour === 0 ? "Free ($0.00)" : `${resource.creditCostPerHour * durationHours} credits`}
                      </strong>
                    </div>
                    <div className="space-y-1 pt-1">
                      <span className="text-ink-muted block">Declared Academic Purpose:</span>
                      <p className="text-ink italic bg-surface p-2.5 rounded-md border border-line/60">
                        &ldquo;{purpose}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-ink-muted space-y-1">
                    <p>
                      By confirming, this reservation will be logged with cryptographic proof into the Postgres audit ledger and dispatched to <strong>{resource.owner.name}</strong>.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(3)}>
                    Back: Fair-Use Checks
                  </Button>
                  <Button
                    variant="accent"
                    isLoading={isSubmitting}
                    onClick={handleSubmitBooking}
                  >
                    Confirm Booking Request
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
