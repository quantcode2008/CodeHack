"use client";

import * as React from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  Eye,
  ArrowRight,
  Coins,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { type CampusResource } from "@/lib/resources/data";
import { type EligibilityResult } from "@/lib/resources/service";
import { cn } from "@/lib/utils";

interface ResourceCardProps {
  resource: CampusResource;
  eligibility?: EligibilityResult;
  isLoggedIn?: boolean;
}

export function ResourceCard({
  resource,
  eligibility,
  isLoggedIn = true,
}: ResourceCardProps) {
  const isEligible = eligibility?.isEligible ?? false;
  const chipLabel = eligibility?.primaryChipLabel ?? "Sign in to check eligibility";

  return (
    <article className="group bg-surface border border-line rounded-editorial overflow-hidden shadow-xs hover:border-ink/25 hover:shadow-editorial transition-all flex flex-col justify-between">
      <div>
        {/* Large Editorial Photo Container */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-bone overflow-hidden border-b border-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resource.photos[0]}
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
            loading="lazy"
          />

          {/* Top Badges Overlay */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none">
            <span className="px-2.5 py-1 rounded-md bg-surface/90 backdrop-blur-md border border-line text-[11px] font-semibold text-ink shadow-xs">
              {resource.categoryLabel}
            </span>

            {resource.requiresSupervision ? (
              <span className="px-2 py-0.5 rounded-md bg-[#FDF9EE]/95 border border-warning/40 text-[10px] font-semibold text-[#8C6114] shadow-xs flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-warning" />
                Monitored
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-bone/90 border border-line text-[10px] font-semibold text-ink-muted shadow-xs">
                Solo Access
              </span>
            )}
          </div>

          {/* Bottom Cost & Slot Strip */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-mono pointer-events-none">
            <span className="px-2 py-0.5 rounded bg-ink/80 text-surface backdrop-blur-sm">
              {resource.creditCostPerHour === 0
                ? "Free to EIT"
                : `${resource.creditCostPerHour} cr/hr`}
            </span>

            <span className="px-2 py-0.5 rounded bg-surface/90 text-ink backdrop-blur-sm border border-line flex items-center gap-1">
              <Clock className="w-3 h-3 text-terracotta" />
              <span>{resource.nextAvailableSlot.split(",")[0]}</span>
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5 space-y-3">
          {/* Title in Serif */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <MapPin className="w-3.5 h-3.5 text-terracotta shrink-0" />
              <span className="truncate">{resource.locationText}</span>
            </div>

            <Link href={`/resources/${resource.slug}`} className="block group-hover:text-terracotta transition-colors">
              <h3 className="font-display text-xl sm:text-2xl text-ink font-normal leading-tight tracking-tight">
                {resource.title}
              </h3>
            </Link>
          </div>

          <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
            {resource.description}
          </p>

          {/* Specs Micro-pill */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-ink-muted">
            <span className="px-2 py-0.5 rounded bg-bone border border-line/60">
              Max {resource.maxBookingHours}h slot
            </span>
            <span className="px-2 py-0.5 rounded bg-bone border border-line/60">
              {resource.capacity} person limit
            </span>
            {resource.depositAmount > 0 && (
              <span className="px-2 py-0.5 rounded bg-bone border border-line/60">
                ${resource.depositAmount} hold
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: Eligibility Chip & Action */}
      <div className="p-4 sm:p-5 pt-0 border-t border-line/50 mt-2 flex items-center justify-between gap-3 text-xs">
        {/* Dynamic Eligibility Chip */}
        {!isLoggedIn ? (
          <Link
            href={`/login?redirectTo=/resources/${resource.slug}`}
            className="inline-flex items-center gap-1.5 text-ink-muted hover:text-terracotta transition-colors font-medium text-[11px]"
          >
            <Lock className="w-3.5 h-3.5 text-ink-muted" />
            <span>Sign in to verify access</span>
          </Link>
        ) : isEligible ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success-light border border-success/30 text-success text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-success shrink-0" />
            <span>You&apos;re Eligible</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-warning-light border border-warning/30 text-[#8C6114] text-[11px] font-medium max-w-[200px] truncate" title={chipLabel}>
            <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
            <span className="truncate">{chipLabel}</span>
          </div>
        )}

        <Link
          href={`/resources/${resource.slug}`}
          className="inline-flex items-center gap-1 font-semibold text-small text-ink group-hover:text-terracotta transition-colors shrink-0"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </article>
  );
}

