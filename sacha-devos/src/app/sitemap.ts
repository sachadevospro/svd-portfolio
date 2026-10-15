import type { MetadataRoute } from "next";
import { categories, site } from "@/lib/content";

export const dynamic = "force-static";

/** Lists every page for search engines. Needs `siteUrl` in content/site.yml. */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!site.siteUrl) return [];
  const now = new Date();
  const paths = ["", "/work", ...categories.map((c) => `/work/${c.slug}`), "/about", "/contact"];
  return paths.map((p) => ({
    url: `${site.siteUrl}${p || "/"}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: p === "" ? 1 : p.startsWith("/work") ? 0.8 : 0.5,
  }));
}
