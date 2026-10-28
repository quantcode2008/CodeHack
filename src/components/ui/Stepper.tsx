import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepItem {
  id: string | number;
  title: string;
  description?: string;
  status: "completed" | "current" | "upcoming";
}

export interface StepperProps {
  steps: StepItem[];
  className?: string;
}

export function Stepper({ steps, className }: StepperProps) {
  return (
    <nav aria-label="Progress Stepper" className={cn("w-full py-2", className)}>
      <ol className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-2">
        {steps.map((step, idx) => {
          const isCompleted = step.status === "completed";
          const isCurrent = step.status === "current";
          const isLast = idx === steps.length - 1;

          return (
            <li
              key={step.id}
              className="flex items-center gap-3 w-full sm:w-auto flex-1 last:flex-none"
            >
              <div className="flex items-center gap-3">
                {/* Step Circle */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-medium transition-colors border shrink-0",
                    isCompleted && "bg-success text-surface border-success",
                    isCurrent && "bg-terracotta text-surface border-terracotta ring-4 ring-terracotta/20 font-bold",
                    !isCompleted && !isCurrent && "bg-bone text-ink-muted border-line"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                {/* Step Label */}
                <div className="flex flex-col">
                  <span
                    className={cn(
                      "text-small font-medium leading-tight",
                      isCurrent ? "text-ink font-semibold" : "text-ink-muted"
                    )}
                  >
                    {step.title}
                  </span>
                  {step.description && (
                    <span className="text-mono-label text-ink-muted">
                      {step.description}
                    </span>
                  )}
                </div>
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div
                  aria-hidden="true"
                  className={cn(
                    "hidden sm:block flex-1 h-[1px] mx-4 transition-colors",
                    isCompleted ? "bg-success" : "bg-line"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

