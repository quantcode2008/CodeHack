"use client";

import * as React from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GrainOverlay } from "@/components/landing/GrainOverlay";
import { CustomCursor } from "@/components/landing/CustomCursor";
import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { MarqueeTicker } from "@/components/landing/MarqueeTicker";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FairByDesignSection } from "@/components/landing/FairByDesignSection";
import { AuditTimelineSection } from "@/components/landing/AuditTimelineSection";
import { AudienceSplitSection } from "@/components/landing/AudienceSplitSection";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingPage() {
  React.useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
    });

    // Wire Lenis to GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    const rafHandler = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(rafHandler);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(rafHandler);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-bone text-ink selection:bg-terracotta selection:text-surface">
      {/* 3% Opacity Archival Paper Grain Overlay */}
      <GrainOverlay />

      {/* Desktop Custom Cursor */}
      <CustomCursor />

      {/* 1. Header Navigation */}
      <LandingNav />

      {/* Main Editorial Flow */}
      <main id="main-content">
        {/* 2. Hero Section with Parallax Phone Screens */}
        <HeroSection />

        {/* 3. Slow Marquee Ticker */}
        <MarqueeTicker />

        {/* 4. "The Problem" Editorial Block with 3 Animated Counters */}
        <ProblemSection />

        {/* 5. "How it Works" Pinned Scroll-Scrubbed Story */}
        <HowItWorksSection />

        {/* 6. "Fair by Design" Asymmetric Bento of 4 Tiles */}
        <FairByDesignSection />

        {/* 7. "Accountability" Animated Audit-Trail Timeline */}
        <AuditTimelineSection />

        {/* 8. "For Owners / For Borrowers" Two-Column Split */}
        <AudienceSplitSection />
      </main>

      {/* 9. Final CTA on Ink-Colored Block & Minimal Footer */}
      <FinalCtaSection />
    </div>
  );
}
