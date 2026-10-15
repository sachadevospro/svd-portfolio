"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Photo as PhotoData } from "@/lib/content";
import { coverSizes } from "@/lib/sizes";
import { Photo } from "./Photo";

type Props = {
  photo: PhotoData;
  categoryTitle: string;
  categorySlug: string;
};

/** A single full-bleed photograph between sections, drifting slightly as the page scrolls. */
export function Interlude({ photo, categoryTitle, categorySlug }: Props) {
  const ref = useRef<HTMLElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    const img = inner.current;
    if (!el || !img) return;
    let frame = 0;
    let visible = false;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // -1 when the section enters at the bottom, +1 when it leaves at the top.
      const progress = (vh - r.top) / (vh + r.height) * 2 - 1;
      img.style.transform = `translate3d(0, ${(progress * 6).toFixed(2)}%, 0) scale(1.14)`;
    };
    const onScroll = () => {
      if (visible && !frame) frame = requestAnimationFrame(update);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) update();
    });
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <figure ref={ref} className="interlude">
      <div ref={inner} className="interlude__media">
        <Photo photo={photo} fit="cover" sizes={coverSizes(photo.ratio * 1.14, 90)} />
      </div>
      <figcaption className="interlude__caption wrap">
        {photo.title && <span className="interlude__title">{photo.title}</span>}
        <Link href={`/work/${categorySlug}`} className="interlude__link link">
          From the {categoryTitle} series
        </Link>
        {photo.demo && <span className="interlude__demo">Demonstration image</span>}
      </figcaption>
    </figure>
  );
}
