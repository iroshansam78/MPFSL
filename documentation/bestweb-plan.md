# BestWeb.LK 2027 — Delivery Plan

How we get from today to the **135+/150** target in [bestweb-2027.md](bestweb-2027.md). The work is
split into two-week sprints, plus a parallel track for what the federation must supply.

- **Tracker** ([bestweb-2027.md](bestweb-2027.md)) — *where we stand* against each checklist item.
- **Plan** (this file) — *what we do next, and when*.
- **Log** ([bestweb-log.md](bestweb-log.md)) — *what we have done*, with evidence. This is the record
  we show if anyone asks how the site meets the expectations.

> **Dates are our own working plan.** BestWeb.LK hasn't announced the 2027 timetable yet. We aim to
> be **submission-ready by 18 April 2027**, then only fix and polish until the entry window opens.
> When the official dates are announced, update this file and log the change.

## How we work

**Every task is done only when:**

1. It works on `mpfsl.lk` (or staging), on a phone and on a desktop.
2. The matching row in [bestweb-2027.md](bestweb-2027.md) has its new status.
3. There's an entry in [bestweb-log.md](bestweb-log.md): what changed, which target it serves, and
   the evidence (commit, screenshot, measurement).
4. For anything that affects speed: Lighthouse is re-run and the result added to the
   [measurements table](bestweb-2027.md#measurements).

**At the end of each sprint** (30 minutes):

- Tick the sprint's exit checks below, or move what's unfinished to the next sprint, with a reason.
- Add a "Sprint N review" entry to the log.
- Check the [federation track](#federation-track): chase anything late, because content is the
  slowest part.

## Milestones

| Date | Milestone | Evidence |
|---|---|---|
| 15 Nov 2026 | Baseline measured; quick fixes live; security headers grade A | measurements table, log |
| 13 Dec 2026 | Real pages that search engines can read; Lighthouse mobile ≥ 90 on the home page | Lighthouse report |
| 10 Jan 2027 | Security items done (MFA, tested backups, policies, contact form) | log, securityheaders.com, restore record |
| 7 Mar 2027 | Content platform live: athletes, competitions, results, rankings, resources | links in the log |
| 4 Apr 2027 | Innovation features live | links in the log |
| 18 Apr 2027 | **Submission-ready**: all audits passed, pre-submission checklist ticked | [checklist](bestweb-2027.md#before-submitting) |

## Developer sprints

### Sprint 1 — Baseline & quick wins · 2–15 Nov 2026

Score areas: Technical, Security, SEO.

- [x] Measure the baseline: Lighthouse (mobile + desktop) → [measurements](bestweb-2027.md#measurements)
- [ ] securityheaders.com and SSL Labs on `www.mpfsl.lk` — after the headers are deployed
- [x] Social links: real accounts, or remove the ones that don't exist yet (`src/data/site.js`)
- [x] Contact section no longer shows `mpfsl.net`
- [x] `Frontend-v2/vercel.json` with the public-site security headers and asset caching ([deployment.md](deployment.md#security-headers)) — the site is on Vercel, not Cloudflare Pages
- [ ] Vercel: confirm the project's root directory is `Frontend-v2` (so `vercel.json` is used); review Vercel Firewall. HTTPS + HSTS already on
- [x] `robots.txt` + `sitemap.xml`; canonical URL, Open Graph / social preview tags (share card) and `SportsOrganization` JSON-LD in `index.html`
- [ ] Google Search Console + Bing Webmaster Tools set up
- [x] `npm audit` in CI, Dependabot on (`.github/`); 2 high-severity advisories fixed
- [x] Extra: console errors removed, self-hosted fonts, responsive + preloaded hero photo, dark-mode contrast fix, gallery alt text

**Exit checks:** baseline logged · securityheaders.com grade A · a shared link shows a proper preview on WhatsApp / Facebook.

### Sprint 2 — Real pages · 16–29 Nov 2026

Score areas: Technical, SEO, Design. See [architecture.md](architecture.md#public-site-pages).

- [ ] `react-router` on the public site: `/`, `/about`, `/news`, `/gallery`, `/contact`, plus a 404 page
- [ ] Own title, description, canonical URL and Open Graph tags on every page
- [ ] Pre-render every page to HTML at build time; `sitemap.xml` generated at build time
- [ ] Breadcrumbs (+ `BreadcrumbList`) on inner pages
- [ ] Menu links go to pages instead of jumping down the home page

**Exit checks:** viewing the page source of each URL shows its real content and title · an unknown URL returns status 404 · sitemap submitted.

### Sprint 3 — Speed · 30 Nov–13 Dec 2026

Score areas: Performance, Content.

- [ ] Skip the WebGL hero slideshow on small screens, slow connections and reduced motion; phone-sized still photo
- [ ] `srcset` with the WebP thumb / medium / large variants (news, gallery)
- [ ] Self-host the fonts, only the weights we use
- [ ] One page per news story (`/news/<slug>`) with `Article` schema and a visible date
- [ ] Re-check that the preloader doesn't push LCP over 2.5 s

**Exit checks:** Lighthouse mobile ≥ 90 and desktop ≥ 90 on `/` and one story page · CLS < 0.1.

### Sprint 4 — Security & trust · 14 Dec 2026–10 Jan 2027 (4 weeks, holidays)

Score areas: Security, Technical, Governance.

- [ ] Two-factor login (TOTP) for admin and editor accounts
- [ ] Daily backups on; a restore tested and recorded
- [ ] Contact form with validation, Turnstile and a rate limit
- [ ] `/privacy` and `/cookies` pages (text from the federation)
- [ ] OWASP Top 10 review written up; findings fixed
- [ ] Incident contacts written down

**Exit checks:** every item in the [hardening checklist](auth-and-security.md#hardening-checklist) is ticked or has a written reason.

### Sprint 5 — Athletes · 11–24 Jan 2027

Score areas: Content, Bonus.

- [ ] `athletes` model, API, admin screens ([data-model.md](data-model.md#planned-for-bestweblk-2027))
- [ ] `/athletes` (teams, search) and `/athletes/<slug>` profiles with `Person` schema
- [ ] Featured athletes on the home page

**Exit checks:** the national team is published with photos and approved details.

### Sprint 6 — Competitions & calendar · 25 Jan–7 Feb 2027

- [ ] `competitions` model, API, admin screens
- [ ] `/competitions` calendar + event pages (venue, registration, documents, photos) with `Event` schema
- [ ] "Upcoming competitions" on the home page

**Exit checks:** the 2027 calendar and at least the last two seasons' competitions are published.

### Sprint 7 — Results & rankings · 8–21 Feb 2027

- [ ] `results` model; results entry per competition in the admin panel
- [ ] Results on each competition page and each athlete profile
- [ ] `/rankings`, calculated from results with the federation's approved method and a "last updated" date

**Exit checks:** athlete → their result → the competition, all linked and reachable in three clicks.

### Sprint 8 — Federation & sport pages · 22 Feb–7 Mar 2027

- [ ] `/resources` (rules, regulations, circulars, forms, policies as PDFs)
- [ ] About pages: history, committees, coaches, officials, governance, safeguarding, anti-doping
- [ ] `/modern-pentathlon`: the sport, disciplines, rules, equipment, beginner guide; `/international`, `/development`
- [ ] Stock photos replaced with federation photos (and the Unsplash host removed from the CSP)

**Exit checks:** no ❌ left in the Content and Governance sections of the tracker that the federation has supplied material for.

### Sprint 9 — Innovation I · 8–21 Mar 2027

Score area: Bonus.

- [ ] Results explorer: filter by year, competition, gender, age group, athlete
- [ ] Interactive five-disciplines guide
- [ ] Hall of Fame / timeline
- [ ] Site search with filters

### Sprint 10 — Innovation II · 22 Mar–4 Apr 2027

- [ ] Newsletter sign-up (double opt-in) and competition reminders
- [ ] Sinhala version of the key pages, checked by a person (Tamil next if translations are ready)
- [ ] AI assistant that answers only from approved MPFSL content — **only if** Sprints 1–9 are done; otherwise move to after submission

### Sprint 11 — Competition readiness · 5–18 Apr 2027

- [ ] Full Lighthouse run on every page type; accessibility audit (keyboard, contrast, screen reader)
- [ ] Final security check (headers, SSL Labs, dependencies, admin accounts)
- [ ] Proof-read every page; check every link and form; no console errors
- [ ] TopWeb.LK review if available; fix the findings
- [ ] Go through the [pre-submission checklist](bestweb-2027.md#before-submitting)

**Exit checks:** every score area estimated at or above its target in the tracker.

## Federation track

Content takes the longest. Each item is needed **before** the sprint that uses it.

| Needed by | What | Used in |
|---|---|---|
| 8 Nov 2026 | Official social media account links; who owns the photos we use (permissions) | Sprint 1 |
| 8 Nov 2026 | Name one owner per score area (see [tracker](bestweb-2027.md#score-targets)) | all |
| 22 Nov 2026 | Approve the hero message (current one or the review's suggestion) | Sprint 2 |
| 6 Dec 2026 | Privacy policy and cookie policy text; official address, phone, map location | Sprint 4 |
| 6 Dec 2026 | Names of the incident contacts | Sprint 4 |
| 4 Jan 2027 | Athlete list with photos, details and **consent** to publish | Sprint 5 |
| 18 Jan 2027 | 2027 competition calendar; past competitions with dates and venues | Sprint 6 |
| 1 Feb 2027 | Past results (spreadsheets are fine); the ranking method | Sprint 7 |
| 15 Feb 2027 | Rules, regulations, circulars, forms, policies (PDFs); history; committees; coaches; officials; safeguarding and anti-doping info | Sprint 8 |
| 15 Feb 2027 | High-quality photos from competitions and training, with permission | Sprint 8 |
| 1 Mar 2027 | Hall of Fame names and milestones | Sprint 9 |
| 15 Mar 2027 | Sinhala (and Tamil) translations of key pages, checked by a person | Sprint 10 |
| When announced | Official BestWeb.LK 2027 dates, rules, fee; application contact details | submission |

## Risks

| Risk | What we do |
|---|---|
| Content arrives late | Build pages with whatever exists; content missing at each sprint review is flagged to the federation in writing and logged |
| The WebGL hero keeps Lighthouse under 90 on mobile | Phones get the still photo only; the 3D slideshow stays on desktop |
| Athlete data and consent (minors) | Publish only with consent; show birth year only if allowed; mention it in the privacy policy |
| Official dates are earlier than planned | Sprints 9–10 (innovation) are the ones to cut or shorten; Sprints 1–8 aren't |
