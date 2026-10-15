# Roadmap

Each phase ends with something that can be shown or tested.

## Phase 0 — Setup

- [ ] Confirm the open questions below with the federation
- [ ] Create MongoDB Atlas project (dev + prod clusters)
- [ ] Create R2 buckets (`mpfsl-media-dev`, `mpfsl-media`) and a bucket-scoped API token
- [ ] Move the domain's DNS to Cloudflare; add `media.` custom domain to the R2 bucket
- [ ] Create the Railway project (Singapore region, root directory `server`, `production` + `staging` environments)
- [x] Scaffold `server/` (Express) + `shared/` with lint config and npm workspaces
- [x] Admin panel scaffold inside `Frontend-v2/src/admin/` (Tailwind, light/dark mode) — one frontend for both addresses

## Phase 1 — API foundation ✅

- [x] Env config + validation, MongoDB connection, error handler, `GET /health`
- [x] User model, `create-admin.js` script
- [x] Login / logout / me, sessions, rate limiting, role middleware
- [x] Admin user management (create editors, change role / deactivate, reset password)
- [x] Tests for auth (wrong password, lockout, role checks) — 40 tests passing

**Demo:** log in with Postman / curl and get the current user.

## Phase 2 — Media & R2

- [ ] R2 service (put / delete), sharp image service
- [ ] `POST /admin/media` upload pipeline, `GET/PATCH/DELETE /admin/media`
- [ ] Tests: rejects SVG / oversized / fake files; strips GPS; produces 3 sizes

**Demo:** upload a phone photo, see the three WebP files on `media.website.lk`.

## Phase 3 — News & gallery API

- [ ] NewsStory + GalleryItem models
- [ ] Admin CRUD, publish/unpublish, feature, gallery ordering
- [ ] Public `GET /news`, `GET /gallery` in the exact shape the site uses
- [ ] `import-existing.js` — move today's stories, photos and gallery into the database

**Demo:** `GET /api/news` returns the same stories the site shows today.

## Phase 4 — Admin panel

- [x] Login page, forced password change, auth guards, layout with sidebar, light/dark mode
- [x] Users page (admins), My account / change password
- [ ] News list + editor (block editor, links, photo uploader/picker, featured fields) — needs Phase 3
- [ ] Preview using the public story component
- [ ] Gallery manager (upload, caption, size, drag-and-drop order, hide/remove) — needs Phase 3
- [ ] Media library — needs Phase 2

**Demo:** federation staff create a draft story with photos on staging.

## Phase 5 — Connect the public site

- [ ] Replace static `news.js` / `gallery.js` imports with API calls (loading skeletons, error
      fallback that keeps the section from breaking)
- [ ] Use `srcset` with the thumb / medium / large variants
- [ ] Done in `Frontend-v2` (the version that launches)

**Demo:** publish in the admin panel → story appears on the public site within a minute.

## Phase 6 — Launch

- [ ] Security checklist in [auth-and-security.md](auth-and-security.md#hardening-checklist)
- [ ] Backups switched on and a restore tested
- [ ] Production deploy, DNS for `admin.` / `api.` / `media.`
- [ ] **First content:** run `import-existing.js` against production so every photo the website shows
      today (all news photos + the gallery) is uploaded to the R2 bucket and the stories / gallery
      items are created — these are the first images in the bucket. Check the live site shows them
      from `media.website.lk` before announcing the launch.
- [ ] Short guide for staff: "How to post a news story" (with screenshots)
- [ ] Hand over admin accounts

## Later (nice to have)

- Shareable page per story (`website.lk/news/<slug>`) with Open Graph previews for Facebook/WhatsApp
- Scheduled publishing (publish at a set date/time)
- Events / results section managed from the admin panel
- Sinhala (and Tamil) versions of stories
- Two-factor login for admins

## Decisions made

| Question | Decision |
|---|---|
| Which public site launches | **Frontend-v2** (photo slideshow). `Frontend/` (version 1) stays in the repo, not deployed. |
| API host | **Railway** to start (can move to a VPS later — the API is a plain Node app) |
| Roles | **editor**: full CRUD on news and gallery (incl. delete, publish, media). **admin**: everything an editor can do + create / manage editor accounts |
| Backend code structure | Express 5 + feature modules, zod, database sessions — see [backend-architecture.md](backend-architecture.md) |
| Language | **JavaScript** (ES modules, JSDoc for types) for `server/`, `shared/` and the frontend — same as before |
| Admin panel | Part of **Frontend-v2** (one build, one Cloudflare Pages project) served on `admin.website.lk`; **Tailwind CSS**, **light + dark mode** |
| First images in R2 | The photos the website already uses (news + gallery) are moved into R2 by `import-existing.js` on the first production deploy |

## Open questions

For the federation:

1. **Domain** — the exact domain (`website.lk` is a placeholder). Is `mpfsl.net` staying?
2. **Languages** — will stories ever need Sinhala/Tamil versions? (Easier to plan for now.)
3. **Gallery** — keep the Unsplash discipline photos, or only the federation's own photos?
4. **Budget** for hosting (Railway + Atlas backups ≈ USD 10–30/month; free tiers possible at the start).

