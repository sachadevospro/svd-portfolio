# Sacha Devos — Photographer & Videographer

The portfolio website of Sacha Devos: a home page, five photography series
(Motocross, Cars, Planes, Barbershop, Fitness), an index of all series, an
About page and a Contact page, with a full-screen photo viewer.

The site is built with Next.js, React and TypeScript, and exported as plain
static files. It can be hosted for free on Netlify, Vercel or Cloudflare
Pages, or on any web server.

> **Demonstration images.** The photographs currently shown are generated
> placeholders (abstract light, dust and silhouettes), not Sacha's work.
> They live in `demo-photos/` and are labelled "Demonstration image" on the
> site. Each one disappears automatically as soon as you add your own
> photographs to the matching folder in `photos/`.

---

## Contents

1. [What you need](#1-what-you-need)
2. [Run the website on your computer](#2-run-the-website-on-your-computer)
3. [Adding your photographs (step by step)](#3-adding-your-photographs-step-by-step)
4. [The home page photo or video, and your portrait](#4-the-home-page-photo-or-video-and-your-portrait)
5. [Changing the texts, email and social links](#5-changing-the-texts-email-and-social-links)
6. [Adding a new category](#6-adding-a-new-category)
7. [Putting the website online](#7-putting-the-website-online)
8. [Publishing updates after launch](#8-publishing-updates-after-launch)
9. [The contact form (optional)](#9-the-contact-form-optional)
10. [Features that need setting up](#10-features-that-need-setting-up)
11. [Image quality: how it works](#11-image-quality-how-it-works)
12. [Testing checklist](#12-testing-checklist)
13. [For developers](#13-for-developers)

---

## 1. What you need

- **Node.js 20.9 or newer** (version 22 recommended). Download the "LTS"
  installer from <https://nodejs.org> and install it like any application.
- A **terminal**: *Terminal* on macOS, *PowerShell* on Windows.
- For publishing: a free **GitHub** account (<https://github.com>) and a free
  **Netlify** account (<https://netlify.com>). You can sign up to Netlify
  with your GitHub account.

You only need to do the installation once.

## 2. Run the website on your computer

Open the terminal in the project folder (on macOS: right-click the folder →
*New Terminal at Folder*; on Windows: open the folder, type `powershell` in
the address bar and press Enter), then run:

```bash
npm install      # once, downloads what the site needs (1–2 minutes)
npm run dev      # starts the preview
```

Open <http://localhost:3000> in your browser. Leave the terminal open: while
it runs, the preview updates by itself every time you add, replace or remove
a photo, or edit a text file. Press `Ctrl + C` in the terminal to stop it.

The first start prepares all photos and can take a minute or two. After that,
only new or changed photos are processed.

To see the final, published version exactly as visitors will:

```bash
npm run build    # creates the finished site in the "out" folder
npm run preview  # serves it at http://localhost:4173
```

## 3. Adding your photographs (step by step)

### STEP 1 — Where to place a new photograph

Put the file in the folder of its category, inside `photos/`:

```
photos/
├── hero/          → the large photo(s) at the top of the home page
├── about/         → your portrait for the About page
├── motocross/
├── cars/
├── planes/
├── barbershop/
└── fitness/
```

There is no list to update: **every image in a folder is published
automatically**. Accepted formats are JPEG (`.jpg`), PNG, TIFF and WebP.
RAW and HEIC files are not shown — export them as JPEG first (the build
tells you if it finds one).

### STEP 2 — How to assign it to Motocross, Cars, Planes, Barbershop or Fitness

The folder decides the category. A photo in `photos/planes/` appears on the
Planes page (`/work/planes`), and so on.

The photos of a folder are shown **in the order of their file names**, so
start names with numbers:

```
photos/cars/001-gt3-night.jpg
photos/cars/002-interior.jpg
photos/cars/003-rolling-shot.jpg
```

Use `010`, `020`, `030`… if you think you will insert photos in between later.

### STEP 3 — How to add a title, caption and alternative text

Create a file named **`captions.yml`** in the same folder (copy
`photos/captions-example.yml` and rename the copy). Write the exact file name
of the photo, a colon, then the details, indented with two spaces:

```yaml
001-gt3-night.jpg:
  title: "Night run"
  caption: "Porsche 911 GT3 on the coast road."
  alt: "A grey sports car on a coastal road at night, tail lights glowing."
  project: "Private commission"
  date: "2026"
  featured: true
```

Every line is optional:

| Line | What it does |
| --- | --- |
| `title` | Shown under the thumbnail and in the full-screen viewer. |
| `caption` | A sentence shown in the full-screen viewer. |
| `alt` | A description of the photo for blind visitors and search engines. Please fill it in; the build reminds you when it is missing. |
| `project`, `date` | Shown in the full-screen viewer, after the caption. |
| `featured: true` | Shows the photo full width in its gallery. The first featured photo of a category is also its cover on the home page. |
| `hidden: true` | Keeps the photo in the folder but does not publish it. |
| `order: 1` | Moves a photo without renaming it (lower numbers first). |

If a name in `captions.yml` does not match a photo exactly (a typo, a
different extension), the build tells you which one.

### STEP 4 — How to preview the result locally

Run `npm run dev` (see section 2) and open <http://localhost:3000>. If the
preview is already running, just save the photo or the `captions.yml`: the
terminal shows "updating photos…" and the page refreshes.

### STEP 5 — How to publish the update online

Once the site is connected to GitHub and Netlify (section 7), every change
you send to GitHub is published automatically in a few minutes. Section 8
explains the two simplest ways to send changes: in the browser, or with
GitHub Desktop.

### STEP 6 — How to replace a photograph without breaking the gallery

Save the new file **with exactly the same name** in the same folder,
replacing the old one. Its title and caption in `captions.yml` stay
attached to it, its place in the gallery doesn't change, and every visitor
gets the new version (the web copies are named after the content of the
file, so no browser keeps showing the old one).

To remove a photo, delete the file (or add `hidden: true` to keep it
for later).

### STEP 7 — How to preserve the best possible image quality

- Export from Lightroom / Capture One / Photoshop as **JPEG, quality 90–100,
  sRGB**, **4000 to 6000 pixels** on the long side. TIFF and PNG work too.
- Do not upscale small images. The site never enlarges a photo beyond its
  real size.
- Your original file is **never modified**. The site creates web copies at
  several sizes (640 to 4096 pixels wide, WebP at quality 90, plus a JPEG
  fallback). Each visitor downloads only the size their screen can show:
  a phone gets a light file, a 5K display gets the 4096-pixel version.
- The web copies are stripped of camera metadata, including **GPS
  location**, and carry a copyright notice in their metadata.
- Optional settings in `content/site.yml` (`images:` section):
  - `avif: true` also creates AVIF files (smaller at the same quality, but
    builds take much longer);
  - `publishOriginals: true` adds a "View original" link in the full-screen
    viewer that opens your untouched full-resolution file. Leave it off if
    you don't want people to be able to download your originals.

## 4. The home page photo or video, and your portrait

- **`photos/hero/`** — the full-screen image behind your name. Choose strong
  **horizontal** photos (they are cropped to fill the screen; keep the subject
  near the centre). With several photos, the home page shows a slow slideshow
  that visitors can pause.
- **Background video (optional)** — put an `.mp4` file in `photos/hero/`. It
  plays muted and looped, with the first hero photo as its poster image.
  Keep it short and light: 10–20 seconds, 1920×1080, H.264, under 15 MB.
  It is not played for visitors who ask their device to reduce motion or to
  save data; they see the photo instead.
- **`photos/about/`** — one portrait for the About page (vertical, about 4:5).

## 5. Changing the texts, email and social links

All texts live in three files in `content/`. Open them with any text editor
(TextEdit in plain-text mode, Notepad, or the free VS Code), change what is
between the quotes, and save.

| File | Contains |
| --- | --- |
| `content/site.yml` | Your name and title, **email address**, social links, website address, contact form, image options. |
| `content/categories.yml` | Each category's title, subtitle, introduction and search-engine description. |
| `content/pages.yml` | Home page introduction, About biography and approach, Contact page texts. |

**Before publishing, replace `hello@example.com` with your real email
address** in `content/site.yml`. Social links that are left empty are not
shown.

When the site has its own address (for example `https://www.sachadevos.com`),
write it in `siteUrl` in `content/site.yml`. This enables the sitemap,
canonical links and the preview image shown when the site is shared on
social media and in messages.

## 6. Adding a new category

1. In `content/categories.yml`, copy one block (from `- slug:` to
   `cover:`) and paste it at the place where it should appear.
2. Change its `slug` (lowercase letters, numbers and hyphens, e.g.
   `street`), title and texts.
3. Create the folder `photos/street/` and add photographs.

The page `/work/street`, its links in the menus and on the home page are
created automatically.

## 7. Putting the website online

### Recommended: GitHub + Netlify (free, automatic updates)

1. **Put the project on GitHub.** Install GitHub Desktop
   (<https://desktop.github.com>), sign in, then *File → Add local
   repository* → choose this folder → *create a repository* → *Publish
   repository*. Keep it **private** if you prefer.
2. **Connect Netlify.** On <https://app.netlify.com>: *Add new site → Import
   an existing project → GitHub* → choose the repository. The settings are
   read from the repository-root `netlify.toml` (base directory
   `sacha-devos`, a clean dependency installation followed by `npm run build`,
   and publish folder `out` relative to that base); just click *Deploy*.
3. After a few minutes the site is online at an address like
   `https://sacha-devos.netlify.app`.
4. **Your own domain (optional).** In Netlify: *Domain management → Add a
   domain*, and follow the instructions (buy the domain there, or point an
   existing one to Netlify). Then put the address in `siteUrl` in
   `content/site.yml` and publish again.

The first build prepares every photo and takes the longest (about one to
two seconds per photo). Vercel, and normally Netlify, keep the prepared
files between builds, so later updates only process new or changed photos.

### Alternatives

- **Vercel** (<https://vercel.com>): *Add New → Project* → import the GitHub
  repository → *Deploy*. Nothing to configure. Note that Vercel's free
  "Hobby" plan is meant for non-commercial use; check their terms for a
  professional portfolio.
- **Cloudflare Pages** (<https://pages.cloudflare.com>): connect the
  repository, build command `npm run build`, output directory `out`,
  and add the environment variable `NODE_VERSION` = `22`.
- **Without GitHub (quick test):** run `npm run build`, then drag the `out`
  folder onto <https://app.netlify.com/drop>. This is fine to try the site
  online, but every update means building and dragging again.
- **Any web host:** upload the content of the `out` folder. The server must
  serve `work/cars.html` for the address `/work/cars` (most hosts do).

Check each provider's current plans and limits before launch; photography
sites use more bandwidth than most.

## 8. Publishing updates after launch

Every change sent to GitHub is published automatically.

**In the browser (no installation):** open the repository on github.com,
go to `photos/cars/` (for example), click *Add file → Upload files*, drop the
photos, then *Commit changes*. To edit `captions.yml` or a text, open the file
and click the pencil icon. Files must be under 25 MB each this way.

**With GitHub Desktop (recommended for regular updates):** add or change
files in the folder on your computer, preview with `npm run dev` if you
like, then in GitHub Desktop write a short summary (e.g. "New motocross
photos"), click *Commit to main*, then *Push origin*. Files up to 100 MB.

After a few minutes, refresh the website.

If one day the portfolio holds many hundreds of large photos (several GB),
the GitHub repository becomes heavy; at that point the photos can move to a
cloud image service (Cloudinary, Cloudflare Images…) — a developer can
connect it without changing the design.

## 9. The contact form (optional)

By default the Contact page shows your email address (with a "Copy email"
button) and no form, because a form needs a service that actually delivers
the messages. The website never shows a form that cannot send.

To add the form, using Formspree (free plan available):

1. Create an account at <https://formspree.io> and create a new form
   with your email address.
2. Copy the form endpoint, e.g. `https://formspree.io/f/abcdwxyz`.
3. Paste it in `content/site.yml`:
   ```yaml
   contact:
     formEndpoint: "https://formspree.io/f/abcdwxyz"
   ```
4. Publish. Send yourself a test message and confirm the first submission
   in the email Formspree sends you.

The form sends the name, email, type of project and message. It includes a
hidden anti-spam field and shows a clear error if sending fails.

## 10. Features that need setting up

| Feature | Status | What to do |
| --- | --- | --- |
| Your photographs | Demonstration images shown | Add photos to `photos/` (section 3). |
| Email address | Placeholder `hello@example.com` | Replace in `content/site.yml`. |
| Social links | Hidden (empty) | Add addresses in `content/site.yml`. |
| Portrait | Placeholder | Add a photo to `photos/about/`. |
| Contact form | Off | Formspree endpoint in `content/site.yml` (section 9). |
| Sitemap, canonical links, social preview image | Off until the address is known | Set `siteUrl` in `content/site.yml`. |
| Public hosting | Not online yet | Section 7. |
| Hero video | Off | Optional `.mp4` in `photos/hero/`. |
| AVIF images, downloadable originals | Off | Options in `content/site.yml`. |

Before launch, set `useDemoImages: false` in `content/site.yml` if some
categories are still empty: they will show "Photographs coming soon"
instead of demonstration images.

## 11. Image quality: how it works

`npm run dev` and `npm run build` first run `scripts/photos.mjs`, which:

1. finds every photo in `photos/<folder>/` (or `demo-photos/<folder>/` while
   a folder is empty);
2. reads `captions.yml`;
3. creates the web copies in `public/_img/` — widths 640, 1080, 1600, 2400,
   3200 and 4096 px (never wider than the original), WebP quality 90,
   gentle sharpening after resizing, colours converted to sRGB, metadata
   removed except a copyright notice, plus a 1600 px JPEG for very old
   browsers;
4. writes `src/generated/content.json`, which the pages read.

On the website:

- every image declares its exact proportions, so nothing jumps while loading;
- a blurred preview of the photo's own colours is shown instantly, and the
  sharp image fades in;
- thumbnails below the screen load only when they are about to be seen
  (lazy loading); the first home-page photo is loaded first;
- the browser chooses the right size for each screen and pixel density
  (`srcset` and `sizes`), including for cropped images on tall phone screens;
- the full-screen viewer loads the largest useful size (up to the original
  width on high-resolution displays) and prepares the next and previous
  photos in advance.

## 12. Testing checklist

Run through this after changes and before launch (`npm run build` then
`npm run preview`, and again on the live site):

- [ ] Home page: the name, "Photographer & Videographer" and "Available
      Worldwide · Based in France" are visible; the hero photo is sharp.
- [ ] The five series appear under *Selected work* and each opens its page.
- [ ] `/work/motocross`, `/work/cars`, `/work/planes`, `/work/barbershop`,
      `/work/fitness` open directly when typed in the address bar and after
      refreshing.
- [ ] In a gallery, clicking a photo opens the viewer; arrows (on screen and
      on the keyboard), swipe on a phone, Escape and the Close button work;
      the counter is right.
- [ ] A link such as `/work/cars#photo-03` opens that photo directly.
- [ ] On a phone: the Menu button opens and closes the menu; no page scrolls
      sideways; text is never cut off.
- [ ] Titles, captions and alt texts are correct (the build lists photos
      without alt text).
- [ ] Contact: the email link opens a new message; "Copy email" works; if
      the form is on, a test message arrives.
- [ ] No demonstration image is left on the published site (they are
      labelled "Demonstration image"), unless intended.
- [ ] The email is no longer `hello@example.com`.
- [ ] With the site address set: `/sitemap.xml` lists every page, and the
      link preview looks right when the address is shared in a message.
- [ ] Optional: run Lighthouse (Chrome → DevTools → Lighthouse) on the home
      page and a gallery, on mobile.

## 13. For developers

```
content/            Editable settings and texts (YAML)
photos/             Sacha's photographs, one folder per category (+ hero, about)
demo-photos/        Generated placeholder images, used while a folder is empty
scripts/
  photos.mjs        Image pipeline + manifest (run before dev and build)
  dev.mjs           Dev server + file watcher
  preview.mjs       Static server for the out/ folder
src/
  app/              Routes: /, /work, /work/[category], /about, /contact, 404,
                    sitemap.xml, robots.txt, icon
  components/       Header, MobileMenu, Hero, SelectedWork, Interlude,
                    Gallery, Lightbox, Photo, ContactCta, ContactForm, Footer…
  lib/content.ts    Typed access to the generated content
  lib/sizes.ts      `sizes` helpers for responsive images
  fonts/            Archivo (variable width) and Newsreader, self-hosted (OFL)
public/_headers     Cache headers for Netlify / Cloudflare Pages
../netlify.toml     Netlify build settings (at the repository root)
vercel.json         Vercel cache headers
```

- Stack: Next.js 16 (App Router, `output: "export"`), React 19, TypeScript,
  plain CSS with design tokens (`src/app/globals.css`), sharp, js-yaml.
- Data flow: YAML + image folders → `scripts/photos.mjs` →
  `src/generated/content.json` → server components. Client components only
  receive the photos they display.
- The gallery uses justified rows in pure CSS: each item gets
  `flex-grow` and `flex-basis` proportional to its aspect ratio, so every
  photo keeps its proportions and each row shares one height. Featured
  photos and panoramas (≥ 2.4:1) get a full-width row.
- Accessibility: semantic landmarks and headings, skip link, visible focus
  ring, labelled controls, dialog semantics with focus trapping and focus
  return in the viewer and the mobile menu, `prefers-reduced-motion`
  respected (no slideshow, video, parallax or reveal movement), content fully
  visible without JavaScript.
- Encoded images are cached in `.next/cache/portfolio-images` (the folder
  Vercel and Netlify persist between builds of Next.js projects) and linked
  into `public/_img/`.
- `npm run typecheck` runs the TypeScript compiler.

The fonts Archivo and Newsreader are licensed under the SIL Open Font
License (see `src/fonts/`).
