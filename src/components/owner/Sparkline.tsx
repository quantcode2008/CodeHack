"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  className?: string;
  showPoints?: boolean;
}

export function Sparkline({
  data,
  width = 120,
  height = 32,
  strokeColor = "#B8522E", // terracotta
  fillColor = "rgba(184, 82, 46, 0.12)",
  className,
  showPoints = true,
}: SparklineProps) {
  if (!data || data.length < 2) {
    return <div className="h-8 w-24 bg-bone/60 rounded animate-pulse" />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 3;

  const points = data.map((val, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return { x, y, val };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const lastPoint = points[points.length - 1];

  return (
    <div className={cn("relative inline-flex items-center", className)}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        aria-hidden="true"
      >
        {/* Shaded Area */}
        <path d={areaD} fill={fillColor} />

        {/* Trend Line */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Current Endpoint */}
        {showPoints && (
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r="2.5"
            fill={strokeColor}
            className="ring-2 ring-surface"
          />
        )}
      </svg>
    </div>
  );
}

