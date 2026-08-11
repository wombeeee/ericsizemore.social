# ericsizemore.social

Personal site for Eric Sizemore — K12 ed tech and AI. Writing, projects, and a
running archive of speaking work. Live at **[ericsizemore.social](https://ericsizemore.social)**.

A hand-built, single-page site with **no build step** — just HTML, CSS, and a
little vanilla JS — served from a small Cloudflare Worker. The console-wordmark
identity (`❯ eric sizemore`) ships in both a dark "forest" and light "limestone"
theme.

## Stack

- **Static front end** — `index.html` plus standalone resource pages under `resources/`, sharing one stylesheet (`css/site.css`). Progressive-enhancement JS in `js/main.js`. No framework, no bundler.
- **Cloudflare Workers** — `worker.js` serves the static assets and adds one tiny API route (below).
- **JetBrains Mono** — loaded from Google Fonts for the wordmark and mono labels; UI/body stay on the system sans stack.

## Project structure

```
index.html         The home page
css/site.css       Shared stylesheet — design tokens + all site styles
resources/         Standalone field-kit pages (e.g. the Gemini prompt library),
                   each with its own shareable URL
js/main.js         Theme toggle, mobile nav, scroll-to-top, fade-ins, the Writing feed
worker.js          Cloudflare Worker: serves assets + the /api/posts feed proxy
wrangler.jsonc     Worker / deploy config
data/events.csv    Source of truth for the Work archive (in-person events)
assets/            favicon.svg (forest badge) + social-card.png (og:image)
.assetsignore      Keeps worker.js, wrangler.jsonc, and data/ out of the public assets
```

## The Writing feed

The **Writing** section is pulled live from my Substack rather than hand-edited.
`worker.js` exposes `GET /api/posts`, which fetches the Substack RSS feed,
parses the latest few items, and returns trimmed JSON (title, link, date,
snippet). It's edge-cached (~15 min) and fails gracefully — if the feed is
unreachable, the section falls back to a link to the Substack archive. The
front end renders it client-side in `js/main.js`.

## Local development

Requires Node. From the repo root:

```sh
npx wrangler dev
```

This runs the Worker locally (default `http://localhost:8787`) so the
`/api/posts` feed works. A plain static server (e.g. `npx serve .`) will render
the page but won't serve the feed endpoint.

## Deployment

Pushing to `main` auto-deploys via **Cloudflare Workers Builds**. To deploy
manually:

```sh
npx wrangler deploy
```

## Design system

The identity is a **console wordmark** — the name typed as a terminal command,
with a blinking caret in the hero. Rivian-influenced: geometric restraint, one
constant accent, forest + limestone earth tones, no separate icon glyph (the
chevron *is* the icon).

- **One constant accent** — yellow-green `#E6EC2B`, the same in both themes.
- **Dual theme** — dark "forest" (`#0e140e`) and light "limestone" (`#ece8d9`). The site defaults to the visitor's OS preference; a nav toggle overrides it and persists to `localStorage`. The theme is set pre-paint to avoid a flash.
- **Legibility rule** — yellow-green is illegible on the light surface, so the chevron and `//` use a `--logo-mark` token (accent on dark, ink on light). The raw accent only appears as a *solid fill* where it reads on either surface: the caret, the toggle knob, the "Shipped" chip, button hovers.
- **Icon marks are fixed** — the favicon and social card use a constant forest badge with the yellow-green chevron and do **not** theme-swap.

The social card (`assets/social-card.png`, 1200×630) is rendered from a small
standalone HTML file in the forest palette — regenerate it if the wordmark or
tagline changes.

---

Built with [Claude Code](https://claude.com/claude-code).
