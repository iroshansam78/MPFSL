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
