import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { ContactCta } from "@/components/ContactCta";
import { absoluteUrl, categories, getCover, pages, portrait, site } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description: pages.about.description,
  alternates: absoluteUrl("/about") ? { canonical: "/about" } : undefined,
};

export default function AboutPage() {
  const about = pages.about;
  const [lead, ...rest] = about.biography;
  // A strip of covers, one per series, under the biography.
  const covers = categories.map((c) => ({ cat: c, photo: getCover(c) })).filter((x) => x.photo);

  return (
    <div className="about">
      <header className="about-head wrap">
        <div className="about-head__text">
          <p className="label label--quiet">About</p>
          <h1 className="about-head__name">{site.name}</h1>
          <p className="about-head__role label">{site.title}</p>
          <p className="about-head__place label label--quiet">
            {site.availability} <span aria-hidden="true">·</span> {site.location}
          </p>
        </div>
        <figure className="about-head__portrait">
          {portrait ? (
            <Photo photo={portrait} sizes="(min-width: 900px) 40vw, 100vw" priority />
          ) : (
            <span className="about-head__placeholder">Portrait</span>
          )}
          {portrait?.demo && <figcaption className="about-head__demo">Portrait placeholder</figcaption>}
        </figure>
      </header>

      <section className="about-bio wrap" aria-label="Biography">
        {lead && <p className="about-bio__lead">{lead}</p>}
        <div className="about-bio__rest">
          {rest.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </section>

      <section className="approach wrap" aria-labelledby="approach-title">
        <h2 id="approach-title" className="label">
          {about.approachTitle}
        </h2>
        <ul className="approach__list">
          {about.approach.map((a) => (
            <Reveal as="li" key={a.title} className="approach__item">
              <h3 className="approach__title">{a.title}</h3>
              <p className="approach__text">{a.text}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="fields wrap" aria-labelledby="fields-title">
        <div className="fields__head">
          <h2 id="fields-title" className="label">
            Series
          </h2>
          <p className="fields__disciplines label label--quiet">{about.disciplines.join(" & ")}</p>
        </div>
        <ul className="fields__list">
          {covers.map(({ cat, photo }) => (
            <li key={cat.slug}>
              <Link href={`/work/${cat.slug}`} className="fields__link" data-cursor="View series">
                <span className="fields__media">{photo && <Photo photo={photo} fit="cover" sizes="(min-width: 900px) 20vw, 50vw" alt="" />}</span>
                <span className="fields__title">{cat.title}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="fields__more">
          <Link href="/work" className="link">
            Explore all the work
          </Link>
        </p>
      </section>

      <ContactCta />
    </div>
  );
}
