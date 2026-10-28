"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: "underline" | "pill";
}

export function Tabs({
  tabs,
  activeId,
  onChange,
  className,
  variant = "underline",
}: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center overflow-x-auto no-scrollbar",
        variant === "underline" && "border-b border-line gap-6",
        variant === "pill" && "p-1 bg-bone border border-line rounded-editorial gap-1",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            className={cn(
              "relative flex items-center gap-2 whitespace-nowrap text-small font-medium transition-colors select-none min-h-[44px] cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              variant === "underline" && [
                "pb-3 pt-2 text-ink-muted hover:text-ink",
                isActive && "text-ink font-semibold",
              ],
              variant === "pill" && [
                "px-4 py-2 rounded-[10px] text-ink-muted hover:text-ink",
                isActive && "bg-surface text-ink shadow-sm font-semibold border border-line/60",
              ]
            )}
          >
            <span>{tab.label}</span>
            {tab.badge && <span className="inline-flex">{tab.badge}</span>}
            {variant === "underline" && isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-terracotta rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}

