"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, PlusCircle, ShieldCheck, Sparkles, Building2 } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PhoneMockup } from "./PhoneMockup";
import {
  ScreenListingDetail,
  ScreenBookingApproval,
  ScreenConditionCheckin,
} from "./LandingPhoneScreens";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function HeroSection() {
  const containerRef = React.useRef<HTMLElement>(null);
  const phoneLeftRef = React.useRef<HTMLDivElement>(null);
  const phoneCenterRef = React.useRef<HTMLDivElement>(null);
  const phoneRightRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Smooth subtle parallaxing of the 3 phones on scroll
      if (phoneLeftRef.current) {
        gsap.to(phoneLeftRef.current, {
          y: -60,
          rotation: -3,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.2,
          },
        });
      }

      if (phoneCenterRef.current) {
        gsap.to(phoneCenterRef.current, {
          y: -100,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
        });
      }

      if (phoneRightRef.current) {
        gsap.to(phoneRightRef.current, {
          y: -40,
          rotation: 4,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.5,
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Editorial Text Block */}
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bone border border-line text-mono-label text-ink">
            <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
            <span>Collegiate Resource Registry · Eastbrook Institute of Technology</span>
          </div>

          {/* Massive Serif Headline with Split-Line Reveal Style */}
          <h1 className="font-display text-display-xl text-ink font-normal tracking-tight leading-[1.02]">
            Idle things, <br className="hidden sm:inline" />
            <span className="italic text-terracotta font-normal">
              put to work.
            </span>
          </h1>

          {/* Calm Editorial Subline */}
          <p className="text-body text-lg sm:text-xl text-ink-muted max-w-2xl mx-auto leading-relaxed font-normal">
            A trusted collegiate exchange for specialized labs, studio suites, and precision fabrication tools. Verified departments share underutilized custody; students gain verified access with transparent accountability.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/explore">
              <Button
                variant="accent"
                size="lg"
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className="shadow-sm"
              >
                Browse resources
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                variant="outline"
                size="lg"
                leftIcon={<PlusCircle className="w-5 h-5 text-terracotta" />}
              >
                List your lab or tools
              </Button>
            </Link>
          </div>

          {/* Trust Metric Micro-pill */}
          <div className="pt-2 flex items-center justify-center gap-6 text-xs text-ink-muted">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-terracotta" />
              Verified Institutional Roles Only
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-ink-muted" />
              Zero Damage Deposit for Qualified Students
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* DESKTOP COMPOSING VISUAL: 3 FLOATING PHONES WITH PARALLAX */}
        {/* ======================================================== */}
        <div className="relative mt-16 md:mt-24 max-w-6xl mx-auto hidden lg:block h-[680px]">
          {/* Subtle archival backdrop pedestal */}
          <div className="absolute inset-x-8 top-12 bottom-0 rounded-3xl bg-surface/50 border border-line/60 pointer-events-none -z-10" />

          {/* Phone 1: Left floating (Listing Detail) */}
          <div
            ref={phoneLeftRef}
            className="absolute left-6 top-16 z-10 -rotate-3 hover:rotate-0 transition-transform duration-300"
          >
            <PhoneMockup time="09:30">
              <ScreenListingDetail />
            </PhoneMockup>
          </div>

          {/* Phone 2: Center elevated (Booking Approval with Explanation) */}
          <div
            ref={phoneCenterRef}
            className="absolute left-1/2 -translate-x-1/2 top-0 z-20 shadow-2xl scale-105"
          >
            <PhoneMockup time="10:15">
              <ScreenBookingApproval />
            </PhoneMockup>
          </div>

          {/* Phone 3: Right floating (Condition Check-in) */}
          <div
            ref={phoneRightRef}
            className="absolute right-6 top-20 z-10 rotate-3 hover:rotate-0 transition-transform duration-300"
          >
            <PhoneMockup time="14:02">
              <ScreenConditionCheckin />
            </PhoneMockup>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MOBILE VISUAL: SINGLE CENTERED PHONE MOCKUP             */}
        {/* ======================================================== */}
        <div className="mt-12 lg:hidden flex justify-center">
          <PhoneMockup time="10:15">
            <ScreenBookingApproval />
          </PhoneMockup>
        </div>
      </div>
    </section>
  );
}

