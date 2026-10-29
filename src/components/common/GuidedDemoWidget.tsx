"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Sparkles,
  CheckCircle2,
  Circle,
  ArrowRight,
  X,
  ChevronDown,
  ChevronUp,
  Layers,
  Search,
  FileCheck,
  ShieldCheck,
  CalendarClock,
  GitBranch,
  CheckCheck,
  Camera,
  RotateCcw,
  FileSpreadsheet,
  AlertTriangle,
} from "lucide-react";
import { useAuth, type Role } from "@/context/AuthContext";
import { useBookings } from "@/context/BookingContext";
import { useOwnerResources } from "@/context/OwnerResourceContext";
import { useIncidents } from "@/context/IncidentContext";
import { useAudit } from "@/context/AuditContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DemoStep {
  id: number;
  title: string;
  role: Role;
  roleLabel: string;
  description: string;
  href: string;
  icon: React.ElementType;
  checkCompleted: (ctx: {
    bookings: any[];
    resources: any[];
    credentials: any[];
    reviewQueue: any[];
    incidents: any[];
    auditLogs: any[];
    pathname: string;
  }) => boolean;
}

export function GuidedDemoWidget() {
  const router = useRouter();
  const pathname = usePathname();
  const { role, setRole, credentials, reviewQueue } = useAuth();
  const { bookings } = useBookings();
  const { resources } = useOwnerResources();
  const { incidents } = useIncidents();
  const { records: auditRecords } = useAudit();

  const [isOpen, setIsOpen] = React.useState(false);
  const [isDismissed, setIsDismissed] = React.useState(false);

  // Restore dismissed state from session storage
  React.useEffect(() => {
    const dismissed = sessionStorage.getItem("commons_demo_widget_dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, []);

  const checkInBookingId = React.useMemo(() => {
    return bookings?.find((b) => b.status === "approved" || b.status === "requested")?.id || "bk-epilog-001";
  }, [bookings]);

  const returnBookingId = React.useMemo(() => {
    return bookings?.find((b) => b.status === "checked_in")?.id || "bk-active-sony-002";
  }, [bookings]);

  const steps: DemoStep[] = React.useMemo(
    () => [
      {
        id: 1,
        title: "Owner Lists Resource",
        role: "owner",
        roleLabel: "Owner",
        href: "/owner/resources/new",
        icon: Layers,
        description:
          "Department owner configures precision equipment, availability rules, and safety prerequisites.",
        checkCompleted: ({ resources }) => resources && resources.length > 0,
      },
      {
        id: 2,
        title: "Student Discovers & Verifies",
        role: "student",
        roleLabel: "Student",
        href: "/discover",
        icon: Search,
        description:
          "Natural-language search matches equipment with live fair-use caps and eligibility checks.",
        checkCompleted: ({ pathname }) =>
          pathname === "/discover" || pathname.startsWith("/resources/"),
      },
      {
        id: 3,
        title: "Upload Missing Credential",
        role: "student",
        roleLabel: "Student",
        href: "/onboarding",
        icon: FileCheck,
        description:
          "Applicant uploads required safety training document into private encrypted vault.",
        checkCompleted: ({ credentials, reviewQueue }) =>
          (credentials && credentials.length > 3) ||
          (reviewQueue && reviewQueue.length > 0),
      },
      {
        id: 4,
        title: "Manager Verifies Credential",
        role: "manager",
        roleLabel: "Manager",
        href: "/admin/credentials",
        icon: ShieldCheck,
        description:
          "Facility coordinator inspects certificate with AI discrepancy pre-check and signed URL.",
        checkCompleted: ({ credentials }) =>
          credentials &&
          credentials.some((c: any) => c.status === "verified" && c.reviewedBy),
      },
      {
        id: 5,
        title: "Request Booking Reservation",
        role: "student",
        roleLabel: "Student",
        href: "/book/microscope-bio-401",
        icon: CalendarClock,
        description:
          "Student declares academic purpose and runs pre-booking fair-use rule verification.",
        checkCompleted: ({ bookings }) => bookings && bookings.length > 0,
      },
      {
        id: 6,
        title: "Contention & Fair Waitlist",
        role: "student",
        roleLabel: "Student",
        href: "/bookings",
        icon: GitBranch,
        description:
          "Algorithmic priority scoring breaks down rank based on seniority, usage caps, and standing.",
        checkCompleted: ({ bookings }) =>
          bookings &&
          bookings.some(
            (b: any) =>
              b.status === "waitlisted" ||
              b.status === "requested" ||
              b.waitlistPriorityScore !== undefined
          ),
      },
      {
        id: 7,
        title: "Owner Approves with Explanation",
        role: "owner",
        roleLabel: "Owner",
        href: "/queue",
        icon: CheckCheck,
        description:
          "Custodian reviews competing requests and issues human-reasoned approval decision.",
        checkCompleted: ({ bookings }) =>
          bookings &&
          bookings.some(
            (b: any) => b.status === "approved" || b.status === "checked_in"
          ),
      },
      {
        id: 8,
        title: "Arrival Condition Check-in",
        role: "student",
        roleLabel: "Student",
        href: `/bookings/${checkInBookingId}/check-in`,
        icon: Camera,
        description:
          "Student logs arrival condition with timestamped photos and launches active timer.",
        checkCompleted: ({ bookings }) =>
          bookings &&
          bookings.some(
            (b: any) =>
              b.status === "checked_in" ||
              b.conditionReports?.before !== undefined
          ),
      },
      {
        id: 9,
        title: "Return & Damage Reporting",
        role: "student",
        roleLabel: "Student",
        href: `/bookings/${returnBookingId}/return`,
        icon: RotateCcw,
        description:
          "Student uploads after-photos for side-by-side comparison and submits incident report.",
        checkCompleted: ({ bookings, incidents }) =>
          (bookings &&
            bookings.some(
              (b: any) =>
                b.status === "returned" ||
                b.conditionReports?.after !== undefined
            )) ||
          (incidents && incidents.length > 0),
      },
      {
        id: 10,
        title: "Resolution & Immutable Audit",
        role: "admin",
        roleLabel: "Admin / Owner",
        href: "/admin/audit",
        icon: FileSpreadsheet,
        description:
          "Custodian resolves damage claim; all parties inspect the SHA-256 tamper-evident ledger.",
        checkCompleted: ({ auditLogs, incidents }) =>
          (incidents && incidents.some((i: any) => i.status === "resolved")) ||
          (auditLogs && auditLogs.length > 0),
      },
    ],
    [checkInBookingId, returnBookingId]
  );

  const contextState = React.useMemo(
    () => ({
      bookings,
      resources,
      credentials,
      reviewQueue,
      incidents,
      auditLogs: auditRecords,
      pathname,
    }),
    [bookings, resources, credentials, reviewQueue, incidents, auditRecords, pathname]
  );

  const completionMap = React.useMemo(() => {
    return steps.map((s) => s.checkCompleted(contextState));
  }, [steps, contextState]);

  const completedCount = completionMap.filter(Boolean).length;
  const nextIncompleteIndex = completionMap.findIndex((c) => !c);
  const nextStep =
    nextIncompleteIndex !== -1 ? steps[nextIncompleteIndex] : steps[0];

  const handleExecuteStep = (step: DemoStep) => {
    // 1. Switch active role to match the step persona
    if (role !== step.role) {
      setRole(step.role);
      toast.info(`Switched view to ${step.roleLabel}.`);
    }

    // 2. Navigate to deep-linked target page
    router.push(step.href);
    setIsOpen(false);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("commons_demo_widget_dismissed", "true");
    toast.success("Lifecycle walkthrough minimized. Click tour pill to restore anytime.");
  };

  if (isDismissed) {
    return (
      <button
        type="button"
        onClick={() => {
          setIsDismissed(false);
          sessionStorage.removeItem("commons_demo_widget_dismissed");
          setIsOpen(true);
        }}
        className="fixed bottom-4 left-4 z-40 bg-surface/90 backdrop-blur-md border border-line text-ink hover:text-terracotta text-xs font-mono py-1.5 px-3 rounded-full shadow-md flex items-center gap-2 hover:bg-bone transition-all"
        title="Restore Lifecycle Tour"
      >
        <Sparkles className="w-3.5 h-3.5 text-terracotta" />
        <span>Campus Tour ({completedCount}/10)</span>
      </button>
    );
  }

  return (
    <>
      {/* ======================================================== */}
      {/* FLOATING ACTION PILL (ALWAYS VISIBLE)                    */}
      {/* ======================================================== */}
      <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-40">
        <div className="flex items-center gap-2">
          {/* Main Toggle Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 bg-ink text-surface hover:bg-ink/90 active:scale-98 transition-all px-4 py-2.5 rounded-full shadow-lg border border-surface/20"
            aria-expanded={isOpen}
            aria-label="Open Lifecycle Tour"
          >
            <div className="w-6 h-6 rounded-full bg-terracotta flex items-center justify-center text-surface">
              <Sparkles className="w-3.5 h-3.5" />
            </div>

            <div className="text-left hidden sm:block">
              <div className="text-xs font-mono uppercase tracking-wider text-bone/80 flex items-center gap-1.5 leading-none">
                <span>Lifecycle Guide</span>
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" />
              </div>
              <div className="text-small font-semibold text-surface leading-tight mt-0.5">
                {completedCount}/10 Steps Done
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-surface sm:hidden">
              {completedCount}/10
            </span>

            {isOpen ? (
              <ChevronDown className="w-4 h-4 text-bone/60" />
            ) : (
              <ChevronUp className="w-4 h-4 text-bone/60" />
            )}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* EXPANDED POPUP DRAWER / SHEET                            */}
      {/* ======================================================== */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="guided-tour-title"
          className="fixed bottom-28 lg:bottom-20 right-4 lg:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[480px] max-h-[75vh] bg-surface border border-line rounded-2xl shadow-editorial-modal flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="p-5 border-b border-line bg-bone/40 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-terracotta/10 text-terracotta text-[11px] font-mono font-semibold">
                  END-TO-END VERIFICATION
                </span>
                <span className="text-xs font-mono text-ink-muted">
                  {completedCount} of 10 Complete
                </span>
              </div>
              <h2
                id="guided-tour-title"
                className="font-display text-h3 text-ink leading-tight"
              >
                Campus Lifecycle Walkthrough
              </h2>
              <p className="text-xs text-ink-muted mt-1">
                Direct transition across roles from Listing &rarr; Approval &rarr; Photo Check-in &rarr; Damage Resolution.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-ink-muted hover:text-ink rounded-full hover:bg-bone transition-colors"
              aria-label="Close tour dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-line/60 h-1.5">
            <div
              className="bg-terracotta h-1.5 transition-all duration-300"
              style={{ width: `${(completedCount / 10) * 100}%` }}
            />
          </div>

          {/* Scrollable Steps List */}
          <div className="p-4 overflow-y-auto space-y-2.5 flex-1 divide-y divide-line/40">
            {steps.map((step, idx) => {
              const isDone = completionMap[idx];
              const isCurrent = idx === nextIncompleteIndex;
              const Icon = step.icon;

              return (
                <div
                  key={step.id}
                  className={cn(
                    "pt-2.5 first:pt-0 pb-1 rounded-xl px-2.5 transition-colors",
                    isCurrent ? "bg-bone/70 border border-terracotta/30" : "hover:bg-bone/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-success fill-success/15" />
                        ) : isCurrent ? (
                          <div className="w-5 h-5 rounded-full border-2 border-terracotta flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-terracotta animate-ping" />
                          </div>
                        ) : (
                          <Circle className="w-5 h-5 text-line" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-small text-ink">
                            {step.id}. {step.title}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] font-mono px-2 py-0.5 rounded-full font-medium",
                              step.role === "student"
                                ? "bg-bone border border-line text-ink"
                                : step.role === "owner"
                                ? "bg-terracotta/10 text-terracotta"
                                : step.role === "manager"
                                ? "bg-sage/20 text-success"
                                : "bg-ink text-surface"
                            )}
                          >
                            As {step.roleLabel}
                          </span>
                        </div>
                        <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleExecuteStep(step)}
                      className={cn(
                        "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 transition-all min-h-[36px]",
                        isCurrent
                          ? "bg-terracotta text-surface hover:bg-terracotta/90 shadow-xs"
                          : "bg-surface border border-line text-ink hover:border-ink"
                      )}
                    >
                      <span>Jump</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Navigation Bar */}
          <div className="p-3.5 bg-bone/50 border-t border-line flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs text-ink-muted hover:text-ink underline"
            >
              Minimize Pill
            </button>

            <button
              type="button"
              onClick={() => handleExecuteStep(nextStep)}
              className="px-4 py-2 bg-ink text-surface hover:bg-ink/90 rounded-full text-xs font-semibold flex items-center gap-2 shadow-xs"
            >
              <span>Next: Step {nextStep.id} ({nextStep.roleLabel})</span>
              <ArrowRight className="w-3.5 h-3.5 text-terracotta" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
