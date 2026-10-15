"use client";

import { useEffect, useRef, useState } from "react";
import type { Photo as PhotoData } from "@/lib/content";

type Props = {
  photo: PhotoData;
  /** Width the image takes on screen, so the browser downloads the right size. */
  sizes: string;
  /** For the first, most important image of a page. */
  priority?: boolean;
  /** "cover" fills its frame (cropping if needed); "natural" keeps the photo's own proportions. */
  fit?: "cover" | "natural";
  className?: string;
  /** Override the alt text (use "" for purely decorative copies). */
  alt?: string;
  onLoad?: () => void;
};

/**
 * One responsive photograph.
 * Shows the photo's blurred colours instantly, then fades the real image in
 * once the browser has downloaded the most suitable size and format.
 */
export function Photo({ photo, sizes, priority = false, fit = "natural", className = "", alt, onLoad }: Props) {
  const img = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  // The image may already be loaded (from cache) before React attaches its handler.
  useEffect(() => {
    const el = img.current;
    if (el && el.complete && el.naturalWidth > 0) {
      setLoaded(true);
      onLoad?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo.id]);

  const style = {
    "--ph": `url("${photo.placeholder}")`,
    "--ph-color": photo.color,
    ...(fit === "natural" ? { aspectRatio: `${photo.width} / ${photo.height}` } : {}),
  } as React.CSSProperties;

  return (
    <span className={`photo photo--${fit}${loaded ? " is-loaded" : ""} ${className}`} style={style}>
      <picture>
        {photo.sources.avif && <source type="image/avif" srcSet={photo.sources.avif} sizes={sizes} />}
        <source type="image/webp" srcSet={photo.sources.webp} sizes={sizes} />
        <img
          ref={img}
          src={photo.fallback}
          width={photo.width}
          height={photo.height}
          alt={alt ?? photo.alt}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "auto"}
          draggable={false}
          onLoad={() => {
            setLoaded(true);
            onLoad?.();
          }}
        />
      </picture>
    </span>
  );
}
