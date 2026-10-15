"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "figure" | "section" | "li";
  /** Fraction of the element that must be visible before it is revealed. */
  threshold?: number;
};

/**
 * Adds `is-revealed` the first time the element scrolls into view.
 * The CSS decides what the reveal looks like (and skips it entirely when
 * the visitor prefers reduced motion or JavaScript is unavailable).
 */
export function Reveal({ children, className = "", as: Tag = "div", threshold = 0.15 }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={`reveal${shown ? " is-revealed" : ""} ${className}`}>
      {children}
    </Tag>
  );
}
