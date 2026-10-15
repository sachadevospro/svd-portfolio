"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { NavCategory } from "./Header";
import { useFocusTrap, useScrollLock } from "@/lib/hooks";

type Props = {
  open: boolean;
  onClose: () => void;
  categories: NavCategory[];
  email: string;
  social: Record<string, string>;
  pathname: string;
};

const LABELS: Record<string, string> = { instagram: "Instagram", youtube: "YouTube", vimeo: "Vimeo", tiktok: "TikTok", linkedin: "LinkedIn" };
const pad = (n: number) => String(n).padStart(2, "0");

export function MobileMenu({ open, onClose, categories, email, social, pathname }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Mounted while open and during the closing transition; `entered` triggers the CSS transition.
  const [visible, setVisible] = useState(open);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
      return () => cancelAnimationFrame(id);
    }
    setEntered(false);
    const t = window.setTimeout(() => setVisible(false), 700);
    return () => window.clearTimeout(t);
  }, [open]);

  useScrollLock(open);
  useFocusTrap(ref, open && visible, closeRef);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!visible) return null;

  return (
    <div
      id="mobile-menu"
      ref={ref}
      className={`mobile-menu${open ? " is-active" : ""}${open && entered ? " is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
    >
      <div className="mobile-menu__bar">
        <Link href="/" className="wordmark" onClick={onClose}>
          Sacha Devos
        </Link>
        <button ref={closeRef} type="button" className="menu-toggle menu-toggle--close" onClick={onClose}>
          Close
        </button>
      </div>

      <nav className="mobile-menu__nav" aria-label="Menu">
        <p className="label mobile-menu__label">Work</p>
        <ul className="mobile-menu__series">
          {categories.map((c, i) => (
            <li key={c.slug} style={{ "--i": i } as React.CSSProperties}>
              <Link
                href={`/work/${c.slug}`}
                className="mobile-menu__link"
                aria-current={pathname === `/work/${c.slug}` ? "page" : undefined}
                onClick={onClose}
              >
                <span className="mobile-menu__num">{pad(c.number)}</span>
                <span className="mobile-menu__title">{c.title}</span>
                <span className="mobile-menu__count">{c.count}</span>
              </Link>
            </li>
          ))}
        </ul>
        <ul className="mobile-menu__pages">
          <li>
            <Link href="/work" onClick={onClose} aria-current={pathname === "/work" ? "page" : undefined}>
              All series
            </Link>
          </li>
          <li>
            <Link href="/about" onClick={onClose} aria-current={pathname === "/about" ? "page" : undefined}>
              About
            </Link>
          </li>
          <li>
            <Link href="/contact" onClick={onClose} aria-current={pathname === "/contact" ? "page" : undefined}>
              Contact
            </Link>
          </li>
        </ul>
      </nav>

      <div className="mobile-menu__foot">
        {email && (
          <a className="mobile-menu__email" href={`mailto:${email}`}>
            {email}
          </a>
        )}
        {Object.keys(social).length > 0 && (
          <ul className="mobile-menu__social">
            {Object.entries(social).map(([k, href]) => (
              <li key={k}>
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {LABELS[k] ?? k}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
