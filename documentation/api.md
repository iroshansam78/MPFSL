# API (Express)

Base URL: `https://api.website.lk/api`

- JSON in, JSON out. Image uploads use `multipart/form-data`.
- Errors: `{ "error": { "code": "VALIDATION_ERROR", "message": "…", "fields": { "title": "Required" } } }`
  with a matching HTTP status (400, 401, 403, 404, 409, 413, 429, 500).
- All `/admin/*` routes need a logged-in session (cookie). Roles are noted per route.
- Request bodies are validated with **zod** schemas (shared with the admin panel from `shared/`).

## Public (no login)

Cached by Cloudflare for a short time (`Cache-Control: public, max-age=60`) so a busy news day
doesn't hit the server on every visit.

### `GET /news`

Published stories, shaped like today's `news.js`:

```json
{
  "featured": {
    "id": "gayani-nagoya",
    "heading": "Gayani Dassanayake carries Sri Lanka’s pentathlon story to Nagoya",
    "highlight": "Nagoya",
    "tag": "Asian Games · Modern Pentathlon",
    "title": "From Dematapelessa to Nagoya: …",
    "image": { "src": "https://media.website.lk/…/large.webp", "thumb": "…", "alt": "…", "width": 2000, "height": 2000 },
    "body": ["Raised in Dematapelessa…", "…"],
    "meta": "20th Asian Games · Nagoya, Japan",
    "stat": { "value": "28th", "label": "overall in Nagoya" },
    "links": [{ "label": "UIPM", "href": "https://…" }],
    "milestones": [{ "tag": "2016", "title": "…", "body": "…" }]
  },
  "stories": [
    {
      "id": "isiwaruna-nagoya",
      "tag": "…", "title": "…", "lead": "…",
      "body": [{ "type": "h4", "text": "…" }],
      "links": [{ "label": "#TeamSriLanka", "href": "…" }],
      "images": [{ "src": "…/medium.webp", "large": "…/large.webp", "alt": "…", "width": 1200, "height": 800 }],
      "publishedAt": "2026-10-01T00:00:00.000Z"
    }
  ]
}
```

Query: `?limit=20&before=<publishedAt>` for "load more" later.

### `GET /news/:slug`

One published story (for a future shareable story page).

### `GET /gallery`

```json
{ "images": [{ "src": "…", "large": "…", "alt": "…", "size": "wide", "credit": null }] }
```

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
| `GET` | `/admin/news?status=draft\|published&q=` | list all stories incl. drafts |
| `GET` | `/admin/news/:id` | one story with full media info |
| `POST` | `/admin/news` | create (always starts as `draft`) |
| `PATCH` | `/admin/news/:id` | update any fields |
| `POST` | `/admin/news/:id/publish` | set `status=published` (sets `publishedAt` if empty) |
| `POST` | `/admin/news/:id/unpublish` | back to draft |
| `POST` | `/admin/news/:id/feature` | make this the featured story (clears the previous one) |
| `DELETE` | `/admin/news/:id` | delete the story (its photos stay in the media library) |

## Admin — gallery (`editor`, `admin`)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/admin/gallery` | all items incl. hidden |
| `POST` | `/admin/gallery` | `{ media, alt?, size? }` add an uploaded image to the gallery |
| `PATCH` | `/admin/gallery/:id` | change `alt`, `size`, `published`, `credit` |
| `PUT` | `/admin/gallery/order` | `{ ids: [...] }` save the new drag-and-drop order |
| `DELETE` | `/admin/gallery/:id` | remove from gallery (the media itself is kept unless unused) |

## Admin — media (`editor`, `admin`)

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/admin/media` | upload 1–10 images (`multipart`, field `files`, plus `alt[]`); returns created media |
| `GET` | `/admin/media?q=&unused=true` | media library for the image picker |
| `PATCH` | `/admin/media/:id` | update default `alt` |
| `DELETE` | `/admin/media/:id` | deletes from R2 + DB; **409** if still used by a story or gallery item |

Limits: 15 MB per file, JPEG / PNG / WebP / HEIC only. See [media-storage-r2.md](media-storage-r2.md).

## Admin — users (`admin` only)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/admin/users` | list |
| `POST` | `/admin/users` | invite: `{ email, name, role }` → returns a one-time temporary password |
| `PATCH` | `/admin/users/:id` | change `role` / `active` |
| `POST` | `/admin/users/:id/reset-password` | new temporary password |

## Health

`GET /health` → `{ ok: true, db: "up" }` for the host's uptime checks.
