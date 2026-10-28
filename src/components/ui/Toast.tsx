"use client";

import * as React from "react";
import { Toaster as SonnerToaster } from "sonner";

export function ToastContainer() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex items-center gap-3 w-full max-w-sm p-4 bg-surface border border-line rounded-editorial text-ink text-small shadow-editorial transition-all",
          title: "font-medium text-ink",
          description: "text-ink-muted text-xs",
          actionButton:
            "px-3 py-1.5 bg-terracotta text-surface rounded-md text-xs font-medium hover:bg-terracotta-hover transition-colors",
          cancelButton:
            "px-3 py-1.5 bg-bone text-ink rounded-md text-xs font-medium hover:bg-line transition-colors",
          success: "border-success/40 text-success",
          error: "border-danger/40 text-danger",
          warning: "border-warning/40 text-warning",
          info: "border-line text-ink",
        },
      }}
    />
  );
}
