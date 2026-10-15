"use client";

import { useEffect, useRef } from "react";

/**
 * On desktop, a small label follows the pointer over elements marked with
 * `data-cursor="…"` (for example "View" over photographs). The normal pointer
 * stays visible; this only adds a hint. Touch screens never see it.
 */
export function CursorLabel() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;
    const el = ref.current;
    if (!el) return;
    let x = 0;
    let y = 0;
    let frame = 0;
    let label = "";

    const render = () => {
      frame = 0;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const target = (e.target as Element | null)?.closest?.("[data-cursor]");
      const next = target?.getAttribute("data-cursor") ?? "";
      if (next !== label) {
        label = next;
        if (next) el.textContent = next;
        el.classList.toggle("is-visible", Boolean(next));
      }
      if (!frame) frame = requestAnimationFrame(render);
    };
    const hide = () => {
      label = "";
      el.classList.remove("is-visible");
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);
    window.addEventListener("scroll", hide, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
      window.removeEventListener("scroll", hide);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={ref} className="cursor-label" aria-hidden="true" />;
}
