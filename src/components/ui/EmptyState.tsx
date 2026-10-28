import * as React from "react";
import { FolderSearch } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-line rounded-editorial-lg bg-surface/60",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-bone border border-line flex items-center justify-center text-ink-muted mb-4 shadow-sm">
        {icon || <FolderSearch className="w-6 h-6 stroke-[1.5]" />}
      </div>
      <h3 className="font-display text-h3 text-ink font-normal mb-2 max-w-md">
        {title}
      </h3>
      <p className="text-small text-ink-muted max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

