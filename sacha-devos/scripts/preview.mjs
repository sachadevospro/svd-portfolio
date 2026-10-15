#!/usr/bin/env node
/**
 * `npm run preview` — serves the finished website (the `out/` folder made by
 * `npm run build`) exactly as a static host would, at http://localhost:4173.
 * Use it to check the final result before publishing.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "out");
const PORT = Number(process.env.PORT) || 4173;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
};

if (!fs.existsSync(ROOT)) {
  console.error("No out/ folder yet. Run `npm run build` first.");
  process.exit(1);
}

function resolve(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]).replace(/\/+$/, "") || "/";
  const candidates = clean === "/" ? ["index.html"] : [clean, `${clean}.html`, path.join(clean, "index.html")];
  for (const c of candidates) {
    const file = path.join(ROOT, c);
    if (!file.startsWith(ROOT)) return null;
    if (fs.existsSync(file) && fs.statSync(file).isFile()) return file;
  }
  return null;
}

http
  .createServer((req, res) => {
    const file = resolve(req.url || "/");
    const status = file ? 200 : 404;
    const target = file || path.join(ROOT, "404.html");
    const type = TYPES[path.extname(target).toLowerCase()] || "application/octet-stream";
    const stat = fs.statSync(target);
    const range = req.headers.range;
    if (range && status === 200 && type.startsWith("video/")) {
      const [s, e] = range.replace("bytes=", "").split("-");
      const start = Number(s);
      const end = e ? Number(e) : stat.size - 1;
      res.writeHead(206, { "Content-Type": type, "Content-Range": `bytes ${start}-${end}/${stat.size}`, "Accept-Ranges": "bytes", "Content-Length": end - start + 1 });
      fs.createReadStream(target, { start, end }).pipe(res);
      return;
    }
    res.writeHead(status, { "Content-Type": type, "Content-Length": stat.size });
    fs.createReadStream(target).pipe(res);
  })
  .listen(PORT, () => console.log(`Preview: http://localhost:${PORT}`));
