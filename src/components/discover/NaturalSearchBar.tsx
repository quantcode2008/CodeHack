"use client";

import * as React from "react";
import { Search, Sparkles, X, ArrowRight, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface NaturalSearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
  intentSummary?: string;
}

const SAMPLE_PROMPTS = [
  "I need a camera for a short film on Saturday",
  "Laser cutter for acrylic capstone",
  "Soundproof podcast room",
  "Prusa 3D printer for fast prototyping",
  "Oscilloscope bench in Maxwell Tower",
];

export function NaturalSearchBar({
  value,
  onChange,
  onClear,
  intentSummary,
}: NaturalSearchBarProps) {
  return (
    <div className="space-y-3">
      {/* Search Input Box */}
      <div className="relative flex items-center bg-surface border border-line rounded-editorial shadow-xs focus-within:border-terracotta focus-within:ring-2 focus-within:ring-terracotta/20 transition-all p-1.5 sm:p-2">
        <div className="pl-3 pr-2 text-ink-muted">
          <Search className="w-5 h-5 text-terracotta shrink-0" />
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by name, lab, or describe your project (e.g. 'I need a camera for a short film on Saturday')..."
          className="w-full bg-transparent text-body text-ink placeholder:text-ink-muted/60 focus:outline-none py-1.5 px-2 text-sm sm:text-base font-medium"
        />

        {value && (
          <button
            type="button"
            onClick={onClear}
            className="p-1.5 text-ink-muted hover:text-ink hover:bg-bone rounded-full transition-colors mr-1"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-bone border border-line rounded-md text-[11px] font-mono text-ink-muted shrink-0">
          <Sparkles className="w-3 h-3 text-terracotta" />
          <span>Natural Language</span>
        </div>
      </div>

      {/* Inferred Intent Pill (if natural language was matched) */}
      {intentSummary && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-terracotta/10 border border-terracotta/20 text-xs text-ink font-medium">
          <Sparkles className="w-3.5 h-3.5 text-terracotta shrink-0" />
          <span className="text-terracotta font-semibold">Understood:</span>
          <span className="text-ink-muted">{intentSummary}</span>
        </div>
      )}

      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-mono-label uppercase text-ink-muted shrink-0">
          Try asking:
        </span>
        {SAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onChange(prompt)}
            className="px-2.5 py-1 rounded-full bg-bone hover:bg-surface border border-line hover:border-terracotta/40 text-ink-muted hover:text-ink transition-colors whitespace-nowrap cursor-pointer text-[11px]"
          >
            &ldquo;{prompt}&rdquo;
          </button>
        ))}
      </div>
    </div>
  );
}

