# Data Model (MongoDB)

Four collections. Field shapes are chosen to match what the public site already uses in
`src/data/news.js` and `src/data/gallery.js`, so switching the site to the API needs minimal changes.

All documents get `createdAt` / `updatedAt` automatically (Mongoose `timestamps: true`).

## `users`

| Field | Type | Notes |
|---|---|---|
| `email` | string, unique, lowercase | login name |
| `name` | string | shown in the admin panel ("Last edited by …") |
| `passwordHash` | string | argon2id (or bcrypt, cost ≥ 12) — never returned by the API |
| `role` | `'admin'` \| `'editor'` | see [auth-and-security.md](auth-and-security.md#roles) |
| `active` | boolean | deactivate instead of deleting, so history stays intact |
| `lastLoginAt` | date | |
| `failedLogins`, `lockedUntil` | number, date | brute-force protection |

## `media`

One record per uploaded image. Stories and gallery items point to these by id.

| Field | Type | Notes |
|---|---|---|
| `key` | string | base R2 key, e.g. `media/2026/10/7f3c9a…` (see [media-storage-r2.md](media-storage-r2.md#object-keys)) |
| `variants` | `{ thumb, medium, large }` | each `{ key, width, height, bytes }` |
| `width`, `height` | number | of the largest variant — used to avoid layout shift |
| `alt` | string, **required** | default description; can be overridden where it's used |
| `originalName` | string | for the admin's reference only |
| `uploadedBy` | ObjectId → users | |

Whether a photo is still in use (and so can't be deleted) is checked by querying stories and
gallery items, not stored as a counter — it can never get out of sync.

The API adds `url` fields (`media.website.lk/<key>`) when returning media — URLs are **not stored**,
so the media domain can change without a database migration.

## `newsstories`

| Field | Type | Notes |
|---|---|---|
| `slug` | string, unique | from the title, e.g. `isiwaruna-nagoya`; used as the stable `id` the site already uses |
| `status` | `'draft'` \| `'published'` | only `published` is returned publicly |
| `publishedAt` | date | sets the order on the site (newest first); editable so old stories keep their real date |
| `tag` | string | e.g. `Coaching · 27–31 May 2025` |
| `title` | string | |
| `lead` | string | the always-visible summary paragraph |
| `body` | array of blocks | same format as today (below) |
| `links` | `[{ label, href }]` | hashtags / partner links |
| `images` | `[{ media: ObjectId, alt?: string }]` | ordered; `alt` overrides the media default |
| `isFeatured` | boolean | at most **one** story is featured (enforced by index + transaction) |
| `featureDetails` | object or `null` | extra fields shown when featured — see below |
| `createdBy`, `updatedBy` | ObjectId → users | |

### Body blocks (unchanged from the current site)

```js
{ type: 'h4', text: 'Results in Bali' }
{ type: 'p', text: 'The team’s debut showed…' }
{ type: 'list', items: [{ strong: 'Team leader:', text: ' former athlete…' }] }
```

Plain text only — the site renders these as React elements, so no HTML can be injected.

### Featured story extras

The featured story (currently Gayani Dassanayake) has a few extra fields, kept even when the
story is no longer featured so it can be featured again later:

```js
featureDetails: {
  heading: 'Gayani Dassanayake carries Sri Lanka’s pentathlon story to Nagoya', // section heading
  highlight: 'Nagoya',                                      // word(s) in accent colour (v2)
  meta: '20th Asian Games · Nagoya, Japan',
  stat: { value: '28th', label: 'overall in Nagoya' },
  milestones: [{ tag: '2016', title: 'National Triathlon Champion', body: '…' }]
}
```

For the featured story, `lead` + `body` paragraphs map to the current `featured.body`, and
`images[0]` is the large photo.

### Indexes

- `{ status: 1, publishedAt: -1 }` — public news list
- `{ slug: 1 }` unique
- partial unique index `{ isFeatured: 1 }` where `isFeatured: true` — the database itself refuses a
  second featured story; the "feature" endpoint un-features the previous one in the same transaction.

## `galleryitems`

| Field | Type | Notes |
|---|---|---|
| `media` | ObjectId → media | |
| `alt` | string | caption shown on hover; defaults to the media alt |
| `size` | `'normal'` \| `'tall'` \| `'wide'` | tile shape, as today |
| `order` | number | position in the grid (drag-and-drop in the admin) |
| `published` | boolean | hide without deleting |
| `credit` | `{ name, url }` optional | for stock photos (e.g. Unsplash photographers) |

## Mapping to the current public-site data

| Public site today | From the API |
|---|---|
| `featured` in `news.js` | the published story with `isFeatured: true` (+ its `featureDetails`) |
| `stories` in `news.js` | other published stories, newest first |
| `story.images[i].src` | `images[i].media.variants.medium.url` (thumbnails), `large` for the lightbox |
| `gallery.images` | published gallery items, by `order` |

The API returns exactly these shapes (see [api.md](api.md)), so the components stay the same.
