import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { CopyEmail } from "@/components/CopyEmail";
import { absoluteUrl, pages, site, socialLinks } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: pages.contact.description,
  alternates: absoluteUrl("/contact") ? { canonical: "/contact" } : undefined,
};

export default function ContactPage() {
  const social = socialLinks();
  return (
    <div className="contact wrap">
      <header className="contact__head">
        <p className="label label--quiet">Contact</p>
        <h1 className="contact__headline">{pages.contact.headline}</h1>
        <p className="contact__text">{pages.contact.text}</p>
      </header>

      <div className="contact__grid">
        <section className="contact__direct" aria-labelledby="direct-title">
          <h2 id="direct-title" className="label label--quiet">
            Email
          </h2>
          {site.email && (
            <p className="contact__email">
              <a href={`mailto:${site.email}`} className="link">
                {site.email}
              </a>
            </p>
          )}
          {site.email && <CopyEmail email={site.email} />}

          {social.length > 0 && (
            <>
              <h2 className="label label--quiet contact__subhead">Elsewhere</h2>
              <ul className="contact__social">
                {social.map((s) => (
                  <li key={s.key}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="link">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}

          <h2 className="label label--quiet contact__subhead">Location</h2>
          <p className="contact__place">
            {site.location} <span aria-hidden="true">·</span> {site.availability}
          </p>
        </section>

        {site.formEndpoint && (
          <section className="contact__form" aria-labelledby="form-title">
            <h2 id="form-title" className="label label--quiet">
              Send a message
            </h2>
            <ContactForm endpoint={site.formEndpoint} email={site.email} />
          </section>
        )}
      </div>
    </div>
  );
}
