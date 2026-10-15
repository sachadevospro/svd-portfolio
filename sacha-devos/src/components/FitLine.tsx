"use client";

import { useRef } from "react";
import { useFitText } from "@/lib/fit";

/** A single line of display type that always spans the full width of its container. */
export function FitLine({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useFitText(ref);
  return (
    <p ref={ref} className={className} aria-hidden="true">
      {children}
    </p>
  );
}
