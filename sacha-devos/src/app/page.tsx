import Link from "next/link";
import { Hero } from "@/components/Hero";
import { SelectedWork } from "@/components/SelectedWork";
import { Interlude } from "@/components/Interlude";
import { ContactCta } from "@/components/ContactCta";
import { Reveal } from "@/components/Reveal";
import { getInterlude, hero, pages, site } from "@/lib/content";

export default function HomePage() {
  const interlude = getInterlude();
  return (
    <>
      <Hero
        photos={hero.photos}
        videos={hero.videos}
        name={site.name}
        title={site.title}
        location={site.location}
        availability={site.availability}
      />

      <SelectedWork />

      {interlude && (
        <Interlude photo={interlude.photo} categoryTitle={interlude.category.title} categorySlug={interlude.category.slug} />
      )}

      <section className="statement wrap" aria-labelledby="statement-title">
        <h2 id="statement-title" className="label statement__label">
          The work
        </h2>
        <Reveal className="statement__body">
          <p className="statement__text">{pages.home.introduction}</p>
          <Link href="/about" className="link statement__link">
            About {site.name}
          </Link>
        </Reveal>
      </section>

      <ContactCta />
    </>
  );
}
