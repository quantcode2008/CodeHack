"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  position?: "bottom" | "right";
  className?: string;
}

export function Sheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  position = "bottom",
  className,
}: SheetProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const isBottom = position === "bottom";

  const sheetVariants = {
    hidden: isBottom ? { y: "100%", opacity: 0.8 } : { x: "100%", opacity: 0.8 },
    visible: isBottom
      ? { y: 0, opacity: 1, transition: { type: "spring" as const, damping: 28, stiffness: 300 } }
      : { x: 0, opacity: 1, transition: { type: "spring" as const, damping: 30, stiffness: 320 } },
    exit: isBottom
      ? { y: "100%", opacity: 0.5, transition: { duration: 0.2, ease: "easeIn" as const } }
      : { x: "100%", opacity: 0.5, transition: { duration: 0.2, ease: "easeIn" as const } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/40 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title || "Panel Sheet"}
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "relative z-10 w-full bg-surface border-line shadow-editorial-sheet overflow-hidden flex flex-col",
              isBottom
                ? "max-h-[88vh] rounded-t-editorial-xl border-t border-x"
                : "h-full max-w-md border-l rounded-none sm:rounded-l-editorial-xl",
              className
            )}
          >
            {/* Grab handle for bottom sheet */}
            {isBottom && (
              <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
                <div className="w-12 h-1.5 rounded-full bg-line/80" />
              </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-4 pb-3 border-b border-line/60">
              <div className="space-y-1">
                {title && (
                  <h2 className="font-display text-h3 text-ink font-normal leading-tight">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-small text-ink-muted leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close sheet"
                className="p-2 -mr-2 text-ink-muted hover:text-ink hover:bg-bone rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content area */}
            <div className="p-6 overflow-y-auto flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
