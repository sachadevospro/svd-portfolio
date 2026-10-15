/**
 * Helpers that tell the browser how wide a photo is displayed, so it can
 * download the right file. Kept apart from content.ts so that pages running
 * in the browser do not have to load the whole content file.
 */
/**
 * `sizes` for a photo that fills (crops into) a frame of the given height
 * (in vh) and the full viewport width. On tall screens such a photo is wider
 * than the screen, so a larger file is needed to stay sharp. The factor
 * stops very dense phone screens from downloading the very largest file for
 * a crop they only partly show (about 2× sharpness instead of 3×).
 */
export function coverSizes(ratio: number, heightVh: number, factor = 0.65): string {
  const cropped = (heightVh * ratio * factor) / 100; // screen proportion below which the crop is wider than 100vw
  return `(max-aspect-ratio: ${Math.round(cropped * 1000)}/1000) ${Math.round(heightVh * ratio * factor)}vh, 100vw`;
}

/** `sizes` for a photo cropped into a frame of fixed proportions. */
export function frameSizes(ratio: number, frames: { minWidth?: number; vw: number; frame: number }[]): string {
  return frames
    .map(({ minWidth, vw, frame }) => {
      const w = Math.min(300, Math.round(vw * Math.max(1, ratio / frame)));
      return minWidth ? `(min-width: ${minWidth}px) ${w}vw` : `${w}vw`;
    })
    .join(", ");
}
