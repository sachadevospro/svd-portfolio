#!/usr/bin/env node
/**
 * PHOTO PIPELINE
 * ─────────────────────────────────────────────────────────────
 * Runs automatically before `npm run dev` and `npm run build`.
 * You can also run it on its own with `npm run photos`.
 *
 *  1. Reads the settings and texts in /content/*.yml
 *  2. Finds every photograph in /photos/<folder>/ (no list to maintain).
 *     If a folder is empty, it uses the matching /demo-photos/<folder>/
 *     (unless `useDemoImages: false` in content/site.yml).
 *  3. Creates web-ready copies in /public/_img/ at several sizes
 *     (WebP, optional AVIF, and a JPEG fallback). Your original files are
 *     only read — they are never resized, compressed or modified.
 *  4. Writes src/generated/content.json, which the website reads.
 *
 * Generated files are named after the content of the photo, so replacing
 * a photo by a new file with the same name is always picked up, and
 * unchanged photos are not processed twice.
 */
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import os from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";
import yaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P = {
  content: path.join(ROOT, "content"),
  photos: path.join(ROOT, "photos"),
  demo: path.join(ROOT, "demo-photos"),
  img: path.join(ROOT, "public", "_img"),
  // Encoded copies are kept here between builds (Vercel and Netlify both
  // preserve .next/cache), so only new or changed photos are processed.
  store: path.join(ROOT, ".next", "cache", "portfolio-images"),
  video: path.join(ROOT, "public", "_video"),
  manifest: path.join(ROOT, "src", "generated", "content.json"),
  cache: path.join(ROOT, ".next", "cache", "portfolio-images", "meta.json"),
};

/** Widths (in pixels) of the copies created for every photo. Never larger than the original. */
const WIDTHS = [640, 1080, 1600, 2400, 3200, 4096];
const FALLBACK_WIDTH = 1600;
const QUALITY = { webp: 90, avif: 60, jpeg: 88 };
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".avif"]);
const VIDEO_EXT = new Set([".mp4", ".webm"]);
const NOT_WEB_READY = new Set([".heic", ".heif", ".cr2", ".cr3", ".nef", ".arw", ".raf", ".dng", ".orf", ".rw2", ".psd", ".mov"]);
const RESERVED = new Set(["hero", "about"]);
const CACHE_VERSION = 3;

const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  ok: (s) => `\x1b[32m${s}\x1b[0m`,
  warn: (s) => `\x1b[33m${s}\x1b[0m`,
  err: (s) => `\x1b[31m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

class FriendlyError extends Error {}

/** Runs at most `n` tasks at the same time. */
function createLimit(n) {
  let active = 0;
  const queue = [];
  const next = () => {
    if (active >= n || queue.length === 0) return;
    active += 1;
    const { fn, resolve, reject } = queue.shift();
    fn()
      .then(resolve, reject)
      .finally(() => {
        active -= 1;
        next();
      });
  };
  return (fn) =>
    new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      next();
    });
}
const CORES = Math.max(1, os.availableParallelism?.() ?? os.cpus().length);
const limit = createLimit(CORES);
const imageLimit = createLimit(Math.max(2, CORES));
sharp.concurrency(1); // parallelism comes from running several encodes at once

async function readYaml(file, { optional = false } = {}) {
  if (!existsSync(file)) {
    if (optional) return null;
    throw new FriendlyError(`Missing file: ${path.relative(ROOT, file)}`);
  }
  const text = await fs.readFile(file, "utf8");
  try {
    return yaml.load(text) ?? null;
  } catch (e) {
    const line = e.mark ? ` (line ${e.mark.line + 1})` : "";
    throw new FriendlyError(
      `Could not read ${path.relative(ROOT, file)}${line}.\n` +
        `  ${e.reason || e.message}\n` +
        `  Tip: check the quotes and the indentation (use spaces, not tabs).`,
    );
  }
}

const str = (v) => (v === undefined || v === null ? "" : String(v).trim());
const naturalSort = (a, b) => a.localeCompare(b, "en", { numeric: true, sensitivity: "base" });
const slugify = (s) =>
  s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "photo";

async function listDir(dir) {
  if (!existsSync(dir)) return [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries.filter((e) => e.isFile() && !e.name.startsWith(".") && !e.name.startsWith("_")).map((e) => e.name);
}

/** Finds the photos (and videos) of one folder, with demo fallback. */
async function discover(folder, settings, log) {
  const ownDir = path.join(P.photos, folder);
  const own = await listDir(ownDir);
  for (const f of own) {
    const ext = path.extname(f).toLowerCase();
    if (NOT_WEB_READY.has(ext)) {
      log.warn(`photos/${folder}/${f} is a ${ext} file. Export it as a high-quality JPEG (or TIFF/PNG) to show it on the website.`);
    }
  }
  const images = own.filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase())).sort(naturalSort);
  const videos = own.filter((f) => VIDEO_EXT.has(path.extname(f).toLowerCase())).sort(naturalSort);
  if (images.length || !settings.useDemoImages) {
    return { dir: ownDir, ownDir, images, videos, demo: false };
  }
  const demoDir = path.join(P.demo, folder);
  const demoImages = (await listDir(demoDir)).filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase())).sort(naturalSort);
  return { dir: demoDir, ownDir, images: demoImages, videos, demo: demoImages.length > 0 };
}

async function readCaptions(dir, files, log) {
  const file = path.join(dir, "captions.yml");
  const data = (await readYaml(file, { optional: true })) || {};
  if (typeof data !== "object" || Array.isArray(data)) {
    log.warn(`${path.relative(ROOT, file)} should list file names followed by their details. It was ignored.`);
    return {};
  }
  const known = new Set(files);
  for (const key of Object.keys(data)) {
    if (!known.has(key)) {
      const close = files.find((f) => f.toLowerCase() === key.toLowerCase());
      log.warn(
        `${path.relative(ROOT, file)} mentions "${key}", but there is no photo with that exact name` +
          (close ? ` (did you mean "${close}"?)` : "") +
          ".",
      );
    }
  }
  return data;
}

async function hashFile(buf) {
  return crypto.createHash("sha1").update(buf).digest("hex").slice(0, 10);
}

/** Creates (or reuses) every web copy of one photograph. */
async function processImage({ srcPath, folder, settings, cache, used, stats, siteName }) {
  const buf = await fs.readFile(srcPath);
  const hash = await hashFile(buf);
  const base = `${slugify(path.parse(srcPath).name)}-${hash}`;
  const relDir = folder;
  const outDir = path.join(P.store, relDir);
  await fs.mkdir(outDir, { recursive: true });

  const cacheKey = `${hash}:${settings.avif ? "a" : ""}`;
  let meta = cache.entries[cacheKey];
  if (!meta) {
    const info = await sharp(buf, { failOn: "none" }).metadata();
    const rotated = (info.orientation || 1) >= 5;
    const width = rotated ? info.height : info.width;
    const height = rotated ? info.width : info.height;
    const tiny = await sharp(buf, { failOn: "none" }).rotate().resize(20, null, { fit: "inside" }).webp({ quality: 45 }).toBuffer();
    const { dominant } = await sharp(buf, { failOn: "none" }).rotate().resize(64).stats();
    const color = "#" + [dominant.r, dominant.g, dominant.b].map((v) => v.toString(16).padStart(2, "0")).join("");
    meta = { width, height, placeholder: `data:image/webp;base64,${tiny.toString("base64")}`, color };
    cache.entries[cacheKey] = meta;
  }
  const { width, height } = meta;

  const targets = WIDTHS.filter((w) => w <= width);
  if (width < WIDTHS[WIDTHS.length - 1] && !targets.includes(width)) targets.push(width);
  const fallbackWidth = Math.min(FALLBACK_WIDTH, width);
  const formats = settings.avif ? ["avif", "webp"] : ["webp"];

  const pipeline = sharp(buf, { failOn: "none" }).rotate();
  const year = new Date().getFullYear();
  const withRights = (s, isDemo) =>
    isDemo ? s : s.withExif({ IFD0: { Copyright: `(c) ${year} ${siteName}. All rights reserved.`, Artist: siteName } });

  const jobs = [];
  const url = (name) => `/_img/${relDir}/${name}`;
  const srcset = {};
  for (const fmt of formats) {
    srcset[fmt] = [];
    for (const w of targets) {
      const name = `${base}-${w}.${fmt}`;
      used.add(path.join(relDir, name));
      srcset[fmt].push(`${url(name)} ${w}w`);
      const out = path.join(outDir, name);
      if (!existsSync(out)) {
        jobs.push({ out, w, fmt });
      }
    }
  }
  const fallbackName = `${base}-${fallbackWidth}.jpg`;
  used.add(path.join(relDir, fallbackName));
  if (!existsSync(path.join(outDir, fallbackName))) jobs.push({ out: path.join(outDir, fallbackName), w: fallbackWidth, fmt: "jpeg" });

  // Encode the copies in parallel (one per processor core). Each file is
  // written under a temporary name first, so an interrupted build never
  // leaves a half-written image behind.
  await Promise.all(
    jobs.map((job) =>
      limit(async () => {
        let s = pipeline.clone().resize({ width: job.w, withoutEnlargement: true, kernel: "lanczos3" });
        // A very light sharpening compensates for the softening of downscaling.
        if (job.w < width) s = s.sharpen({ sigma: 0.5, m1: 0.4, m2: 1.2 });
        s = withRights(s, stats.demo);
        if (job.fmt === "webp") s = s.webp({ quality: QUALITY.webp, effort: 4 });
        if (job.fmt === "avif") s = s.avif({ quality: QUALITY.avif, effort: 3, chromaSubsampling: "4:4:4" });
        if (job.fmt === "jpeg") s = s.jpeg({ quality: QUALITY.jpeg, mozjpeg: true, chromaSubsampling: "4:4:4" });
        const tmp = `${job.out}.tmp`;
        await s.toFile(tmp);
        await fs.rename(tmp, job.out);
      }),
    ),
  );
  stats.created += jobs.length;

  let original = null;
  if (settings.publishOriginals && !stats.demo) {
    const ext = path.extname(srcPath).toLowerCase();
    const name = `${base}${ext}`;
    const origDir = path.join(P.img, "originals", relDir);
    await fs.mkdir(origDir, { recursive: true });
    used.add(path.join("originals", relDir, name));
    if (!existsSync(path.join(origDir, name))) await fs.copyFile(srcPath, path.join(origDir, name));
    original = `/_img/originals/${relDir}/${name}`;
  }

  const largest = targets[targets.length - 1];
  return {
    width,
    height,
    ratio: Number((width / height).toFixed(4)),
    color: meta.color,
    placeholder: meta.placeholder,
    sources: {
      avif: settings.avif ? srcset.avif.join(", ") : null,
      webp: srcset.webp.join(", "),
    },
    fallback: url(fallbackName),
    largest: url(`${base}-${largest}.webp`),
    largestWidth: largest,
    original,
    generated: jobs.length,
  };
}

async function processFolder(folder, label, ctx) {
  const found = await discover(folder, ctx.settings, ctx.log);
  const captions = await readCaptions(found.dir, found.images, ctx.log);
  const photos = [];
  const visible = found.images.filter((file) => {
    const cap = captions[file] || {};
    return !(cap.hidden === true || cap.published === false);
  });
  // Several photos are prepared at once so that every processor core stays busy.
  const results = await Promise.all(
    visible.map((file) =>
      imageLimit(async () => {
        const srcPath = path.join(found.dir, file);
        try {
          return await processImage({
            srcPath,
            folder,
            settings: ctx.settings,
            cache: ctx.cache,
            used: ctx.used,
            stats: { demo: found.demo, created: 0 },
            siteName: ctx.siteName,
          });
        } catch (e) {
          ctx.log.warn(`Skipped ${path.relative(ROOT, srcPath)}: it could not be read as an image (${e.message}).`);
          return null;
        }
      }),
    ),
  );
  for (const [k, file] of visible.entries()) {
    const img = results[k];
    if (!img) continue;
    const cap = captions[file] || {};
    ctx.counts.processed += img.generated > 0 ? 1 : 0;
    ctx.counts.total += 1;
    const title = str(cap.title);
    const alt = str(cap.alt);
    if (!alt && !found.demo) ctx.missingAlt.push(`${folder}/${file}`);
    const { generated, ...rest } = img;
    photos.push({
      id: `${folder}-${slugify(path.parse(file).name)}`,
      file,
      folder,
      title,
      caption: str(cap.caption),
      alt: alt || (title ? `${title}. ${label} photograph by ${ctx.siteName}.` : `${label} photograph by ${ctx.siteName}.`),
      project: str(cap.project),
      date: str(cap.date),
      featured: cap.featured === true,
      order: Number.isFinite(Number(cap.order)) && cap.order !== null && cap.order !== "" ? Number(cap.order) : null,
      demo: found.demo,
      ...rest,
    });
    if (ctx.verbose && img.generated) ctx.log.info(`  ${c.dim(label.padEnd(12))} ${file} ${c.dim(`(${img.generated} files)`)}`);
  }
  photos.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || naturalSort(a.file, b.file));
  photos.forEach((p, idx) => (p.index = idx + 1));
  return { ...found, photos };
}

async function copyVideos(found, ctx) {
  const out = [];
  for (const file of found.videos) {
    const src = path.join(found.ownDir, file); // videos are never demo files
    const buf = await fs.readFile(src);
    const hash = await hashFile(buf);
    const ext = path.extname(file).toLowerCase();
    const name = `${slugify(path.parse(file).name)}-${hash}${ext}`;
    await fs.mkdir(P.video, { recursive: true });
    ctx.usedVideo.add(name);
    if (!existsSync(path.join(P.video, name))) await fs.copyFile(src, path.join(P.video, name));
    const mb = buf.length / 1024 / 1024;
    if (mb > 25) ctx.log.warn(`photos/hero/${file} is ${mb.toFixed(0)} MB. Aim for under 15 MB (1080p, 10–20 s, H.264) so the home page stays fast.`);
    out.push({ src: `/_video/${name}`, type: ext === ".webm" ? "video/webm" : "video/mp4" });
  }
  return out;
}

async function cleanStale(dir, keep, rel = "") {
  if (!existsSync(dir)) return 0;
  let removed = 0;
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const r = path.join(rel, e.name);
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      removed += await cleanStale(full, keep, r);
      if ((await fs.readdir(full)).length === 0) await fs.rmdir(full);
    } else if (!keep.has(r) && e.name !== ".gitkeep") {
      await fs.unlink(full);
      removed += 1;
    }
  }
  return removed;
}

function validateCategories(list) {
  if (!Array.isArray(list) || list.length === 0) {
    throw new FriendlyError("content/categories.yml must contain at least one category (lines starting with \"- slug:\").");
  }
  const seen = new Set();
  return list.map((cat, i) => {
    const slug = str(cat?.slug);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      throw new FriendlyError(
        `content/categories.yml, category ${i + 1}: the slug "${slug}" must be lowercase letters, numbers and hyphens only (e.g. "street-portraits").`,
      );
    }
    if (RESERVED.has(slug)) throw new FriendlyError(`content/categories.yml: "${slug}" is reserved for another folder. Choose another slug.`);
    if (seen.has(slug)) throw new FriendlyError(`content/categories.yml: the slug "${slug}" is used twice.`);
    seen.add(slug);
    const title = str(cat.title) || slug.charAt(0).toUpperCase() + slug.slice(1);
    return {
      slug,
      title,
      subtitle: str(cat.subtitle),
      intro: str(cat.intro),
      seoTitle: str(cat.seoTitle) || `${title} Photography`,
      seoDescription: str(cat.seoDescription) || str(cat.subtitle),
      coverFile: str(cat.cover),
    };
  });
}

export async function run({ verbose = true, clean = true } = {}) {
  const started = Date.now();
  const warnings = [];
  const log = {
    info: (m) => verbose && console.log(m),
    warn: (m) => warnings.push(m),
  };

  const siteRaw = (await readYaml(path.join(P.content, "site.yml"))) || {};
  const pages = (await readYaml(path.join(P.content, "pages.yml"))) || {};
  const categories = validateCategories(await readYaml(path.join(P.content, "categories.yml")));

  const settings = {
    useDemoImages: siteRaw?.images?.useDemoImages !== false,
    avif: siteRaw?.images?.avif === true,
    publishOriginals: siteRaw?.images?.publishOriginals === true,
  };
  const site = {
    name: str(siteRaw.name) || "Sacha Devos",
    title: str(siteRaw.title),
    location: str(siteRaw.location),
    availability: str(siteRaw.availability),
    siteUrl: str(siteRaw.siteUrl).replace(/\/+$/, ""),
    email: str(siteRaw?.contact?.email),
    formEndpoint: str(siteRaw?.contact?.formEndpoint),
    social: Object.fromEntries(
      Object.entries(siteRaw.social || {})
        .map(([k, v]) => [k, str(v)])
        .filter(([, v]) => v),
    ),
    publishOriginals: settings.publishOriginals,
  };
  if (site.siteUrl && !/^https?:\/\//.test(site.siteUrl)) {
    log.warn(`content/site.yml: siteUrl should start with https:// (got "${site.siteUrl}"). It was ignored.`);
    site.siteUrl = "";
  }
  if (!site.email || site.email.endsWith("@example.com")) {
    log.warn("content/site.yml: the contact email is still the placeholder. Replace it with your real address before publishing.");
  }

  let cache = { version: CACHE_VERSION, entries: {} };
  try {
    const raw = JSON.parse(await fs.readFile(P.cache, "utf8"));
    if (raw.version === CACHE_VERSION) cache = raw;
  } catch {}

  const ctx = {
    settings,
    cache,
    log,
    verbose,
    used: new Set(),
    usedVideo: new Set(),
    siteName: site.name,
    missingAlt: [],
    counts: { processed: 0, total: 0 },
  };

  log.info(c.bold("Photos"));
  const outCategories = [];
  for (const [i, cat] of categories.entries()) {
    const res = await processFolder(cat.slug, cat.title, ctx);
    const photos = res.photos;
    const cover =
      (cat.coverFile && photos.find((p) => p.file === cat.coverFile)) || photos.find((p) => p.featured) || photos[0] || null;
    if (cat.coverFile && !photos.find((p) => p.file === cat.coverFile)) {
      log.warn(`content/categories.yml: the cover "${cat.coverFile}" was not found in photos/${cat.slug}/.`);
    }
    if (!existsSync(path.join(P.photos, cat.slug))) {
      log.warn(`There is no photos/${cat.slug}/ folder yet for the "${cat.title}" category. Create it and add photographs.`);
    }
    const { coverFile, ...rest } = cat;
    outCategories.push({ ...rest, number: i + 1, demo: res.demo, count: photos.length, coverId: cover?.id ?? null, photos });
    log.info(`  ${(cat.title + ":").padEnd(14)} ${photos.length} photo${photos.length === 1 ? "" : "s"}${res.demo ? c.dim(" (demonstration images)") : ""}`);
  }

  const heroFound = await processFolder("hero", "Featured", ctx);
  const heroVideos = await copyVideos(heroFound, ctx);
  const about = await processFolder("about", "Portrait", ctx);
  log.info(`  ${"Home hero:".padEnd(14)} ${heroFound.photos.length} photo(s)${heroVideos.length ? ` + ${heroVideos.length} video` : ""}${heroFound.demo ? c.dim(" (demonstration images)") : ""}`);
  log.info(`  ${"Portrait:".padEnd(14)} ${about.photos.length ? about.photos[0].file : "none"}${about.demo ? c.dim(" (placeholder)") : ""}`);

  // The large "interlude" image on the home page.
  const all = outCategories.flatMap((cat) => cat.photos);
  const coverIds = new Set(outCategories.map((cat) => cat.coverId));
  const requested = str(pages?.home?.interlude);
  let interlude = null;
  if (requested) {
    const [folder, file] = requested.split("/");
    interlude = all.find((p) => p.folder === folder && p.file === file) || null;
    if (!interlude) log.warn(`content/pages.yml: home.interlude "${requested}" was not found (format: "cars/cars-001.jpg").`);
  }
  interlude =
    interlude ||
    all.find((p) => p.featured && !coverIds.has(p.id) && p.ratio >= 1.3) ||
    all.filter((p) => !coverIds.has(p.id)).sort((a, b) => b.ratio - a.ratio)[0] ||
    all[0] ||
    null;

  const manifest = {
    site,
    pages,
    categories: outCategories,
    hero: { photos: heroFound.photos, videos: heroVideos, demo: heroFound.demo },
    portrait: about.photos[0] || null,
    interludeId: interlude?.id ?? null,
    interludeCategory: interlude?.folder ?? null,
  };

  // Make every encoded copy available to the website in public/_img.
  for (const rel of ctx.used) {
    const from = path.join(P.store, rel);
    const to = path.join(P.img, rel);
    if (existsSync(to) || !existsSync(from)) continue;
    await fs.mkdir(path.dirname(to), { recursive: true });
    try {
      await fs.link(from, to);
    } catch {
      await fs.copyFile(from, to);
    }
  }

  if (clean) {
    await cleanStale(P.store, new Set([...ctx.used, "meta.json"]));
    const removed = (await cleanStale(P.img, ctx.used)) + (await cleanStale(P.video, ctx.usedVideo));
    if (removed) log.info(c.dim(`  Removed ${removed} old generated file(s).`));
  }

  await fs.mkdir(path.dirname(P.cache), { recursive: true });
  await fs.writeFile(P.cache, JSON.stringify(cache));
  await fs.mkdir(path.dirname(P.manifest), { recursive: true });
  const json = JSON.stringify(manifest, null, 1);
  const previous = existsSync(P.manifest) ? await fs.readFile(P.manifest, "utf8") : "";
  if (previous !== json) await fs.writeFile(P.manifest, json);

  if (ctx.missingAlt.length) {
    warnings.push(
      `${ctx.missingAlt.length} photo(s) have no description ("alt" text) for blind visitors and search engines. ` +
        `Add one in the captions.yml of their folder: ${ctx.missingAlt.slice(0, 4).join(", ")}${ctx.missingAlt.length > 4 ? "…" : ""}`,
    );
  }
  for (const w of warnings) console.log(c.warn("  ! ") + w);
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  log.info(c.ok(`  ✓ ${ctx.counts.total} photos ready`) + c.dim(` (${ctx.counts.processed} new or changed, ${secs}s)`));
  return manifest;
}

const isMain = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  run().catch((e) => {
    if (e instanceof FriendlyError) {
      console.error(c.err("\n✗ " + e.message + "\n"));
    } else {
      console.error(e);
    }
    process.exit(1);
  });
}

export { FriendlyError };
