#!/usr/bin/env node
/**
 * `npm run dev` — local preview with automatic photo updates.
 *
 * Prepares the photos, starts the website at http://localhost:3000, then
 * watches /photos, /demo-photos and /content: when you add, replace or
 * remove a photo, or edit a .yml file, the photos are prepared again and
 * the open page refreshes by itself.
 */
import { spawn } from "node:child_process";
import { watch, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { run, FriendlyError } from "./photos.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function prepare(first) {
  try {
    await run({ verbose: first });
    return true;
  } catch (e) {
    console.error(`\n\x1b[31m✗ ${e instanceof FriendlyError ? e.message : e.stack}\x1b[0m\n`);
    return false;
  }
}

const ok = await prepare(true);
if (!ok && !existsSync(path.join(ROOT, "src", "generated", "content.json"))) process.exit(1);

const nextBin = path.join(ROOT, "node_modules", "next", "dist", "bin", "next");
const next = spawn(process.execPath, [nextBin, "dev", ...process.argv.slice(2)], { stdio: "inherit", cwd: ROOT });
next.on("exit", (code) => process.exit(code ?? 0));

let timer = null;
let running = false;
let again = false;
const trigger = (dir, file) => {
  if (!file || /(^|[\\/])\.|\.tmp$/.test(file)) return;
  clearTimeout(timer);
  timer = setTimeout(async () => {
    if (running) {
      again = true;
      return;
    }
    running = true;
    console.log(`\n\x1b[2m↻ ${path.join(dir, file)} changed — updating photos…\x1b[0m`);
    await prepare(false);
    running = false;
    if (again) {
      again = false;
      trigger(dir, file);
    }
  }, 500);
};

for (const dir of ["photos", "demo-photos", "content"]) {
  const full = path.join(ROOT, dir);
  if (!existsSync(full)) continue;
  try {
    watch(full, { recursive: true }, (_event, file) => trigger(dir, file));
  } catch {
    console.warn(`Could not watch /${dir}. Restart \`npm run dev\` after adding photos.`);
  }
}

for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => next.kill(sig));
