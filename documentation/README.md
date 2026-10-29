# MPFSL Website — Planning Docs

Plans for **mpfsl.lk**: the public website, the admin panel that lets the federation manage it
without editing code, and the API behind both.

> **Target: BestWeb.LK 2027 — Gold in Best Sports & Fitness Website (135+/150).** Every plan here
> should move the site towards the targets and checklist in [bestweb-2027.md](bestweb-2027.md),
> following the [plan](bestweb-plan.md). Every change that moves a target is recorded in
> [bestweb-log.md](bestweb-log.md).

## The short version

- **Stack:** MongoDB · Express · React · Node (MERN), with images stored in **Cloudflare R2**.
- **Four addresses, one frontend:**
  - `mpfsl.lk` — the public site
  - `admin.mpfsl.lk` — the admin panel (staff only, login required)
  - …both served by the **same `Frontend-v2` build** (one Vercel project); the app picks
    which to show by hostname
  - `api.mpfsl.lk` — the Express API that both of them talk to
  - `media.mpfsl.lk` — public image delivery straight from R2 (cached by Cloudflare)
- **Two roles:**
  - **Editor** — full create / edit / publish / delete for news stories and the gallery.
  - **Admin** — everything an editor can do, plus creating and managing editor accounts.
- **What changes on the public site (`Frontend-v2`):** news and gallery are loaded from the API
  instead of the hard-coded files in `src/data/news.js` and `src/data/gallery.js`. For BestWeb the
  site then grows from one scrolling page into real, pre-rendered pages (athletes, competitions,
  results, resources…) — see [architecture.md](architecture.md#public-site-pages).
- **API hosting:** Railway to start.

## Documents

| File | What's in it |
|---|---|
| [bestweb-2027.md](bestweb-2027.md) | **BestWeb.LK 2027 targets, full checklist and current status** — start here |
| [bestweb-plan.md](bestweb-plan.md) | Sprint plan with dates, and what the federation needs to supply when |
| [bestweb-log.md](bestweb-log.md) | **Record of everything done to meet the targets** — add an entry for every change |
| [MPFSL_BestWeb_2027_Competition_Readiness_Review.pdf](MPFSL_BestWeb_2027_Competition_Readiness_Review.pdf) | The original readiness review (October 2026) |
| [architecture.md](architecture.md) | How the pieces fit together, repo layout, request flows |
| [backend-architecture.md](backend-architecture.md) | How the Express code is organised: modules, layers, patterns, testing |
| [data-model.md](data-model.md) | MongoDB collections and fields |
| [api.md](api.md) | Every API endpoint, request and response shapes |
| [media-storage-r2.md](media-storage-r2.md) | R2 bucket setup, upload pipeline, image sizes, deletion |
| [admin-panel.md](admin-panel.md) | Admin screens and features |
| [auth-and-security.md](auth-and-security.md) | Login, roles, sessions, hardening checklist |
| [deployment.md](deployment.md) | Hosting, DNS/subdomains, environment variables |
| [roadmap.md](roadmap.md) | Build phases (incl. the BestWeb phases 7–10), tasks, and open questions for the federation |

## Decisions

Made (see [roadmap.md](roadmap.md#decisions-made)):

- Public site: **Frontend-v2** launches. `Frontend/` (version 1) is kept in the repo but not deployed.
- API host: **Railway**.
- Roles: **admin** and **editor** (editors have full news + gallery CRUD; admins also manage editors).
- Domain: **mpfsl.lk** (live).
- Competition: **BestWeb.LK 2027**, Best Sports & Fitness Website.

Still open (details in [roadmap.md](roadmap.md#open-questions)):

Translations (Sinhala / Tamil), federation photos, who supplies athlete and results data, hosting budget.
