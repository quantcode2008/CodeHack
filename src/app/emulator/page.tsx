"use client";

import * as React from "react";
import Link from "next/link";
import {
  Smartphone,
  RotateCw,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Sliders,
  Sparkles,
  ArrowLeft,
  Wifi,
  Battery,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface DevicePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  radius: string;
  notch: "island" | "notch" | "punch";
}

const DEVICES: DevicePreset[] = [
  {
    id: "iphone-se",
    name: "iPhone SE (Standard 375px)",
    width: 375,
    height: 667,
    radius: "rounded-[40px]",
    notch: "notch",
  },
  {
    id: "iphone-15",
    name: "iPhone 15 Pro (393px)",
    width: 393,
    height: 852,
    radius: "rounded-[52px]",
    notch: "island",
  },
  {
    id: "pixel-7",
    name: "Google Pixel 7 (412px)",
    width: 412,
    height: 915,
    radius: "rounded-[44px]",
    notch: "punch",
  },
];

export default function EmulatorPage() {
  const [selectedDevice, setSelectedDevice] = React.useState<DevicePreset>(DEVICES[0]);
  const [currentRoute, setCurrentRoute] = React.useState<string>("/design");
  const [isLandscape, setIsLandscape] = React.useState<boolean>(false);
  const [scale, setScale] = React.useState<number>(1);
  const [key, setKey] = React.useState<number>(0);
  const [currentTime, setCurrentTime] = React.useState<string>("9:41");

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const deviceWidth = isLandscape ? selectedDevice.height : selectedDevice.width;
  const deviceHeight = isLandscape ? selectedDevice.width : selectedDevice.height;

  const reloadIframe = () => setKey((k) => k + 1);

  return (
    <div className="min-h-screen bg-[#EDE7DA] text-ink flex flex-col">
      {/* Top Controller Bar */}
      <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-md border-b border-line px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/design"
              className="p-2 -ml-2 text-ink-muted hover:text-ink rounded-full hover:bg-bone transition-colors"
              title="Return to Design System"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-h3 text-ink leading-tight">
                  Mobile Device Emulator
                </span>
                <Badge status="active" showDot={false}>
                  Live Preview
                </Badge>
              </div>
              <p className="text-xs text-ink-muted">
                Interactive collegiate phone simulator · Testing mobile responsiveness & touch ergonomics
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Device Selector */}
            <div className="flex items-center bg-bone border border-line rounded-editorial p-1 gap-1">
              {DEVICES.map((dev) => (
                <button
                  key={dev.id}
                  type="button"
                  onClick={() => setSelectedDevice(dev)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-[10px] transition-all cursor-pointer ${
                    selectedDevice.id === dev.id
                      ? "bg-surface text-ink shadow-sm font-semibold border border-line/60"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {dev.name.split(" ")[0]} {dev.width}px
                </button>
              ))}
            </div>

            {/* Route Selector */}
            <div className="flex items-center bg-bone border border-line rounded-editorial p-1 gap-1 overflow-x-auto">
              {[
                { label: "Book Wizard", route: "/book/epilog-fusion-pro-laser" },
                { label: "My Bookings", route: "/bookings" },
                { label: "Owner Queue", route: "/queue" },
                { label: "Discover", route: "/discover" },
                { label: "Resource Detail", route: "/resources/epilog-fusion-pro-laser" },
                { label: "Credentials Desk", route: "/admin/credentials" },
                { label: "Onboarding", route: "/onboarding" },
                { label: "Profile", route: "/profile" },
                { label: "Login", route: "/login" },
                { label: "Home", route: "/" },
              ].map((r) => (
                <button
                  key={r.route}
                  type="button"
                  onClick={() => setCurrentRoute(r.route)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-[10px] transition-all cursor-pointer whitespace-nowrap ${
                    currentRoute === r.route
                      ? "bg-surface text-terracotta shadow-sm font-semibold border border-line/60"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Orientation & Reload */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLandscape(!isLandscape)}
                leftIcon={<RotateCw className="w-4 h-4" />}
                title="Toggle Landscape / Portrait"
              >
                Rotate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={reloadIframe}
                title="Reload Page"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <a
                href={currentRoute}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center h-9 px-3 text-small rounded-editorial border border-line bg-surface text-ink hover:bg-bone transition-colors"
                title="Open fullscreen in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Scale Slider */}
            <div className="hidden sm:flex items-center gap-2 bg-bone border border-line px-3 py-1.5 rounded-editorial text-xs text-ink-muted">
              <span>Zoom:</span>
              {[0.85, 1].map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    scale === s ? "bg-surface text-ink font-bold shadow-xs" : "hover:text-ink"
                  }`}
                >
                  {Math.round(s * 100)}%
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Emulator Canvas */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 overflow-x-auto">
        <div
          className="relative transition-all duration-300 ease-out origin-top flex flex-col items-center"
          style={{ transform: `scale(${scale})` }}
        >
          {/* Realistic Phone Bezel Frame */}
          <div
            className={`relative p-3.5 bg-[#1F1E1B] border-[4px] border-[#383630] shadow-[0_25px_70px_rgba(28,27,24,0.35),0_10px_20px_rgba(28,27,24,0.2)] ${selectedDevice.radius}`}
            style={{ width: deviceWidth + 28, height: deviceHeight + 28 }}
          >
            {/* Side hardware buttons (visual accents) */}
            <div className="absolute -left-[7px] top-28 w-[3px] h-12 bg-[#383630] rounded-l" />
            <div className="absolute -left-[7px] top-44 w-[3px] h-12 bg-[#383630] rounded-l" />
            <div className="absolute -right-[7px] top-32 w-[3px] h-16 bg-[#383630] rounded-r" />

            {/* Inner Glass Display */}
            <div
              className="relative w-full h-full bg-bone overflow-hidden flex flex-col select-none rounded-[36px]"
              style={{ width: deviceWidth, height: deviceHeight }}
            >
              {/* Phone Status Bar */}
              <div className="relative z-30 h-10 px-6 flex items-center justify-between text-ink text-xs font-semibold bg-surface/90 backdrop-blur-md border-b border-line/40 shrink-0">
                <span>{currentTime}</span>

                {/* Notch / Dynamic Island */}
                {selectedDevice.notch === "island" && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-2 w-28 h-6 bg-black rounded-full flex items-center justify-end pr-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1A1A2E]/80 ring-1 ring-white/10" />
                  </div>
                )}
                {selectedDevice.notch === "notch" && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-0 w-36 h-4 bg-black rounded-b-2xl" />
                )}
                {selectedDevice.notch === "punch" && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-2 w-3.5 h-3.5 rounded-full bg-black" />
                )}

                {/* Status Bar Icons */}
                <div className="flex items-center gap-1.5 text-ink">
                  <span className="text-[10px] font-mono font-bold tracking-tight">5G</span>
                  <Wifi className="w-3.5 h-3.5" />
                  <Battery className="w-4 h-4" />
                </div>
              </div>

              {/* Live Web Content Frame */}
              <div className="flex-1 w-full relative overflow-hidden bg-bone">
                <iframe
                  key={key}
                  src={currentRoute}
                  title="Phone Preview"
                  className="w-full h-full border-none select-auto"
                />
              </div>

              {/* Bottom Home Indicator Bar */}
              <div className="h-5 bg-surface/90 backdrop-blur-md flex items-center justify-center shrink-0 border-t border-line/30">
                <div className="w-32 h-1 bg-ink/30 rounded-full" />
              </div>
            </div>
          </div>

          {/* Quick Ergonomics Checklist */}
          <div className="mt-8 max-w-lg w-full bg-surface border border-line rounded-editorial p-4 shadow-sm text-small space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-line/60">
              <span className="font-semibold text-ink">Mobile Ergonomics Checklist</span>
              <span className="text-mono-label text-ink-muted">
                Viewport: {deviceWidth} × {deviceHeight}px
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-ink-muted pt-1">
              <div className="flex items-center gap-1.5 text-success">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>≥44px Touch Targets</span>
              </div>
              <div className="flex items-center gap-1.5 text-success">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Stacked Card Tables</span>
              </div>
              <div className="flex items-center gap-1.5 text-success">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Bottom Tab Bar Nav</span>
              </div>
              <div className="flex items-center gap-1.5 text-success">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Grab-Handle Bottom Sheet</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

