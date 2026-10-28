"use client";

import * as React from "react";
import {
  SlidersHorizontal,
  RotateCcw,
  CheckCircle2,
  Building2,
  Layers,
  GraduationCap,
  ShieldAlert,
  Coins,
  ShieldCheck,
} from "lucide-react";
import { type ResourceCategory } from "@/lib/supabase/types";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface FilterState {
  category: ResourceCategory | "all";
  building: string | "all";
  requiresTraining: "all" | "yes" | "no";
  supervision: "all" | "unsupervised" | "supervised";
  creditCost: "all" | "free" | "under_10";
  onlyEligible: boolean;
}

interface FilterRailProps {
  filters: FilterState;
  onChange: (updated: Partial<FilterState>) => void;
  onReset: () => void;
  activeCount: number;
  className?: string;
}

const CATEGORIES: { id: ResourceCategory | "all"; label: string }[] = [
  { id: "all", label: "All Categories" },
  { id: "device", label: "Devices & Cameras" },
  { id: "equipment", label: "Heavy Equipment & CNC" },
  { id: "space", label: "Rooms & Studios" },
  { id: "tool", label: "Precision Hand Tools" },
];

const BUILDINGS = [
  "all",
  "East Engineering Wing",
  "Maxwell Tower",
  "Central Library",
  "Media Arts Center",
  "Building C High Bay",
];

export function FilterRail({
  filters,
  onChange,
  onReset,
  activeCount,
  className,
}: FilterRailProps) {
  return (
    <aside
      aria-label="Search filter controls"
      className={cn("space-y-6 text-ink", className)}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-terracotta" />
          <h2 className="font-semibold text-small uppercase tracking-wider text-ink">
            Filter Results
          </h2>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-terracotta text-surface text-[10px] font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-ink-muted hover:text-terracotta flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* 1. "I'm Eligible" Toggle Box */}
      <div className="p-3.5 bg-sage-light border border-sage/40 rounded-editorial space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sage-dark shrink-0" />
            <span className="font-semibold text-small text-ink">
              Only Show Eligible
            </span>
          </div>
          <Switch
            checked={filters.onlyEligible}
            onCheckedChange={(checked: boolean) => onChange({ onlyEligible: checked })}
          />
        </div>
        <p className="text-[11px] text-ink-muted leading-relaxed">
          Matches your uploaded safety certifications and course enrollment status in real time.
        </p>
      </div>

      {/* 2. Category Selector */}
      <div className="space-y-2">
        <label className="text-mono-label uppercase text-ink-muted font-bold block">
          Resource Category
        </label>
        <div className="flex flex-col space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChange({ category: cat.id })}
              className={cn(
                "px-3 py-2 text-xs font-medium rounded-editorial text-left transition-colors flex items-center justify-between cursor-pointer",
                filters.category === cat.id
                  ? "bg-surface font-semibold text-ink border border-line shadow-xs"
                  : "text-ink-muted hover:text-ink hover:bg-bone"
              )}
            >
              <span>{cat.label}</span>
              {filters.category === cat.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Building / Campus Zone */}
      <div className="space-y-2">
        <label className="text-mono-label uppercase text-ink-muted font-bold block">
          Campus Building
        </label>
        <select
          value={filters.building}
          onChange={(e) => onChange({ building: e.target.value })}
          className="w-full h-10 px-3 bg-surface border border-line rounded-editorial text-xs text-ink focus:outline-none focus:border-terracotta"
        >
          {BUILDINGS.map((b) => (
            <option key={b} value={b}>
              {b === "all" ? "All Campus Quadrangles" : b}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Training Requirement */}
      <div className="space-y-2">
        <label className="text-mono-label uppercase text-ink-muted font-bold block">
          Prerequisite Training
        </label>
        <div className="grid grid-cols-3 gap-1 bg-bone p-1 border border-line rounded-editorial text-[11px]">
          {[
            { id: "all", label: "All" },
            { id: "no", label: "No Cert" },
            { id: "yes", label: "Training" },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ requiresTraining: opt.id as any })}
              className={cn(
                "py-1.5 rounded-md font-medium transition-all text-center cursor-pointer",
                filters.requiresTraining === opt.id
                  ? "bg-surface text-ink font-semibold shadow-xs"
                  : "text-ink-muted hover:text-ink"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Supervision Requirement */}
      <div className="space-y-2">
        <label className="text-mono-label uppercase text-ink-muted font-bold block">
          Supervision
        </label>
        <div className="grid grid-cols-3 gap-1 bg-bone p-1 border border-line rounded-editorial text-[11px]">
          {[
            { id: "all", label: "All" },
            { id: "unsupervised", label: "Solo" },
            { id: "supervised", label: "Monitored" },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ supervision: opt.id as any })}
              className={cn(
                "py-1.5 rounded-md font-medium transition-all text-center cursor-pointer",
                filters.supervision === opt.id
                  ? "bg-surface text-ink font-semibold shadow-xs"
                  : "text-ink-muted hover:text-ink"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6. Credit Cost */}
      <div className="space-y-2">
        <label className="text-mono-label uppercase text-ink-muted font-bold block">
          Usage Cost
        </label>
        <div className="grid grid-cols-3 gap-1 bg-bone p-1 border border-line rounded-editorial text-[11px]">
          {[
            { id: "all", label: "All" },
            { id: "free", label: "Free $0" },
            { id: "under_10", label: "< 10 cr" },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ creditCost: opt.id as any })}
              className={cn(
                "py-1.5 rounded-md font-medium transition-all text-center cursor-pointer",
                filters.creditCost === opt.id
                  ? "bg-surface text-ink font-semibold shadow-xs"
                  : "text-ink-muted hover:text-ink"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

