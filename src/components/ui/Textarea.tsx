import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  maxLengthIndicator?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      maxLengthIndicator = false,
      maxLength,
      value,
      defaultValue,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const [charCount, setCharCount] = React.useState<number>(
      value
        ? String(value).length
        : defaultValue
        ? String(defaultValue).length
        : 0
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      props.onChange?.(e);
    };

    return (
      <div className="w-full space-y-1.5">
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={textareaId}
              className="block text-small font-medium text-ink tracking-tight"
            >
              {label}
            </label>
          )}
          {maxLengthIndicator && maxLength && (
            <span className="text-mono-label text-ink-muted">
              {charCount}/{maxLength}
            </span>
          )}
        </div>
        <div className="relative">
          <textarea
            id={textareaId}
            ref={ref}
            disabled={disabled}
            maxLength={maxLength}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${textareaId}-error`
                : helperText
                ? `${textareaId}-helper`
                : undefined
            }
            className={cn(
              "w-full min-h-[110px] p-3.5 bg-surface text-ink text-body placeholder:text-ink-muted/70",
              "border border-line rounded-editorial transition-colors duration-150 resize-y",
              "focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta",
              "disabled:bg-bone/60 disabled:text-ink-muted disabled:cursor-not-allowed",
              error && "border-danger focus:border-danger focus:ring-danger text-danger",
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p
            id={`${textareaId}-error`}
            className="text-small text-danger font-medium flex items-center gap-1"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p id={`${textareaId}-helper`} className="text-small text-ink-muted">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
