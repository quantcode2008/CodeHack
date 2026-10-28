import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: "sm" | "md" | "lg" | "full";
}

export function Skeleton({
  className,
  rounded = "md",
  ...props
}: SkeletonProps) {
  const roundedStyles = {
    sm: "rounded-[6px]",
    md: "rounded-editorial",
    lg: "rounded-editorial-lg",
    full: "rounded-full",
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden bg-line/50 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-surface/40 before:to-transparent",
        roundedStyles[rounded],
        className
      )}
      {...props}
    />
  );
}

