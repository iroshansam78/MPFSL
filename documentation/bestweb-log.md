# BestWeb.LK 2027 — Work Log

The record of what has been done to meet the [BestWeb.LK 2027 targets](bestweb-2027.md), following
the [plan](bestweb-plan.md). Newest entry first. **Add an entry for every change that moves a
checklist item**, including content the federation publishes and settings changed in Cloudflare or
Railway, which don't show up in git.

## How to write an entry

```markdown
### YYYY-MM-DD — Short title
- **Area:** Technical | Performance | Design | Content | Security | Bonus | SEO | Governance | Planning
- **Target:** the checklist item(s) in bestweb-2027.md this serves
- **Done:** what changed, in a sentence or two
- **Evidence:** commit / PR, files, screenshot, measurement, link to the live page
- **Tracker:** status change, e.g. "Branded first impression ❌ → ✅"
- **Next:** what's still open (optional)
```

Keep entries short and factual. If something was tried and didn't work, log that too, with why.

---

### 2026-10-30 — Website row back in Contact; footer simplified; old `mpfsl.net` replaced

- **Area:** Content
- **Target:** No placeholder or unfinished content; consistent contact details
- **Done:** The Contact section's Website row is back (removed in Sprint 1 because it showed
  `mpfsl.net`) and now shows `mpfsl.lk`. On request the footer was simplified: the website link added
  next to the Facebook link and the Sprint 2 footer menu (About … Contact) were removed, so the footer
  is back to copyright, Sinhala name and the Facebook link. The header menu and breadcrumbs remain.
  `mpfsl.net` was replaced with `mpfsl.lk` in the old `Frontend/` app, the root `index.html` and the
  `mpfsl-preview*.html` files. Frontend-v2 already had no mentions. Doc lines that record its
  removal, and the question of redirecting the old domain, stay as history.
- **Evidence:** `Frontend-v2/src/sections/Contact/Contact.jsx`, `components/layout/Footer/`; lint and build pass;
  the Website row is in the pre-rendered home and `/contact` pages.
- **Tracker:** no status change (contact details were already 🟡 → kept consistent)

### 2026-10-30 — Sprint 2: real pages, pre-rendered for search engines

- **Area:** Technical, SEO, Design, Performance
- **Target:** clean URLs, sitemap, canonical URLs + structured data, breadcrumbs, professional 404,
  unique title + description per page, pages readable without JavaScript, Lighthouse 90+ on mobile
- **Done:**
  - The single scrolling page became real pages: `/`, `/about`, `/programmes`, `/news`, `/gallery`,
    `/contact` and a branded 404 (real HTTP 404, `noindex`). One list (`src/data/pages.js`) drives
    the routes, menu, footer menu, breadcrumbs, titles, descriptions and sitemap.
  - Every page is **pre-rendered** to HTML at build time (`scripts/prerender.js`) with its own
    `<title>`, description, canonical URL, Open Graph tags and `BreadcrumbList`; `sitemap.xml` is
    generated. The browser **hydrates** that HTML instead of rebuilding it; theme, reduced motion and
    the footer year were made hydration-safe.
  - Inner pages get a dark banner with breadcrumbs and the `<h1>`; the active menu item is marked;
    moving between pages scrolls to the top and moves focus to the content (screen readers).
  - Performance work so the pre-rendering didn't cost speed (first attempt: mobile home fell to
    47–66): CSS inlined; pre-rendered content laid out only once the app is ready (behind the
    preloader); scroll-reveal only hides what's below the first screen; size-matched fallback fonts
    (no shift when fonts load); WebGL slideshow skipped on phones / slow connections / reduced
    motion; federation photos as WebP 480/960/1440 px via `srcset` (`npm run images`, ~80% smaller);
    the featured story photo loads first on `/news`.
  - Fixed along the way: duplicate React keys in the hero caption (since Sprint 1's `localPhotos`
    change); the admin host would have received the public pages — it now starts clean on an
    empty page with only its own CSS, and `vercel.json` rewrites every admin path to `index.html`.
- **Evidence:** local production build served with the `vercel.json` headers. Lighthouse
  mobile / desktop performance: `/` 96/96, `/about` 95/100, `/programmes` 91/100, `/news` 85–93/99,
  `/gallery` 97/100, `/contact` 94/100; **accessibility, best practices and SEO 100 on every page**;
  CLS 0–0.02. Puppeteer checks: every page hydrates without errors in light and dark mode and with
  reduced motion; menu, logo, back button, 404 → page navigation update the title, description and
  canonical URL; admin host starts cleanly. See [measurements](bestweb-2027.md#measurements).
- **Tracker:** sitemap/robots/clean URLs → ✅; canonical + structured data → ✅; breadcrumbs ❌ → ✅;
  404 ❌ → ✅; unique titles ❌ → ✅; pre-rendered pages ❌ → ✅; hero on phones → ✅; images → ✅;
  navigation → ✅
- **Next:** push, then measure on `www.mpfsl.lk` and log it. `/news` mobile sits around 90: one page
  per story (Sprint 3) will make the list page lighter. Google Search Console + sitemap submission.

### 2026-10-29 — Sprint 1: dependency audit in CI, 2 vulnerabilities fixed

- **Area:** Security
- **Target:** "Dependencies/plugins are updated and vulnerability monitoring is established"
- **Done:** `npm audit` found 2 high-severity denial-of-service advisories in the API's dependencies:
  `multer` (photo uploads, GHSA-q7qp-rjg7-q26m) and `body-parser` (GHSA-27r3-jxmh-p828). Updated to
  `multer` 2.5.0 and `body-parser` 2.4.0; `npm audit` now reports 0. Added a GitHub Actions workflow
  (audit, lint, API tests, website build on every push / PR to `main`) and Dependabot (weekly).
- **Evidence:** `.github/workflows/ci.yml`, `.github/dependabot.yml`, `server/package.json`,
  `package-lock.json`; 62/62 API tests pass; lint and build pass locally.
- **Tracker:** "Dependency updates + vulnerability alerts" ❌ → ✅
- **Next:** check the first CI run on GitHub after pushing.

### 2026-10-29 — Sprint 1: security headers for the public site

- **Area:** Security
- **Target:** "Security headers are correctly configured", "Content Security Policy is implemented"
- **Done:** found the live site is on **Vercel** (not Cloudflare Pages as planned) and redirects
  `mpfsl.lk` → `www.mpfsl.lk`; Vercel already sends HSTS. Added `Frontend-v2/vercel.json`: a strict
  CSP (scripts only from our own domain), `X-Frame-Options`, `nosniff`, `Referrer-Policy`,
  `Permissions-Policy`, and a one-year cache for hashed assets. Tested by serving the build locally
  with exactly these headers: no CSP violations, WebGL slideshow works. `Cross-Origin-Opener-Policy`
  was tried and removed: it breaks Lighthouse's mobile run. Docs corrected for Vercel.
- **Evidence:** `Frontend-v2/vercel.json`, [deployment.md](deployment.md#security-headers)
- **Tracker:** "HSTS" ❌ → ✅; "Security headers + CSP" stays 🟡 until verified live
- **Next:** after pushing: confirm in Vercel that the root directory is `Frontend-v2`, then run
  securityheaders.com and SSL Labs on `www.mpfsl.lk` and log the grades.

### 2026-10-29 — Sprint 1: SEO and social sharing basics

- **Area:** SEO, Technical
- **Target:** canonical URLs, structured data, sitemap + robots.txt, Open Graph, `SportsOrganization` schema
- **Done:** canonical URL (`https://www.mpfsl.lk/`), clearer meta description, Open Graph + Twitter
  card tags with a new 1200×630 share card (Isiwaruna De Silva fencing at Aichi-Nagoya 2026 + logo),
  `SportsOrganization` + `WebSite` JSON-LD (incl. UIPM membership, Sinhala name), `robots.txt`,
  `sitemap.xml`, `logo.png` for search engines.
- **Evidence:** `Frontend-v2/index.html`, `Frontend-v2/public/{og-image.jpg,logo.png,robots.txt,sitemap.xml}`;
  JSON-LD validated as JSON; Lighthouse SEO 100.
- **Tracker:** Open Graph ❌ → ✅; `SportsOrganization` ❌ → ✅; sitemap/robots ❌ → 🟡; canonical + structured data ❌ → 🟡
- **Next:** Google Search Console + Bing Webmaster Tools (needs the domain owner), submit the
  sitemap; check the share preview on WhatsApp / Facebook after deploy.

### 2026-10-29 — Sprint 1: Lighthouse fixes (speed, console errors, accessibility, placeholders)

- **Area:** Performance, Technical, Design
- **Target:** Lighthouse 90+, no console errors, colour contrast, no placeholder content
- **Done:** measured the live baseline (mobile 75 / desktop 76 performance; accessibility 96; best
  practices 96). Then:
  - **Console errors:** the site no longer calls the API while none is deployed (`src/utils/api.js`),
    and no longer requests hero photos that aren't in the repo (`localPhotos` in `src/data/hero.js`).
  - **Fonts:** self-hosted with `@fontsource`, only the weights in use; removes the render-blocking
    Google Fonts request.
  - **Hero photo:** a real `<img>` with 5 widths (`srcset`) and `fetchpriority="high"`, preloaded
    from the HTML by a small Vite plugin; phones no longer download the 2400 px version first.
  - **Contrast:** new `--brand-ink` colour for brand-coloured text (dark mode was 3.2:1, now 6.7:1).
  - **Gallery:** captions hidden from screen readers (they repeated the alt text).
  - **Placeholders:** removed the X / YouTube / Instagram search-page links and the `mpfsl.net` link.
- **Evidence:** local build with production headers: **mobile 90 / desktop 94** performance,
  accessibility, best practices and SEO all **100**; mobile LCP 3.0 s → 2.1 s, speed index
  10.9 s → 4.7 s. See [measurements](bestweb-2027.md#measurements).
- **Tracker:** console errors ❓ → ✅; fonts → ✅; CDN + caching → ✅; preloader → ✅; links → ✅
- **Next:** re-measure on `www.mpfsl.lk` after deploy; Sprint 3 work (skip WebGL on phones, `srcset`
  for news and gallery) to get mobile comfortably above 90. In headless Edge the WebGL canvas
  rendered ~26 px narrower than the window; check in a real browser.

### 2026-10-29 — Delivery plan and work log started

- **Area:** Planning
- **Target:** the review's requirement that every item has an owner, a target date and a status
- **Done:** wrote the sprint plan (11 sprints, submission-ready by 18 Apr 2027), a federation track
  with dates for the content we need, and this log.
- **Evidence:** [bestweb-plan.md](bestweb-plan.md), this file
- **Tracker:** —
- **Next:** the federation names an owner per score area (by 8 Nov 2026); Sprint 1 starts 2 Nov.

### 2026-10-29 — Branded preloader

- **Area:** Design, Performance
- **Target:** Design: "Strong and consistent MPFSL visual identity"; Performance: must not hurt LCP
- **Done:** a pure HTML/CSS preloader in `index.html`: logo, "Five disciplines. One champion.", a
  five-colour bar naming each discipline in turn, and a curtain-lift into the hero. It is lifted
  once the hero photo and fonts are ready: at least 0.9 s on a first visit only, never more than
  2.5 s. A still version is shown with reduced motion; screen readers hear "loading" until it's gone.
  It's not shown on the admin panel.
- **Evidence:** `Frontend-v2/index.html`, `Frontend-v2/src/utils/preloader.js`,
  `Frontend-v2/src/sections/Hero/Hero.jsx`, `Frontend-v2/public/theme-init.js`; build and lint pass;
  checked in headless Edge screenshots at desktop and phone sizes.
- **Tracker:** "Branded first impression" → ✅; "Preloader doesn't delay the page" → 🟡 (needs Lighthouse)
- **Next:** measure LCP with and without it in Sprint 1's baseline.

### 2026-10-29 — Readiness tracker and documentation aligned to the targets

- **Area:** Planning, all areas
- **Target:** the whole [Competition Readiness Review](MPFSL_BestWeb_2027_Competition_Readiness_Review.pdf)
- **Done:** turned the review into a tracker with the current status of every item, checked against
  the code. Updated the planning docs: target page structure and pre-rendering (architecture),
  athlete / competition / results / documents collections (data model), security hardening list
  with what the API already does, public-site security headers and search-engine setup
  (deployment), and BestWeb phases 7–10 (roadmap).
- **Evidence:** [bestweb-2027.md](bestweb-2027.md), [architecture.md](architecture.md#public-site-pages),
  [data-model.md](data-model.md#planned-for-bestweblk-2027),
  [auth-and-security.md](auth-and-security.md#hardening-checklist),
  [deployment.md](deployment.md#security-headers), [roadmap.md](roadmap.md#bestweblk-2027)
- **Tracker:** created
- **Next:** Sprint 1.

### 2026-10-29 — Domain confirmed: mpfsl.lk

- **Area:** Eligibility
- **Target:** "mpfsl.lk is a valid .lk domain and does not simply redirect to another domain"
- **Done:** the site runs on `mpfsl.lk`. Replaced the `website.lk` placeholder with `mpfsl.lk` (and
  `admin.` / `api.` / `media.mpfsl.lk`) across the docs, READMEs, `.env.example` files and code comments.
- **Evidence:** docs and READMEs; no code behaviour changed
- **Tracker:** Eligibility "valid .lk domain" → ✅
- **Next:** the Contact section still shows `mpfsl.net` (Sprint 1); decide whether `mpfsl.net`
  redirects to `mpfsl.lk`.

### Before 2026-10-29 — Work already in place

Done before the BestWeb plan started, and counted in the tracker:

- **Security:** API with `helmet` and a strict CSP, strict zod validation, rate limiting on login and
  the API, account lockout, argon2id passwords, database sessions with `HttpOnly` / `Secure` /
  `SameSite` cookies, upload checks (size, real type, no SVG, EXIF removed), audit log. 40+ auth tests.
- **Content:** admin panel for news (drafts, publish, featured story) and the gallery; alt text
  required on uploaded photos.
- **Design:** consistent MPFSL identity, light/dark mode, skip-to-content link, responsive layout,
  lazy-loaded images, still photo before the WebGL hero.
