"use client";

import * as React from "react";
import Link from "next/link";
import { Clock, AlertTriangle, RotateCcw, PlusCircle, AlertCircle, ArrowRight } from "lucide-react";
import { useBookings, type BookingRecord } from "@/context/BookingContext";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { cn } from "@/lib/utils";

interface BookingTimerProps {
  booking: BookingRecord;
  className?: string;
  variant?: "full" | "compact" | "banner";
  onReturnClick?: () => void;
}

export function BookingTimer({
  booking,
  className,
  variant = "full",
  onReturnClick,
}: BookingTimerProps) {
  const { extendBooking, markOverdue } = useBookings();
  const [now, setNow] = React.useState(Date.now());
  const [isExtendOpen, setIsExtendOpen] = React.useState(false);
  const [extendHours, setExtendHours] = React.useState(1);
  const [isExtending, setIsExtending] = React.useState(false);

  // Update clock every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const endTime = new Date(booking.timeRangeEnd).getTime();
  const diffSeconds = Math.floor((endTime - now) / 1000);
  const isOverdue = diffSeconds <= 0;
  const isWarning = diffSeconds > 0 && diffSeconds <= 900; // <= 15 minutes

  // Auto-mark overdue in state once
  React.useEffect(() => {
    if (isOverdue && booking.status === "checked_in") {
      markOverdue(booking.id);
    }
  }, [isOverdue, booking.id, booking.status, markOverdue]);

  // Format seconds to HH:MM:SS or MM:SS
  const formatTime = (totalSeconds: number) => {
    const absSeconds = Math.abs(totalSeconds);
    const hours = Math.floor(absSeconds / 3600);
    const minutes = Math.floor((absSeconds % 3600) / 60);
    const seconds = absSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, "0");

    if (hours > 0) {
      return `${hours}h ${pad(minutes)}m ${pad(seconds)}s`;
    }
    return `${pad(minutes)}m ${pad(seconds)}s`;
  };

  const handleConfirmExtend = async () => {
    setIsExtending(true);
    await extendBooking(booking.id, extendHours);
    setIsExtending(false);
    setIsExtendOpen(false);
  };

  // Only render for active or overdue sessions
  if (booking.status !== "checked_in" && booking.status !== "overdue") {
    return null;
  }

  // Compact Variant (e.g., inside cards or table rows)
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border",
          isOverdue
            ? "bg-[#FCF2F1] text-danger border-[#ECCAC7] animate-pulse"
            : isWarning
            ? "bg-[#FDF9EE] text-[#8C6114] border-[#EAD9B8]"
            : "bg-[#FDF5F2] text-terracotta border-[#F1D0C4]",
          className
        )}
      >
        <span
          className={cn(
            "w-2 h-2 rounded-full shrink-0",
            isOverdue ? "bg-danger" : isWarning ? "bg-[#B07A1E] animate-ping" : "bg-terracotta animate-pulse"
          )}
        />
        <span>
          {isOverdue ? `Overdue +${formatTime(diffSeconds)}` : `${formatTime(diffSeconds)} left`}
        </span>
      </div>
    );
  }

  // Full & Banner Variant
  return (
    <>
      <div
        className={cn(
          "rounded-editorial border p-4 sm:p-5 transition-all shadow-xs",
          isOverdue
            ? "bg-[#FCF2F1] border-danger/40 text-danger"
            : isWarning
            ? "bg-[#FDF9EE] border-[#B07A1E]/40 text-[#8C6114]"
            : "bg-surface border-line text-ink",
          className
        )}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Status & Clock Display */}
          <div className="flex items-start gap-3.5">
            <div
              className={cn(
                "p-2.5 rounded-full border shrink-0 mt-0.5",
                isOverdue
                  ? "bg-danger/10 border-danger/30 text-danger"
                  : isWarning
                  ? "bg-[#B07A1E]/10 border-[#B07A1E]/30 text-[#B07A1E]"
                  : "bg-terracotta/10 border-terracotta/30 text-terracotta"
              )}
            >
              {isOverdue ? (
                <AlertCircle className="w-5 h-5 animate-pulse" />
              ) : isWarning ? (
                <AlertTriangle className="w-5 h-5 animate-bounce" />
              ) : (
                <Clock className="w-5 h-5" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-mono-label uppercase font-bold text-[10px]",
                    isOverdue ? "text-danger" : isWarning ? "text-[#8C6114]" : "text-ink-muted"
                  )}
                >
                  {isOverdue
                    ? "Session Overdue Notice"
                    : isWarning
                    ? "Final 15-Minute Window"
                    : "Active Reservation In Progress"}
                </span>
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    isOverdue ? "bg-danger animate-ping" : isWarning ? "bg-[#B07A1E] animate-ping" : "bg-terracotta"
                  )}
                />
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight">
                  {formatTime(diffSeconds)}
                </span>
                <span className="text-xs font-sans opacity-80">
                  {isOverdue ? "past scheduled checkout" : "remaining in session"}
                </span>
              </div>

              <p className="text-xs leading-relaxed max-w-xl opacity-90">
                {isOverdue
                  ? "Scheduled handoff time has elapsed. Please proceed to the return checklist immediately to maintain your campus clean standing."
                  : isWarning
                  ? "Your booking ends in less than 15 minutes. Prepare to clean the workspace, holster components, or request an extension if no conflicting slots exist."
                  : "Custody confirmed via arrival inspection. Return before scheduled expiration to prevent standing penalties."}
              </p>
            </div>
          </div>

          {/* Action Triggers */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-line/40">
            {!isOverdue && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<PlusCircle className="w-4 h-4 text-terracotta" />}
                onClick={() => setIsExtendOpen(true)}
                className="flex-1 sm:flex-initial"
              >
                Extend (+1h)
              </Button>
            )}

            <Link
              href={`/bookings/${booking.id}/return`}
              className="flex-1 sm:flex-initial"
              onClick={onReturnClick}
            >
              <Button
                variant={isOverdue ? "danger" : "accent"}
                size="sm"
                leftIcon={<RotateCcw className="w-4 h-4" />}
                rightIcon={<ArrowRight className="w-3.5 h-3.5 opacity-70" />}
                className="w-full"
              >
                {isOverdue ? "Return Now (Overdue)" : "Return & Check Out"}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Extension Modal Dialog */}
      <Dialog
        isOpen={isExtendOpen}
        onClose={() => setIsExtendOpen(false)}
        title="Extend Session Window"
        description="Consecutive slot verification & fair-use allowance check."
      >
        <div className="space-y-4 pt-2 text-ink text-xs">
          <p className="leading-relaxed text-ink-muted">
            Extensions are evaluated against subsequent reservations on{" "}
            <strong className="text-ink">{booking.resourceTitle}</strong> and your weekly fair-use balance.
          </p>

          <div className="p-3 bg-bone/70 border border-line rounded-editorial space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-ink-muted">Current Slot Expiration:</span>
              <span className="font-mono font-semibold">
                {new Date(booking.timeRangeEnd).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-ink-muted">Requested Extension:</span>
              <span className="font-mono text-terracotta font-bold">+{extendHours} Hour(s)</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1 border-t border-line/60">
              <span className="text-ink-muted">New Scheduled Expiration:</span>
              <span className="font-mono font-bold text-ink">
                {new Date(
                  new Date(booking.timeRangeEnd).getTime() + extendHours * 3600000
                ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-mono-label uppercase text-ink-muted font-bold block">
              Select Extension Length
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setExtendHours(1)}
                className={cn(
                  "p-3 rounded-editorial border text-center transition-all min-h-[44px]",
                  extendHours === 1
                    ? "bg-terracotta text-white border-terracotta"
                    : "bg-surface border-line text-ink hover:border-terracotta/50"
                )}
              >
                <div className="font-bold">+1.0 Hour</div>
                <div className="text-[10px] opacity-80">Available slot</div>
              </button>
              <button
                type="button"
                onClick={() => setExtendHours(2)}
                className={cn(
                  "p-3 rounded-editorial border text-center transition-all min-h-[44px]",
                  extendHours === 2
                    ? "bg-terracotta text-white border-terracotta"
                    : "bg-surface border-line text-ink hover:border-terracotta/50"
                )}
              >
                <div className="font-bold">+2.0 Hours</div>
                <div className="text-[10px] opacity-80">Max consecutive</div>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
            <Button variant="ghost" size="sm" onClick={() => setIsExtendOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="accent"
              size="sm"
              isLoading={isExtending}
              onClick={handleConfirmExtend}
            >
              Confirm Extension
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

