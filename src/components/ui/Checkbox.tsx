import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, disabled, checked, defaultChecked, onChange, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const [isChecked, setIsChecked] = React.useState<boolean>(
      checked !== undefined ? !!checked : !!defaultChecked
    );

    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(!!checked);
      }
    }, [checked]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (checked === undefined) {
        setIsChecked(e.target.checked);
      }
      onChange?.(e);
    };

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className={cn(
            "flex items-start gap-3 select-none cursor-pointer group min-h-[44px] py-1",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <div className="relative flex items-center justify-center shrink-0 mt-0.5">
            <input
              id={inputId}
              ref={ref}
              type="checkbox"
              disabled={disabled}
              checked={checked !== undefined ? checked : isChecked}
              onChange={handleChange}
              className="sr-only peer"
              aria-invalid={!!error}
              {...props}
            />
            <div
              className={cn(
                "w-5 h-5 rounded-[6px] border border-line bg-surface transition-all duration-150 flex items-center justify-center",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-terracotta peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bone",
                "peer-checked:bg-ink peer-checked:border-ink",
                error && "border-danger",
                className
              )}
            >
              <Check
                className={cn(
                  "w-3.5 h-3.5 text-surface stroke-[2.5] transition-opacity duration-150",
                  isChecked ? "opacity-100" : "opacity-0"
                )}
              />
            </div>
          </div>
          {(label || description) && (
            <div className="flex flex-col text-left">
              {label && (
                <span className="text-body font-medium text-ink group-hover:text-ink/90">
                  {label}
                </span>
              )}
              {description && (
                <span className="text-small text-ink-muted leading-relaxed">
                  {description}
                </span>
              )}
            </div>
          )}
        </label>
        {error && (
          <p className="mt-1 text-small text-danger font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
