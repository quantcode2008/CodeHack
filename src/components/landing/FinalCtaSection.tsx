"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Heart, Sparkles, Building2, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function FinalCtaSection() {
  return (
    <>
      {/* ======================================================== */}
      {/* FINAL CTA: FULL-BLEED INK BLOCK                          */}
      {/* ======================================================== */}
      <section className="relative w-full bg-ink text-surface py-24 sm:py-36 overflow-hidden select-none">
        {/* Archival geometric hairlines */}
        <div className="absolute inset-0 border-y border-white/10 pointer-events-none" />
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[1px] bg-white/5 pointer-events-none hidden md:block" />

        <div className="max-w-5xl mx-auto px-4 sm:px-8 text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-mono-label text-surface/90">
            <span className="w-2 h-2 rounded-full bg-terracotta" />
            <span>Eastbrook Institute of Technology · All 4 Academic Quadrangles</span>
          </div>

          <h2 className="font-display text-display-xl font-normal leading-[1.02] tracking-tight max-w-4xl mx-auto">
            Let nothing sit idle. <br />
            <span className="italic text-terracotta">Start sharing today.</span>
          </h2>

          <p className="text-body text-surface/80 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed font-normal">
            Join verified faculty, lab custodians, and student researchers on Eastbrook&apos;s calm, auditable resource exchange.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/explore">
              <Button
                variant="accent"
                size="lg"
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className="shadow-md"
              >
                Browse campus resources
              </Button>
            </Link>
            <Link href="/login">
              <button
                type="button"
                className="px-6 py-3 rounded-editorial border border-white/20 bg-white/5 hover:bg-white/10 text-surface text-small font-medium transition-colors cursor-pointer"
              >
                Sign in with institutional ID
              </button>
            </Link>
          </div>

          <div className="pt-6 text-xs text-surface/50 flex flex-wrap items-center justify-center gap-6">
            <span>Free for all enrolled students</span>
            <span>·</span>
            <span>Zero third-party telemetry</span>
            <span>·</span>
            <span>Postgres RPC audit verified</span>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* MINIMAL EDITORIAL FOOTER                                 */}
      {/* ======================================================== */}
      <footer className="w-full bg-bone border-t border-line py-12 text-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-line">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-editorial bg-ink text-surface flex items-center justify-center font-display text-xl">
                C
              </div>
              <div>
                <span className="font-display text-xl text-ink tracking-tight block leading-none">
                  Commons
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted">
                  Eastbrook Collegiate Registry
                </span>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-6 text-small text-ink-muted">
              <Link href="/explore" className="hover:text-ink transition-colors">
                Explore Resources
              </Link>
              <a href="#how-it-works" className="hover:text-ink transition-colors">
                How It Works
              </a>
              <a href="#fair-access" className="hover:text-ink transition-colors">
                Fair Access
              </a>
              <Link href="/design" className="hover:text-ink transition-colors">
                Design Lab
              </Link>
              <Link href="/profile" className="hover:text-ink transition-colors">
                Privacy Charter
              </Link>
            </nav>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-ink-muted">
            <p>
              © {new Date().getFullYear()} Commons · Eastbrook Institute of Technology. Built for collegiate peer trust.
            </p>
            <div className="flex items-center gap-4">
              <span>WCAG AA Compliant</span>
              <span>·</span>
              <span>100% Client-Side Private Vault</span>
              <span>·</span>
              <span>Next.js 15 App Router</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

