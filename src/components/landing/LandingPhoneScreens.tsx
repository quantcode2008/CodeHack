"use client";

import * as React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Camera,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  UserCheck,
  Award,
  Hash,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

/**
 * Screen 1: Resource Listing Detail
 */
export function ScreenListingDetail() {
  return (
    <div className="flex flex-col h-full justify-between space-y-3 pt-6 pb-2 text-ink">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            Fab Lab 04 · South Wing
          </span>
          <Badge status="active" showDot={false}>Available</Badge>
        </div>

        <div className="space-y-1">
          <h3 className="font-display text-xl text-ink leading-tight">
            Markforged Metal X
          </h3>
          <p className="text-[11px] text-ink-muted leading-snug">
            Atomic diffusion metal 3D printing in 17-4 PH stainless steel and copper.
          </p>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-surface p-2.5 rounded-editorial border border-line">
          <div>
            <span className="text-[9px] text-ink-muted block uppercase">Precision</span>
            <strong className="text-ink font-semibold">50μm Layer</strong>
          </div>
          <div>
            <span className="text-[9px] text-ink-muted block uppercase">Max Slot</span>
            <strong className="text-ink font-semibold">4.0 Hours</strong>
          </div>
          <div>
            <span className="text-[9px] text-ink-muted block uppercase">Cost</span>
            <strong className="text-terracotta font-semibold">Free to EIT</strong>
          </div>
          <div>
            <span className="text-[9px] text-ink-muted block uppercase">Notice</span>
            <strong className="text-ink font-semibold">2h Advance</strong>
          </div>
        </div>

        {/* Eligibility Pill */}
        <div className="p-2 bg-sage-light border border-sage/40 rounded-editorial flex items-center gap-2 text-[10px]">
          <ShieldCheck className="w-3.5 h-3.5 text-sage-dark shrink-0" />
          <span className="text-ink font-medium">
            Prerequisite: Metal Induction Level 2 (Verified)
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-line">
        <button
          type="button"
          className="w-full py-2.5 bg-ink text-surface hover:bg-terracotta transition-colors rounded-editorial text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
        >
          <span>Select 14:00 - 16:30 Today</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

/**
 * Screen 2: Booking Approval with Human Explanation
 */
export function ScreenBookingApproval() {
  return (
    <div className="flex flex-col h-full justify-between space-y-3 pt-6 pb-2 text-ink">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            Request #BK-4920
          </span>
          <Badge status="approved">Approved</Badge>
        </div>

        <div className="space-y-0.5">
          <h3 className="font-display text-xl text-ink leading-tight">
            Epilog Laser 60W
          </h3>
          <p className="text-[11px] text-ink-muted">
            Today · 14:00 – 16:30 (2.5 hrs)
          </p>
        </div>

        {/* Human Custodian Review Note Box */}
        <div className="p-3 bg-surface border border-line rounded-editorial space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-bone border border-line flex items-center justify-center font-display text-[10px] text-terracotta font-bold">
              KR
            </div>
            <div>
              <span className="text-[11px] font-semibold text-ink block leading-none">
                Dr. Kavitha Rao
              </span>
              <span className="text-[9px] text-ink-muted">Lab Director</span>
            </div>
          </div>
          <p className="text-[11px] text-ink/90 italic leading-relaxed border-l-2 border-terracotta pl-2">
            &ldquo;Laser safety certification verified. Slotted for 14:00 today. Please bring approved OD5+ safety goggles.&rdquo;
          </p>
        </div>

        {/* Access Code Pill */}
        <div className="p-2.5 bg-bone border border-line rounded-editorial text-center space-y-1">
          <span className="text-[9px] uppercase tracking-wider text-ink-muted block">
            Digital Entry Key
          </span>
          <span className="font-mono text-sm tracking-widest font-bold text-ink">
            EIT-884-FL4
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-line">
        <div className="w-full py-2 bg-bone border border-line rounded-editorial text-[11px] font-medium text-ink flex items-center justify-center gap-1.5">
          <Clock className="w-3 h-3 text-terracotta" />
          <span>Window starts in 38 mins</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Screen 3: Condition Check-in Report
 */
export function ScreenConditionCheckin() {
  return (
    <div className="flex flex-col h-full justify-between space-y-3 pt-6 pb-2 text-ink">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            Arrival Check-in
          </span>
          <Badge status="active">Checked In</Badge>
        </div>

        <div className="space-y-0.5">
          <h3 className="font-display text-lg text-ink leading-tight">
            Sony FX6 Cinema Kit
          </h3>
          <p className="text-[10px] text-ink-muted flex items-center gap-1">
            <Clock className="w-3 h-3 text-terracotta" />
            <span>Recorded 14:02:18 EST</span>
          </p>
        </div>

        {/* Condition Photo Fragment */}
        <div className="border border-line rounded-editorial bg-surface overflow-hidden p-2 space-y-2">
          <div className="relative h-24 bg-bone/80 border border-line/60 rounded-md flex flex-col items-center justify-center text-ink-muted text-center p-2">
            <Camera className="w-5 h-5 text-terracotta mb-1" />
            <span className="text-[10px] font-medium text-ink">
              Sensor & Lens Mount Photo #1
            </span>
            <span className="text-[8px] font-mono text-ink-muted">
              SHA256: 8f02...e319
            </span>
          </div>

          <div className="space-y-1 text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-ink-muted">Overall Condition:</span>
              <strong className="text-success font-semibold">Good (Verified)</strong>
            </div>
            <div className="text-[9px] text-ink-muted italic">
              Note: &ldquo;Minor mounting rail scuff pre-existing. Optics pristine.&rdquo;
            </div>
          </div>
        </div>

        {/* Chain of Custody Stamp */}
        <div className="p-2 bg-bone border border-line rounded-editorial flex items-center gap-2 text-[10px]">
          <ShieldCheck className="w-3.5 h-3.5 text-terracotta shrink-0" />
          <span className="text-ink font-medium">
            Custody legally transferred to Aanya Patel
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-line">
        <div className="text-[9px] text-center text-ink-muted font-mono">
          Immutable audit record: #REC-2026-904
        </div>
      </div>
    </div>
  );
}

/**
 * Screen 4: Qualification & Eligibility Match
 */
export function ScreenEligibilityCheck() {
  return (
    <div className="flex flex-col h-full justify-between space-y-3 pt-6 pb-2 text-ink">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            Access Evaluation
          </span>
          <Badge status="verified">Verified</Badge>
        </div>

        <div className="space-y-0.5">
          <h3 className="font-display text-xl text-ink leading-tight">
            CNC 5-Axis Milling Suite
          </h3>
          <p className="text-[11px] text-ink-muted">
            High-precision machining center
          </p>
        </div>

        <div className="space-y-2">
          <span className="text-[9px] font-bold uppercase tracking-wider text-ink-muted block">
            Prerequisites Checklist
          </span>

          <div className="space-y-1.5 text-[11px]">
            <div className="p-2 bg-surface border border-line rounded-editorial flex items-center justify-between">
              <span className="font-medium">Basic Workshop Induction</span>
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            </div>
            <div className="p-2 bg-surface border border-line rounded-editorial flex items-center justify-between">
              <span className="font-medium">CNC G-Code Certification</span>
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            </div>
            <div className="p-2 bg-surface border border-line rounded-editorial flex items-center justify-between">
              <span className="font-medium">Liability Waiver (2026)</span>
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            </div>
          </div>
        </div>

        <div className="p-2.5 bg-sage-light border border-sage/40 rounded-editorial text-center">
          <span className="text-[11px] font-semibold text-ink block">
            All 3 Prerequisites Fulfilled
          </span>
          <span className="text-[9px] text-ink-muted">
            Instant booking request clearance unlocked
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-line">
        <button
          type="button"
          className="w-full py-2 bg-terracotta text-surface rounded-editorial text-xs font-semibold flex items-center justify-center gap-1.5"
        >
          <span>Continue to Purpose Declaration</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

/**
 * Screen 5: Return & Audit History
 */
export function ScreenReturnHistory() {
  return (
    <div className="flex flex-col h-full justify-between space-y-3 pt-6 pb-2 text-ink">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            Journey Completed
          </span>
          <Badge status="returned">Returned</Badge>
        </div>

        <div className="space-y-0.5">
          <h3 className="font-display text-xl text-ink leading-tight">
            Return Verified
          </h3>
          <p className="text-[11px] text-ink-muted">
            Markforged Metal X · Fab Lab 04
          </p>
        </div>

        {/* Summary Card */}
        <div className="bg-surface border border-line rounded-editorial p-3 space-y-2 text-[11px]">
          <div className="flex justify-between border-b border-line/60 pb-1.5">
            <span className="text-ink-muted">Return Timestamp</span>
            <strong>16:28:40 EST (On-Time)</strong>
          </div>
          <div className="flex justify-between border-b border-line/60 pb-1.5">
            <span className="text-ink-muted">Post-Use Condition</span>
            <strong className="text-success font-semibold">Excellent</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Custody Inspector</span>
            <strong>Imran Syed (Manager)</strong>
          </div>
        </div>

        {/* Audit Hash Block */}
        <div className="p-2.5 bg-bone border border-line rounded-editorial space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase text-ink-muted">
              Audit Block Sealed
            </span>
            <Hash className="w-3 h-3 text-terracotta" />
          </div>
          <p className="font-mono text-[9px] text-ink-muted truncate">
            0x4b9a11...f89e2c (Immutable Postgres RPC)
          </p>
        </div>
      </div>

      <div className="pt-2 border-t border-line">
        <div className="p-2 bg-sage-light border border-sage/40 rounded-editorial text-center text-[10px] font-medium text-ink">
          Standing preserved: 0 no-shows · 1.25x priority maintained
        </div>
      </div>
    </div>
  );
}

