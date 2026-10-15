import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/Photo";
import { absoluteUrl, categories, pad, photoCount, site, totalPhotos } from "@/lib/content";

export const metadata: Metadata = {
  title: "Work",
  description: `All photography series by ${site.name}: ${categories.map((c) => c.title.toLowerCase()).join(", ")}.`,
  alternates: absoluteUrl("/work") ? { canonical: "/work" } : undefined,
};

/** Index of all series, laid out like a contact sheet: one row per series. */
export default function WorkPage() {
  return (
    <div className="work-index">
      <header className="page-head wrap">
        <h1 className="page-head__title">Work</h1>
        <p className="page-head__meta label label--quiet">
          {categories.length} series, {photoCount(totalPhotos)}
        </p>
      </header>

      <ol className="sheet wrap">
        {categories.map((cat) => (
          <li key={cat.slug} className="sheet__row">
            <Link href={`/work/${cat.slug}`} className="sheet__link" data-cursor="View series">
              <span className="sheet__num label label--quiet">{pad(cat.number)}</span>
              <div className="sheet__head">
                <h2 className="sheet__title">{cat.title}</h2>
                <span className="sheet__sub">{cat.subtitle}</span>
                <span className="sheet__count label label--quiet">{photoCount(cat.count)}</span>
              </div>
              <span className="sheet__strip">
                {cat.photos.slice(0, 4).map((p) => (
                  <span key={p.id} className="sheet__frame" style={{ "--ar": p.ratio } as React.CSSProperties}>
                    <Photo photo={p} sizes="(min-width: 900px) 16vw, 30vw" alt="" />
                  </span>
                ))}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
