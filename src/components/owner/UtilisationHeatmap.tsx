"use client";

import * as React from "react";
import { type HeatmapDayRow, type HeatmapHourSlot, type ResourceUtilisationData } from "@/lib/owner/types";
import { Clock, TrendingUp, Moon, Flame, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UtilisationHeatmapProps {
  data: ResourceUtilisationData;
  resourceTitle?: string;
  className?: string;
}

export function UtilisationHeatmap({
  data,
  resourceTitle,
  className,
}: UtilisationHeatmapProps) {
  const [hoveredSlot, setHoveredSlot] = React.useState<{
    dayLabel: string;
    slot: HeatmapHourSlot;
  } | null>(null);

  const hourLabels = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
  ];

  const getSlotColor = (slot: HeatmapHourSlot) => {
    switch (slot.status) {
      case "blackout":
        return "bg-line text-ink-muted border-line";
      case "peak":
        return "bg-terracotta text-white border-terracotta hover:brightness-110";
      case "moderate":
        return "bg-[#8A9A7B]/70 text-ink border-[#8A9A7B]/50 hover:bg-[#8A9A7B]/90";
      case "light":
        return "bg-[#8A9A7B]/25 text-ink-muted border-[#8A9A7B]/30 hover:bg-[#8A9A7B]/40";
      case "idle":
      default:
        return "bg-bone/80 text-ink-muted border-line/50 hover:bg-surface";
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Metrics Header Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-surface border border-line rounded-editorial space-y-1 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-ink-muted font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-terracotta" />
            <span>Avg Utilization</span>
          </div>
          <div className="font-display text-2xl text-ink font-normal">
            {data.utilizationRate}%
          </div>
          <span className="text-[11px] text-ink-muted block">
            {data.totalHoursBooked} hrs active this week
          </span>
        </div>

        <div className="p-4 bg-surface border border-line rounded-editorial space-y-1 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-ink-muted font-medium">
            <Clock className="w-3.5 h-3.5 text-sage" />
            <span>Idle Recovered</span>
          </div>
          <div className="font-display text-2xl text-ink font-normal">
            {data.idleHoursRecovered}h
          </div>
          <span className="text-[11px] text-sage font-medium block">
            +18% vs semester baseline
          </span>
        </div>

        <div className="p-4 bg-surface border border-line rounded-editorial space-y-1 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-ink-muted font-medium">
            <Flame className="w-3.5 h-3.5 text-terracotta" />
            <span>Peak Demand</span>
          </div>
          <div className="font-mono text-sm font-bold text-ink pt-1">
            {data.peakHourRange}
          </div>
          <span className="text-[11px] text-ink-muted block">
            Weekdays (Tues – Thurs)
          </span>
        </div>

        <div className="p-4 bg-surface border border-line rounded-editorial space-y-1 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-ink-muted font-medium">
            <Moon className="w-3.5 h-3.5 text-ink-muted" />
            <span>Most Idle Window</span>
          </div>
          <div className="font-mono text-sm font-bold text-ink-muted pt-1">
            {data.mostIdleWindow}
          </div>
          <span className="text-[11px] text-ink-muted block">
            Prime for maintenance
          </span>
        </div>
      </div>

      {/* Main Heatmap Matrix Container */}
      <div className="bg-surface border border-line rounded-editorial p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
          <div>
            <span className="text-mono-label uppercase text-ink-muted">Weekly Schedule Heatmap</span>
            <h3 className="font-display text-xl text-ink">
              Hourly Utilization Profile
            </h3>
          </div>

          {/* Interactive Status Indicator */}
          {hoveredSlot ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-bone border border-line rounded-editorial text-xs animate-in fade-in duration-150">
              <span className="font-semibold text-ink">{hoveredSlot.dayLabel}</span>
              <span className="font-mono text-terracotta">
                {String(hoveredSlot.slot.hour).padStart(2, "0")}:00 –{" "}
                {String(hoveredSlot.slot.hour + 1).padStart(2, "0")}:00
              </span>
              <span className="text-line">|</span>
              <span className="font-bold text-ink">
                {hoveredSlot.slot.status === "blackout"
                  ? "Blackout / Maintenance"
                  : `${hoveredSlot.slot.utilizationPct}% Utilized (${hoveredSlot.slot.sessionsCount} session${
                      hoveredSlot.slot.sessionsCount !== 1 ? "s" : ""
                    })`}
              </span>
            </div>
          ) : (
            <span className="text-xs text-ink-muted">
              Hover over any time block to view hourly demand
            </span>
          )}
        </div>

        {/* Heatmap Grid with Horizontal Scroll on Mobile */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[700px] space-y-2">
            {/* Header row of hours */}
            <div className="grid grid-cols-16 gap-1.5 items-center text-[10px] font-mono text-ink-muted pl-16">
              {hourLabels.map((hour) => (
                <div key={hour} className="text-center font-medium">
                  {hour.split(":")[0]}h
                </div>
              ))}
            </div>

            {/* Weekday Rows */}
            {data.heatmap.map((row) => (
              <div
                key={row.day}
                className="grid grid-cols-16 gap-1.5 items-center group"
              >
                {/* Day Label (First Col) */}
                <div className="w-14 text-xs font-semibold text-ink group-hover:text-terracotta transition-colors">
                  {row.day}
                </div>

                {/* 15 Hour Cells */}
                {row.hours.map((slot) => (
                  <button
                    key={`${row.day}-${slot.hour}`}
                    type="button"
                    onMouseEnter={() =>
                      setHoveredSlot({
                        dayLabel: row.dayLabel,
                        slot,
                      })
                    }
                    onMouseLeave={() => setHoveredSlot(null)}
                    className={cn(
                      "h-8 rounded-sm border transition-all duration-150 flex items-center justify-center text-[9px] font-mono cursor-pointer relative",
                      getSlotColor(slot),
                      hoveredSlot?.dayLabel === row.dayLabel &&
                        hoveredSlot.slot.hour === slot.hour &&
                        "ring-2 ring-terracotta z-10 scale-105"
                    )}
                    aria-label={`${row.dayLabel} at ${slot.hour}:00, ${slot.utilizationPct}% utilized`}
                  >
                    {slot.status === "peak" ? (
                      <span className="font-bold opacity-90">{slot.utilizationPct}%</span>
                    ) : slot.status === "moderate" ? (
                      <span className="opacity-80">{slot.utilizationPct}%</span>
                    ) : null}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap Legend */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-line/60 text-xs text-ink-muted">
          <div className="flex items-center gap-4">
            <span className="font-medium text-ink">Density Scale:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-bone border border-line/50" />
              <span>Idle (0%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-[#8A9A7B]/25 border border-[#8A9A7B]/30" />
              <span>Light (20-49%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-[#8A9A7B]/70 border border-[#8A9A7B]/50" />
              <span>Moderate (50-74%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-terracotta border border-terracotta" />
              <span className="text-terracotta font-semibold">Peak (75-100%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-line border border-line" />
              <span>Blackout</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-sage" />
            <span>Collegiate Fair-Use Load Balancing Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

