"use client";

import * as React from "react";
import { gsap } from "gsap";

export function CustomCursor() {
  const cursorRef = React.useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  React.useEffect(() => {
    // Check for desktop fine pointer and respect reduced motion
    const finePointer = window.matchMedia("(pointer: fine) and (min-width: 1024px)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!finePointer || reducedMotion) {
      setEnabled(false);
      return;
    }

    setEnabled(true);
    const cursor = cursorRef.current;
    if (!cursor) return;

    const xTo = gsap.quickTo(cursor, "x", { duration: 0.18, ease: "power2.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.18, ease: "power2.out" });

    const onMouseMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const isInteractive = Boolean(
        target.closest("a, button, [role='button'], input, select, textarea, label, .interactive-hover")
      );
      setIsHovered(isInteractive);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseover", onMouseOver, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[999] -translate-x-1/2 -translate-y-1/2 transition-transform duration-150 ease-out"
      style={{
        width: isHovered ? "42px" : "10px",
        height: isHovered ? "42px" : "10px",
        borderRadius: "9999px",
        backgroundColor: isHovered ? "rgba(184, 82, 46, 0.12)" : "#B8522E",
        border: isHovered ? "1.5px solid #B8522E" : "none",
        mixBlendMode: "normal",
      }}
    />
  );
}

