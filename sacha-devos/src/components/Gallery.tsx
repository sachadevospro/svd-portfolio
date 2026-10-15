"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Photo as PhotoData } from "@/lib/content";
import { Photo } from "./Photo";
import { Lightbox } from "./Lightbox";

type Props = {
  photos: PhotoData[];
  seriesTitle: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * A photograph gets a full-width row of its own when it is marked
 * `featured: true` (and is not a vertical photo), or when it is a true
 * panorama that would look too small inside a row.
 */
const isWide = (p: PhotoData) => (p.featured && p.ratio >= 1.3) || p.ratio >= 2.4;

type Block = { kind: "rows"; items: { photo: PhotoData; i: number }[] } | { kind: "wide"; photo: PhotoData; i: number };

/**
 * Splits the photographs into blocks: justified rows (every photo keeps its
 * own proportions, all photos of a row share the same height) and
 * full-width photographs that punctuate the sequence.
 */
function toBlocks(photos: PhotoData[]): Block[] {
  const blocks: Block[] = [];
  let current: { photo: PhotoData; i: number }[] = [];
  photos.forEach((photo, i) => {
    if (isWide(photo)) {
      if (current.length) blocks.push({ kind: "rows", items: current });
      current = [];
      blocks.push({ kind: "wide", photo, i });
    } else {
      current.push({ photo, i });
    }
  });
  if (current.length) blocks.push({ kind: "rows", items: current });
  return blocks;
}

/** Tells the browser roughly how wide each thumbnail is displayed. */
function rowSizes(ratio: number): string {
  const vw = (rowVw: number) => Math.min(100, Math.round(ratio * rowVw * 1.25));
  return `(min-width: 1100px) ${vw(26)}vw, (min-width: 640px) ${vw(36)}vw, ${ratio >= 0.95 ? 100 : 55}vw`;
}

export function Gallery({ photos, seriesTitle }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  const lastOpened = useRef<number | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const blocks = useMemo(() => toBlocks(photos), [photos]);

  const show = useCallback(
    (i: number | null) => {
      setOpen(i);
      if (i !== null) lastOpened.current = i;
      const url = new URL(window.location.href);
      url.hash = i === null ? "" : `photo-${pad(i + 1)}`;
      window.history.replaceState(window.history.state, "", url.hash ? url : url.pathname + url.search);
    },
    [],
  );

  // Links like /work/cars#photo-04 open that photograph directly.
  useEffect(() => {
    const m = window.location.hash.match(/^#photo-(\d+)$/);
    if (m) {
      const i = Number(m[1]) - 1;
      if (i >= 0 && i < photos.length) show(i);
    }
  }, [photos.length, show]);

  // Give focus back to the photograph that was being viewed.
  useEffect(() => {
    if (open === null && lastOpened.current !== null) {
      const btn = buttons.current[lastOpened.current];
      btn?.focus({ preventScroll: true });
      const r = btn?.getBoundingClientRect();
      if (r && (r.bottom < 0 || r.top > window.innerHeight)) btn?.scrollIntoView({ block: "center" });
    }
  }, [open]);

  if (photos.length === 0) {
    return (
      <div className="gallery-empty wrap">
        <p className="gallery-empty__title">Photographs coming soon.</p>
        <p className="gallery-empty__text">This series is being edited. In the meantime, browse the other series.</p>
      </div>
    );
  }

  const item = (photo: PhotoData, i: number, sizes: string, wide = false) => (
    <li
      key={photo.id}
      className={wide ? "g-wide" : "g-item"}
      style={wide ? undefined : ({ "--ar": photo.ratio } as React.CSSProperties)}
    >
      <button
        type="button"
        ref={(el) => {
          buttons.current[i] = el;
        }}
        className="g-item__button"
        onClick={() => show(i)}
        aria-haspopup="dialog"
        aria-label={`View photograph ${i + 1} of ${photos.length}${photo.title ? `: ${photo.title}` : ""}`}
        data-cursor="View"
      >
        <Photo photo={photo} sizes={sizes} priority={i < 2} />
      </button>
      <p className="g-item__meta" aria-hidden="true">
        <span className="g-item__num">{pad(i + 1)}</span>
        {photo.title && <span className="g-item__title">{photo.title}</span>}
      </p>
    </li>
  );

  return (
    <>
      <div className="gallery wrap">
        {blocks.map((b, k) =>
          b.kind === "wide" ? (
            <ul className="g-block g-block--wide" key={`w${k}`}>
              {item(b.photo, b.i, "100vw", true)}
            </ul>
          ) : (
            <ul className="g-block g-rows" key={`r${k}`}>
              {b.items.map(({ photo, i }) => item(photo, i, rowSizes(photo.ratio)))}
            </ul>
          ),
        )}
      </div>
      {open !== null && (
        <Lightbox photos={photos} index={open} seriesTitle={seriesTitle} onNavigate={show} onClose={() => show(null)} />
      )}
    </>
  );
}
