"use client";

import * as React from "react";
import Link from "next/link";
import {
  MapPin,
  Compass,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Building2,
  X,
} from "lucide-react";
import { type CampusResource } from "@/lib/resources/data";
import { computeEligibility, type UserCredentialSnapshot } from "@/lib/resources/service";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface CampusMapProps {
  resources: CampusResource[];
  userCredentials?: UserCredentialSnapshot[];
  onSelectResource?: (res: CampusResource) => void;
}

export function CampusMap({
  resources,
  userCredentials = [],
}: CampusMapProps) {
  const [selectedResource, setSelectedResource] = React.useState<CampusResource | null>(
    resources[0] || null
  );

  const eligibility = selectedResource
    ? computeEligibility(selectedResource, userCredentials)
    : null;

  return (
    <div className="relative w-full bg-surface border border-line rounded-editorial overflow-hidden shadow-xs">
      {/* Top Map Bar */}
      <div className="px-4 py-3 border-b border-line bg-bone/70 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-terracotta" />
          <span className="font-semibold text-ink">
            Eastbrook Institute Campus Quadrangle Map
          </span>
        </div>
        <span className="text-mono-label text-ink-muted">
          {resources.length} active resources pinned
        </span>
      </div>

      {/* Map Canvas (Bespoke Collegiate Architectural Schematic) */}
      <div className="relative w-full h-[420px] sm:h-[480px] bg-[#EFE9DC] overflow-hidden select-none">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(#1C1B18 1px, transparent 1px), radial-gradient(#1C1B18 1px, #EFE9DC 1px)",
            backgroundSize: "24px 24px",
            backgroundPosition: "0 0, 12px 12px",
          }}
        />

        {/* Campus Buildings Layout (SVG Architectural Footprints) */}
        <svg
          viewBox="0 0 800 500"
          className="w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* North Quad lawn */}
          <rect
            x="120"
            y="60"
            width="240"
            height="180"
            rx="12"
            fill="#E2DDCF"
            stroke="#D0C7B5"
            strokeWidth="1.5"
          />
          <text
            x="240"
            y="155"
            textAnchor="middle"
            fill="#8A857B"
            fontSize="12"
            fontFamily="serif"
            fontStyle="italic"
          >
            Engineering North Quad
          </text>

          {/* East Engineering Wing */}
          <rect
            x="80"
            y="80"
            width="100"
            height="130"
            rx="6"
            fill="#FAF6EE"
            stroke="#1C1B18"
            strokeWidth="1.5"
          />
          <text
            x="130"
            y="145"
            textAnchor="middle"
            fill="#1C1B18"
            fontSize="10"
            fontWeight="600"
          >
            East Eng Wing
          </text>
          <text
            x="130"
            y="160"
            textAnchor="middle"
            fill="#6B675E"
            fontSize="8"
          >
            Fab Lab 104
          </text>

          {/* Maxwell Tower */}
          <rect
            x="240"
            y="70"
            width="110"
            height="90"
            rx="6"
            fill="#FAF6EE"
            stroke="#1C1B18"
            strokeWidth="1.5"
          />
          <text
            x="295"
            y="115"
            textAnchor="middle"
            fill="#1C1B18"
            fontSize="10"
            fontWeight="600"
          >
            Maxwell Tower
          </text>
          <text
            x="295"
            y="130"
            textAnchor="middle"
            fill="#6B675E"
            fontSize="8"
          >
            EE Labs · Rm 202
          </text>

          {/* Central Lawn & Pathway */}
          <path
            d="M 50 260 Q 400 240 750 260"
            stroke="#D5CDBC"
            strokeWidth="16"
            fill="none"
          />
          <path
            d="M 400 60 L 400 440"
            stroke="#D5CDBC"
            strokeWidth="12"
            fill="none"
          />

          {/* Central Library */}
          <rect
            x="440"
            y="100"
            width="150"
            height="120"
            rx="8"
            fill="#FAF6EE"
            stroke="#1C1B18"
            strokeWidth="1.5"
          />
          <text
            x="515"
            y="155"
            textAnchor="middle"
            fill="#1C1B18"
            fontSize="11"
            fontWeight="600"
          >
            Central Library
          </text>
          <text
            x="515"
            y="170"
            textAnchor="middle"
            fill="#6B675E"
            fontSize="8"
          >
            AV Vault B12
          </text>

          {/* Media Arts Center */}
          <rect
            x="460"
            y="290"
            width="140"
            height="110"
            rx="6"
            fill="#FAF6EE"
            stroke="#1C1B18"
            strokeWidth="1.5"
          />
          <text
            x="530"
            y="345"
            textAnchor="middle"
            fill="#1C1B18"
            fontSize="10"
            fontWeight="600"
          >
            Media Arts Center
          </text>
          <text
            x="530"
            y="360"
            textAnchor="middle"
            fill="#6B675E"
            fontSize="8"
          >
            Podcast Studio 305
          </text>

          {/* Building C High Bay */}
          <rect
            x="140"
            y="300"
            width="160"
            height="110"
            rx="6"
            fill="#FAF6EE"
            stroke="#1C1B18"
            strokeWidth="1.5"
          />
          <text
            x="220"
            y="355"
            textAnchor="middle"
            fill="#1C1B18"
            fontSize="10"
            fontWeight="600"
          >
            Building C High Bay
          </text>
          <text
            x="220"
            y="370"
            textAnchor="middle"
            fill="#6B675E"
            fontSize="8"
          >
            CNC Router Rm 110
          </text>
        </svg>

        {/* Map Interactive Pins */}
        {resources.map((res, idx) => {
          // Layout pins strategically across building coordinates
          const coords = [
            { top: "27%", left: "16%" }, // Fab Lab (Prusa)
            { top: "33%", left: "62%" }, // Library AV Vault (Sony FX3)
            { top: "30%", left: "19%" }, // Fab Lab (Laser)
            { top: "72%", left: "66%" }, // Media Arts (Podcast)
            { top: "23%", left: "37%" }, // Maxwell Tower (RF bench)
            { top: "73%", left: "28%" }, // High Bay (ShopBot)
          ];
          const pos = coords[idx % coords.length];
          const isSelected = selectedResource?.id === res.id;

          return (
            <button
              key={res.id}
              type="button"
              onClick={() => setSelectedResource(res)}
              style={{ top: pos.top, left: pos.left }}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 z-20 group transition-transform cursor-pointer",
                isSelected ? "scale-125 z-30" : "hover:scale-115"
              )}
              title={`${res.title} (${res.locationText})`}
            >
              <div
                className={cn(
                  "px-2.5 py-1 rounded-full border shadow-md flex items-center gap-1.5 text-xs font-semibold transition-colors",
                  isSelected
                    ? "bg-terracotta text-surface border-terracotta"
                    : "bg-surface text-ink border-ink/40 group-hover:border-terracotta"
                )}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="max-w-[100px] truncate hidden sm:inline">
                  {res.title.split(" ")[0]}
                </span>
              </div>
            </button>
          );
        })}

        {/* Floating Selected Resource Drawer Card */}
        {selectedResource && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-surface border border-line rounded-editorial p-4 shadow-editorial-raised z-30 space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-2 border-b border-line/60 pb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block">
                  {selectedResource.categoryLabel}
                </span>
                <h4 className="font-display text-lg text-ink font-normal leading-tight">
                  {selectedResource.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedResource(null)}
                className="text-ink-muted hover:text-ink p-1 rounded-full hover:bg-bone transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-ink-muted line-clamp-2">
              {selectedResource.description}
            </p>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-line/60">
              <span className="text-[11px] font-mono text-terracotta font-semibold">
                {selectedResource.nextAvailableSlot.split(",")[0]}
              </span>

              <Link
                href={`/resources/${selectedResource.slug}`}
                className="inline-flex items-center gap-1 font-semibold text-terracotta hover:underline"
              >
                <span>View Details</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

