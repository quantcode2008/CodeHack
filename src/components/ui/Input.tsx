import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-small font-medium text-ink tracking-tight"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-ink-muted">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            className={cn(
              "w-full h-11 px-3.5 bg-surface text-ink text-body placeholder:text-ink-muted/70",
              "border border-line rounded-editorial transition-colors duration-150",
              "focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta",
              "disabled:bg-bone/60 disabled:text-ink-muted disabled:cursor-not-allowed",
              leftIcon && "pl-10",
              (rightIcon || error) && "pr-10",
              error && "border-danger focus:border-danger focus:ring-danger text-danger",
              className
            )}
            {...props}
          />
          {error ? (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-danger">
              <AlertCircle className="w-4 h-4" />
            </div>
          ) : (
            rightIcon && (
              <div className="absolute right-3.5 flex items-center pointer-events-none text-ink-muted">
                {rightIcon}
              </div>
            )
          )}
        </div>
        {error ? (
          <p
            id={`${inputId}-error`}
            className="text-small text-danger font-medium flex items-center gap-1"
          >
            {error}
          </p>
        ) : helperText ? (
          <p id={`${inputId}-helper`} className="text-small text-ink-muted">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
