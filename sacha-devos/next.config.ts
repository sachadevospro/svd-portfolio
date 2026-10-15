import type { NextConfig } from "next";

/**
 * The site is exported as plain static files (the `out/` folder after
 * `npm run build`), so it can be hosted anywhere: Netlify, Vercel,
 * Cloudflare Pages, GitHub Pages or any web server.
 *
 * Images are prepared ahead of time by scripts/photos.mjs, which is why
 * Next.js' own on-the-fly image optimisation is switched off.
 */
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
  // Don't write an AGENTS.md file into the project when running `npm run dev`.
  agentRules: false,
};

export default nextConfig;
