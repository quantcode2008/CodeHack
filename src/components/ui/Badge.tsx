import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeStatus =
  | "requested"
  | "pending"
  | "approved"
  | "rejected"
  | "waitlisted"
  | "active"
  | "checked_in"
  | "returned"
  | "completed"
  | "cancelled"
  | "overdue"
  | "disputed"
  | "verified"
  | "unverified"
  | "expired"
  | "neutral";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: BadgeStatus;
  showDot?: boolean;
}

export function Badge({
  className,
  status = "neutral",
  showDot = true,
  children,
  ...props
}: BadgeProps) {
  const statusStyles: Record<
    BadgeStatus,
    { badge: string; dot: string; label: string }
  > = {
    requested: {
      badge: "bg-[#FDF9EE] text-[#8C6114] border-[#EAD9B8]",
      dot: "bg-warning",
      label: "Requested",
    },
    pending: {
      badge: "bg-[#FDF9EE] text-[#8C6114] border-[#EAD9B8]",
      dot: "bg-warning",
      label: "Pending",
    },
    approved: {
      badge: "bg-[#F0F5F1] text-[#2F5338] border-[#C6DBCB]",
      dot: "bg-success",
      label: "Approved",
    },
    rejected: {
      badge: "bg-[#FCF2F1] text-[#7F261E] border-[#ECCAC7]",
      dot: "bg-danger",
      label: "Rejected",
    },
    waitlisted: {
      badge: "bg-[#F4F6F2] text-[#55634A] border-[#D4DDCF]",
      dot: "bg-sage",
      label: "Waitlisted",
    },
    active: {
      badge: "bg-[#FDF5F2] text-[#8F3718] border-[#F1D0C4]",
      dot: "bg-terracotta",
      label: "Active",
    },
    checked_in: {
      badge: "bg-[#FDF5F2] text-[#8F3718] border-[#F1D0C4]",
      dot: "bg-terracotta",
      label: "Checked In",
    },
    returned: {
      badge: "bg-[#F0F5F1] text-[#2F5338] border-[#C6DBCB]",
      dot: "bg-success",
      label: "Returned",
    },
    completed: {
      badge: "bg-[#F0F5F1] text-[#2F5338] border-[#C6DBCB]",
      dot: "bg-success",
      label: "Completed",
    },
    cancelled: {
      badge: "bg-bone text-ink-muted border-line",
      dot: "bg-ink-muted/50",
      label: "Cancelled",
    },
    overdue: {
      badge: "bg-[#FCF2F1] text-[#7F261E] border-[#ECCAC7]",
      dot: "bg-danger animate-pulse",
      label: "Overdue",
    },
    disputed: {
      badge: "bg-[#FCF2F1] text-[#8C281F] border-[#E8BFBB]",
      dot: "bg-danger",
      label: "Disputed",
    },
    verified: {
      badge: "bg-[#F0F5F1] text-[#2F5338] border-[#C6DBCB]",
      dot: "bg-success",
      label: "Verified",
    },
    unverified: {
      badge: "bg-[#FDF5F2] text-[#8F3718] border-[#F1D0C4]",
      dot: "bg-terracotta",
      label: "Unverified",
    },
    expired: {
      badge: "bg-bone text-ink-muted border-line",
      dot: "bg-ink-muted",
      label: "Expired",
    },
    neutral: {
      badge: "bg-surface text-ink-muted border-line",
      dot: "bg-ink-muted",
      label: "Default",
    },
  };

  const current = statusStyles[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-mono-label font-mono font-medium tracking-wider uppercase transition-colors select-none",
        current.badge,
        className
      )}
      {...props}
    >
      {showDot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", current.dot)}
          aria-hidden="true"
        />
      )}
      <span>{children || current.label}</span>
    </span>
  );
}

