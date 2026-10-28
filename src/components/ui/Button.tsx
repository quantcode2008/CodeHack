import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      primary:
        "bg-ink text-surface hover:bg-[#2C2B27] active:bg-[#151412] border border-ink focus-visible:ring-ink",
      accent:
        "bg-terracotta text-surface hover:bg-terracotta-hover active:bg-[#8F3718] border border-terracotta focus-visible:ring-terracotta",
      outline:
        "bg-transparent text-ink hover:bg-bone active:bg-line/60 border border-line focus-visible:ring-terracotta",
      ghost:
        "bg-transparent text-ink hover:bg-bone/80 active:bg-line/40 border border-transparent focus-visible:ring-terracotta",
      danger:
        "bg-danger text-surface hover:bg-[#8F2D23] active:bg-[#78241B] border border-danger focus-visible:ring-danger",
    };

    const sizeStyles = {
      sm: "h-9 px-3.5 text-small gap-1.5 rounded-editorial min-h-[44px] min-w-[44px]",
      md: "h-11 px-5 text-body gap-2 rounded-editorial min-h-[44px]",
      lg: "h-13 px-7 text-h4 font-medium gap-2.5 rounded-editorial-lg min-h-[48px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-150 select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bone",
          "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed cursor-pointer",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

