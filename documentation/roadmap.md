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
- [x] `npm run init` — one-command database setup: checks transactions, syncs indexes, creates the first admin
- [x] `npm run dev:db` — local MongoDB replica set for development (no install)
- [x] Login / logout / me, sessions, rate limiting, role middleware
- [x] Admin user management (create editors, change role / deactivate, reset password)
- [x] Tests for auth (wrong password, lockout, role checks) — 40 tests passing

**Demo:** log in with Postman / curl and get the current user.

## Phase 2 — Media & R2 ✅

- [x] Storage service (R2, or a local folder when R2 isn't configured in development), sharp image service
- [x] `POST /admin/media` upload pipeline, `GET/PATCH/DELETE /admin/media`
- [x] Tests: rejects SVG / non-image files and too many files; produces 3 sizes; delete removes the files

**Demo:** upload a phone photo, see the three WebP files on `media.website.lk`.

## Phase 3 — News & gallery API

- [x] NewsStory model
- [x] Gallery photos: replace the photo / caption of each spot, restore the original
- [x] News: admin CRUD, publish/unpublish, feature, ordering
- [x] Public `GET /site-photos`
- [x] Public `GET /news`
- [x] `npm run init` copies today's stories into the database (their photos stay in the website)

**Demo:** `GET /api/news` returns the same stories the site shows today.

## Phase 4 — Admin panel

- [x] Login page, forced password change, auth guards, layout with sidebar, light/dark mode
- [x] Users page (admins), My account / change password
- [x] News list + editor (headings/paragraphs/bullets, links, photos with guidance, featured extras, live preview in the website colours)
- [ ] Preview using the public story component
- [x] Gallery page (same layout as the website; click a photo to replace it, with size/shape guidance and a caption)
- [ ] Media library — needs Phase 2

**Demo:** federation staff create a draft story with photos on staging.

## Phase 5 — Connect the public site

- [x] Gallery applies the admin panel's photo changes; news section loads its stories from the API (built-in stories if it can't be reached)
- [ ] Replace static `news.js` / `gallery.js` imports with API calls (loading skeletons, error
      fallback that keeps the section from breaking)
- [ ] Use `srcset` with the thumb / medium / large variants
- [ ] Done in `Frontend-v2` (the version that launches)

**Demo:** publish in the admin panel → story appears on the public site within a minute.

## Phase 6 — Launch

- [ ] Security checklist in [auth-and-security.md](auth-and-security.md#hardening-checklist)
- [ ] Backups switched on and a restore tested
- [ ] Production deploy, DNS for `admin.` / `api.` / `media.`
- [ ] Run `npm run init` against production (indexes + first admin account + today's news stories),
      then `npm run upload-news-photos` to move the stories' photos into R2
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
| First images in R2 | The news photos, moved by `npm run upload-news-photos`. The gallery's stock photos stay on Unsplash until replaced in the admin panel |

## Open questions

For the federation:

1. **Domain** — the exact domain (`website.lk` is a placeholder). Is `mpfsl.net` staying?
2. **Languages** — will stories ever need Sinhala/Tamil versions? (Easier to plan for now.)
3. **Gallery** — keep the Unsplash discipline photos, or only the federation's own photos?
4. **Budget** for hosting (Railway + Atlas backups ≈ USD 10–30/month; free tiers possible at the start).

