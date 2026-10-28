"use client";

import * as React from "react";

const RESOURCES = [
  "Markforged Metal X 3D Printer",
  "Podcast Audio Suite",
  "Rigol 4-Channel Oscilloscope",
  "Epilog 60W Laser Cutter",
  "Acoustic Seminar Room B",
  "High-Speed Centrifuge",
  "VR Spatial HoloBench",
  "Haas 5-Axis CNC Mill",
  "Abrasive Waterjet Cutter",
  "Anechoic RF Test Chamber",
  "Sony FX6 Cinema Camera",
  "Sartorius Analytical Balance",
  "Optical Vibration Table",
];

export function MarqueeTicker() {
  return (
    <section
      aria-label="Campus equipment highlights ticker"
      className="relative w-full border-y border-line bg-surface/60 py-4 overflow-hidden select-none"
    >
      <div className="flex w-max animate-marquee space-x-8">
        {/* First track */}
        <div className="flex items-center space-x-8 text-ink">
          {RESOURCES.map((item, idx) => (
            <React.Fragment key={`ticker-1-${idx}`}>
              <span className="font-display italic text-lg sm:text-xl tracking-wide font-normal text-ink/90 hover:text-terracotta transition-colors whitespace-nowrap">
                {item}
              </span>
              <span className="text-terracotta/60 text-xs select-none">✦</span>
            </React.Fragment>
          ))}
        </div>

        {/* Second track for seamless looping */}
        <div className="flex items-center space-x-8 text-ink" aria-hidden="true">
          {RESOURCES.map((item, idx) => (
            <React.Fragment key={`ticker-2-${idx}`}>
              <span className="font-display italic text-lg sm:text-xl tracking-wide font-normal text-ink/90 hover:text-terracotta transition-colors whitespace-nowrap">
                {item}
              </span>
              <span className="text-terracotta/60 text-xs select-none">✦</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

