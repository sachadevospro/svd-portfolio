"use client";

import { useEffect, useRef, useState } from "react";
import type { Photo as PhotoData } from "@/lib/content";
import { useFocusTrap, useScrollLock } from "@/lib/hooks";

type Props = {
  photos: PhotoData[];
  index: number;
  seriesTitle: string;
  onNavigate: (i: number) => void;
  onClose: () => void;
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Size hint for the full-screen viewer: the photo is as wide as the screen,
 * unless the screen is wider (proportionally) than the photo, in which case
 * the height limits it. The browser then picks the sharpest file that is
 * actually useful for this screen and its pixel density.
 */
function viewerSizes(p: PhotoData): string {
  return `(min-aspect-ratio: ${p.width}/${p.height}) ${Math.round(p.ratio * 100)}vh, 100vw`;
}

function Picture({ photo, onLoad, eager = true }: { photo: PhotoData; onLoad?: () => void; eager?: boolean }) {
  const sizes = viewerSizes(photo);
  return (
    <picture>
      {photo.sources.avif && <source type="image/avif" srcSet={photo.sources.avif} sizes={sizes} />}
      <source type="image/webp" srcSet={photo.sources.webp} sizes={sizes} />
      <img
        src={photo.fallback}
        width={photo.width}
        height={photo.height}
        alt={photo.alt}
        sizes={sizes}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        onLoad={onLoad}
        ref={(el) => {
          if (el && el.complete && el.naturalWidth > 0) onLoad?.();
        }}
      />
    </picture>
  );
}

export function Lightbox({ photos, index, seriesTitle, onNavigate, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [slow, setSlow] = useState(false);
  const [entered, setEntered] = useState(false);
  const photo = photos[index];
  const total = photos.length;
  const prev = () => onNavigate((index - 1 + total) % total);
  const next = () => onNavigate((index + 1) % total);
  const loaded = loadedId === photo.id;

  useScrollLock(true);
  useFocusTrap(ref, true, closeRef);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // A loading line appears only if the full-size image takes a moment.
  useEffect(() => {
    setSlow(false);
    if (loaded) return;
    const t = window.setTimeout(() => setSlow(true), 350);
    return () => window.clearTimeout(t);
  }, [photo.id, loaded]);

  // Keyboard: arrows to move, Escape to close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Home") onNavigate(0);
      else if (e.key === "End") onNavigate(total - 1);
      else return;
      e.preventDefault();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  // Touch: swipe left/right to move, swipe down to close.
  const start = useRef<{ x: number; y: number; t: number } | null>(null);
  const moved = useRef(false);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return;
    start.current = { x: e.clientX, y: e.clientY, t: Date.now() };
    moved.current = false;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      moved.current = true;
      if (dx < 0) next();
      else prev();
    } else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.5) {
      moved.current = true;
      onClose();
    }
  };

  const neighbours = total > 1 ? [photos[(index + 1) % total], photos[(index - 1 + total) % total]] : [];

  return (
    <div
      ref={ref}
      className={`lightbox${entered ? " is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${seriesTitle}: photograph ${index + 1} of ${total}`}
    >
      <div className="lightbox__top">
        <p className="lightbox__count" aria-live="polite">
          <span className="lightbox__num">{pad(index + 1)}</span>
          <span className="lightbox__sep" aria-hidden="true">/</span>
          <span>{pad(total)}</span>
          <span className="visually-hidden">{photo.title ? `, ${photo.title}` : ""}</span>
        </p>
        <p className="lightbox__series">{seriesTitle}</p>
        <button ref={closeRef} type="button" className="lightbox__close" onClick={onClose}>
          Close
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
      </div>

      <div
        className="lightbox__stage"
        onClick={(e) => {
          if (moved.current) {
            moved.current = false;
            return;
          }
          if (e.target === e.currentTarget) onClose();
        }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (start.current = null)}
      >
        <figure
          key={photo.id}
          className={`lightbox__figure${loaded ? " is-loaded" : ""}`}
          style={
            {
              "--ar": photo.ratio,
              "--ph": `url("${photo.placeholder}")`,
              "--ph-color": photo.color,
            } as React.CSSProperties
          }
        >
          <Picture photo={photo} onLoad={() => setLoadedId(photo.id)} />
          {slow && !loaded && <span className="lightbox__loading" role="status" aria-label="Loading full-size photograph" />}
        </figure>
      </div>

      {total > 1 && (
        <>
          <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={prev} aria-label="Previous photograph">
            <svg width="22" height="12" viewBox="0 0 22 12" aria-hidden="true">
              <path d="M21 6H1.5M6.5 1L1.5 6l5 5" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
          <button type="button" className="lightbox__nav lightbox__nav--next" onClick={next} aria-label="Next photograph">
            <svg width="22" height="12" viewBox="0 0 22 12" aria-hidden="true">
              <path d="M1 6h19.5M15.5 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </>
      )}

      <div className="lightbox__bottom">
        <div className="lightbox__text">
          {photo.title && <p className="lightbox__title">{photo.title}</p>}
          {(photo.caption || photo.project || photo.date) && (
            <p className="lightbox__caption">{[photo.caption, photo.project, photo.date].filter(Boolean).join(" — ")}</p>
          )}
          {photo.demo && <p className="lightbox__demo">Demonstration image, to be replaced by an original photograph.</p>}
        </div>
        {photo.original && (
          <a className="lightbox__original link" href={photo.original} target="_blank" rel="noopener">
            View original ({photo.width} × {photo.height})
          </a>
        )}
      </div>

      <div className="lightbox__preload" aria-hidden="true">
        {neighbours.map((p) => (
          <Picture key={p.id} photo={p} />
        ))}
      </div>
    </div>
  );
}
