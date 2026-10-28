"use client";

import * as React from "react";
import { AlertCircle, Clock, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function ProblemSection() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const count1Ref = React.useRef<HTMLSpanElement>(null);
  const count2Ref = React.useRef<HTMLSpanElement>(null);
  const count3Ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Counter 1: 0 to 72%
      if (count1Ref.current) {
        const obj1 = { val: 0 };
        gsap.to(obj1, {
          val: 72,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: count1Ref.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
          onUpdate: () => {
            if (count1Ref.current) {
              count1Ref.current.innerText = `${Math.round(obj1.val)}%`;
            }
          },
        });
      }

      // Counter 3: 1.0 to 4.8x
      if (count3Ref.current) {
        const obj3 = { val: 1.0 };
        gsap.to(obj3, {
          val: 4.8,
          duration: 2.0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: count3Ref.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
          onUpdate: () => {
            if (count3Ref.current) {
              count3Ref.current.innerText = `${obj3.val.toFixed(1)}x`;
            }
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 sm:py-32 bg-bone border-b border-line"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-16">
        {/* Editorial Narrative Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 text-mono-label uppercase text-terracotta font-bold tracking-wider">
            <span>The Campus Dilemma</span>
          </div>
          <h2 className="font-display text-display-lg text-ink font-normal leading-tight tracking-tight">
            Colleges invest millions in labs. <br />
            Most doors stay locked.
          </h2>
          <p className="text-body text-ink-muted text-lg leading-relaxed">
            Every collegiate campus has specialized oscilloscopes, laser cutters, cleanrooms, and audio booths that sit dark 16 hours a day. Meanwhile, students delay capstones, research stalls, and equipment decays from underuse—all because custody, eligibility, and return accountability were never solved.
          </p>
        </div>

        {/* 3 Large Animated Counters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          {/* Card 1 */}
          <div className="bg-surface border border-line rounded-editorial p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs hover:border-ink/20 transition-colors">
            <div className="space-y-3">
              <span className="text-mono-label uppercase tracking-wider text-ink-muted block">
                Equipment Utilization
              </span>
              <div className="font-display text-display-xl font-normal text-terracotta leading-none">
                <span ref={count1Ref}>72%</span>
              </div>
            </div>
            <div className="pt-4 border-t border-line/60 space-y-1">
              <strong className="text-small font-semibold text-ink block">
                Hours specialized tools sit idle
              </strong>
              <p className="text-xs text-ink-muted leading-relaxed">
                Outside scheduled undergraduate lectures, high-value campus testbenches remain under key with zero booking transparency.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-surface border border-line rounded-editorial p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs hover:border-ink/20 transition-colors">
            <div className="space-y-3">
              <span className="text-mono-label uppercase tracking-wider text-ink-muted block">
                Qualified Access Cost
              </span>
              <div className="font-display text-display-xl font-normal text-ink leading-none">
                <span ref={count2Ref}>$0</span>
              </div>
            </div>
            <div className="pt-4 border-t border-line/60 space-y-1">
              <strong className="text-small font-semibold text-ink block">
                Collegiate fee for certified peers
              </strong>
              <p className="text-xs text-ink-muted leading-relaxed">
                Zero commercial markup. Access is mediated by safety credentials, course prerequisites, and good citizenship—not deep pockets.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-surface border border-line rounded-editorial p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs hover:border-ink/20 transition-colors">
            <div className="space-y-3">
              <span className="text-mono-label uppercase tracking-wider text-ink-muted block">
                Equitable Allocation
              </span>
              <div className="font-display text-display-xl font-normal text-terracotta leading-none">
                <span ref={count3Ref}>4.8x</span>
              </div>
            </div>
            <div className="pt-4 border-t border-line/60 space-y-1">
              <strong className="text-small font-semibold text-ink block">
                Higher fairness vs. click-races
              </strong>
              <p className="text-xs text-ink-muted leading-relaxed">
                Merit-based waitlist scoring and weekly caps prevent senior lab cartels from monopolizing scarce fabrication time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

