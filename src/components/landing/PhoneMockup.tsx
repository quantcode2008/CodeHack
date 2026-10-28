"use client";

import * as React from "react";
import { Wifi, BatteryMedium, Signal } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhoneMockupProps {
  children: React.ReactNode;
  className?: string;
  screenClassName?: string;
  time?: string;
}

export function PhoneMockup({
  children,
  className,
  screenClassName,
  time = "09:41",
}: PhoneMockupProps) {
  return (
    <div
      className={cn(
        "relative mx-auto w-[280px] sm:w-[310px] h-[580px] sm:h-[620px] rounded-[44px] bg-[#181715] p-2.5 shadow-[0_20px_50px_rgba(28,27,24,0.18)] border-[3px] border-[#32302A] select-none transition-transform duration-300",
        className
      )}
    >
      {/* Outer subtle edge bevel reflection */}
      <div className="absolute inset-0 rounded-[42px] border border-white/10 pointer-events-none" />

      {/* Screen container */}
      <div
        className={cn(
          "relative h-full w-full rounded-[34px] bg-bone overflow-hidden flex flex-col border border-line/60",
          screenClassName
        )}
      >
        {/* Dynamic Island / Notch */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30 w-24 h-5 bg-[#181715] rounded-full flex items-center justify-between px-2.5 shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0E0E0D] border border-white/5" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#1F2A38]" />
        </div>

        {/* Status Bar */}
        <div className="relative z-20 flex items-center justify-between px-6 pt-3 pb-2 text-[11px] font-semibold text-ink">
          <span>{time}</span>
          <div className="flex items-center gap-1.5 text-ink">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <BatteryMedium className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Screen Content */}
        <div className="relative z-10 flex-1 overflow-hidden flex flex-col p-3">
          {children}
        </div>

        {/* Home Indicator Bar */}
        <div className="relative z-20 pb-2 pt-1 flex justify-center">
          <div className="w-28 h-1 bg-ink/25 rounded-full" />
        </div>
      </div>
    </div>
  );
}

