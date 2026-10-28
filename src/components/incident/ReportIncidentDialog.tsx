"use client";

import * as React from "react";
import {
  AlertOctagon,
  Camera,
  Trash2,
  Image as ImageIcon,
  ShieldAlert,
  Info,
} from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useIncidents } from "@/context/IncidentContext";
import { useAuth } from "@/context/AuthContext";
import { compressImage, SAMPLE_INSPECTION_PHOTOS } from "@/lib/condition/compressor";
import { type IncidentType, type IncidentSeverity } from "@/lib/supabase/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReportIncidentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resourceId: string;
  resourceTitle: string;
  resourceSlug: string;
  resourceLocation: string;
  resourcePhoto?: string;
  bookingId?: string;
}

export function ReportIncidentDialog({
  isOpen,
  onClose,
  resourceId,
  resourceTitle,
  resourceSlug,
  resourceLocation,
  resourcePhoto,
  bookingId,
}: ReportIncidentDialogProps) {
  const { user, roleTitle } = useAuth();
  const { reportIncident } = useIncidents();

  const [type, setType] = React.useState<IncidentType>("damage");
  const [severity, setSeverity] = React.useState<IncidentSeverity>("low");
  const [description, setDescription] = React.useState("");
  const [photos, setPhotos] = React.useState<{ url: string; sizeKb: number; label: string }[]>([]);
  const [isCompressing, setIsCompressing] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > 4) {
      toast.error("Maximum 4 incident photos allowed.");
      return;
    }

    setIsCompressing(true);
    try {
      const newPhotos: { url: string; sizeKb: number; label: string }[] = [];
      for (let i = 0; i < files.length; i++) {
        const compressed = await compressImage(files[i], 1280, 1280, 0.78);
        newPhotos.push({
          url: compressed.dataUrl,
          sizeKb: compressed.sizeKb,
          label: `Incident photo (${compressed.timestamp})`,
        });
      }
      setPhotos((prev) => [...prev, ...newPhotos]);
      toast.success(`Attached ${newPhotos.length} photo(s)`);
    } catch {
      toast.error("Error compressing incident image");
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddSamplePhoto = () => {
    if (photos.length >= 4) {
      toast.error("Maximum 4 photos reached.");
      return;
    }

    const sampleCategory = resourceSlug.includes("laser")
      ? SAMPLE_INSPECTION_PHOTOS.laser.damaged
      : resourceSlug.includes("camera")
      ? SAMPLE_INSPECTION_PHOTOS.camera.damaged
      : SAMPLE_INSPECTION_PHOTOS.printer.damaged;

    const sampleItem = sampleCategory[photos.length % sampleCategory.length];
    setPhotos((prev) => [
      ...prev,
      {
        url: sampleItem.url,
        sizeKb: 145,
        label: sampleItem.label,
      },
    ]);
    toast.success("Attached sample damage photo");
  };

  const handleSubmit = async () => {
    if (!description.trim() || description.trim().length < 8) {
      toast.error("Please provide a detailed description (minimum 8 characters).");
      return;
    }

    setIsSubmitting(true);
    await reportIncident({
      bookingId,
      resourceId,
      resourceTitle,
      resourceSlug,
      resourceLocation,
      resourcePhoto,
      reportedBy: user?.id || "11111111-1111-1111-1111-111111111111",
      reportedByName: user?.fullName || "Aanya Patel",
      reportedByRole: (user?.role as any) || "student",
      reportedByEmail: user?.email || "aanya@eastbrook.edu",
      type,
      severity,
      description,
      photos: photos.map((p) => p.url),
    });

    setIsSubmitting(false);
    setDescription("");
    setPhotos([]);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Report Incident / Maintenance Notice"
      description={`Disclose damage, malfunction, or delay for ${resourceTitle}.`}
    >
      <div className="space-y-4 pt-2 text-ink text-xs">
        {/* Resource Reference Banner */}
        <div className="p-3 bg-bone/70 border border-line rounded-editorial flex items-center justify-between">
          <div>
            <span className="text-[10px] text-ink-muted uppercase block">Subject Resource</span>
            <strong className="text-ink text-small block">{resourceTitle}</strong>
          </div>
          {bookingId && (
            <span className="text-[10px] font-mono text-terracotta bg-terracotta/10 px-2 py-0.5 rounded border border-terracotta/20">
              Ref: {bookingId}
            </span>
          )}
        </div>

        {/* Category & Severity Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-mono-label uppercase text-ink-muted font-bold block">
              Incident Classification
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as IncidentType)}
              aria-label="Incident Classification"
              className="w-full px-3 py-2 bg-bone/50 border border-line rounded-editorial text-xs text-ink focus:outline-none focus:ring-1 focus:ring-terracotta min-h-[44px]"
            >
              <option value="damage">Material Damage / Component Broken</option>
              <option value="delay">Unforeseen Schedule Delay</option>
              <option value="safety">Safety Interlock / Fume Notice</option>
              <option value="misuse">Prior User Misuse Discovered</option>
              <option value="conflict">Double-Booking / Room Access Conflict</option>
              <option value="other">General Maintenance Request</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-mono-label uppercase text-ink-muted font-bold block">
              Estimated Severity
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
              aria-label="Estimated Severity"
              className="w-full px-3 py-2 bg-bone/50 border border-line rounded-editorial text-xs text-ink focus:outline-none focus:ring-1 focus:ring-terracotta min-h-[44px]"
            >
              <option value="low">Low (Cosmetic, doesn&apos;t halt machine)</option>
              <option value="medium">Medium (Part replacement needed soon)</option>
              <option value="high">High (Machine offline until technician visits)</option>
              <option value="critical">Critical (Immediate safety risk / lock required)</option>
            </select>
          </div>
        </div>

        {/* Description Field */}
        <div className="space-y-1">
          <label className="text-mono-label uppercase text-ink-muted font-bold block">
            Incident Description & Context
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain what occurred, strange sounds, optical blemishes, or temperature anomalies..."
            rows={3}
            className="text-xs"
          />
        </div>

        {/* Photo Upload Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-mono-label uppercase text-ink-muted font-bold block">
              Evidence Photos ({photos.length}/4)
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
              onClick={handleAddSamplePhoto}
              className="w-full text-xs border border-line bg-bone/40 hover:bg-bone min-h-[44px]"
            >
              Add Sample Photo
            </Button>
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-4 gap-2 pt-1">
              {photos.map((p, idx) => (
                <div key={idx} className="relative rounded border border-line overflow-hidden bg-surface group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={`Evidence ${idx + 1}`} className="w-full h-16 object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 p-1 bg-ink/80 text-white rounded-full hover:bg-danger transition-colors min-h-[24px] min-w-[24px] flex items-center justify-center"
                    title="Remove"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="p-3 bg-surface border border-line rounded-editorial flex items-start gap-2.5 text-[11px] text-ink-muted">
          <Info className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
          <span>
            Transparent disclosure protects your campus standing score. This report will be logged to the immutable audit ledger and dispatched to lab management.
          </span>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            isLoading={isSubmitting}
            onClick={handleSubmit}
            className="min-h-[44px] px-4"
          >
            Submit Incident Report
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
