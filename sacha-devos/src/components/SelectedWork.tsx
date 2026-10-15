import Link from "next/link";
import { categories, getCover, pad, photoCount, totalPhotos } from "@/lib/content";
import { frameSizes } from "@/lib/sizes";
import { Photo } from "./Photo";
import { Reveal } from "./Reveal";

/*
 * The five series as large editorial panels. The composition repeats every
 * five categories (wide left / offset right / full width / narrow left /
 * wide right), so adding a category keeps the rhythm.
 */
const LAYOUT = ["a", "b", "c", "d", "e"] as const;
/* Width on screen (vw) and frame proportions of each panel, desktop then phone. */
const FRAMES: Record<(typeof LAYOUT)[number], { desktop: [number, number]; phone: number }> = {
  a: { desktop: [56, 4 / 3], phone: 4 / 5 },
  b: { desktop: [31, 3 / 4], phone: 4 / 5 },
  c: { desktop: [100, 21 / 9], phone: 4 / 3 },
  d: { desktop: [31, 4 / 5], phone: 4 / 5 },
  e: { desktop: [47, 3 / 2], phone: 4 / 3 },
};
const panelSizes = (v: (typeof LAYOUT)[number], ratio: number) =>
  frameSizes(ratio, [
    { minWidth: 900, vw: FRAMES[v].desktop[0], frame: FRAMES[v].desktop[1] },
    { vw: 100, frame: FRAMES[v].phone },
  ]);

export function SelectedWork() {
  return (
    <section id="selected-work" className="selected" aria-labelledby="selected-title">
      <div className="section-head wrap">
        <h2 id="selected-title" className="label">
          Selected work
        </h2>
        <p className="label label--quiet">
          {categories.length} series, {photoCount(totalPhotos)}
        </p>
      </div>

      <ol className="panels wrap">
        {categories.map((cat, i) => {
          const cover = getCover(cat);
          const v = LAYOUT[i % LAYOUT.length];
          return (
            <Reveal as="li" key={cat.slug} className={`panel panel--${v}`}>
              <Link href={`/work/${cat.slug}`} className="panel__link" data-cursor="View series">
                <span className="panel__media">
                  {cover ? (
                    <Photo photo={cover} fit="cover" sizes={panelSizes(v, cover.ratio)} alt="" />
                  ) : (
                    <span className="panel__empty">Photographs coming soon</span>
                  )}
                </span>
                <div className="panel__caption">
                  <span className="panel__num">{pad(cat.number)}</span>
                  <h3 className="panel__title">{cat.title}</h3>
                  <span className="panel__count">{photoCount(cat.count)}</span>
                </div>
                <span className="panel__sub">{cat.subtitle}</span>
                <span className="panel__cta">View series</span>
              </Link>
            </Reveal>
          );
        })}
      </ol>
    </section>
  );
}
