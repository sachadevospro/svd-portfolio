import Link from "next/link";
import { categories, site, socialLinks } from "@/lib/content";
import { BackToTop } from "./BackToTop";
import { Year } from "./Year";
import { FitLine } from "./FitLine";

export function Footer() {
  const social = socialLinks();
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="wrap site-footer__grid">
        <div className="site-footer__id">
          <p className="label label--quiet">{site.title}</p>
          <p className="label label--quiet">
            {site.location} <span aria-hidden="true">·</span> {site.availability}
          </p>
        </div>

        <nav className="site-footer__col" aria-label="Footer">
          <p className="label label--quiet site-footer__heading">Index</p>
          <ul>
            <li>
              <Link href="/work">Work</Link>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </nav>

        <nav className="site-footer__col" aria-label="Series">
          <p className="label label--quiet site-footer__heading">Series</p>
          <ul>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/work/${c.slug}`}>{c.title}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-footer__col">
          <p className="label label--quiet site-footer__heading">Contact</p>
          <ul>
            {site.email && (
              <li>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
            )}
            {social.map((s) => (
              <li key={s.key}>
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <FitLine className="site-footer__mark">{site.name}</FitLine>

      <div className="wrap site-footer__base">
        <p className="site-footer__copy">
          © <Year initial={year} /> {site.name}. All rights reserved.
        </p>
        <BackToTop />
      </div>
    </footer>
  );
}
