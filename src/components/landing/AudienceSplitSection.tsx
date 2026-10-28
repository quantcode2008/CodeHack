"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  Award,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export function AudienceSplitSection() {
  return (
    <section
      id="for-owners"
      className="py-20 sm:py-32 bg-bone border-b border-line"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-16">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-mono-label uppercase text-terracotta font-bold tracking-wider">
            <span>Two Sides of the Quad</span>
          </div>
          <h2 className="font-display text-display-lg text-ink font-normal leading-tight tracking-tight">
            Built for those who protect, <br />
            and those who create.
          </h2>
          <p className="text-body text-ink-muted text-lg leading-relaxed">
            High-trust sharing requires honoring the distinct needs of lab directors safeguarding equipment and students pushing the boundaries of research.
          </p>
        </div>

        {/* 2-Column Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Column 1: For Owners (Authoritative, Calm, Risk-Mitigating) */}
          <div className="bg-surface border border-line rounded-editorial p-8 sm:p-10 flex flex-col justify-between space-y-8 shadow-xs hover:border-ink/20 transition-all">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-mono-label uppercase text-terracotta font-bold tracking-wider">
                  For Lab Directors & Custodians
                </span>
                <h3 className="font-display text-3xl sm:text-4xl text-ink font-normal leading-tight">
                  Total governance. <br />
                  Zero damage liability.
                </h3>
                <p className="text-small text-ink-muted leading-relaxed">
                  Put dormant equipment to work for institutional metrics without risking delicate calibration or department safety.
                </p>
              </div>

              <div className="space-y-4 text-small">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-bone border border-line flex items-center justify-center text-terracotta shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-ink block">Mandatory Safety Prerequisites</strong>
                    <span className="text-xs text-ink-muted">
                      Only students with verified training certifications can submit booking requests.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-bone border border-line flex items-center justify-center text-terracotta shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-ink block">Arrival Condition Photo Audits</strong>
                    <span className="text-xs text-ink-muted">
                      Borrowers log condition photos before powering on, creating an indisputable baseline.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-bone border border-line flex items-center justify-center text-terracotta shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-ink block">Custom Blackouts & Quotas</strong>
                    <span className="text-xs text-ink-muted">
                      Reserve benches for departmental coursework with 1-click scheduling freezes.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-line/60">
              <Link href="/signup">
                <Button variant="outline" size="lg" className="w-full justify-center">
                  Register as equipment custodian
                </Button>
              </Link>
            </div>
          </div>

          {/* Column 2: For Borrowers (Empowering, Frictionless, Transparent) */}
          <div className="bg-surface border border-line rounded-editorial p-8 sm:p-10 flex flex-col justify-between space-y-8 shadow-xs hover:border-ink/20 transition-all">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-mono-label uppercase text-terracotta font-bold tracking-wider">
                  For Students & Researchers
                </span>
                <h3 className="font-display text-3xl sm:text-4xl text-ink font-normal leading-tight">
                  Precision tools. <br />
                  No backroom politics.
                </h3>
                <p className="text-small text-ink-muted leading-relaxed">
                  Access cutting-edge laser cutters, audio suites, and testbenches through transparent merit rather than who you know.
                </p>
              </div>

              <div className="space-y-4 text-small">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-bone border border-line flex items-center justify-center text-terracotta shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-ink block">Live Availability Schedules</strong>
                    <span className="text-xs text-ink-muted">
                      See open slots across every collegiate department in a single, calm interface.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-bone border border-line flex items-center justify-center text-terracotta shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-ink block">Transparent Waitlist Math</strong>
                    <span className="text-xs text-ink-muted">
                      See exactly how your course capstone status and clean return standing boost your priority.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-bone border border-line flex items-center justify-center text-terracotta shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-ink block">Verified Qualification Passport</strong>
                    <span className="text-xs text-ink-muted">
                      Upload your safety certifications once to unlock cross-departmental access campus-wide.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-line/60">
              <Link href="/explore">
                <Button variant="accent" size="lg" className="w-full justify-center">
                  Explore available equipment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

