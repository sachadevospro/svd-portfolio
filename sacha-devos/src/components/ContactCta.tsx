import Link from "next/link";
import { pages, site } from "@/lib/content";
import { Reveal } from "./Reveal";

/** The closing invitation used at the end of the home, about and gallery pages. */
export function ContactCta({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`cta${compact ? " cta--compact" : ""}`} aria-labelledby="cta-title">
      <div className="wrap">
        <p className="label cta__question">{pages.home.ctaQuestion}</p>
        <Reveal>
          <h2 id="cta-title" className="cta__headline">
            {pages.home.ctaHeadline}
          </h2>
        </Reveal>
        <div className="cta__actions">
          <Link href="/contact" className="button">
            Contact
          </Link>
          {site.email && (
            <a href={`mailto:${site.email}`} className="cta__email link">
              {site.email}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
