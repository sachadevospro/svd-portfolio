import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/Gallery";
import { ContactCta } from "@/components/ContactCta";
import { Photo } from "@/components/Photo";
import { absoluteUrl, categories, getAdjacent, getCategory, getCover, pad, photoCount, site } from "@/lib/content";
import { coverSizes } from "@/lib/sizes";

type Params = { category: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) return {};
  const cover = getCover(cat);
  const path = `/work/${cat.slug}`;
  return {
    title: cat.seoTitle,
    description: cat.seoDescription,
    alternates: absoluteUrl(path) ? { canonical: path } : undefined,
    openGraph: {
      title: `${site.name} — ${cat.seoTitle}`,
      description: cat.seoDescription,
      url: absoluteUrl(path),
      ...(site.siteUrl && cover ? { images: [{ url: cover.fallback, alt: cover.alt }] } : {}),
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();
  const next = getAdjacent(cat.slug, 1);
  const nextCover = getCover(next);

  return (
    <article className="series">
      <header className="series-head wrap">
        <nav className="series-head__crumbs label label--quiet" aria-label="Breadcrumb">
          <ol>
            <li>
              <Link href="/work">Work</Link>
            </li>
            <li aria-current="page">{cat.title}</li>
          </ol>
        </nav>
        <p className="series-head__index label label--quiet" aria-hidden="true">
          {pad(cat.number)} <span className="series-head__of">of</span> {pad(categories.length)}
        </p>
        <h1 className="series-head__title">{cat.title}</h1>
        <div className="series-head__text">
          <p className="series-head__subtitle">{cat.subtitle}</p>
          {cat.intro && <p className="series-head__intro">{cat.intro}</p>}
        </div>
        <p className="series-head__count label">
          {photoCount(cat.count)}
          {cat.demo && <span className="series-head__demo">Demonstration images</span>}
        </p>
      </header>

      <Gallery photos={cat.photos} seriesTitle={cat.title} />

      {next.slug !== cat.slug && (
        <Link href={`/work/${next.slug}`} className="next-series" data-cursor="Next series">
          <span className="next-series__media">{nextCover && <Photo photo={nextCover} fit="cover" sizes={coverSizes(nextCover.ratio, 55)} alt="" />}</span>
          <span className="next-series__text wrap">
            <span className="label">Next series</span>
            <span className="next-series__title">{next.title}</span>
            <span className="next-series__sub">{next.subtitle}</span>
          </span>
        </Link>
      )}

      <ContactCta compact />
    </article>
  );
}
