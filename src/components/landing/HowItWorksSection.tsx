"use client";

import * as React from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ListPlus,
  Compass,
  FileCheck2,
  Camera,
  History,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { PhoneMockup } from "./PhoneMockup";
import {
  ScreenListingDetail,
  ScreenEligibilityCheck,
  ScreenBookingApproval,
  ScreenConditionCheckin,
  ScreenReturnHistory,
} from "./LandingPhoneScreens";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CHAPTERS = [
  {
    step: "01",
    label: "Step 01",
    title: "List with Guardrails",
    subtitle: "Faculty and lab custodians catalog equipment with custom access rules.",
    desc: "Specify lead notice requirements, operating rules, safety prerequisites, and category-level hour quotas. The equipment remains strictly governed by departmental policies.",
    icon: ListPlus,
    screen: <ScreenListingDetail />,
    time: "09:30",
  },
  {
    step: "02",
    label: "Step 02",
    title: "Discover & Match Eligibility",
    subtitle: "Students browse live schedules with real-time certificate qualification.",
    desc: "No more emailing department admins to inquire who holds the key. Commons matches your institutional safety certifications directly against the resource's requirements.",
    icon: Compass,
    screen: <ScreenEligibilityCheck />,
    time: "09:45",
  },
  {
    step: "03",
    label: "Step 03",
    title: "Request & Explainable Decision",
    subtitle: "Declare your research purpose with transparent waitlist ranking.",
    desc: "Every approval or rejection includes substantive human explanation from the lab manager. Transparent algorithms weight course deadlines and clean return histories over click-races.",
    icon: FileCheck2,
    screen: <ScreenBookingApproval />,
    time: "10:15",
  },
  {
    step: "04",
    label: "Step 04",
    title: "Physical Photo Check-in",
    subtitle: "Arrival inspection photos establish an immutable baseline of condition.",
    desc: "Upon arrival, the borrower uploads timestamped condition photos to the private vault. Both parties acknowledge condition, formally transferring legal custody.",
    icon: Camera,
    screen: <ScreenConditionCheckin />,
    time: "14:02",
  },
  {
    step: "05",
    label: "Step 05",
    title: "Return & Immutable History",
    subtitle: "Manager verifies return, seals custody, and records to Postgres audit log.",
    desc: "On-time returns enhance your priority standing for scarce equipment. Every state change is sealed into the append-only audit trail via validated stored procedures.",
    icon: History,
    screen: <ScreenReturnHistory />,
    time: "16:30",
  },
];

export function HowItWorksSection() {
  const containerRef = React.useRef<HTMLElement>(null);
  const pinnedWrapperRef = React.useRef<HTMLDivElement>(null);
  const [activeChapter, setActiveChapter] = React.useState(0);
  const [isDesktopPinned, setIsDesktopPinned] = React.useState(false);

  React.useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isDesktop || reducedMotion || !pinnedWrapperRef.current) {
      setIsDesktopPinned(false);
      return;
    }

    setIsDesktopPinned(true);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: pinnedWrapperRef.current,
        start: "top top",
        end: "+=2600",
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => {
          const progress = self.progress;
          // Split progress into 5 segments: 0 to 4
          const index = Math.min(
            CHAPTERS.length - 1,
            Math.floor(progress * CHAPTERS.length)
          );
          setActiveChapter(index);
        },
      });
    }, pinnedWrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      className="relative bg-surface border-b border-line"
    >
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-20 pb-12 sm:pt-28 sm:pb-16 text-center space-y-4">
        <div className="inline-flex items-center gap-2 text-mono-label uppercase text-terracotta font-bold tracking-wider">
          <span>The 5-Chapter Protocol</span>
        </div>
        <h2 className="font-display text-display-lg text-ink font-normal tracking-tight">
          From discovery to return, <br />
          <span className="italic text-terracotta">completely auditable.</span>
        </h2>
        <p className="text-body text-ink-muted text-lg max-w-2xl mx-auto leading-relaxed">
          Five orchestrated milestones designed so any campus member or hackathon judge can complete a full journey with zero friction and total institutional trust.
        </p>
      </div>

      {/* ======================================================== */}
      {/* DESKTOP PINNED SCROLL-SCRUBBED STORY (≥1024px)           */}
      {/* ======================================================== */}
      <div
        ref={pinnedWrapperRef}
        className="hidden lg:block w-full h-screen max-h-[920px] relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between gap-12">
          {/* Left Column: Chapters Narrative */}
          <div className="w-1/2 space-y-6">
            {/* Step Indicators */}
            <div className="flex items-center gap-3 border-b border-line pb-4">
              {CHAPTERS.map((chap, idx) => (
                <button
                  key={chap.step}
                  type="button"
                  onClick={() => setActiveChapter(idx)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                    activeChapter === idx
                      ? "bg-ink text-surface shadow-xs"
                      : "bg-bone text-ink-muted hover:text-ink border border-line"
                  )}
                >
                  <span>{chap.step}</span>
                  <span className="hidden xl:inline">{chap.title.split(" ")[0]}</span>
                </button>
              ))}
            </div>

            {/* Active Chapter Details */}
            <div className="min-h-[280px] flex flex-col justify-center space-y-4 transition-all duration-300">
              <div className="flex items-center gap-2">
                <span className="text-mono-label text-terracotta font-bold tracking-widest uppercase">
                  {CHAPTERS[activeChapter].label} of 05
                </span>
                <span className="text-line">|</span>
                <span className="text-xs text-ink-muted">
                  Chain of Custody Guarantee
                </span>
              </div>

              <h3 className="font-display text-4xl text-ink font-normal leading-tight">
                {CHAPTERS[activeChapter].title}
              </h3>

              <p className="text-base text-ink font-medium leading-relaxed">
                {CHAPTERS[activeChapter].subtitle}
              </p>

              <p className="text-small text-ink-muted leading-relaxed max-w-xl">
                {CHAPTERS[activeChapter].desc}
              </p>
            </div>

            {/* Progress Bar Line */}
            <div className="w-full h-1 bg-bone border border-line rounded-full overflow-hidden">
              <div
                className="h-full bg-terracotta transition-all duration-300"
                style={{
                  width: `${((activeChapter + 1) / CHAPTERS.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Right Column: Pinned Phone Screen with Live Crossfade */}
          <div className="w-1/2 flex justify-center items-center">
            <div className="relative">
              {/* Soft decorative aura */}
              <div className="absolute -inset-4 rounded-[50px] bg-bone/60 border border-line/40 -z-10" />

              <PhoneMockup time={CHAPTERS[activeChapter].time}>
                <div className="h-full w-full transition-opacity duration-200">
                  {CHAPTERS[activeChapter].screen}
                </div>
              </PhoneMockup>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MOBILE VERTICAL STACKED SEQUENCE (<1024px)              */}
      {/* ======================================================== */}
      <div className="lg:hidden px-4 sm:px-8 pb-20 space-y-16">
        {CHAPTERS.map((chap, idx) => (
          <div
            key={`mobile-chap-${idx}`}
            className="bg-bone border border-line rounded-editorial p-6 space-y-6"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-mono-label uppercase text-terracotta font-bold">
                  {chap.label} of 05
                </span>
                <Badge status="active" showDot={false}>{chap.title.split(" ")[0]}</Badge>
              </div>

              <h3 className="font-display text-2xl text-ink font-normal leading-tight">
                {chap.title}
              </h3>

              <p className="text-small font-medium text-ink leading-snug">
                {chap.subtitle}
              </p>

              <p className="text-xs text-ink-muted leading-relaxed">
                {chap.desc}
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <PhoneMockup time={chap.time} className="w-[260px] h-[520px]">
                {chap.screen}
              </PhoneMockup>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

