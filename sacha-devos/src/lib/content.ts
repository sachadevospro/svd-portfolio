/**
 * Typed access to the website content.
 *
 * Everything comes from src/generated/content.json, which is written by
 * scripts/photos.mjs from the /content/*.yml files and the /photos folders.
 * You should not need to edit this file to change texts or photographs.
 */
import data from "@/generated/content.json";

export type Photo = {
  id: string;
  file: string;
  folder: string;
  index: number;
  title: string;
  caption: string;
  alt: string;
  project: string;
  date: string;
  featured: boolean;
  demo: boolean;
  width: number;
  height: number;
  ratio: number;
  color: string;
  placeholder: string;
  sources: { avif: string | null; webp: string };
  fallback: string;
  largest: string;
  largestWidth: number;
  original: string | null;
};

export type Category = {
  slug: string;
  title: string;
  subtitle: string;
  intro: string;
  seoTitle: string;
  seoDescription: string;
  number: number;
  demo: boolean;
  count: number;
  coverId: string | null;
  photos: Photo[];
};

export type Site = {
  name: string;
  title: string;
  location: string;
  availability: string;
  siteUrl: string;
  email: string;
  formEndpoint: string;
  social: Record<string, string>;
  publishOriginals: boolean;
};

type Pages = {
  home: { description: string; introduction: string; ctaQuestion: string; ctaHeadline: string; interlude?: string };
  about: {
    description: string;
    biography: string[];
    approachTitle: string;
    approach: { title: string; text: string }[];
    disciplines: string[];
  };
  contact: { description: string; headline: string; text: string };
};

type Manifest = {
  site: Site;
  pages: Pages;
  categories: Category[];
  hero: { photos: Photo[]; videos: { src: string; type: string }[]; demo: boolean };
  portrait: Photo | null;
  interludeId: string | null;
  interludeCategory: string | null;
};

const content = data as unknown as Manifest;

export const site = content.site;
export const pages = content.pages;
export const categories = content.categories;
export const hero = content.hero;
export const portrait = content.portrait;

export const totalPhotos = categories.reduce((sum, c) => sum + c.count, 0);

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCover(category: Category): Photo | null {
  return category.photos.find((p) => p.id === category.coverId) ?? category.photos[0] ?? null;
}

export function getInterlude(): { photo: Photo; category: Category } | null {
  const category = categories.find((c) => c.slug === content.interludeCategory);
  const photo = category?.photos.find((p) => p.id === content.interludeId);
  return category && photo ? { photo, category } : null;
}

/** Neighbouring category, wrapping around (for "Next series" links). */
export function getAdjacent(slug: string, step: 1 | -1): Category {
  const i = categories.findIndex((c) => c.slug === slug);
  return categories[(i + step + categories.length) % categories.length];
}

export const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  vimeo: "Vimeo",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
};

export function socialLinks(): { key: string; label: string; href: string }[] {
  return Object.entries(site.social).map(([key, href]) => ({
    key,
    label: SOCIAL_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1),
    href,
  }));
}

/** "1 photograph" / "12 photographs" */
export function photoCount(n: number): string {
  return `${n} photograph${n === 1 ? "" : "s"}`;
}

export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function absoluteUrl(pathname: string): string | undefined {
  return site.siteUrl ? `${site.siteUrl}${pathname}` : undefined;
}

