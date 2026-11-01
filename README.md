# Gaurav Dhakad · Portfolio

Next.js (App Router), TypeScript, Tailwind CSS v4 and three.js. Static, deploys to Vercel.

## Setup

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # serve the production build
npm run lint       # type-check
```

Node 18.18+ (tested on Node 22).

## Deploy (Vercel)

1. Push this folder to a GitHub repo.
2. In Vercel: **Add New → Project → import the repo**. The Next.js defaults are correct.
3. Optional: add the env var `NEXT_PUBLIC_FORMSPREE_ID` (see "Contact form").
4. If the domain changes, update `siteUrl` in `data/profile.ts`. It drives canonical URLs, Open Graph, the sitemap and JSON-LD.

## Updating content

All text lives in `/data`. Components never need editing for content changes.

| File | What's in it |
|---|---|
| `data/profile.ts` | Name, status line, hero and About copy, results strip, education, contact details, resume paths |
| `data/projects.ts` | Projects and case studies: problem, results, screenshots, decisions, limitations |
| `data/timeline.ts` | Experience, grouped by start year |
| `data/skills.ts` | The skills table: which skill was used in which project |
| `data/links.ts` | Coding-profile URLs and **hard-coded** stats (`statsCheckedOn` says when they were checked) |
| `data/misc.ts` | Open-source PRs with their real status, certifications, section list |
| `data/testimonials.json` | Recommendations. Empty entries show as placeholders in `npm run dev` only; in production the section stays hidden until one has a real quote |
| `data/stockwise-sku1001.json` | Real StockWise output for SKU-1001, drawn by the particles in "How I work" |
| `data/screener-results.json` | Real output of the resume screener's TF-IDF scorer |
| `lib/fit.ts` | Fit Check: skills it recognises, sample job descriptions |

### Resumes

The PDFs in `/public` are built from `resume/ai-ml.html` and `resume/full-stack.html`. Edit the HTML, then:

```bash
npm i -D puppeteer-core
```

```bash
node resume/build.mjs
```

Or replace the PDFs with your own, keeping the names `Gaurav_Dhakad_Resume_AI-ML.pdf` and `Gaurav_Dhakad_Resume_Full-Stack.pdf`. Every download calls `onResumeDownload(type)` in `lib/analytics.ts`, a no-op you can wire to analytics.

### Screenshots

Project images live in `public/projects/<slug>/` (1800×1125 WebP) and are listed in each project's `shots`. Captured from the live demos (Grace, BioPay) and local runs of each repo with its own seed or sample data (StockWise, VisionInspect, BookLeaf, AgriMarket). Profile images live in `public/profiles/`.

### Music

Put a royalty-free loop at `public/audio/ambient.mp3` and note its licence at the top of `components/MusicToggle.tsx`. Until then the button plays a soft pad synthesised in the browser. It's off by default and only starts on a click.

### Recommendations

Paste real ones into `data/testimonials.json`. The section and its nav entry appear as soon as one has a quote:

```json
{ "quote": "…", "name": "Full Name", "role": "Title, Company", "relation": "Mentor at X", "href": "https://www.linkedin.com/in/…" }
```

### Contact form

Create a form at [formspree.io](https://formspree.io) and set `NEXT_PUBLIC_FORMSPREE_ID` (the part after `/f/`) in `.env.local` and in Vercel. Without it, submitting opens a pre-filled email instead.

## How the WebGL works

`components/gl/` holds one point cloud. `shapes.ts` builds each shape with the same number of points, `engine.ts` draws them with a custom shader, and `Stage.tsx` connects them to the page.

- **The opening** is real gradient descent. Each point minimises `||p - target||²`, which has the closed form `p(t) = target + (p0 - target)(1 - 2·lr)^t`. The shader evaluates that per point, and the loss on screen is measured from the same formula. The target is the name, sampled from the page's own heading so the letters line up.
- **How I work** scrolls the same points through real data: StockWise's sales history, its holdout results, one square per test, then the real dashboard.
- three.js only loads when it can run. With reduced motion you get a still frame; without WebGL the page is plain text and an SVG chart. It pauses off-screen, and lowers detail once if a device can't hold frame rate.

## Colours and type

- Klein blue `#0a1b94`, bone `#f2eee3`, ink `#0d1020`, acid yellow `#d7f24a`. Tokens are at the top of `app/globals.css`.
- Schibsted Grotesk (headings, UI), Newsreader (reading text), IBM Plex Mono (labels, data).
- The sizes in `app/globals.css` (`.t-display`, `.t-h2`, `.t-read` and so on) scale smoothly from phone to desktop. Change them there and the whole site follows.

## Extras

`Ctrl/⌘ + K` command palette. Konami code (↑↑↓↓←→←→BA) for terminal mode. Dark/light theme with no flash on load.

## Structure

```
app/          layout, home page, /work/[slug] case studies, OG image, sitemap, robots, icon
components/   one file per section; gl/ holds the WebGL scene
data/         all editable content
lib/          Fit Check, analytics hook, small client helpers
resume/       resume source (HTML) and PDF build script
public/       resumes, screenshots, audio
```
