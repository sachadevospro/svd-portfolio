"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { MobileMenu } from "./MobileMenu";

export type NavCategory = { slug: string; title: string; number: number; count: number };

type Props = {
  name: string;
  categories: NavCategory[];
  email: string;
  social: Record<string, string>;
};

const pad = (n: number) => String(n).padStart(2, "0");

export function Header({ name, categories, email, social }: Props) {
  const pathname = usePathname() || "/";
  const isHome = pathname === "/";
  const [solid, setSolid] = useState(false);
  const [pastHero, setPastHero] = useState(!isHome);
  const [hidden, setHidden] = useState(false);
  const [workOpen, setWorkOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const workRef = useRef<HTMLLIElement>(null);
  const workButton = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  // Header appearance follows the scroll position.
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      setSolid(y > 24);
      setPastHero(!isHome || y > window.innerHeight * 0.55);
      // Hide while scrolling down through the photographs, show again on the way up.
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 320);
        last = y;
      }
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // Close menus after navigating.
  useEffect(() => {
    setWorkOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  // The Work panel closes on Escape or a click elsewhere.
  useEffect(() => {
    if (!workOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setWorkOpen(false);
        workButton.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (!workRef.current?.contains(e.target as Node)) setWorkOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [workOpen]);

  const onWorkBlur = useCallback((e: React.FocusEvent) => {
    if (!workRef.current?.contains(e.relatedTarget as Node)) setWorkOpen(false);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

  const classes = [
    "site-header",
    solid && "is-solid",
    hidden && !workOpen && !menuOpen && "is-hidden",
    !pastHero && "is-over-hero",
    workOpen && "is-panel-open",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <header className={classes}>
        <div className="site-header__inner">
          <Link href="/" className="wordmark" aria-label={`${name}, home`} tabIndex={!pastHero ? -1 : undefined}>
            {name}
          </Link>

          <nav className="site-nav" aria-label="Main">
            <ul className="site-nav__list">
              <li className="site-nav__item site-nav__item--work" ref={workRef} onBlur={onWorkBlur}>
                <button
                  ref={workButton}
                  type="button"
                  className="site-nav__link"
                  aria-expanded={workOpen}
                  aria-controls={panelId}
                  data-active={isActive("/work") || undefined}
                  onClick={() => setWorkOpen((o) => !o)}
                >
                  Work
                  <svg className="site-nav__chevron" width="9" height="6" viewBox="0 0 9 6" aria-hidden="true">
                    <path d="M1 1l3.5 3.5L8 1" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </button>
                <div id={panelId} className="work-panel" hidden={!workOpen}>
                  <ul className="work-panel__list">
                    {categories.map((c) => (
                      <li key={c.slug}>
                        <Link
                          href={`/work/${c.slug}`}
                          className="work-panel__link"
                          aria-current={pathname === `/work/${c.slug}` ? "page" : undefined}
                        >
                          <span className="work-panel__num">{pad(c.number)}</span>
                          <span className="work-panel__title">{c.title}</span>
                          <span className="work-panel__count">{c.count}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link href="/work" className="work-panel__all" aria-current={pathname === "/work" ? "page" : undefined}>
                    All series
                  </Link>
                </div>
              </li>
              <li className="site-nav__item">
                <Link href="/about" className="site-nav__link" aria-current={isActive("/about") ? "page" : undefined}>
                  About
                </Link>
              </li>
              <li className="site-nav__item">
                <Link href="/contact" className="site-nav__link" aria-current={isActive("/contact") ? "page" : undefined}>
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          <button
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            Menu
          </button>
        </div>
      </header>
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        categories={categories}
        email={email}
        social={social}
        pathname={pathname}
      />
    </>
  );
}
