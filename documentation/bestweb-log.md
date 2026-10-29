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
