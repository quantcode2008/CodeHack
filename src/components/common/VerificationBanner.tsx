"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function VerificationBanner() {
  const { verifiedStatus, role } = useAuth();
  const [dismissed, setDismissed] = React.useState(false);

  // Owners, managers, and admins don't need the student verification banner
  if (role !== "student" || dismissed) {
    return null;
  }

  if (verifiedStatus === "verified") {
    return null; // Quiet state when fully verified
  }

  const configs = {
    unverified: {
      wrapper: "bg-[#FDF5F2] border-terracotta/30 text-ink",
      icon: <ShieldAlert className="w-5 h-5 text-terracotta shrink-0 mt-0.5" />,
      tag: "Verification Required",
      tagColor: "bg-terracotta/10 text-terracotta border-terracotta/20",
      title: "Your campus account is unverified",
      message:
        "Complete the 3-step academic onboarding to upload your safety certificates and unlock precision lab bookings.",
      actionLabel: "Complete Onboarding",
      actionHref: "/onboarding",
      buttonVariant: "accent" as const,
    },
    pending: {
      wrapper: "bg-[#FDF9EE] border-warning/40 text-ink",
      icon: <Clock className="w-5 h-5 text-warning shrink-0 mt-0.5" />,
      tag: "Review In Progress",
      tagColor: "bg-warning/10 text-[#8C6114] border-warning/30",
      title: "Credential evaluation pending",
      message:
        "Your safety credentials are under review by Eastbrook lab coordinators. Average turnaround is 4 academic hours.",
      actionLabel: "View Credentials",
      actionHref: "/profile",
      buttonVariant: "outline" as const,
    },
    rejected: {
      wrapper: "bg-[#FCF2F1] border-danger/40 text-ink",
      icon: <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />,
      tag: "Action Required",
      tagColor: "bg-danger/10 text-danger border-danger/20",
      title: "Credential rejected or expired",
      message:
        "A lab coordinator noted a discrepancy on your submission. Please inspect the review note and upload a valid certificate.",
      actionLabel: "Inspect & Fix",
      actionHref: "/profile",
      buttonVariant: "danger" as const,
    },
  };

  const current = configs[verifiedStatus];
  if (!current) return null;

  return (
    <aside
      aria-label="Campus Verification Status Notice"
      className={cn(
        "relative mx-4 sm:mx-8 mt-4 p-4 rounded-editorial border shadow-sm transition-all animate-in fade-in slide-in-from-top-2 duration-200",
        current.wrapper
      )}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          {current.icon}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
                  current.tagColor
                )}
              >
                {current.tag}
              </span>
              <span className="text-small font-semibold text-ink">
                {current.title}
              </span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed max-w-2xl">
              {current.message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <Link href={current.actionHref}>
            <Button
              size="sm"
              variant={current.buttonVariant}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {current.actionLabel}
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss notice"
            className="p-1.5 text-ink-muted hover:text-ink rounded-full hover:bg-bone transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

