"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  RotateCcw,
  Camera,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  UploadCloud,
  Trash2,
  Sparkles,
  MapPin,
  Clock,
  Info,
  Check,
  Image as ImageIcon,
  AlertOctagon,
  FileWarning,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useBookings, type BookingRecord } from "@/context/BookingContext";
import { CAMPUS_RESOURCES } from "@/lib/resources/data";
import { type ConditionRating, type IncidentSeverity, type IncidentType } from "@/lib/supabase/types";
import { type IncidentDraft } from "@/lib/condition/types";
import { compressImage, SAMPLE_INSPECTION_PHOTOS } from "@/lib/condition/compressor";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Rank: excellent=4, good=3, fair=2, damaged=1
const RATING_RANKS: Record<ConditionRating, number> = {
  excellent: 4,
  good: 3,
  fair: 2,
  damaged: 1,
};

export default function ReturnPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = (params?.bookingId || params?.id) as string;
  const { user } = useAuth();
  const { getBookingById, returnBooking } = useBookings();

  const booking = getBookingById(bookingId);
  const beforeCondition = booking?.conditionReports?.before;

  // Form State
  const [conditionRating, setConditionRating] = React.useState<ConditionRating>("good");
  const [conditionNotes, setConditionNotes] = React.useState("");
  const [photos, setPhotos] = React.useState<{ url: string; sizeKb: number; label: string }[]>([]);
  const [isCompressing, setIsCompressing] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Incident reporting state
  const [isIncidentOpen, setIsIncidentOpen] = React.useState(false);
  const [incidentType, setIncidentType] = React.useState<IncidentType>("damage");
  const [incidentSeverity, setIncidentSeverity] = React.useState<IncidentSeverity>("low");
  const [incidentDescription, setIncidentDescription] = React.useState("");

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Restore draft from localStorage (offline-safe)
  React.useEffect(() => {
    if (!bookingId || typeof window === "undefined") return;
    const draft = localStorage.getItem(`commons_return_draft_${bookingId}`);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.conditionRating) setConditionRating(parsed.conditionRating);
        if (parsed.conditionNotes) setConditionNotes(parsed.conditionNotes);
        if (parsed.photos?.length) setPhotos(parsed.photos);
        if (parsed.isIncidentOpen !== undefined) setIsIncidentOpen(parsed.isIncidentOpen);
        if (parsed.incidentDescription) setIncidentDescription(parsed.incidentDescription);
      } catch {
        // ignore draft parse error
      }
    }
  }, [bookingId]);

  // Save draft to localStorage
  React.useEffect(() => {
    if (!bookingId || typeof window === "undefined") return;
    const draft = {
      conditionRating,
      conditionNotes,
      photos,
      isIncidentOpen,
      incidentDescription,
    };
    localStorage.setItem(`commons_return_draft_${bookingId}`, JSON.stringify(draft));
  }, [bookingId, conditionRating, conditionNotes, photos, isIncidentOpen, incidentDescription]);

  // Degradation detection
  const beforeRank = beforeCondition ? RATING_RANKS[beforeCondition.overall] : 4;
  const afterRank = RATING_RANKS[conditionRating];
  const isDegraded = afterRank < beforeRank;

  // Check for damage keywords in notes
  const hasDamageKeywords = React.useMemo(() => {
    const text = conditionNotes.toLowerCase();
    return (
      text.includes("crack") ||
      text.includes("damage") ||
      text.includes("broke") ||
      text.includes("scratched") ||
      text.includes("burn") ||
      text.includes("defect") ||
      text.includes("jam")
    );
  }, [conditionNotes]);

  // Prompt incident if degraded or keyword spotted
  React.useEffect(() => {
    if (isDegraded || hasDamageKeywords) {
      setIsIncidentOpen(true);
      if (!incidentDescription) {
        setIncidentDescription(
          isDegraded
            ? `Condition degraded from ${beforeCondition?.overall || "excellent"} to ${conditionRating}. ${conditionNotes}`
            : conditionNotes
        );
      }
    }
  }, [isDegraded, hasDamageKeywords, beforeCondition, conditionRating, conditionNotes, incidentDescription]);

  if (!booking) {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto px-4 py-16">
          <EmptyState
            title="Reservation Not Found"
            description="Could not locate this booking record for checkout."
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

  // Handle Photo File Upload with Canvas Compression
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > 6) {
      toast.error("Maximum 6 departure photos allowed.");
      return;
    }

    setIsCompressing(true);
    const toastId = toast.loading("Compressing departure photo(s)...");

    try {
      const newPhotos: { url: string; sizeKb: number; label: string }[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressed = await compressImage(file, 1280, 1280, 0.78);
        newPhotos.push({
          url: compressed.dataUrl,
          sizeKb: compressed.sizeKb,
          label: `Departure capture (${compressed.timestamp})`,
        });
      }
      setPhotos((prev) => [...prev, ...newPhotos]);
      toast.success(`Attached ${newPhotos.length} compressed photo(s)`, { id: toastId });
    } catch {
      toast.error("Error processing camera image", { id: toastId });
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Add One-Click Sample Photo for Demo / Desktop evaluation
  const handleAddSamplePhoto = (type: "clean" | "damaged" = "clean") => {
    if (photos.length >= 6) {
      toast.error("Maximum 6 condition photos reached.");
      return;
    }

    const category = booking.resourceSlug.includes("laser")
      ? SAMPLE_INSPECTION_PHOTOS.laser
      : booking.resourceSlug.includes("camera")
      ? SAMPLE_INSPECTION_PHOTOS.camera
      : booking.resourceSlug.includes("audio")
      ? SAMPLE_INSPECTION_PHOTOS.audio
      : booking.resourceSlug.includes("prusa")
      ? SAMPLE_INSPECTION_PHOTOS.printer
      : SAMPLE_INSPECTION_PHOTOS.electronics;

    const list = type === "damaged" ? category.damaged : category.clean;
    const sampleItem = list[photos.length % list.length];

    setPhotos((prev) => [
      ...prev,
      {
        url: sampleItem.url,
        sizeKb: 152,
        label: sampleItem.label,
      },
    ]);
    toast.success(`Attached ${type} inspection photo`);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Return
  const handleSubmitReturn = async () => {
    let incidentDraft: IncidentDraft | undefined = undefined;

    if (isIncidentOpen && incidentDescription.trim()) {
      incidentDraft = {
        id: `inc-${Date.now()}`,
        bookingId: booking.id,
        resourceId: booking.resourceId,
        reportedBy: booking.userId,
        reportedByName: booking.userName,
        type: incidentType,
        severity: incidentSeverity,
        description: incidentDescription,
        status: "open",
        createdAt: new Date().toISOString(),
      };
    }

    setIsSubmitting(true);
    const success = await returnBooking(
      booking.id,
      {
        overall: conditionRating,
        notes: conditionNotes,
        photos: photos.map((p) => p.url),
      },
      incidentDraft
    );

    setIsSubmitting(false);

    if (success) {
      if (typeof window !== "undefined") {
        localStorage.removeItem(`commons_return_draft_${bookingId}`);
      }
      router.push(`/bookings/${booking.id}`);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 text-ink pb-24">
        {/* Top Navigation */}
        <div className="flex items-center justify-between border-b border-line pb-4">
          <Link
            href={`/bookings/${booking.id}`}
            className="inline-flex items-center gap-2 text-small font-medium text-ink-muted hover:text-ink transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 text-terracotta group-hover:-translate-x-1 transition-transform" />
            <span>Cancel & Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-ink-muted">Physical Handoff · Phase 2</span>
          </div>
        </div>

        {/* Header Summary */}
        <div className="p-4 bg-surface border border-line rounded-editorial flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={booking.resourcePhoto}
              alt={booking.resourceTitle}
              className="w-14 h-14 rounded-editorial object-cover border border-line shrink-0"
            />
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-terracotta font-semibold block">
                Resource Return & Departure Inspection
              </span>
              <h1 className="font-display text-xl sm:text-2xl text-ink font-normal leading-tight truncate">
                {booking.resourceTitle}
              </h1>
              <div className="flex items-center gap-2 text-xs text-ink-muted pt-0.5">
                <MapPin className="w-3.5 h-3.5 text-terracotta shrink-0" />
                <span className="truncate">{booking.resourceLocation}</span>
              </div>
            </div>
          </div>

          <div className="hidden sm:block text-right">
            <span className="text-[10px] text-ink-muted uppercase block">Session Borrower</span>
            <strong className="text-xs text-ink block">{booking.userName}</strong>
            <span className="text-[11px] font-mono text-terracotta">Ref: {booking.id}</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SIDE-BY-SIDE BEFORE / AFTER CONDITION COMPARISON VIEW     */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* LEFT: Before (Arrival Condition) */}
          <Card className="p-5 space-y-3 bg-bone/40 border-line">
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-terracotta" />
                <h3 className="font-semibold text-xs text-ink uppercase tracking-wider font-mono">
                  Arrival Baseline (Before)
                </h3>
              </div>
              <Badge status="approved">
                {beforeCondition?.overall?.toUpperCase() || "EXCELLENT"}
              </Badge>
            </div>

            {beforeCondition ? (
              <div className="space-y-3 text-xs">
                <p className="p-2.5 bg-surface border border-line rounded-editorial italic text-ink-muted leading-relaxed">
                  &ldquo;{beforeCondition.notes || "No pre-existing defect observed."}&rdquo;
                </p>

                {beforeCondition.photos.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-ink-muted block">
                      Arrival Photos ({beforeCondition.photos.length})
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {beforeCondition.photos.map((photoUrl, idx) => (
                        <div
                          key={idx}
                          className="rounded-editorial border border-line overflow-hidden bg-surface"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photoUrl}
                            alt={`Arrival photo ${idx + 1}`}
                            className="w-full h-24 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-[10px] font-mono text-ink-muted flex items-center gap-1.5 pt-1">
                  <Clock className="w-3 h-3 text-terracotta" />
                  <span>
                    Logged at{" "}
                    {new Date(beforeCondition.recordedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-ink-muted">
                No initial condition report on file. Proceed with departure inspection.
              </div>
            )}
          </Card>

          {/* RIGHT: After (Departure Condition Input) */}
          <Card className="p-5 space-y-4 border-terracotta/40 shadow-xs">
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-terracotta" />
                <h3 className="font-semibold text-xs text-ink uppercase tracking-wider font-mono">
                  Departure Condition (After)
                </h3>
              </div>
              <span className="text-[10px] font-mono uppercase font-bold text-terracotta">
                Current State
              </span>
            </div>

            {/* Condition Rating Selector */}
            <div className="space-y-1.5">
              <label className="text-mono-label uppercase text-ink-muted font-bold block">
                Departure Rating
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(
                  [
                    { key: "excellent", label: "Excellent" },
                    { key: "good", label: "Good" },
                    { key: "fair", label: "Fair" },
                    { key: "damaged", label: "Damaged" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setConditionRating(opt.key)}
                    className={cn(
                      "p-2 rounded-editorial border text-center transition-all min-h-[44px]",
                      conditionRating === opt.key
                        ? "bg-terracotta text-white border-terracotta shadow-xs font-bold"
                        : "bg-surface border-line text-ink hover:border-terracotta/50 text-xs"
                    )}
                  >
                    <div className="text-xs">{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-mono-label uppercase text-ink-muted font-bold block">
                Cleanup & Condition Notes
              </label>
              <Textarea
                value={conditionNotes}
                onChange={(e) => setConditionNotes(e.target.value)}
                placeholder="E.g., Work area swept, exhaust chiller powered down, tool holstered in rack, PEI build sheet cleaned with isopropanol..."
                rows={3}
                className="text-xs"
              />
            </div>

            {/* Departure Photos Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-mono-label uppercase text-ink-muted font-bold block">
                  Departure Photos ({photos.length}/6)
                </label>
                <span className="text-[10px] text-ink-muted">Canvas WebP compressed</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="camera-return-input"
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<Camera className="w-3.5 h-3.5 text-terracotta" />}
                  onClick={() => fileInputRef.current?.click()}
                  isLoading={isCompressing}
                  className="w-full text-xs min-h-[44px]"
                >
                  Snap Photo
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  leftIcon={<ImageIcon className="w-3.5 h-3.5 text-terracotta" />}
                  onClick={() => handleAddSamplePhoto("clean")}
                  className="w-full text-xs border border-line bg-bone/40 hover:bg-bone min-h-[44px]"
                >
                  Add Sample Photo
                </Button>
              </div>

              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {photos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-editorial border border-line overflow-hidden bg-surface"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo.url} alt={photo.label} className="w-full h-18 object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-ink/80 text-white hover:bg-danger transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ======================================================== */}
        {/* DEGRADATION ALERT / PROMPT "REPORT DAMAGE?"             */}
        {/* ======================================================== */}
        {(isDegraded || hasDamageKeywords) && (
          <div className="p-4 bg-[#FCF2F1] border border-danger/40 rounded-editorial space-y-2 text-xs text-danger shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertOctagon className="w-5 h-5 text-danger shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="block font-semibold text-small">
                  Condition Degradation Detected
                </strong>
                <p className="leading-relaxed">
                  Arrival condition was marked as{" "}
                  <strong className="uppercase font-mono">{beforeCondition?.overall || "excellent"}</strong>,
                  while departure is marked as{" "}
                  <strong className="uppercase font-mono">{conditionRating}</strong>. Transparent disclosure
                  prevents dispute flags and preserves your campus trust score.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Toggleable Incident Report Form */}
        <div className="bg-surface border border-line rounded-editorial p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileWarning className="w-4 h-4 text-terracotta" />
              <span className="font-semibold text-xs text-ink">
                Report an Issue, Delay, or Damage
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsIncidentOpen(!isIncidentOpen)}
              className="text-xs text-terracotta font-medium hover:underline min-h-[36px] flex items-center"
            >
              {isIncidentOpen ? "Hide Incident Section" : "+ Log Maintenance / Damage Report"}
            </button>
          </div>

          {isIncidentOpen && (
            <div className="space-y-3 pt-3 border-t border-line/60 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-mono-label uppercase text-ink-muted font-bold block">
                    Incident Classification
                  </label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value as IncidentType)}
                    aria-label="Incident Classification"
                    className="w-full px-3 py-2 bg-bone/50 border border-line rounded-editorial text-xs text-ink focus:outline-none focus:ring-1 focus:ring-terracotta min-h-[44px]"
                  >
                    <option value="damage">Material Damage / Component Broken</option>
                    <option value="delay">Unforeseen Schedule Delay</option>
                    <option value="safety">Safety Interlock / Fume Notice</option>
                    <option value="misuse">Prior User Misuse Discovered</option>
                    <option value="other">General Maintenance Flag</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-mono-label uppercase text-ink-muted font-bold block">
                    Estimated Severity
                  </label>
                  <select
                    value={incidentSeverity}
                    onChange={(e) => setIncidentSeverity(e.target.value as IncidentSeverity)}
                    aria-label="Estimated Severity"
                    className="w-full px-3 py-2 bg-bone/50 border border-line rounded-editorial text-xs text-ink focus:outline-none focus:ring-1 focus:ring-terracotta min-h-[44px]"
                  >
                    <option value="low">Low (Cosmetic, doesn&apos;t halt machine)</option>
                    <option value="medium">Medium (Part replacement needed soon)</option>
                    <option value="high">High (Machine offline until technician visits)</option>
                    <option value="critical">Critical (Safety hazard / immediate lock)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-mono-label uppercase text-ink-muted font-bold block">
                  Incident Description & Context
                </label>
                <Textarea
                  value={incidentDescription}
                  onChange={(e) => setIncidentDescription(e.target.value)}
                  placeholder="Detail what occurred, any strange motor sounds, blade resistance, or accidental drop..."
                  rows={2}
                  className="text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddSamplePhoto("damaged")}
                  leftIcon={<Camera className="w-3.5 h-3.5 text-danger" />}
                  className="text-xs border border-danger/30 text-danger hover:bg-danger/10 min-h-[40px]"
                >
                  Attach Damage Sample Photo (Demo)
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Audit Trail Disclaimer */}
        <div className="p-3 bg-surface border border-line rounded-editorial flex items-start gap-2.5 text-[11px] text-ink-muted">
          <Info className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
          <span>
            Upon submission, booking status transitions to <code className="font-mono text-ink">returned</code>.
            The owner/lab custodian will receive a verification task in their queue to inspect the tool and
            seal the audit ledger.
          </span>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <Link href={`/bookings/${booking.id}`}>
            <Button variant="ghost" className="min-h-[44px]">Back to Booking</Button>
          </Link>

          <Button
            variant="accent"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            isLoading={isSubmitting}
            onClick={handleSubmitReturn}
            className="min-h-[44px] px-6"
          >
            Submit Return Checklist
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
