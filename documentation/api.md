# API (Express)

Base URL: `https://api.mpfsl.lk/api`

- JSON in, JSON out. Image uploads use `multipart/form-data`.
- Errors: `{ "error": { "code": "VALIDATION_ERROR", "message": "…", "fields": { "title": "Required" } } }`
  with a matching HTTP status (400, 401, 403, 404, 409, 413, 429, 500).
- All `/admin/*` routes need a logged-in session (cookie). Roles are noted per route.
- Request bodies are validated with **zod** schemas (shared with the admin panel from `shared/`).

## Public (no login)

Cached by Cloudflare for a short time (`Cache-Control: public, max-age=60`) so a busy news day
doesn't hit the server on every visit.

### `GET /news`

```json
{
  "featured": {
    "id": "…",
    "tag": "Asian Games · Modern Pentathlon",
    "title": "From Dematapelessa to Nagoya: …",
    "lead": "Raised in Dematapelessa…",
    "body": [{ "type": "p", "text": "…" }],
    "links": [{ "label": "UIPM", "href": "https://…" }],
    "images": [{ "src": "/images/news/gayani-asian-games-2026.jpg", "alt": "…" }],
    "feature": {
      "heading": "Gayani Dassanayake carries Sri Lanka’s pentathlon story to Nagoya",
      "highlight": "Nagoya",
      "meta": "20th Asian Games · Nagoya, Japan",
      "stat": { "value": "28th", "label": "overall in Nagoya" },
      "milestones": [{ "tag": "2016", "title": "…", "body": "…" }]
    }
  },
  "stories": [
    {
      "id": "…",
      "tag": "…", "title": "…", "lead": "…",
      "body": [
        { "type": "h4", "text": "…" },
        { "type": "p", "text": "…" },
        { "type": "list", "items": [{ "strong": "UIPM", "text": "for its support." }] }
      ],
      "links": [{ "label": "#TeamSriLanka", "href": "…" }],
      "images": [{ "src": "…/medium.webp", "large": "…/large.webp", "alt": "…" }]
    }
  ]
}
```

Published stories only: the featured one (`null` if there is none, or it's a draft) and the others in
the admin panel's order. Photos are uploaded ones (`src` medium + `large`) or ones that ship with the
website (`/images/news/…`, no `large`). Story colours aren't stored: the website gives the cards its
five discipline colours in turn. Cached for 60 seconds.

### `GET /site-photos`

```json
{ "photos": [{ "key": "gallery.0", "alt": "…", "src": "…/medium.webp", "large": "…/large.webp",
              "thumb": "…/thumb.webp", "width": 2000, "height": 1333 },
            { "key": "news.bali-2023.0", "alt": "…" }] }
```

Gallery photos that were changed in the admin panel, by spot name `gallery.<n>` (see
`Frontend-v2/src/data/photoSpots.js`; the original photos are in `data/gallery.js`). Each has a new caption, plus the photo's sizes
when the photo was replaced (no `src` = caption change on the original photo). Spots not listed
show their original photo.
Cached for 60 seconds (`Cache-Control: public, max-age=60`).

## Auth

| Method | Path | Body | Result |
|---|---|---|---|
| `POST` | `/auth/login` | `{ email, password }` | sets session cookie, returns `{ user }` |
| `POST` | `/auth/logout` | — | clears cookie |
| `GET` | `/auth/me` | — | `{ user }` or 401 — the admin panel calls this on load |
| `POST` | `/auth/change-password` | `{ currentPassword, newPassword }` | 204 |

Login is rate-limited (see [auth-and-security.md](auth-and-security.md)).

## Admin — news (`editor`, `admin`)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/admin/news` | every story incl. drafts, in order: `{ stories: [{ id, status, featured, order, …, images: [{ alt, src, media, preview }] }] }` |
| `GET` | `/admin/news/:id` | one story |
| `POST` | `/admin/news` | create (goes to the top of the list). Body: `{ tag, title, lead, body, links, images: [{ media | src, alt }] (1–4), status, feature }` |
| `PUT` | `/admin/news/:id` | save the whole story (same body). Uploaded photos it no longer uses are deleted |
| `PUT` | `/admin/news/:id/status` | `{ status: 'draft' | 'published' }` |
| `POST` | `/admin/news/:id/feature` | make this the featured story (the previous one becomes a normal story) |
| `PUT` | `/admin/news/order` | `{ ids: [...] }` new order (must list every story) |
| `DELETE` | `/admin/news/:id` | delete the story and the photos uploaded for it |

`npm run init` copies the website's built-in stories (`Frontend-v2/src/data/news.js`) into an empty database.

## Admin — website photos (`editor`, `admin`)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/admin/site-photos` | `{ photos: [{ key, alt, media | null, updatedAt }] }` the changed spots |
| `PUT` | `/admin/site-photos/:key` | `{ alt, media? }` set a spot's caption and, with `media` (an uploaded photo's id), its photo. The photo it replaces is deleted unless used elsewhere |
| `DELETE` | `/admin/site-photos/:key` | put the original photo and caption back (deletes the uploaded photo unless used elsewhere) |

## Admin — media (`editor`, `admin`)

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/admin/media` | upload 1–10 images (`multipart`: `files`, plus one `alt` field per file in the same order); returns `{ media: [...] }` |
| `GET` | `/admin/media?q=&unused=true` | media library for the image picker |
| `PATCH` | `/admin/media/:id` | update default `alt` |
| `DELETE` | `/admin/media/:id` | deletes from R2 + DB; **409** if still shown on the website |

Limits: 15 MB per file, at most 50 megapixels, JPEG / PNG / WebP (HEIF works only if sharp can decode it). Errors: `413 FILE_TOO_LARGE`, `400 TOO_MANY_FILES`.

Without R2 settings (local development) photos are saved in `server/.data/uploads` and served at `/api/uploads/...`. See [media-storage-r2.md](media-storage-r2.md).

## Admin — users (`admin` only)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/admin/users` | list |
| `POST` | `/admin/users` | invite: `{ email, name, role }` → returns a one-time temporary password |
| `PATCH` | `/admin/users/:id` | change `role` / `active` |
| `POST` | `/admin/users/:id/reset-password` | new temporary password |

## Health

`GET /health` → `{ ok: true, db: "up" }` for the host's uptime checks.
