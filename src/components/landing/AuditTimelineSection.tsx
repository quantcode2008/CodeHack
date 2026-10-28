"use client";

import * as React from "react";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Camera,
  History,
  Lock,
  Hash,
  Clock,
  User,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Badge } from "@/components/ui/Badge";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const AUDIT_EVENTS = [
  {
    time: "09:15:32 EST",
    actor: "Aanya Patel (Student #89201)",
    role: "Borrower",
    action: "Booking Request Initiated",
    detail: "Requested 2.5 hours on Epilog 60W Laser Cutter for ME-401 Senior Chassis Capstone.",
    badge: "requested" as const,
    hash: "0x8f2a...1e40",
  },
  {
    time: "10:30:10 EST",
    actor: "Automated Registry Engine",
    role: "System Check",
    action: "Safety Prerequisites Validated",
    detail: "Cross-checked student vault: Laser Safety Certificate L1 verified by Dept of Physics.",
    badge: "verified" as const,
    hash: "0x3c99...77b1",
  },
  {
    time: "11:00:45 EST",
    actor: "Dr. Kavitha Rao",
    role: "Lab Director",
    action: "Reservation Approved with Conditions",
    detail: "\"Approved for capstone slot. Note: Mandatory OD5+ laser eyewear in Fab Lab 04.\"",
    badge: "approved" as const,
    hash: "0x9a44...ff02",
  },
  {
    time: "14:02:18 EST",
    actor: "Aanya Patel",
    role: "Borrower Check-in",
    action: "Arrival Photo Inspection Logged",
    detail: "Uploaded 2 condition photos. Pre-existing cutting bed scorch noted and acknowledged.",
    badge: "active" as const,
    hash: "0x77ee...d934",
  },
  {
    time: "16:28:40 EST",
    actor: "Imran Syed",
    role: "Lab Monitor",
    action: "Return Verified & Ledger Sealed",
    detail: "Optics clean, laser bed cleared. Zero damage reported. Audit log permanently sealed.",
    badge: "returned" as const,
    hash: "0x55aa...88c2",
  },
];

export function AuditTimelineSection() {
  const containerRef = React.useRef<HTMLElement>(null);
  const lineRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !containerRef.current || !lineRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top center",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
            end: "bottom 75%",
            scrub: 1,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="accountability"
      ref={containerRef}
      className="py-20 sm:py-32 bg-surface border-b border-line"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-mono-label uppercase text-terracotta font-bold tracking-wider">
            <Lock className="w-3.5 h-3.5 text-terracotta" />
            <span>Immutable Chain of Custody</span>
          </div>
          <h2 className="font-display text-display-lg text-ink font-normal leading-tight tracking-tight">
            Every action, sealed in daylight.
          </h2>
          <p className="text-body text-ink-muted text-base sm:text-lg leading-relaxed">
            Zero direct client status mutations. Every transition dispatches through atomic Postgres RPC stored procedures that write permanently to the campus audit log.
          </p>
        </div>

        {/* ======================================================== */}
        {/* TIMELINE WITH SCROLL-DRAWING VERTICAL CONNECTOR LINE     */}
        {/* ======================================================== */}
        <div className="relative pl-6 sm:pl-10 space-y-8">
          {/* Background guide line */}
          <div className="absolute left-[11px] sm:left-[19px] top-4 bottom-4 w-[2px] bg-line/60" />

          {/* Animated Scroll-drawn line */}
          <div
            ref={lineRef}
            className="absolute left-[11px] sm:left-[19px] top-4 bottom-4 w-[2px] bg-terracotta origin-top"
          />

          {AUDIT_EVENTS.map((event, idx) => (
            <div
              key={`audit-${idx}`}
              className="relative flex items-start gap-4 sm:gap-6 group"
            >
              {/* Node Marker Dot */}
              <div className="w-6 h-6 rounded-full bg-surface border-2 border-terracotta flex items-center justify-center -translate-x-[21px] sm:-translate-x-[29px] mt-1 shrink-0 z-10 shadow-xs group-hover:scale-110 transition-transform bg-bone">
                <div className="w-2 h-2 rounded-full bg-terracotta" />
              </div>

              {/* Event Card */}
              <div className="flex-1 bg-bone border border-line rounded-editorial p-4 sm:p-5 space-y-2.5 shadow-xs hover:border-ink/20 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-ink">
                      {event.time}
                    </span>
                    <span className="text-xs text-ink-muted">·</span>
                    <span className="text-xs text-ink-muted font-medium">
                      {event.actor}
                    </span>
                  </div>
                  <Badge status={event.badge} />
                </div>

                <div className="space-y-1">
                  <h3 className="font-semibold text-small text-ink">
                    {event.action}
                  </h3>
                  <p className="text-xs text-ink-muted leading-relaxed font-normal">
                    {event.detail}
                  </p>
                </div>

                <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-ink-muted border-t border-line/40">
                  <span className="flex items-center gap-1">
                    <Hash className="w-3 h-3 text-terracotta" />
                    <span>Postgres RPC Entry</span>
                  </span>
                  <span className="tracking-wider">{event.hash}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

