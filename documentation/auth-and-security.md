# Authentication & Security

## Sessions

- Login with email + password → the API sets a cookie holding a random session token; only its
  hash is stored in a `sessions` collection (**decided** — logout and deactivating a user take
  effect immediately, unlike a JWT). Implementation in
  [backend-architecture.md](backend-architecture.md#sessions-modulesauth).
- Cookie settings:

  | Attribute | Value | Why |
  |---|---|---|
  | `HttpOnly` | yes | JavaScript can't read it (protects against stolen tokens via XSS) |
  | `Secure` | yes | HTTPS only |
  | `SameSite` | `Lax` | `admin.website.lk` and `api.website.lk` are the same *site*, so the cookie is still sent |
  | `Domain` | `api.website.lk` (default, don't widen) | only the API ever sees it |
  | Lifetime | 8 hours, sliding; "remember me" up to 14 days | |

- The admin panel calls the API with `fetch(url, { credentials: 'include' })`.
- No tokens in `localStorage`.

## Roles

| Role | Can |
|---|---|
| `editor` | full create / read / update / delete on **news** and **gallery**: publish, unpublish, feature, upload and delete media; change own password |
| `admin` | everything an editor can, plus **create, edit, deactivate and reset passwords for editor (and other admin) accounts** |

Deletes by either role ask for confirmation in the admin panel and are recorded in the audit log.

Enforced **on the API** (`requireRole('admin')`); the admin panel only hides buttons for convenience.

## Passwords

- Hash with **argon2id** (or bcrypt cost ≥ 12).
- Minimum 10 characters; block the most common passwords.
- Temporary passwords from invites/resets must be changed at first login.
- First admin is created on the server with `node scripts/create-admin.js` — no public sign-up.

## Brute-force protection

- `express-rate-limit` on `/auth/login`: 10 attempts per 15 minutes per IP.
- Per-account lock: 5 failures → locked 15 minutes.
- Same error message for "no such user" and "wrong password".

## CSRF

- `SameSite=Lax` cookies already block cross-site form posts.
- In addition, for every non-GET request the API checks the `Origin` header is
  `https://admin.website.lk` (or the dev origin) and rejects anything else.

## CORS

| Origin | Allowed |
|---|---|
| `https://website.lk` (and `www.`) | public `GET` routes only, no credentials |
| `https://admin.website.lk` | all routes, `credentials: true` |
| `http://localhost:5173` etc. | development only |

## Hardening checklist

- [ ] `helmet()` with a strict Content-Security-Policy on the admin panel's host
- [ ] Validate every request body with zod; reject unknown fields
- [ ] Mongo queries only via Mongoose models with validated input (no raw `req.body` in queries — prevents NoSQL injection)
- [ ] File uploads: size limits, real-type check with sharp, no SVG, EXIF stripped (see [media-storage-r2.md](media-storage-r2.md))
- [ ] Error responses never include stack traces in production
- [ ] Secrets only in environment variables; `.env` files git-ignored; separate dev and prod R2 buckets / databases
- [ ] MongoDB Atlas: database user with access to this DB only; IP access list = Railway static outbound IPs (see [deployment.md](deployment.md#railway-setup-api))
- [ ] Express `trust proxy` set (Railway runs behind a proxy) so secure cookies and rate limits work
- [ ] R2 token scoped to the one bucket
- [ ] HTTPS everywhere (Cloudflare), HSTS on
- [ ] Log logins, failed logins, publishes and deletions (who + when) in an `auditlog` collection
- [ ] Daily MongoDB backups (Atlas backup or `mongodump` to a separate R2 bucket)
- [ ] `npm audit` in CI; keep dependencies updated
- [ ] Optional later: two-factor login (TOTP) for admins
