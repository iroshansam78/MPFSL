# MPFSL Admin Panel — Planning Docs

Plans for the admin panel that lets the federation manage **news stories** and the **photo gallery**
on the public website without editing code.

> `website.lk` is used as a placeholder throughout. Replace it with the real domain once confirmed.

## The short version

- **Stack:** MongoDB · Express · React · Node (MERN), with images stored in **Cloudflare R2**.
- **Four addresses:**
  - `website.lk` — the public site (**`Frontend-v2`**)
  - `admin.website.lk` — the admin panel (staff only, login required)
  - `api.website.lk` — the Express API that both of them talk to
  - `media.website.lk` — public image delivery straight from R2 (cached by Cloudflare)
- **Two roles:**
  - **Editor** — full create / edit / publish / delete for news stories and the gallery.
  - **Admin** — everything an editor can do, plus creating and managing editor accounts.
- **What changes on the public site (`Frontend-v2`):** news and gallery are loaded from the API
  instead of the hard-coded files in `src/data/news.js` and `src/data/gallery.js`. Everything else
  stays static.
- **API hosting:** Railway to start.

## Documents

| File | What's in it |
|---|---|
| [architecture.md](architecture.md) | How the pieces fit together, repo layout, request flows |
| [backend-architecture.md](backend-architecture.md) | How the Express code is organised: modules, layers, patterns, testing |
| [data-model.md](data-model.md) | MongoDB collections and fields |
| [api.md](api.md) | Every API endpoint, request and response shapes |
| [media-storage-r2.md](media-storage-r2.md) | R2 bucket setup, upload pipeline, image sizes, deletion |
| [admin-panel.md](admin-panel.md) | Admin screens and features |
| [auth-and-security.md](auth-and-security.md) | Login, roles, sessions, hardening checklist |
| [deployment.md](deployment.md) | Hosting, DNS/subdomains, environment variables |
| [roadmap.md](roadmap.md) | Build phases, tasks, and open questions for the federation |

## Decisions

Made (see [roadmap.md](roadmap.md#decisions-made)):

- Public site: **Frontend-v2** launches. `Frontend/` (version 1) is kept in the repo but not deployed.
- API host: **Railway**.
- Roles: **admin** and **editor** (editors have full news + gallery CRUD; admins also manage editors).

Still open (details in [roadmap.md](roadmap.md#open-questions)):

1. The real domain name.
2. Languages, gallery photos, hosting budget.
