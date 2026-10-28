import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
  verified?: boolean;
}

export function Avatar({
  className,
  src,
  name,
  subtitle,
  size = "md",
  verified = false,
  ...props
}: AvatarProps) {
  const getInitials = (nameStr: string) => {
    return nameStr
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const sizeStyles = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-small",
    lg: "w-14 h-14 text-h4 font-display",
  };

  return (
    <div className="inline-flex items-center gap-3">
      <div
        className={cn(
          "relative inline-flex items-center justify-center rounded-full bg-bone border border-line text-ink font-semibold overflow-hidden shrink-0 select-none",
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}

        {verified && (
          <span
            title="Verified Campus Identity"
            className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-surface"
          />
        )}
      </div>

      {subtitle && (
        <div className="flex flex-col text-left">
          <span className="text-small font-medium text-ink leading-tight">
            {name}
          </span>
          <span className="text-mono-label text-ink-muted">{subtitle}</span>
        </div>
      )}
    </div>
  );
}

