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

**Demo:** upload a phone photo, see the three WebP files on `media.mpfsl.lk`.

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

## BestWeb.LK 2027

Goal: Gold in **Best Sports & Fitness Website**, internal target **135+/150**. Targets, the full
checklist and current status are in [bestweb-2027.md](bestweb-2027.md); the dated sprint plan is in
[bestweb-plan.md](bestweb-plan.md), and finished work is recorded in [bestweb-log.md](bestweb-log.md).

### Phase 7 — Foundation (technical, SEO, security, performance)

- [ ] Real social links (or remove X / YouTube / Instagram until accounts exist); Contact shows `mpfsl.lk`
- [ ] `robots.txt`, `sitemap.xml`, canonical URLs, Open Graph tags, `SportsOrganization` structured data
- [x] Public-site security headers in `Frontend-v2/vercel.json` (see [deployment.md](deployment.md#security-headers)); HSTS already on (Vercel)
- [ ] Real pages with their own URLs, titles and descriptions (`react-router`), breadcrumbs, a proper 404
- [ ] Pre-render every public page at build time so crawlers and slow phones get real HTML
- [x] Branded preloader (pure HTML/CSS in `index.html`, capped at 2.5 s)
- [ ] Hero: phone-sized still photo; skip the WebGL slideshow on small screens, slow connections and reduced motion
- [ ] `srcset` with the WebP thumb / medium / large variants (Phase 5); fewer font weights, self-hosted
- [ ] Two-factor login (TOTP) for admin accounts
- [ ] `npm audit` + Dependabot in CI; backups on and a restore tested
- [ ] Privacy policy, cookie policy, contact form with Turnstile + rate limit

**Demo:** Lighthouse ≥ 90 on mobile and desktop for the home page; securityheaders.com grade A.

### Phase 8 — Content platform

- [ ] Athletes: model, admin screens, public list + profile pages (`Person` schema)
- [ ] Competitions: calendar, event pages with venue / registration / documents / results / photos (`Event` schema)
- [ ] Results: entered per competition in the admin panel; public results pages
- [ ] Rankings: national rankings with the method and "last updated" date
- [ ] News: own page per story (`mpfsl.lk/news/<slug>`, `Article` schema, share previews)
- [ ] Resources: rules, regulations, circulars, forms, policies (PDF uploads)
- [ ] About pages: history, committees, coaches, officials, governance, safeguarding, anti-doping
- [ ] Modern Pentathlon pages: the sport, five disciplines, rules, equipment, beginner guide
- [ ] Replace stock photos with federation photos

**Demo:** an athlete, their results and the competition they came from are all linked and reachable in three clicks.

### Phase 9 — Innovation

- [ ] Results explorer (filter by year, competition, gender, age group, athlete)
- [ ] Interactive five-disciplines guide
- [ ] Hall of Fame / digital timeline
- [ ] Site search with filters
- [ ] Newsletter sign-up and competition reminders
- [ ] Sinhala and Tamil versions (checked by a person, not just machine-translated)
- [ ] AI assistant that answers only from approved MPFSL content
- [ ] Video stories / athlete interviews (with captions)

### Phase 10 — Competition

- [ ] Final Lighthouse, accessibility and security (OWASP) reviews; fix findings
- [ ] TopWeb.LK review for early feedback, if available
- [ ] Go through the pre-submission checklist in [bestweb-2027.md](bestweb-2027.md#before-submitting)
- [ ] Submit to BestWeb.LK 2027 (category, organisation details, fee)
- [ ] Fair public-voting campaign through athletes, clubs, schools and official channels

## Later (nice to have)

- Scheduled publishing (publish at a set date/time)
- PWA (installable, offline) — only if it clearly helps visitors
- 360° / immersive views, voice search — only if budget and quality allow

## Decisions made

| Question | Decision |
|---|---|
| Which public site launches | **Frontend-v2** (photo slideshow). `Frontend/` (version 1) stays in the repo, not deployed. |
| API host | **Railway** to start (can move to a VPS later — the API is a plain Node app) |
| Roles | **editor**: full CRUD on news and gallery (incl. delete, publish, media). **admin**: everything an editor can do + create / manage editor accounts |
| Backend code structure | Express 5 + feature modules, zod, database sessions — see [backend-architecture.md](backend-architecture.md) |
| Language | **JavaScript** (ES modules, JSDoc for types) for `server/`, `shared/` and the frontend — same as before |
| Admin panel | Part of **Frontend-v2** (one build, one Vercel project) served on `admin.mpfsl.lk`; **Tailwind CSS**, **light + dark mode** |
| Domain | **mpfsl.lk** (live). Subdomains: `admin.`, `api.`, `media.` |
| Competition | Enter **BestWeb.LK 2027**, category **Best Sports & Fitness Website** — see [bestweb-2027.md](bestweb-2027.md) |
| First images in R2 | The news photos, moved by `npm run upload-news-photos`. The gallery's stock photos stay on Unsplash until replaced in the admin panel |

## Open questions

For the federation:

1. **Languages** — who will check the Sinhala and Tamil translations? (Needed for the BestWeb bonus points.)
2. **Photos** — the federation’s own photos to replace the Unsplash stock photos in the hero and gallery.
3. **Content owners** — who provides athletes, results, rankings, committees and policies (see [bestweb-2027.md](bestweb-2027.md)).
4. **Old domain** — should `mpfsl.net` redirect to `mpfsl.lk`?
5. **Budget** for hosting (Railway + Atlas backups ≈ USD 10–30/month; free tiers possible at the start).

