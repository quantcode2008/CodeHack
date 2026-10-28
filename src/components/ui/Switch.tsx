import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  id?: string;
  className?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked,
      defaultChecked = false,
      onCheckedChange,
      disabled = false,
      label,
      description,
      id,
      className,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const switchId = id || generatedId;
    const [isChecked, setIsChecked] = React.useState<boolean>(
      checked !== undefined ? checked : defaultChecked
    );

    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked);
      }
    }, [checked]);

    const handleToggle = () => {
      if (disabled) return;
      const next = !isChecked;
      if (checked === undefined) {
        setIsChecked(next);
      }
      onCheckedChange?.(next);
    };

    return (
      <div className="flex items-start justify-between gap-4 py-1.5 min-h-[44px]">
        {(label || description) && (
          <label
            htmlFor={switchId}
            onClick={handleToggle}
            className={cn(
              "flex flex-col text-left cursor-pointer select-none",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            {label && (
              <span className="text-body font-medium text-ink">{label}</span>
            )}
            {description && (
              <span className="text-small text-ink-muted leading-relaxed">
                {description}
              </span>
            )}
          </label>
        )}
        <button
          id={switchId}
          ref={ref}
          type="button"
          role="switch"
          aria-checked={isChecked}
          disabled={disabled}
          onClick={handleToggle}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-line transition-colors duration-200 ease-in-out",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-bone",
            "disabled:cursor-not-allowed disabled:opacity-50",
            isChecked ? "bg-terracotta border-terracotta" : "bg-line/40",
            className
          )}
          {...props}
        >
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none inline-block h-5 w-5 rounded-full bg-surface shadow-sm transform transition duration-200 ease-in-out",
              isChecked ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>
    );
  }
);

Switch.displayName = "Switch";
