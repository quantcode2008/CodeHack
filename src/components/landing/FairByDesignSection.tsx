"use client";

import * as React from "react";
import {
  Scale,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function FairByDesignSection() {
  // Live Waitlist Score Interactive Simulation
  const [hasCapstoneCredit, setHasCapstoneCredit] = React.useState(true);
  const [hasCleanRecord, setHasCleanRecord] = React.useState(true);

  // Compute live score
  const baseSeniority = 20;
  const capstoneBonus = hasCapstoneCredit ? 30 : 0;
  const cleanBonus = hasCleanRecord ? 45 : 15;
  const recentUsageDeduction = -10;
  const totalScore = baseSeniority + capstoneBonus + cleanBonus + recentUsageDeduction;
  const rank = totalScore >= 80 ? 1 : totalScore >= 60 ? 2 : 4;

  return (
    <section
      id="fair-access"
      className="py-20 sm:py-32 bg-bone border-b border-line"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-16">
        {/* Section Title */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 text-mono-label uppercase text-terracotta font-bold tracking-wider">
            <span>Algorithmic Integrity</span>
          </div>
          <h2 className="font-display text-display-lg text-ink font-normal leading-tight tracking-tight">
            Fair by design. <br />
            <span className="italic text-terracotta">Not first-click races.</span>
          </h2>
          <p className="text-body text-ink-muted text-lg leading-relaxed">
            Campus resources are public collegiate goods. Commons replaces opaque faculty favors and 8:00 AM server crashes with transparent merit weights, weekly usage ceilings, and human-explained decisions.
          </p>
        </div>

        {/* ======================================================== */}
        {/* ASYMMETRIC BENTO GRID (12-COLUMN DESKTOP COMPOSITION)    */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tile 1: Usage Caps & Anti-Hoarding (Large 7 Cols) */}
          <div className="lg:col-span-7 bg-surface border border-line rounded-editorial p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs hover:border-ink/20 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-editorial bg-bone border border-line flex items-center justify-center text-terracotta">
                    <Scale className="w-4 h-4" />
                  </span>
                  <span className="text-mono-label uppercase tracking-wider text-ink-muted">
                    Fair-Use Quotas
                  </span>
                </div>
                <Badge status="active" showDot={false}>Rule 01</Badge>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-display text-2xl sm:text-3xl text-ink font-normal leading-snug">
                  8-Hour Weekly Fair Quota
                </h3>
                <p className="text-small text-ink-muted leading-relaxed">
                  No single research group or senior can monopolize scarce machinery. Every student receives an 8.0-hour weekly cap per equipment category with mandatory Monday 00:00 resets.
                </p>
              </div>

              {/* Real UI Fragment: Quiet Usage Progress Bar */}
              <div className="p-4 bg-bone/70 border border-line rounded-editorial space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-ink">
                    Rapid Fabrication Category Quota
                  </span>
                  <span className="font-mono font-bold text-terracotta">
                    5.5h / 8.0h consumed
                  </span>
                </div>

                <div className="w-full h-2.5 bg-surface border border-line rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-terracotta rounded-full transition-all duration-500"
                    style={{ width: "68%" }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-ink-muted">
                  <span>Reset in 2 days</span>
                  <span className="text-success font-medium">
                    2.5h remaining this week
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 text-xs text-ink-muted flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <span>Consecutive-day ceiling: max 2 straight days per scarce asset</span>
            </div>
          </div>

          {/* Tile 2: Transparent Waitlist with Live Score (5 Cols) */}
          <div className="lg:col-span-5 bg-surface border border-line rounded-editorial p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs hover:border-ink/20 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-editorial bg-bone border border-line flex items-center justify-center text-terracotta">
                    <Award className="w-4 h-4" />
                  </span>
                  <span className="text-mono-label uppercase tracking-wider text-ink-muted">
                    Open Algorithm
                  </span>
                </div>
                <div className="px-2 py-0.5 rounded bg-terracotta/10 border border-terracotta/20 text-mono-label text-terracotta font-bold">
                  Queue Rank: #{rank}
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-display text-2xl text-ink font-normal leading-snug">
                  Transparent Waitlist Score
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Never wonder why another student got the slot. Inspect your live priority score breakdown in full daylight.
                </p>
              </div>

              {/* Interactive Live Score Card */}
              <div className="p-4 bg-bone/70 border border-line rounded-editorial space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-ink border-b border-line/60 pb-1.5">
                  <span className="text-ink-muted">Base Seniority (Year 3)</span>
                  <span className="font-mono font-semibold">+{baseSeniority} pts</span>
                </div>

                <div className="flex justify-between items-center text-ink border-b border-line/60 pb-1.5">
                  <span className="text-ink-muted">Course Capstone Bonus</span>
                  <button
                    type="button"
                    onClick={() => setHasCapstoneCredit(!hasCapstoneCredit)}
                    className="font-mono font-semibold text-terracotta hover:underline cursor-pointer"
                  >
                    +{capstoneBonus} pts {hasCapstoneCredit ? "✓" : "(off)"}
                  </button>
                </div>

                <div className="flex justify-between items-center text-ink border-b border-line/60 pb-1.5">
                  <span className="text-ink-muted">0 No-Shows Track Record</span>
                  <button
                    type="button"
                    onClick={() => setHasCleanRecord(!hasCleanRecord)}
                    className="font-mono font-semibold text-success hover:underline cursor-pointer"
                  >
                    +{cleanBonus} pts {hasCleanRecord ? "✓" : "(late)"}
                  </button>
                </div>

                <div className="flex justify-between items-center text-ink border-b border-line/60 pb-1.5">
                  <span className="text-ink-muted">Recent Usage Velocity</span>
                  <span className="font-mono text-danger font-semibold">
                    {recentUsageDeduction} pts
                  </span>
                </div>

                <div className="pt-1 flex justify-between items-center font-bold text-sm text-ink">
                  <span>Effective Score</span>
                  <span className="font-mono text-terracotta text-base">
                    {totalScore} / 100
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-ink-muted italic">
              Click priority criteria above to test live priority recalibration.
            </p>
          </div>

          {/* Tile 3: Explainable Decisions (5 Cols) */}
          <div className="lg:col-span-5 bg-surface border border-line rounded-editorial p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs hover:border-ink/20 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-editorial bg-bone border border-line flex items-center justify-center text-terracotta">
                    <HelpCircle className="w-4 h-4" />
                  </span>
                  <span className="text-mono-label uppercase tracking-wider text-ink-muted">
                    No Black Boxes
                  </span>
                </div>
                <Badge status="active" showDot={false}>Rule 03</Badge>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-display text-2xl text-ink font-normal leading-snug">
                  Explainable Decisions
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  No silent drops. If a reservation is rejected or modified, the lab custodian must provide a substantive written explanation.
                </p>
              </div>

              {/* Sample Decision Excerpt */}
              <div className="p-4 bg-bone/70 border border-line rounded-editorial space-y-2">
                <div className="flex items-center gap-2 text-[11px]">
                  <Badge status="rejected">Actionable Rejection</Badge>
                  <span className="text-ink-muted">CNC Mill #2</span>
                </div>
                <p className="text-xs text-ink/90 italic leading-relaxed border-l-2 border-danger pl-2">
                  &ldquo;Prerequisite missing: CNC Level 2 G-Code certification expired Oct 15. Renew with Prof. Adler in Room 104 to unlock this slot.&rdquo;
                </p>
              </div>
            </div>

            <div className="text-xs text-ink-muted flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-terracotta shrink-0" />
              <span>Provides clear next steps rather than a dead end.</span>
            </div>
          </div>

          {/* Tile 4: Human-in-the-Loop Custody (Large 7 Cols) */}
          <div className="lg:col-span-7 bg-surface border border-line rounded-editorial p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs hover:border-ink/20 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-editorial bg-bone border border-line flex items-center justify-center text-terracotta">
                    <UserCheck className="w-4 h-4" />
                  </span>
                  <span className="text-mono-label uppercase tracking-wider text-ink-muted">
                    Physical Reality
                  </span>
                </div>
                <Badge status="active" showDot={false}>Rule 04</Badge>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-display text-2xl sm:text-3xl text-ink font-normal leading-snug">
                  Human-in-the-Loop Custody
                </h3>
                <p className="text-small text-ink-muted leading-relaxed">
                  Software coordinates, but humans sign off. Physical lab monitors and student borrowers inspect equipment together with condition photos, protecting both sides from false damage claims.
                </p>
              </div>

              {/* Dual Inspection Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-bone/70 border border-line rounded-editorial space-y-1">
                  <strong className="text-ink block font-semibold">
                    1. Arrival Hand-off
                  </strong>
                  <p className="text-ink-muted leading-relaxed text-[11px]">
                    Borrower photographs lens/bed/switch condition upon arrival. Pre-existing marks are permanently cataloged.
                  </p>
                </div>
                <div className="p-3 bg-bone/70 border border-line rounded-editorial space-y-1">
                  <strong className="text-ink block font-semibold">
                    2. Check-out Verification
                  </strong>
                  <p className="text-ink-muted leading-relaxed text-[11px]">
                    Monitor inspects returned tooling and releases deposit hold. Clean returns earn priority standing.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 text-xs text-ink-muted flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <span>Zero hidden liabilities · 100% mutual trust verification</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

