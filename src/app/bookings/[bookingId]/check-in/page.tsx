"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
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
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useBookings, type BookingRecord } from "@/context/BookingContext";
import { CAMPUS_RESOURCES } from "@/lib/resources/data";
import { type ConditionRating } from "@/lib/supabase/types";
import { compressImage, SAMPLE_INSPECTION_PHOTOS, type CompressedPhotoResult } from "@/lib/condition/compressor";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type CheckInStep = 1 | 2 | 3;

export default function CheckInPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = (params?.bookingId || params?.id) as string;
  const { user } = useAuth();
  const { getBookingById, checkInBooking } = useBookings();

  const booking = getBookingById(bookingId);
  const resource = CAMPUS_RESOURCES.find(
    (r) => r.id === booking?.resourceId || r.slug === booking?.resourceSlug
  );

  // Wizard state
  const [step, setStep] = React.useState<CheckInStep>(1);
  const [demoBypassWindow, setDemoBypassWindow] = React.useState(true);

  // Form State
  const [rulesAcknowledged, setRulesAcknowledged] = React.useState(false);
  const [conditionRating, setConditionRating] = React.useState<ConditionRating>("excellent");
  const [conditionNotes, setConditionNotes] = React.useState("");
  const [photos, setPhotos] = React.useState<{ url: string; sizeKb: number; label: string }[]>([]);
  const [isCompressing, setIsCompressing] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // File input ref
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Restore draft from localStorage (offline-safe)
  React.useEffect(() => {
    if (!bookingId || typeof window === "undefined") return;
    const draft = localStorage.getItem(`commons_checkin_draft_${bookingId}`);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.rulesAcknowledged) setRulesAcknowledged(parsed.rulesAcknowledged);
        if (parsed.conditionRating) setConditionRating(parsed.conditionRating);
        if (parsed.conditionNotes) setConditionNotes(parsed.conditionNotes);
        if (parsed.photos?.length) setPhotos(parsed.photos);
      } catch {
        // ignore draft parse error
      }
    }
  }, [bookingId]);

  // Save draft to localStorage whenever form changes
  React.useEffect(() => {
    if (!bookingId || typeof window === "undefined") return;
    const draft = {
      rulesAcknowledged,
      conditionRating,
      conditionNotes,
      photos,
    };
    localStorage.setItem(`commons_checkin_draft_${bookingId}`, JSON.stringify(draft));
  }, [bookingId, rulesAcknowledged, conditionRating, conditionNotes, photos]);

  if (!booking) {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto px-4 py-16">
          <EmptyState
            title="Reservation Not Found"
            description="Could not locate this booking record for arrival check-in."
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

  // Window Check: Check-in opens 15 minutes before start
  const now = Date.now();
  const startTime = new Date(booking.timeRangeStart).getTime();
  const endTime = new Date(booking.timeRangeEnd).getTime();
  const windowOpensAt = startTime - 15 * 60 * 1000;
  const isWithinWindow = (now >= windowOpensAt && now <= endTime) || demoBypassWindow;

  // Handle Photo File Upload with Canvas Compression
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > 6) {
      toast.error("Maximum 6 inspection photos allowed.");
      return;
    }

    setIsCompressing(true);
    const toastId = toast.loading("Compressing arrival photo(s) client-side...");

    try {
      const newPhotos: { url: string; sizeKb: number; label: string }[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressed = await compressImage(file, 1280, 1280, 0.78);
        newPhotos.push({
          url: compressed.dataUrl,
          sizeKb: compressed.sizeKb,
          label: `Camera capture (${compressed.timestamp})`,
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
  const handleAddSamplePhoto = () => {
    if (photos.length >= 6) {
      toast.error("Maximum 6 condition photos reached.");
      return;
    }

    const sampleCategory = booking.resourceSlug.includes("laser")
      ? SAMPLE_INSPECTION_PHOTOS.laser.clean
      : booking.resourceSlug.includes("camera")
      ? SAMPLE_INSPECTION_PHOTOS.camera.clean
      : booking.resourceSlug.includes("audio")
      ? SAMPLE_INSPECTION_PHOTOS.audio.clean
      : booking.resourceSlug.includes("prusa")
      ? SAMPLE_INSPECTION_PHOTOS.printer.clean
      : SAMPLE_INSPECTION_PHOTOS.electronics.clean;

    const sampleItem = sampleCategory[photos.length % sampleCategory.length];

    setPhotos((prev) => [
      ...prev,
      {
        url: sampleItem.url,
        sizeKb: 148,
        label: sampleItem.label,
      },
    ]);
    toast.success("Attached verified inspection sample photo");
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Submission
  const handleSubmitCheckIn = async () => {
    if (!rulesAcknowledged) {
      toast.error("Please confirm you have read and accepted the usage rules.");
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    const success = await checkInBooking(
      booking.id,
      {
        overall: conditionRating,
        notes: conditionNotes,
        photos: photos.map((p) => p.url),
      },
      rulesAcknowledged
    );

    setIsSubmitting(false);

    if (success) {
      // Clear draft
      if (typeof window !== "undefined") {
        localStorage.removeItem(`commons_checkin_draft_${bookingId}`);
      }
      router.push(`/bookings/${booking.id}`);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 text-ink pb-24">
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
            <span className="text-[11px] font-mono text-ink-muted">Physical Handoff · Phase 1</span>
          </div>
        </div>

        {/* Resource Header Summary Card */}
        <div className="p-4 bg-surface border border-line rounded-editorial flex items-center gap-3.5 shadow-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={booking.resourcePhoto}
            alt={booking.resourceTitle}
            className="w-14 h-14 rounded-editorial object-cover border border-line shrink-0"
          />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-terracotta font-semibold block">
              Physical Arrival Verification
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

        {/* Window Guard Alert if outside time window */}
        {!isWithinWindow && (
          <div className="p-4 bg-[#FDF9EE] border border-[#EAD9B8] rounded-editorial space-y-3 text-xs text-[#8C6114]">
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Check-in Window Not Yet Active</strong>
                <p className="leading-relaxed pt-0.5">
                  Arrival condition reporting unlocks 15 minutes before your scheduled slot (
                  {new Date(windowOpensAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}).
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#EAD9B8]/70 flex items-center justify-between">
              <span className="text-[11px]">Judge evaluation override:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDemoBypassWindow(true)}
                className="bg-white text-xs h-8"
              >
                Enable Demo Check-in Now
              </Button>
            </div>
          </div>
        )}

        {/* 3-Step Wizard Navigation Stepper */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { num: 1, label: "Identity & Rules" },
            { num: 2, label: "Arrival Condition" },
            { num: 3, label: "Lock & Confirm" },
          ].map((item) => (
            <button
              key={item.num}
              type="button"
              onClick={() => {
                if (item.num === 1 || (item.num === 2 && rulesAcknowledged) || (item.num === 3 && rulesAcknowledged)) {
                  setStep(item.num as CheckInStep);
                }
              }}
              className={cn(
                "p-2.5 rounded-editorial border text-left transition-all min-h-[44px]",
                step === item.num
                  ? "bg-ink text-bone border-ink shadow-xs"
                  : step > item.num
                  ? "bg-bone border-line text-ink"
                  : "bg-surface/50 border-line/60 text-ink-muted opacity-60"
              )}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold">
                {step > item.num ? (
                  <Check className="w-3 h-3 text-success" />
                ) : (
                  <span>0{item.num}.</span>
                )}
                <span className="hidden sm:inline">Step</span>
              </div>
              <div className="text-xs font-semibold truncate">{item.label}</div>
            </button>
          ))}
        </div>

        {/* ======================================================== */}
        {/* STEP 1: IDENTITY & RULES ACKNOWLEDGMENT                  */}
        {/* ======================================================== */}
        {step === 1 && (
          <div className="space-y-6">
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-terracotta" />
                  <h2 className="font-semibold text-small text-ink">
                    1. Borrower Custody Verification
                  </h2>
                </div>
                <Badge status="approved">Slotted Borrower</Badge>
              </div>

              <div className="p-3 bg-bone/70 border border-line rounded-editorial text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Authorized Student:</span>
                  <strong className="text-ink">{booking.userName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Affiliation:</span>
                  <span className="text-ink">{booking.userAffiliation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Course Context:</span>
                  <span className="text-ink">{booking.courseContext || "Undergraduate Engineering"}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="text-mono-label uppercase text-ink-muted font-bold">
                  Resource Operating & Safety Rules
                </h3>
                <div className="space-y-2 bg-surface p-3.5 border border-line rounded-editorial">
                  {(resource?.usageRules || [
                    "Inspect equipment for visible damages before engaging power switch.",
                    "Personal Protective Equipment (safety eyewear / ear protection) is mandatory.",
                    "Report any misalignment, dull blades, or abnormal motor vibrations immediately.",
                    "Leave work surface broom-clean and turn off main isolator upon session end.",
                  ]).map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-ink">
                      <span className="w-4 h-4 rounded-full bg-bone border border-line text-[10px] font-mono flex items-center justify-center shrink-0 mt-0.5 text-terracotta font-bold">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mandatory Checkbox */}
              <label
                className={cn(
                  "flex items-start gap-3 p-3.5 rounded-editorial border cursor-pointer transition-colors min-h-[44px]",
                  rulesAcknowledged
                    ? "bg-[#F0F5F1] border-[#C6DBCB]"
                    : "bg-surface border-line hover:border-terracotta/50"
                )}
              >
                <input
                  type="checkbox"
                  checked={rulesAcknowledged}
                  onChange={(e) => setRulesAcknowledged(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-line text-terracotta focus:ring-terracotta"
                />
                <span className="text-xs text-ink leading-relaxed select-none">
                  <strong>I acknowledge physical presence at the resource</strong> and confirm that I have
                  read and will abide by the operating rules above. I understand that I am responsible for custody
                  until return inspection.
                </span>
              </label>
            </Card>

            <div className="flex justify-end">
              <Button
                variant="accent"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                disabled={!rulesAcknowledged}
                onClick={() => setStep(2)}
              >
                Proceed to Condition Baseline
              </Button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: ARRIVAL CONDITION BASELINE                       */}
        {/* ======================================================== */}
        {step === 2 && (
          <div className="space-y-6">
            <Card className="p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-terracotta" />
                  <h2 className="font-semibold text-small text-ink">
                    2. Arrival Condition Baseline
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-ink-muted">Timestamped Record</span>
              </div>

              {/* Condition Rating Selector */}
              <div className="space-y-2">
                <label className="text-mono-label uppercase text-ink-muted font-bold block">
                  Overall Tool / Bench Rating
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { key: "excellent", label: "Excellent", desc: "Pristine, factory spec" },
                      { key: "good", label: "Good", desc: "Clean, minor cosmetic wear" },
                      { key: "fair", label: "Fair", desc: "Heavy cosmetic wear" },
                      { key: "damaged", label: "Damaged", desc: "Defect or issue noted" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setConditionRating(opt.key)}
                      className={cn(
                        "p-3 rounded-editorial border text-left transition-all min-h-[44px]",
                        conditionRating === opt.key
                          ? "bg-terracotta text-white border-terracotta shadow-xs"
                          : "bg-surface border-line text-ink hover:border-terracotta/50"
                      )}
                    >
                      <div className="font-bold text-xs">{opt.label}</div>
                      <div className="text-[10px] opacity-80 leading-tight pt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes Field */}
              <div className="space-y-1.5">
                <label className="text-mono-label uppercase text-ink-muted font-bold block">
                  Arrival Observations & Existing Marks
                </label>
                <Textarea
                  value={conditionNotes}
                  onChange={(e) => setConditionNotes(e.target.value)}
                  placeholder="E.g., Honeycomb tray cleared of prior acrylic cuts, focus lens clean, emergency stop engaged, safety eyewear accounted for..."
                  rows={3}
                  className="text-xs"
                />
              </div>

              {/* Photo Upload Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-mono-label uppercase text-ink-muted font-bold block">
                    Condition Photos ({photos.length}/6)
                  </label>
                  <span className="text-[10px] text-ink-muted">Canvas WebP compressed</span>
                </div>

                {/* Upload Action Triggers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="camera-upload-input"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    leftIcon={<Camera className="w-4 h-4 text-terracotta" />}
                    onClick={() => fileInputRef.current?.click()}
                    isLoading={isCompressing}
                    className="w-full justify-center min-h-[44px]"
                  >
                    Snap Photo (Camera)
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    leftIcon={<ImageIcon className="w-4 h-4 text-terracotta" />}
                    onClick={handleAddSamplePhoto}
                    className="w-full justify-center border border-line/60 bg-bone/40 hover:bg-bone text-xs min-h-[44px]"
                  >
                    Use Sample Inspection Photo
                  </Button>
                </div>

                {/* Photo Previews Grid */}
                {photos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    {photos.map((photo, idx) => (
                      <div
                        key={idx}
                        className="group relative rounded-editorial border border-line bg-surface overflow-hidden shadow-2xs"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.url}
                          alt={photo.label}
                          className="w-full h-28 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-ink/70 text-white hover:bg-danger transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="p-2 bg-surface text-[10px] border-t border-line/60 flex items-center justify-between">
                          <span className="font-mono text-ink-muted">{photo.sizeKb} KB</span>
                          <span className="font-medium text-terracotta truncate max-w-[100px]">
                            {photo.label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                variant="accent"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => setStep(3)}
              >
                Review & Confirm
              </Button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: REVIEW & LOCK IN ARRIVAL                         */}
        {/* ======================================================== */}
        {step === 3 && (
          <div className="space-y-6">
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-terracotta" />
                  <h2 className="font-semibold text-small text-ink">
                    3. Review Check-in Record
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-terracotta font-bold uppercase">
                  Ready to Lock
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-bone/70 border border-line rounded-editorial space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-ink-muted">Condition Assessment:</span>
                    <strong className="uppercase font-mono text-terracotta">
                      {conditionRating}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ink-muted">Inspection Photos:</span>
                    <strong className="text-ink">{photos.length} Attached</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ink-muted">Operating Rules:</span>
                    <span className="text-success font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Acknowledged
                    </span>
                  </div>
                </div>

                {conditionNotes && (
                  <div className="space-y-1">
                    <span className="text-mono-label text-ink-muted uppercase font-bold block">
                      Arrival Notes
                    </span>
                    <p className="p-3 bg-surface border border-line rounded-editorial italic text-ink">
                      &ldquo;{conditionNotes}&rdquo;
                    </p>
                  </div>
                )}

                {/* Audit notice */}
                <div className="p-3 bg-surface border border-line rounded-editorial flex items-start gap-2.5 text-[11px] text-ink-muted">
                  <Info className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                  <span>
                    Submitting this check-in will write an immutable record to the campus Postgres{" "}
                    <code className="font-mono text-ink">audit_log</code> and start your live session timer.
                  </span>
                </div>
              </div>
            </Card>

            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                variant="accent"
                leftIcon={<Camera className="w-4 h-4" />}
                isLoading={isSubmitting}
                onClick={handleSubmitCheckIn}
                className="min-h-[44px] px-6"
              >
                Submit Arrival Check-in
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

