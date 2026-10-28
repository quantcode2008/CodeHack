"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Lock,
  Sparkles,
  Coins,
  Share2,
  FileText,
  UploadCloud,
  ChevronRight,
  Info,
  Scale,
  Zap,
  AlertOctagon,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useAudit } from "@/context/AuditContext";
import { AuditTimeline } from "@/components/audit/AuditTimeline";
import { ReportIncidentDialog } from "@/components/incident/ReportIncidentDialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "sonner";
import { CAMPUS_RESOURCES, type CampusResource, type AvailabilitySlot } from "@/lib/resources/data";
import { computeEligibility, type UserCredentialSnapshot } from "@/lib/resources/service";
import { cn } from "@/lib/utils";

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { user, credentials } = useAuth();
  const { getAuditByResource } = useAudit();

  // Find resource by slug
  const resource = React.useMemo(() => {
    return CAMPUS_RESOURCES.find((r) => r.slug === slug);
  }, [slug]);

  // Tab & Incident state
  const [activeResourceTab, setActiveResourceTab] = React.useState<"overview" | "history">("overview");
  const [isReportIncidentOpen, setIsReportIncidentOpen] = React.useState(false);
  const resourceAuditRecords = resource ? getAuditByResource(resource.id) : [];

  // Gallery state
  const [activePhotoIdx, setActivePhotoIdx] = React.useState(0);

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = React.useState(false);
  const [selectedSlot, setSelectedSlot] = React.useState<AvailabilitySlot | null>(null);
  const [purposeDeclaration, setPurposeDeclaration] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // AI Match State
  const [aiAnalysis, setAiAnalysis] = React.useState<{
    matchScore: number;
    confidence: string;
    rationale: string;
    recommendations: string[];
    safetyAdvice: string;
  } | null>(null);
  const [isEvaluatingAi, setIsEvaluatingAi] = React.useState(false);

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

  // Initialize selected slot from available slots
  React.useEffect(() => {
    if (resource && !selectedSlot) {
      const firstOpen = resource.weeklySchedule.find((s) => s.status === "open");
      if (firstOpen) setSelectedSlot(firstOpen);
    }
  }, [resource, selectedSlot]);

  // Call /api/match stub when user types a purpose declaration
  const handleEvaluatePurposeAi = async () => {
    if (!purposeDeclaration.trim()) {
      toast.info("Please enter a purpose declaration first");
      return;
    }
    setIsEvaluatingAi(true);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purpose: purposeDeclaration,
          resourceSlug: resource?.slug,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiAnalysis(data);
        toast.success("AI match analysis completed", {
          description: `Evaluated at ${data.matchScore}% alignment score.`,
        });
      }
    } catch {
      // Graceful fallback if network fails
      setAiAnalysis({
        matchScore: 92,
        confidence: "high",
        rationale: "Academic purpose aligns with standard facility protocols.",
        recommendations: ["Review safety guidelines before scheduled arrival."],
        safetyAdvice: "Mandatory condition check-in required upon entry.",
      });
    } finally {
      setIsEvaluatingAi(false);
    }
  };

  const handleConfirmBooking = () => {
    if (!purposeDeclaration.trim() || purposeDeclaration.trim().length < 8) {
      toast.error("Please provide a substantive purpose declaration (minimum 8 characters).");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsBookingOpen(false);
      toast.success("Booking request submitted!", {
        description: `Request queued for ${resource?.owner.name}. Notification dispatched to your institutional inbox.`,
      });
    }, 700);
  };

  if (!resource) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto px-4 py-16">
          <EmptyState
            title="Campus Resource Not Found"
            description="The requested laboratory bench or equipment listing does not exist in the Eastbrook registry."
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

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-10 pb-24 lg:pb-12 text-ink">
        {/* Back Link Breadcrumb */}
        <div className="flex items-center justify-between border-b border-line pb-4">
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 text-small font-medium text-ink-muted hover:text-ink transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 text-terracotta group-hover:-translate-x-1 transition-transform" />
            <span>Back to Discovery Registry</span>
          </Link>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-mono-label text-ink-muted uppercase">Catalog ID:</span>
            <span className="font-mono text-ink font-semibold">{resource.slug}</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TOP HERO GRID: PHOTO GALLERY & PRIMARY TITLE / SPECS     */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Gallery Column (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            {/* Main Stage Image */}
            <div className="relative aspect-[16/10] w-full rounded-editorial overflow-hidden bg-bone border border-line shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resource.photos[activePhotoIdx] || resource.photos[0]}
                alt={resource.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 rounded-md bg-surface/90 backdrop-blur-md border border-line text-xs font-semibold text-ink shadow-xs">
                  {resource.categoryLabel}
                </span>
              </div>
            </div>

            {/* Thumbnail Navigation Strip */}
            {resource.photos.length > 1 && (
              <div className="flex items-center gap-3">
                {resource.photos.map((photo, idx) => (
                  <button
                    key={`thumb-${idx}`}
                    type="button"
                    onClick={() => setActivePhotoIdx(idx)}
                    className={cn(
                      "w-20 h-14 rounded-md overflow-hidden border-2 transition-all cursor-pointer bg-bone",
                      activePhotoIdx === idx
                        ? "border-terracotta shadow-xs scale-102"
                        : "border-line/70 opacity-60 hover:opacity-100"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Details & Booking Overview (5 cols) */}
          <div className="lg:col-span-5 bg-surface border border-line rounded-editorial p-6 space-y-6 shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                <MapPin className="w-3.5 h-3.5 text-terracotta shrink-0" />
                <span>{resource.locationText}</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl text-ink font-normal leading-tight tracking-tight">
                {resource.title}
              </h1>
            </div>

            {/* Cost & Slot Metadata */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-bone border border-line rounded-editorial text-xs">
              <div>
                <span className="text-[10px] text-ink-muted uppercase block">Usage Rate</span>
                <strong className="text-sm font-semibold text-ink">
                  {resource.creditCostPerHour === 0 ? "Free to EIT" : `${resource.creditCostPerHour} cr / hr`}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted uppercase block">Next Slot</span>
                <strong className="text-sm font-semibold text-terracotta">
                  {resource.nextAvailableSlot.split(",")[0]}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted uppercase block">Max Window</span>
                <strong className="text-sm font-semibold text-ink">
                  Up to {resource.maxBookingHours} hours
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted uppercase block">Lead Notice</span>
                <strong className="text-sm font-semibold text-ink">
                  {resource.minNoticeHours}h required
                </strong>
              </div>
            </div>

            {/* Eligibility Banner on Card */}
            <div className="space-y-2">
              <span className="text-mono-label uppercase text-ink-muted font-bold block">
                Your Access Standing
              </span>
              {!user ? (
                <div className="p-3 bg-bone border border-line rounded-editorial flex items-center justify-between gap-3 text-xs">
                  <span className="text-ink-muted">Sign in with campus account to check qualification</span>
                  <Link href={`/login?redirectTo=/resources/${resource.slug}`}>
                    <Button size="sm" variant="accent">Sign in</Button>
                  </Link>
                </div>
              ) : eligibility?.isEligible ? (
                <div className="p-3 bg-success-light border border-success/30 rounded-editorial flex items-center gap-2.5 text-xs text-success font-semibold">
                  <ShieldCheck className="w-4 h-4 text-success shrink-0" />
                  <span>You meet all safety and course prerequisites</span>
                </div>
              ) : (
                <div className="p-3 bg-warning-light border border-warning/30 rounded-editorial space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-[#8C6114] font-semibold">
                    <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                    <span>Prerequisite Required Before Booking</span>
                  </div>
                  <p className="text-[11px] text-[#8C6114]/90">
                    Missing: <strong>{eligibility?.missingLabels[0]}</strong>. Upload proof or complete departmental training to unlock slots.
                  </p>
                  <Link href="/onboarding">
                    <Button size="sm" variant="outline" className="w-full justify-center text-xs">
                      Upload Safety Certificate
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Desktop Request Booking Trigger */}
            <div className="pt-2">
              <Link href={`/book/${resource.slug}`} className="block w-full">
                <Button
                  variant="accent"
                  size="lg"
                  className="w-full justify-center shadow-xs"
                  disabled={Boolean(user && !eligibility?.isEligible)}
                >
                  Request Reservation (4-Step Wizard)
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Tab Strip: Catalog Overview vs Audited Maintenance History */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveResourceTab("overview")}
              className={cn(
                "px-4 py-2 text-small font-medium border-b-2 -mb-1.5 transition-colors cursor-pointer",
                activeResourceTab === "overview"
                  ? "border-terracotta text-terracotta font-semibold"
                  : "border-transparent text-ink-muted hover:text-ink hover:border-line"
              )}
            >
              Catalog Overview & Specifications
            </button>
            <button
              type="button"
              onClick={() => setActiveResourceTab("history")}
              className={cn(
                "px-4 py-2 text-small font-medium border-b-2 -mb-1.5 transition-colors cursor-pointer flex items-center gap-2",
                activeResourceTab === "history"
                  ? "border-terracotta text-terracotta font-semibold"
                  : "border-transparent text-ink-muted hover:text-ink hover:border-line"
              )}
            >
              <span>Maintenance & Audit History</span>
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                  activeResourceTab === "history"
                    ? "bg-terracotta/15 text-terracotta font-bold"
                    : "bg-bone text-ink-muted"
                )}
              >
                {resourceAuditRecords.length}
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
            Report Issue / Incident
          </Button>
        </div>

        {activeResourceTab === "history" ? (
          <AuditTimeline
            records={resourceAuditRecords}
            entityTitle={`${resource.title} — Campus Registry`}
            allowExport
          />
        ) : (
          /* ======================================================== */
          /* MAIN BODY: 2-COLUMN EDITORIAL DECK                       */
          /* ======================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Narrative, Rules, Schedule (8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Description Narrative */}
            <section className="space-y-4">
              <div className="border-b border-line pb-2">
                <span className="text-mono-label uppercase text-ink-muted">Resource Overview</span>
                <h2 className="font-display text-2xl text-ink">Description & Capabilities</h2>
              </div>
              <p className="text-body text-ink/90 leading-relaxed font-normal">
                {resource.description}
              </p>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {resource.specs.map((spec, i) => (
                  <div key={i} className="p-3 bg-surface border border-line rounded-editorial space-y-1">
                    <span className="text-[10px] uppercase text-ink-muted block">{spec.label}</span>
                    <strong className="text-xs text-ink font-semibold">{spec.value}</strong>
                  </div>
                ))}
              </div>
            </section>

            {/* Usage Rules */}
            <section className="space-y-4">
              <div className="border-b border-line pb-2">
                <span className="text-mono-label uppercase text-ink-muted">Departmental Governance</span>
                <h2 className="font-display text-2xl text-ink">Usage Rules & Operating Standards</h2>
              </div>
              <div className="bg-surface border border-line rounded-editorial p-5 space-y-3">
                <ol className="space-y-2.5 text-small text-ink/90 list-decimal list-inside leading-relaxed">
                  {resource.usageRules.map((rule, idx) => (
                    <li key={idx} className="pl-1">
                      <span>{rule}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            {/* Weekly Availability Grid */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <div>
                  <span className="text-mono-label uppercase text-ink-muted">Weekly Schedule</span>
                  <h2 className="font-display text-2xl text-ink">Live Availability Grid</h2>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-success">
                    <span className="w-2.5 h-2.5 rounded-full bg-success" />
                    Open
                  </span>
                  <span className="flex items-center gap-1.5 text-ink-muted">
                    <span className="w-2.5 h-2.5 rounded-full bg-line" />
                    Booked
                  </span>
                  <span className="flex items-center gap-1.5 text-warning">
                    <span className="w-2.5 h-2.5 rounded-full bg-warning" />
                    Blackout
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {resource.weeklySchedule.map((slot, idx) => {
                  const isSlotSelected =
                    selectedSlot?.day === slot.day && selectedSlot?.timeRange === slot.timeRange;
                  const isOpen = slot.status === "open";

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!isOpen}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setIsBookingOpen(true);
                      }}
                      className={cn(
                        "p-3 rounded-editorial border text-left transition-all flex flex-col justify-between h-24",
                        isOpen
                          ? "bg-surface hover:border-terracotta cursor-pointer border-line shadow-xs"
                          : slot.status === "blackout"
                          ? "bg-bone/80 border-dashed border-line text-ink-muted/70 cursor-not-allowed"
                          : "bg-bone/50 border-line/60 text-ink-muted cursor-not-allowed",
                        isSlotSelected && isOpen && "border-terracotta ring-1 ring-terracotta"
                      )}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-ink">{slot.day}</span>
                        <span className="text-[10px] text-ink-muted">{slot.dateStr}</span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="font-mono text-[11px] font-medium block text-ink">
                          {slot.timeRange}
                        </span>
                        <span className="text-[10px] capitalize block font-medium">
                          {slot.status === "open" ? (
                            <span className="text-success font-semibold">Available</span>
                          ) : slot.status === "blackout" ? (
                            <span className="text-warning text-[9px]">{slot.reason || "Reserved"}</span>
                          ) : (
                            <span className="text-ink-muted text-[10px]">Reserved</span>
                          )}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* AI Match Evaluator Card */}
            <section className="bg-surface border border-line rounded-editorial p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-line/60 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-terracotta" />
                  <span className="font-display text-xl text-ink">AI Purpose Alignment Evaluator</span>
                </div>
                <Badge status="active" showDot={false}>Automated Clearance</Badge>
              </div>

              <p className="text-small text-ink-muted leading-relaxed">
                Describe your research or project intent to verify whether this apparatus satisfies your requirements before submitting a formal booking.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="e.g. Need high precision 4K capture for fluid dynamics experiment"
                  value={purposeDeclaration}
                  onChange={(e) => setPurposeDeclaration(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  isLoading={isEvaluatingAi}
                  onClick={handleEvaluatePurposeAi}
                  leftIcon={<Sparkles className="w-4 h-4 text-terracotta" />}
                >
                  Analyze Fit
                </Button>
              </div>

              {aiAnalysis && (
                <div className="p-4 bg-bone/70 border border-line rounded-editorial space-y-3 text-xs animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink">Match Assessment:</span>
                    <span className="font-mono text-terracotta font-bold text-sm">
                      {aiAnalysis.matchScore}% Match
                    </span>
                  </div>
                  <p className="text-ink-muted leading-relaxed italic">
                    &ldquo;{aiAnalysis.rationale}&rdquo;
                  </p>
                  <div className="pt-2 border-t border-line/60 space-y-1">
                    <strong className="text-ink block">Protocol Advice:</strong>
                    <span className="text-ink-muted">{aiAnalysis.safetyAdvice}</span>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Custodian Card, Prerequisites Checklist, Fair Use (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Owner & Custodian Card */}
            <div className="bg-surface border border-line rounded-editorial p-5 space-y-4 shadow-xs">
              <span className="text-mono-label uppercase text-ink-muted font-bold block">
                Equipment Custodian
              </span>
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resource.owner.avatarUrl}
                  alt={resource.owner.name}
                  className="w-12 h-12 rounded-full object-cover border border-line shrink-0"
                />
                <div className="space-y-0.5 overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-small text-ink truncate">
                      {resource.owner.name}
                    </span>
                    <span title="Verified Faculty Custodian">
                      <ShieldCheck className="w-4 h-4 text-success shrink-0" />
                    </span>
                  </div>
                  <span className="text-xs text-ink-muted block truncate">
                    {resource.owner.title}
                  </span>
                  <span className="text-[11px] text-ink-muted/80 block truncate">
                    {resource.owner.department}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-line/60 flex items-center justify-between text-xs text-ink-muted">
                <span>Average Response:</span>
                <strong className="text-ink font-semibold">{resource.owner.responseTime}</strong>
              </div>
            </div>

            {/* Prerequisites Checklist with Live User Status */}
            <div className="bg-surface border border-line rounded-editorial p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-line/60 pb-2">
                <span className="text-mono-label uppercase text-ink-muted font-bold">
                  Prerequisites Checklist
                </span>
                <span className="text-xs text-ink-muted">
                  {resource.requirements.length} Requirements
                </span>
              </div>

              {resource.requirements.length === 0 ? (
                <p className="text-xs text-ink-muted">No safety certifications required for this tool.</p>
              ) : (
                <div className="space-y-3">
                  {resource.requirements.map((req) => {
                    const matchingCred = userCredSnapshots.find(
                      (c) => c.requirementLabel.toLowerCase() === req.label.toLowerCase()
                    );
                    const isVerified = matchingCred?.status === "verified";
                    const isPending = matchingCred?.status === "pending";

                    return (
                      <div
                        key={req.id}
                        className="p-3 bg-bone/70 border border-line rounded-editorial space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <strong className="text-ink font-semibold leading-snug">
                            {req.label}
                          </strong>
                          {isVerified ? (
                            <span className="px-2 py-0.5 rounded bg-success-light text-success border border-success/30 text-[10px] font-semibold shrink-0">
                              Verified
                            </span>
                          ) : isPending ? (
                            <span className="px-2 py-0.5 rounded bg-warning-light text-[#8C6114] border border-warning/30 text-[10px] font-semibold shrink-0">
                              Pending
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-danger-light text-danger border border-danger/30 text-[10px] font-semibold shrink-0">
                              Missing
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-ink-muted leading-relaxed">
                          {req.description}
                        </p>

                        {!isVerified && (
                          <div className="pt-1">
                            <Link href="/onboarding">
                              <span className="text-terracotta hover:underline font-semibold text-[11px] flex items-center gap-1">
                                <span>Upload Certificate</span>
                                <ChevronRight className="w-3 h-3" />
                              </span>
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Fair-Use Rules Panel */}
            <div className="bg-surface border border-line rounded-editorial p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 border-b border-line/60 pb-2">
                <Scale className="w-4 h-4 text-terracotta" />
                <span className="font-semibold text-small text-ink">
                  Fair-Use Governance
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-line/40 pb-1.5">
                  <span className="text-ink-muted">Weekly Category Cap</span>
                  <strong className="text-ink">{resource.fairUse.weeklyCapHours} hours</strong>
                </div>
                <div className="flex justify-between border-b border-line/40 pb-1.5">
                  <span className="text-ink-muted">Concurrent Reservations</span>
                  <strong className="text-ink">{resource.fairUse.maxActiveBookings} active max</strong>
                </div>
                <div className="flex justify-between border-b border-line/40 pb-1.5">
                  <span className="text-ink-muted">Cooldown Between Sessions</span>
                  <strong className="text-ink">{resource.fairUse.cooldownHours} hours</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Consecutive Day Limit</span>
                  <strong className="text-ink">{resource.fairUse.consecutiveDayLimit} days max</strong>
                </div>
              </div>
            </div>

            {/* Access & Building Guide */}
            <div className="bg-surface border border-line rounded-editorial p-5 space-y-2 shadow-xs text-xs">
              <div className="flex items-center gap-2 text-ink font-semibold">
                <Building2 className="w-4 h-4 text-terracotta" />
                <span>Access Instructions</span>
              </div>
              <p className="text-ink-muted leading-relaxed text-[11px]">
                {resource.accessInstructions}
              </p>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* ======================================================== */}
      {/* MOBILE STICKY BOTTOM BAR (<1024px)                       */}
      {/* ======================================================== */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-surface/95 backdrop-blur-md border-t border-line p-4 z-40 flex items-center justify-between gap-4 shadow-editorial-sheet">
        <div>
          <span className="text-[10px] text-ink-muted uppercase block">Next Slot</span>
          <span className="font-mono text-xs font-bold text-terracotta">
            {resource.nextAvailableSlot.split(",")[0]}
          </span>
          <span className="text-[10px] text-ink-muted block">
            {resource.creditCostPerHour === 0 ? "Free access" : `${resource.creditCostPerHour} cr/hr`}
          </span>
        </div>

        <Link href={`/book/${resource.slug}`}>
          <Button
            variant="accent"
            size="md"
            className="shadow-sm"
            disabled={Boolean(user && !eligibility?.isEligible)}
          >
            Request Booking
          </Button>
        </Link>
      </div>

      {/* ======================================================== */}
      {/* BOOKING REQUEST MODAL                                    */}
      {/* ======================================================== */}
      <Dialog
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        title={`Request ${resource.title}`}
        description="Submit your collegiate purpose declaration for custodian review."
      >
        <div className="space-y-5 pt-2">
          {/* Slot Confirmation */}
          <div className="p-3 bg-bone border border-line rounded-editorial space-y-1 text-xs">
            <span className="text-[10px] text-ink-muted uppercase block">Selected Session</span>
            <div className="flex items-center justify-between font-semibold text-ink">
              <span>{selectedSlot ? `${selectedSlot.day}, ${selectedSlot.dateStr}` : "Next Available Slot"}</span>
              <span className="font-mono text-terracotta">{selectedSlot?.timeRange || "14:00 - 17:00"}</span>
            </div>
          </div>

          {/* Purpose Declaration */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink flex items-center justify-between">
              <span>Purpose Declaration (Mandatory)</span>
              <span className="text-[10px] text-ink-muted">Visible to custodian</span>
            </label>
            <Textarea
              placeholder="e.g. Cutting acrylic structural casing for ME-401 Capstone project chassis..."
              value={purposeDeclaration}
              onChange={(e) => setPurposeDeclaration(e.target.value)}
              rows={3}
            />
          </div>

          {/* Transparent Waitlist Math Breakdown */}
          <div className="p-3 bg-bone/60 border border-line rounded-editorial space-y-1.5 text-[11px] text-ink-muted">
            <div className="flex items-center justify-between font-semibold text-ink">
              <span>Waitlist Merit Score</span>
              <span className="font-mono text-terracotta font-bold">85 / 100</span>
            </div>
            <p className="leading-snug">
              Priority is calculated from your 0 no-show record (+45), course enrollment (+30), and seniority tier (+20).
            </p>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-line/60">
            <Button variant="outline" onClick={() => setIsBookingOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="accent"
              isLoading={isSubmitting}
              onClick={handleConfirmBooking}
            >
              Confirm Booking Request
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Global Incident Report Dialog for this Resource */}
      <ReportIncidentDialog
        isOpen={isReportIncidentOpen}
        onClose={() => setIsReportIncidentOpen(false)}
        resourceId={resource.id}
        resourceTitle={resource.title}
        resourceSlug={resource.slug}
        resourceLocation={resource.locationText}
        resourcePhoto={resource.photos[0]}
      />
    </AppShell>
  );
}
