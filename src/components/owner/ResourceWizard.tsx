"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  type CampusResource,
  type AvailabilitySlot,
  type ResourceRequirementItem,
  type FairUsePolicy,
} from "@/lib/resources/data";
import { type ResourceCategory } from "@/lib/supabase/types";
import { useOwnerResources, type ResourceDraftData } from "@/context/OwnerResourceContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Stepper, type StepItem } from "@/components/ui/Stepper";
import { toast } from "sonner";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  UploadCloud,
  Trash2,
  MoveUp,
  MoveDown,
  Plus,
  ShieldCheck,
  Calendar,
  Building2,
  Clock,
  Eye,
  Save,
  RotateCcw,
  AlertTriangle,
  Coins,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ResourceWizardProps {
  initialResource?: CampusResource;
  isEditMode?: boolean;
}

const WIZARD_STEPS_DEF = [
  { id: "basics", title: "Basics" },
  { id: "photos", title: "Photos" },
  { id: "location", title: "Location" },
  { id: "schedule", title: "Schedule" },
  { id: "requirements", title: "Requirements" },
  { id: "rules", title: "Rules & Credits" },
  { id: "fairuse", title: "Fair-Use" },
  { id: "preview", title: "Preview & Publish" },
];

const SAMPLE_PHOTO_PRESETS = [
  {
    label: "3D Fabrication Bench",
    url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Laser Cutter System",
    url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "High-Res Microscope",
    url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Acoustic Podcast Studio",
    url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Precision Hardware Rig",
    url: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80",
  },
];

const DEFAULT_SCHEDULE: AvailabilitySlot[] = [
  { day: "Mon", dateStr: "Tomorrow", timeRange: "09:00 - 12:00", status: "open" },
  { day: "Mon", dateStr: "Tomorrow", timeRange: "13:00 - 17:00", status: "open" },
  { day: "Mon", dateStr: "Tomorrow", timeRange: "18:00 - 21:00", status: "booked" },
  { day: "Tue", dateStr: "In 2 days", timeRange: "09:00 - 12:00", status: "open" },
  { day: "Tue", dateStr: "In 2 days", timeRange: "13:00 - 17:00", status: "open" },
  { day: "Tue", dateStr: "In 2 days", timeRange: "18:00 - 21:00", status: "open" },
  { day: "Wed", dateStr: "In 3 days", timeRange: "09:00 - 12:00", status: "blackout", reason: "Faculty Calibration" },
  { day: "Wed", dateStr: "In 3 days", timeRange: "13:00 - 17:00", status: "open" },
  { day: "Wed", dateStr: "In 3 days", timeRange: "18:00 - 21:00", status: "open" },
  { day: "Thu", dateStr: "In 4 days", timeRange: "09:00 - 12:00", status: "open" },
  { day: "Thu", dateStr: "In 4 days", timeRange: "13:00 - 17:00", status: "open" },
  { day: "Thu", dateStr: "In 4 days", timeRange: "18:00 - 21:00", status: "open" },
  { day: "Fri", dateStr: "In 5 days", timeRange: "09:00 - 12:00", status: "open" },
  { day: "Fri", dateStr: "In 5 days", timeRange: "13:00 - 17:00", status: "open" },
  { day: "Fri", dateStr: "In 5 days", timeRange: "18:00 - 21:00", status: "blackout", reason: "Weekend Lockout" },
];

export function ResourceWizard({ initialResource, isEditMode = false }: ResourceWizardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const {
    createResource,
    updateResource,
    saveDraft,
    loadDraft,
    clearDraft,
    lastDraftSavedAt,
  } = useOwnerResources();

  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form State
  const [title, setTitle] = React.useState(initialResource?.title || "");
  const [category, setCategory] = React.useState<ResourceCategory>(initialResource?.category || "device");
  const [categoryLabel, setCategoryLabel] = React.useState(initialResource?.categoryLabel || "Prototyping Device");
  const [department, setDepartment] = React.useState(initialResource?.owner?.department || user?.affiliation || "College of Engineering");
  const [description, setDescription] = React.useState(initialResource?.description || "");
  const [assetTag, setAssetTag] = React.useState("AST-2026-ENG-08");

  // Photos
  const [photos, setPhotos] = React.useState<string[]>(
    initialResource?.photos || [SAMPLE_PHOTO_PRESETS[0].url, SAMPLE_PHOTO_PRESETS[1].url]
  );
  const [photoInputUrl, setPhotoInputUrl] = React.useState("");

  // Location
  const [building, setBuilding] = React.useState(initialResource?.building || "East Engineering Wing");
  const [room, setRoom] = React.useState(initialResource?.room || "Room 104");
  const [locationText, setLocationText] = React.useState(initialResource?.locationText || "Fabrication Lab, Room 104, East Engineering Wing");
  const [accessInstructions, setAccessInstructions] = React.useState(
    initialResource?.accessInstructions ||
      "Scan physical Eastbrook student ID at door reader. Keycard privileges sync within 5 minutes of approved reservation window."
  );
  const [requiresSupervision, setRequiresSupervision] = React.useState(initialResource?.requiresSupervision || false);

  // Schedule
  const [weeklySchedule, setWeeklySchedule] = React.useState<AvailabilitySlot[]>(
    initialResource?.weeklySchedule || DEFAULT_SCHEDULE
  );
  const [minNoticeHours, setMinNoticeHours] = React.useState(initialResource?.minNoticeHours || 2);
  const [maxBookingHours, setMaxBookingHours] = React.useState(initialResource?.maxBookingHours || 6);

  // Requirements
  const [requirements, setRequirements] = React.useState<ResourceRequirementItem[]>(
    initialResource?.requirements || [
      {
        id: "req-01",
        label: "Standard EHS Workshop Safety Orientation",
        type: "training",
        description: "Mandatory campus hazard training completed within the last 12 months.",
        requiresDocument: true,
      },
    ]
  );
  const [newReqLabel, setNewReqLabel] = React.useState("");
  const [newReqType, setNewReqType] = React.useState<ResourceRequirementItem["type"]>("training");
  const [newReqDesc, setNewReqDesc] = React.useState("");
  const [newReqDoc, setNewReqDoc] = React.useState(true);

  // Rules & Credits
  const [creditCostPerHour, setCreditCostPerHour] = React.useState(initialResource?.creditCostPerHour || 0);
  const [depositAmount, setDepositAmount] = React.useState(initialResource?.depositAmount || 0);
  const [usageRules, setUsageRules] = React.useState<string[]>(
    initialResource?.usageRules || [
      "Wear approved ANSI Z87.1 eye protection at all times in this enclosure.",
      "Clean working surfaces and vacuum debris immediately prior to check-out.",
      "Never leave active heating elements or lasers unattended.",
    ]
  );
  const [newRuleInput, setNewRuleInput] = React.useState("");

  // Fair-Use
  const [weeklyCapHours, setWeeklyCapHours] = React.useState(initialResource?.fairUse.weeklyCapHours || 8);
  const [maxActiveBookings, setMaxActiveBookings] = React.useState(initialResource?.fairUse.maxActiveBookings || 2);
  const [cooldownHours, setCooldownHours] = React.useState(initialResource?.fairUse.cooldownHours || 24);
  const [consecutiveDayLimit, setConsecutiveDayLimit] = React.useState(initialResource?.fairUse.consecutiveDayLimit || 3);

  // Check and restore draft on initial load (only for new mode)
  React.useEffect(() => {
    if (!isEditMode) {
      const draft = loadDraft();
      if (draft && !title) {
        setTitle(draft.title || "");
        setCategory(draft.category || "device");
        setCategoryLabel(draft.categoryLabel || "Prototyping Device");
        setDescription(draft.description || "");
        setDepartment(draft.department || "College of Engineering");
        if (draft.photos?.length) setPhotos(draft.photos);
        if (draft.building) setBuilding(draft.building);
        if (draft.room) setRoom(draft.room);
        if (draft.locationText) setLocationText(draft.locationText);
        if (draft.accessInstructions) setAccessInstructions(draft.accessInstructions);
        setRequiresSupervision(draft.requiresSupervision || false);
        if (draft.weeklySchedule?.length) setWeeklySchedule(draft.weeklySchedule);
        if (draft.requirements?.length) setRequirements(draft.requirements);
        if (draft.usageRules?.length) setUsageRules(draft.usageRules);
        if (draft.fairUse) {
          setWeeklyCapHours(draft.fairUse.weeklyCapHours);
          setMaxActiveBookings(draft.fairUse.maxActiveBookings);
          setCooldownHours(draft.fairUse.cooldownHours);
          setConsecutiveDayLimit(draft.fairUse.consecutiveDayLimit);
        }
        toast.info("Unsaved Draft Restored", {
          description: "Loaded your previous changes from browser storage.",
        });
      }
    }
  }, [isEditMode, loadDraft, title]);

  // Autosave whenever inputs change (debounced via effect)
  React.useEffect(() => {
    if (isEditMode) return; // Don't overwrite new draft with edit state
    const timer = setTimeout(() => {
      if (title.trim()) {
        saveDraft({
          title,
          category,
          categoryLabel,
          department,
          description,
          assetTag,
          building,
          room,
          locationText,
          photos,
          capacity: 1,
          requiresSupervision,
          depositAmount,
          creditCostPerHour,
          maxBookingHours,
          minNoticeHours,
          usageRules,
          specs: initialResource?.specs || [{ label: "Model", value: "Enterprise 2026" }],
          accessInstructions,
          fairUse: {
            weeklyCapHours,
            maxActiveBookings,
            cooldownHours,
            consecutiveDayLimit,
          },
          requirements,
          weeklySchedule,
          status: "listed",
        });
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [
    isEditMode,
    title,
    category,
    categoryLabel,
    department,
    description,
    assetTag,
    building,
    room,
    locationText,
    photos,
    requiresSupervision,
    depositAmount,
    creditCostPerHour,
    maxBookingHours,
    minNoticeHours,
    usageRules,
    accessInstructions,
    weeklyCapHours,
    maxActiveBookings,
    cooldownHours,
    consecutiveDayLimit,
    requirements,
    weeklySchedule,
    saveDraft,
    initialResource?.specs,
  ]);

  // Photo handlers
  const handleAddPhoto = () => {
    if (photoInputUrl.trim()) {
      setPhotos((prev) => [...prev, photoInputUrl.trim()]);
      setPhotoInputUrl("");
    }
  };

  const handleAddPresetPhoto = (url: string) => {
    if (!photos.includes(url)) {
      setPhotos((prev) => [...prev, url]);
    }
  };

  const handleMovePhoto = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= photos.length) return;
    const next = [...photos];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    setPhotos(next);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Schedule slot toggler
  const handleToggleSlotStatus = (index: number) => {
    setWeeklySchedule((prev) =>
      prev.map((slot, i) => {
        if (i === index) {
          const nextStatus: AvailabilitySlot["status"] =
            slot.status === "open"
              ? "booked"
              : slot.status === "booked"
              ? "blackout"
              : "open";
          return {
            ...slot,
            status: nextStatus,
            reason: nextStatus === "blackout" ? "Departmental Hold" : undefined,
          };
        }
        return slot;
      })
    );
  };

  // Requirements builder
  const handleAddRequirement = () => {
    if (!newReqLabel.trim()) return;
    const newReq: ResourceRequirementItem = {
      id: `req-${Date.now().toString(36)}`,
      label: newReqLabel.trim(),
      type: newReqType,
      description: newReqDesc.trim() || "Prerequisite certification or course record required for access.",
      requiresDocument: newReqDoc,
    };
    setRequirements((prev) => [...prev, newReq]);
    setNewReqLabel("");
    setNewReqDesc("");
    setNewReqDoc(true);
  };

  const handleRemoveRequirement = (id: string) => {
    setRequirements((prev) => prev.filter((r) => r.id !== id));
  };

  // Rules builder
  const handleAddRule = () => {
    if (newRuleInput.trim()) {
      setUsageRules((prev) => [...prev, newRuleInput.trim()]);
      setNewRuleInput("");
    }
  };

  const handleRemoveRule = (index: number) => {
    setUsageRules((prev) => prev.filter((_, i) => i !== index));
  };

  // Publish / Save
  const handlePublish = async () => {
    if (!title.trim()) {
      toast.error("Resource title is required");
      setCurrentStepIndex(0);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        category,
        categoryLabel,
        description,
        locationText: `${room}, ${building}`,
        building,
        room,
        lat: 42.3601,
        lng: -71.0942,
        photos: photos.length > 0 ? photos : [SAMPLE_PHOTO_PRESETS[0].url],
        capacity: 1,
        requiresSupervision,
        supervisionNote: requiresSupervision ? "Peer lab monitor on duty during hours" : undefined,
        depositAmount,
        creditCostPerHour,
        maxBookingHours,
        minNoticeHours,
        usageRules,
        specs: initialResource?.specs || [
          { label: "Asset Tag", value: assetTag },
          { label: "Custodian Facility", value: department },
        ],
        accessInstructions,
        fairUse: {
          weeklyCapHours,
          maxActiveBookings,
          cooldownHours,
          consecutiveDayLimit,
        },
        requirements,
        status: "listed" as const,
        nextAvailableSlot: "Tomorrow, 09:00 - 12:00",
        weeklySchedule,
      };

      if (isEditMode && initialResource) {
        await updateResource(initialResource.id, payload);
      } else {
        await createResource(payload);
        clearDraft();
      }

      router.push("/owner/resources");
    } catch {
      toast.error("Failed to save resource listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps: StepItem[] = WIZARD_STEPS_DEF.map((s, idx) => ({
    id: s.id,
    title: s.title,
    status: (idx < currentStepIndex ? "completed" : idx === currentStepIndex ? "current" : "upcoming") as "completed" | "current" | "upcoming",
  }));

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Top Header & Autosave Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <span className="text-mono-label uppercase text-ink-muted">
            {isEditMode ? "Edit Existing Listing" : "Collegiate Resource Registry"}
          </span>
          <h1 className="font-display text-3xl text-ink font-normal">
            {isEditMode ? `Update ${initialResource?.title}` : "List a New Campus Resource"}
          </h1>
        </div>

        {/* Autosave Pill */}
        {!isEditMode && (
          <div className="flex items-center gap-2 self-start sm:self-center">
            {lastDraftSavedAt ? (
              <span className="px-2.5 py-1 bg-surface border border-line rounded-editorial text-[11px] font-mono text-ink-muted flex items-center gap-1.5 shadow-xs">
                <Save className="w-3 h-3 text-sage" />
                <span>
                  Autosaved at {new Date(lastDraftSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </span>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearDraft}
              className="text-xs text-ink-muted hover:text-danger min-h-[32px] px-2"
              title="Reset form to defaults"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          </div>
        )}
      </div>

      {/* Stepper Bar */}
      <div className="bg-surface border border-line rounded-editorial p-4 shadow-xs">
        <Stepper steps={steps} />
      </div>

      {/* ============================================================ */}
      {/* STEP 1: BASICS                                               */}
      {/* ============================================================ */}
      {currentStepIndex === 0 && (
        <div className="bg-surface border border-line rounded-editorial p-6 space-y-6 shadow-xs animate-in fade-in duration-150">
          <div className="border-b border-line pb-2">
            <span className="text-mono-label uppercase text-ink-muted">Step 1 of 8</span>
            <h2 className="font-display text-2xl text-ink">Resource Overview & Specifications</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-ink block">
                Resource Title <span className="text-terracotta">*</span>
              </label>
              <Input
                required
                placeholder="e.g. Formlabs Form 3+ Laser Stereolithography 3D Printer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-ink block">Category</label>
                <select
                  value={category}
                  onChange={(e) => {
                    const nextCat = e.target.value as ResourceCategory;
                    setCategory(nextCat);
                    const labelMap: Record<ResourceCategory, string> = {
                      device: "Prototyping Device",
                      equipment: "Heavy Fabrication Equipment",
                      space: "Specialized Lab / Studio",
                      tool: "Precision Hand Instrument",
                    };
                    setCategoryLabel(labelMap[nextCat]);
                  }}
                  className="w-full px-3 py-2 bg-bone border border-line rounded-editorial text-xs text-ink focus:outline-none focus:ring-1 focus:ring-terracotta"
                >
                  <option value="device">Prototyping Device</option>
                  <option value="equipment">Heavy Fabrication Equipment</option>
                  <option value="space">Specialized Lab / Studio</option>
                  <option value="tool">Precision Hand Instrument</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-ink block">Asset Tag / Serial Number</label>
                <Input
                  placeholder="e.g. AST-2026-ENG-104"
                  value={assetTag}
                  onChange={(e) => setAssetTag(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-ink block">Department / Custodian Division</label>
              <Input
                placeholder="e.g. Department of Mechanical Engineering"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-ink block">Description & Academic Purpose</label>
              <Textarea
                rows={4}
                placeholder="Detail technical tolerances, materials supported, primary research applications, and guidelines..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 2: PHOTOS                                               */}
      {/* ============================================================ */}
      {currentStepIndex === 1 && (
        <div className="bg-surface border border-line rounded-editorial p-6 space-y-6 shadow-xs animate-in fade-in duration-150">
          <div className="border-b border-line pb-2">
            <span className="text-mono-label uppercase text-ink-muted">Step 2 of 8</span>
            <h2 className="font-display text-2xl text-ink">Inspection & Gallery Photos</h2>
          </div>

          {/* Quick presets */}
          <div className="space-y-2">
            <span className="text-mono-label uppercase text-ink-muted font-bold block">
              Quick Presets (High-Resolution Campus Assets)
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PHOTO_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleAddPresetPhoto(preset.url)}
                  className="px-2.5 py-1.5 bg-bone border border-line rounded-editorial text-xs text-ink hover:border-terracotta hover:text-terracotta transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Add photo by URL */}
          <div className="flex gap-2">
            <Input
              placeholder="Paste public image URL (Unsplash, campus CDN, or storage bucket)..."
              value={photoInputUrl}
              onChange={(e) => setPhotoInputUrl(e.target.value)}
            />
            <Button variant="outline" size="md" onClick={handleAddPhoto}>
              Add Photo
            </Button>
          </div>

          {/* Photo Gallery Grid with reordering */}
          <div className="space-y-3">
            <span className="text-mono-label uppercase text-ink-muted font-bold block">
              Configured Photos ({photos.length}) — First photo acts as primary cover
            </span>

            {photos.length === 0 ? (
              <div className="p-8 bg-bone/50 border border-line border-dashed rounded-editorial text-center space-y-2">
                <UploadCloud className="w-8 h-8 text-ink-muted mx-auto" />
                <p className="text-xs text-ink-muted">
                  No photos added yet. Select a preset above or paste an image URL.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {photos.map((url, idx) => (
                  <div
                    key={`${url}-${idx}`}
                    className="relative bg-bone border border-line rounded-editorial overflow-hidden group shadow-xs"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-36 object-cover"
                    />

                    {idx === 0 && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-ink text-surface font-mono text-[9px] rounded uppercase font-bold tracking-wider">
                        Primary Cover
                      </span>
                    )}

                    {/* Controls Bar */}
                    <div className="p-2 bg-surface flex items-center justify-between border-t border-line text-xs">
                      <span className="font-mono text-ink-muted text-[10px]">
                        Slot #{idx + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMovePhoto(idx, "up")}
                          className="p-1 text-ink-muted hover:text-ink disabled:opacity-30 cursor-pointer"
                          title="Move left/up"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === photos.length - 1}
                          onClick={() => handleMovePhoto(idx, "down")}
                          className="p-1 text-ink-muted hover:text-ink disabled:opacity-30 cursor-pointer"
                          title="Move right/down"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="p-1 text-danger hover:bg-danger/10 rounded cursor-pointer ml-1"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 3: LOCATION & CUSTODY                                   */}
      {/* ============================================================ */}
      {currentStepIndex === 2 && (
        <div className="bg-surface border border-line rounded-editorial p-6 space-y-6 shadow-xs animate-in fade-in duration-150">
          <div className="border-b border-line pb-2">
            <span className="text-mono-label uppercase text-ink-muted">Step 3 of 8</span>
            <h2 className="font-display text-2xl text-ink">Campus Location & Physical Access</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-ink block">Campus Building</label>
                <Input
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  placeholder="e.g. East Engineering Wing"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-ink block">Room / Bay / Studio Number</label>
                <Input
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g. Room 104, Cleanroom Bay B"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-ink block">Location Summary String</label>
              <Input
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="e.g. Fabrication Lab, Room 104, East Engineering Wing"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-ink block">Access Instructions for Approved Borrowers</label>
              <Textarea
                rows={3}
                value={accessInstructions}
                onChange={(e) => setAccessInstructions(e.target.value)}
                placeholder="Detail keycard tap protocol, lab monitor check-in location, lockbox combination rules..."
              />
            </div>

            {/* Supervision Toggle */}
            <div className="p-4 bg-bone border border-line rounded-editorial flex items-start gap-3">
              <input
                type="checkbox"
                id="supervisionCheck"
                checked={requiresSupervision}
                onChange={(e) => setRequiresSupervision(e.target.checked)}
                className="mt-1 rounded text-terracotta focus:ring-terracotta"
              />
              <label htmlFor="supervisionCheck" className="cursor-pointer space-y-0.5">
                <span className="font-semibold text-ink block">
                  Mandatory Lab Supervision Required
                </span>
                <span className="text-ink-muted text-[11px] block leading-relaxed">
                  When enabled, borrowers can only book time slots when an authorized lab monitor or graduate proctor is physically on duty.
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 4: AVAILABILITY RULES & WEEKLY GRID EDITOR              */}
      {/* ============================================================ */}
      {currentStepIndex === 3 && (
        <div className="bg-surface border border-line rounded-editorial p-6 space-y-6 shadow-xs animate-in fade-in duration-150">
          <div className="border-b border-line pb-2">
            <span className="text-mono-label uppercase text-ink-muted">Step 4 of 8</span>
            <h2 className="font-display text-2xl text-ink">Availability Grid & Blackout Intervals</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-ink block">Minimum Lead Notice (Hours)</label>
              <Input
                type="number"
                min={0}
                value={minNoticeHours}
                onChange={(e) => setMinNoticeHours(Number(e.target.value))}
              />
              <span className="text-[10px] text-ink-muted block">
                Time required between booking submission and session start.
              </span>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-ink block">Maximum Session Window (Hours)</label>
              <Input
                type="number"
                min={1}
                max={24}
                value={maxBookingHours}
                onChange={(e) => setMaxBookingHours(Number(e.target.value))}
              />
              <span className="text-[10px] text-ink-muted block">
                Single consecutive reservation limit.
              </span>
            </div>
          </div>

          {/* Weekly Interactive Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-mono-label uppercase text-ink-muted font-bold">
                Weekly Time Slots (Click slot to toggle: Open &rarr; Booked &rarr; Blackout)
              </span>
              <span className="text-[11px] text-ink-muted">
                {weeklySchedule.filter((s) => s.status === "open").length} open slots
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {weeklySchedule.map((slot, index) => (
                <button
                  key={`${slot.day}-${slot.timeRange}-${index}`}
                  type="button"
                  onClick={() => handleToggleSlotStatus(index)}
                  className={cn(
                    "p-3 rounded-editorial border text-left transition-all cursor-pointer shadow-xs min-h-[44px]",
                    slot.status === "open"
                      ? "bg-bone border-line hover:border-terracotta"
                      : slot.status === "booked"
                      ? "bg-line/40 border-line text-ink-muted"
                      : "bg-terracotta/10 border-terracotta/30 text-terracotta"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <strong className="font-semibold text-ink">{slot.day}</strong>
                    <Badge
                      status={
                        slot.status === "open"
                          ? "approved"
                          : slot.status === "booked"
                          ? "neutral"
                          : "requested"
                      }
                    >
                      {slot.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="font-mono text-[11px] text-ink-muted pt-1">
                    {slot.timeRange}
                  </div>
                  {slot.reason && (
                    <div className="text-[10px] text-terracotta font-medium pt-0.5">
                      {slot.reason}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 5: REQUIREMENTS BUILDER                                 */}
      {/* ============================================================ */}
      {currentStepIndex === 4 && (
        <div className="bg-surface border border-line rounded-editorial p-6 space-y-6 shadow-xs animate-in fade-in duration-150">
          <div className="border-b border-line pb-2">
            <span className="text-mono-label uppercase text-ink-muted">Step 5 of 8</span>
            <h2 className="font-display text-2xl text-ink">Access Prerequisites & Qualifications</h2>
          </div>

          {/* Active Requirements List */}
          <div className="space-y-3">
            <span className="text-mono-label uppercase text-ink-muted font-bold block">
              Enforced Qualifications ({requirements.length})
            </span>

            {requirements.length === 0 ? (
              <div className="p-4 bg-bone/50 border border-line border-dashed rounded-editorial text-center text-xs text-ink-muted">
                No prerequisites configured. Any verified student on campus can book this resource.
              </div>
            ) : (
              <div className="space-y-2">
                {requirements.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 bg-bone border border-line rounded-editorial flex items-center justify-between gap-3 text-xs shadow-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <strong className="font-semibold text-ink">{req.label}</strong>
                        <Badge status="neutral">
                          {req.type}
                        </Badge>
                        {req.requiresDocument && (
                          <span className="text-[10px] text-terracotta font-mono">
                            Doc Upload Required
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-ink-muted">{req.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(req.id)}
                      className="p-1.5 text-ink-muted hover:text-danger rounded hover:bg-danger/10 transition-colors cursor-pointer"
                      title="Remove prerequisite"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Requirement */}
          <div className="p-4 bg-bone border border-line rounded-editorial space-y-3 text-xs">
            <span className="font-semibold text-ink block flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-terracotta" />
              <span>Add Prerequisite Qualification</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-medium text-ink block">Qualification Name</label>
                <Input
                  placeholder="e.g. Laser Safety Level 2 Certification"
                  value={newReqLabel}
                  onChange={(e) => setNewReqLabel(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-ink block">Category</label>
                <select
                  value={newReqType}
                  onChange={(e) => setNewReqType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-surface border border-line rounded-editorial text-xs text-ink focus:outline-none focus:ring-1 focus:ring-terracotta"
                >
                  <option value="training">Safety Training / Orientation</option>
                  <option value="qualification">Academic Course Enrollment</option>
                  <option value="membership">Lab / Departmental Membership</option>
                  <option value="authorisation">Principal Investigator Sign-off</option>
                  <option value="document">Custom Document / Certificate</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-medium text-ink block">Plain Description for Borrowers</label>
              <Input
                placeholder="e.g. Upload your completion certificate issued by Eastbrook EHS office."
                value={newReqDesc}
                onChange={(e) => setNewReqDesc(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newReqDoc}
                  onChange={(e) => setNewReqDoc(e.target.checked)}
                  className="rounded text-terracotta focus:ring-terracotta"
                />
                <span className="text-ink text-xs">
                  Requires document proof upload (PDF or image)
                </span>
              </label>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRequirement}
              >
                Add Requirement
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 6: RULES & CREDITS                                      */}
      {/* ============================================================ */}
      {currentStepIndex === 5 && (
        <div className="bg-surface border border-line rounded-editorial p-6 space-y-6 shadow-xs animate-in fade-in duration-150">
          <div className="border-b border-line pb-2">
            <span className="text-mono-label uppercase text-ink-muted">Step 6 of 8</span>
            <h2 className="font-display text-2xl text-ink">Usage Rules & Access Credits</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-ink block">Hourly Credit Rate</label>
              <Input
                type="number"
                min={0}
                value={creditCostPerHour}
                onChange={(e) => setCreditCostPerHour(Number(e.target.value))}
              />
              <span className="text-[10px] text-ink-muted block">
                0 = Free to all eligible campus students.
              </span>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-ink block">Security Deposit (Credits / USD)</label>
              <Input
                type="number"
                min={0}
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
              />
              <span className="text-[10px] text-ink-muted block">
                Trust-based default is $0.00.
              </span>
            </div>
          </div>

          {/* Usage Rules */}
          <div className="space-y-3 text-xs">
            <span className="text-mono-label uppercase text-ink-muted font-bold block">
              Facility Guidelines & Conduct Rules
            </span>

            <div className="space-y-1.5">
              {usageRules.map((rule, idx) => (
                <div
                  key={`${rule}-${idx}`}
                  className="p-2.5 bg-bone border border-line rounded-editorial flex items-center justify-between gap-3 shadow-xs"
                >
                  <span className="text-ink">
                    <strong className="text-ink-muted mr-1.5">{idx + 1}.</strong>
                    {rule}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRule(idx)}
                    className="p-1 text-ink-muted hover:text-danger rounded cursor-pointer"
                    title="Remove rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Input
                placeholder="Add rule (e.g. Vacuum aluminum shavings before check-out)..."
                value={newRuleInput}
                onChange={(e) => setNewRuleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddRule();
                  }
                }}
              />
              <Button variant="outline" size="md" onClick={handleAddRule}>
                Add Rule
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 7: FAIR-USE OVERRIDES                                   */}
      {/* ============================================================ */}
      {currentStepIndex === 6 && (
        <div className="bg-surface border border-line rounded-editorial p-6 space-y-6 shadow-xs animate-in fade-in duration-150">
          <div className="border-b border-line pb-2">
            <span className="text-mono-label uppercase text-ink-muted">Step 7 of 8</span>
            <h2 className="font-display text-2xl text-ink">Collegiate Fair-Use Load Balancers</h2>
          </div>

          <p className="text-xs text-ink-muted leading-relaxed">
            Prevent resource monopolization and ensure equitable access across academic departments.
            These parameters are mathematically audited during booking submission.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-bone border border-line rounded-editorial space-y-2">
              <label className="font-semibold text-ink block">Weekly Cap Per Borrower</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={40}
                  value={weeklyCapHours}
                  onChange={(e) => setWeeklyCapHours(Number(e.target.value))}
                />
                <span className="font-mono text-ink-muted">hours</span>
              </div>
              <span className="text-[10px] text-ink-muted block leading-snug">
                Borrowers cannot exceed this sum across 7 rolling days.
              </span>
            </div>

            <div className="p-4 bg-bone border border-line rounded-editorial space-y-2">
              <label className="font-semibold text-ink block">Max Active Bookings</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={maxActiveBookings}
                  onChange={(e) => setMaxActiveBookings(Number(e.target.value))}
                />
                <span className="font-mono text-ink-muted">slots</span>
              </div>
              <span className="text-[10px] text-ink-muted block leading-snug">
                Simultaneous future reservations allowed at one time.
              </span>
            </div>

            <div className="p-4 bg-bone border border-line rounded-editorial space-y-2">
              <label className="font-semibold text-ink block">Cooldown Between Sessions</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={72}
                  value={cooldownHours}
                  onChange={(e) => setCooldownHours(Number(e.target.value))}
                />
                <span className="font-mono text-ink-muted">hours</span>
              </div>
              <span className="text-[10px] text-ink-muted block leading-snug">
                Mandatory buffer before the same student can book again.
              </span>
            </div>

            <div className="p-4 bg-bone border border-line rounded-editorial space-y-2">
              <label className="font-semibold text-ink block">Consecutive Day Limit</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={7}
                  value={consecutiveDayLimit}
                  onChange={(e) => setConsecutiveDayLimit(Number(e.target.value))}
                />
                <span className="font-mono text-ink-muted">days</span>
              </div>
              <span className="text-[10px] text-ink-muted block leading-snug">
                Maximum back-to-back days allowed per project.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 8: PREVIEW & PUBLISH                                    */}
      {/* ============================================================ */}
      {currentStepIndex === 7 && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-surface border border-line rounded-editorial p-6 space-y-2 shadow-xs">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <div>
                <span className="text-mono-label uppercase text-ink-muted">Step 8 of 8</span>
                <h2 className="font-display text-2xl text-ink">Borrower Experience Live Preview</h2>
              </div>
              <Badge status="approved">
                Ready to Publish
              </Badge>
            </div>
            <p className="text-xs text-ink-muted">
              This is the exact view verified students will see on the campus directory.
            </p>
          </div>

          {/* User Preview Card Deck */}
          <div className="bg-surface border border-line rounded-editorial p-6 space-y-6 shadow-xs">
            {/* Header snippet */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photos[0] || SAMPLE_PHOTO_PRESETS[0].url}
                alt={title || "Resource preview"}
                className="w-full md:w-80 h-48 object-cover rounded-editorial border border-line"
              />

              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <Badge status="active">
                    {categoryLabel}
                  </Badge>
                  <span className="text-xs text-ink-muted">{building} • {room}</span>
                </div>

                <h3 className="font-display text-2xl text-ink">
                  {title || "Untitled Campus Resource"}
                </h3>

                <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
                  {description || "No description provided yet."}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                  <div className="p-2 bg-bone rounded border border-line/60">
                    <span className="text-[10px] text-ink-muted uppercase block">Rate</span>
                    <strong className="text-ink">{creditCostPerHour === 0 ? "Free" : `${creditCostPerHour} cr/hr`}</strong>
                  </div>
                  <div className="p-2 bg-bone rounded border border-line/60">
                    <span className="text-[10px] text-ink-muted uppercase block">Weekly Cap</span>
                    <strong className="text-ink">{weeklyCapHours}h max</strong>
                  </div>
                  <div className="p-2 bg-bone rounded border border-line/60">
                    <span className="text-[10px] text-ink-muted uppercase block">Lead Time</span>
                    <strong className="text-ink">{minNoticeHours}h</strong>
                  </div>
                  <div className="p-2 bg-bone rounded border border-line/60">
                    <span className="text-[10px] text-ink-muted uppercase block">Supervision</span>
                    <strong className="text-ink">{requiresSupervision ? "Required" : "Autonomous"}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="p-4 bg-bone border border-line rounded-editorial space-y-3 text-xs">
              <span className="font-semibold text-ink block">
                Required Prerequisite Checklist ({requirements.length})
              </span>
              <div className="space-y-1.5">
                {requirements.map((req) => (
                  <div key={req.id} className="flex items-center gap-2 text-ink">
                    <CheckCircle2 className="w-4 h-4 text-sage shrink-0" />
                    <span>{req.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wizard Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-line">
        <Button
          type="button"
          variant="outline"
          size="md"
          disabled={currentStepIndex === 0}
          onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Previous Step
        </Button>

        {currentStepIndex < WIZARD_STEPS_DEF.length - 1 ? (
          <Button
            type="button"
            variant="accent"
            size="md"
            onClick={() => setCurrentStepIndex((prev) => Math.min(WIZARD_STEPS_DEF.length - 1, prev + 1))}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Next: {WIZARD_STEPS_DEF[currentStepIndex + 1].title}
          </Button>
        ) : (
          <Button
            type="button"
            variant="accent"
            size="lg"
            isLoading={isSubmitting}
            onClick={handlePublish}
            leftIcon={<Check className="w-4 h-4" />}
          >
            {isEditMode ? "Save & Apply Changes" : "Publish to Campus Catalog"}
          </Button>
        )}
      </div>
    </div>
  );
}
