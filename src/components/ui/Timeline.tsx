import * as React from "react";
import { Badge, type BadgeStatus } from "./Badge";
import { cn } from "@/lib/utils";

export interface TimelineEvent {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: "Student" | "Owner" | "Manager" | "Admin";
  previousStatus?: BadgeStatus;
  newStatus: BadgeStatus;
  notes?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function Timeline({ events, className }: TimelineProps) {
  return (
    <div className={cn("relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-line", className)}>
      {events.map((evt) => (
        <div key={evt.id} className="relative group">
          {/* Node marker */}
          <div className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-surface border-2 border-terracotta group-hover:scale-125 transition-transform" />

          {/* Event Content */}
          <div className="bg-surface border border-line rounded-editorial p-4 shadow-sm hover:border-ink/20 transition-all">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-small font-semibold text-ink">
                  {evt.actorName}
                </span>
                <span className="text-mono-label text-ink-muted px-1.5 py-0.5 rounded bg-bone border border-line/60">
                  {evt.actorRole}
                </span>
              </div>
              <time className="text-mono-label text-ink-muted">
                {evt.timestamp}
              </time>
            </div>

            <div className="flex items-center gap-2 mb-2">
              {evt.previousStatus && (
                <>
                  <Badge status={evt.previousStatus} showDot={false} />
                  <span className="text-ink-muted text-xs">→</span>
                </>
              )}
              <Badge status={evt.newStatus} />
            </div>

            {evt.notes && (
              <p className="text-small text-ink/90 leading-relaxed bg-bone/40 p-2.5 rounded-md border border-line/40">
                {evt.notes}
              </p>
            )}

            {evt.metadata && Object.keys(evt.metadata).length > 0 && (
              <div className="mt-2 pt-2 border-t border-line/40 flex flex-wrap gap-2 text-mono-label text-ink-muted">
                {Object.entries(evt.metadata).map(([key, val]) => (
                  <span key={key} className="bg-bone px-2 py-0.5 rounded">
                    {key}: <strong className="text-ink">{String(val)}</strong>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

