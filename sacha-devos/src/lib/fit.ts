"use client";

import { useLayoutEffect, type RefObject } from "react";

/**
 * Scales a line of display type so it exactly fills its container.
 * The CSS already sizes the name "Sacha Devos" correctly; this only
 * corrects the size if the name (or the font) is changed, by setting
 * the `--fit` multiplier used in the element's CSS font-size.
 */
export function useFitText(ref: RefObject<HTMLElement | null>, lineSelector?: string) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const style = getComputedStyle(el);
      const available = el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      let used = 0;
      const lines = lineSelector ? Array.from(el.querySelectorAll<HTMLElement>(lineSelector)) : [];
      const stacked = lines.length > 1 && lines[0].parentElement && getComputedStyle(lines[0].parentElement).display === "block";
      if (stacked) {
        used = Math.max(...lines.map((l) => l.getBoundingClientRect().width));
      } else {
        const range = document.createRange();
        range.selectNodeContents(el);
        used = range.getBoundingClientRect().width;
      }
      if (!used || !available) return;
      const current = parseFloat(el.style.getPropertyValue("--fit")) || 1;
      const next = Math.min(1.6, Math.max(0.4, (current * available) / used));
      if (Math.abs(next - current) > 0.004) el.style.setProperty("--fit", next.toFixed(4));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    document.fonts?.ready.then(schedule);
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [ref, lineSelector]);
}
