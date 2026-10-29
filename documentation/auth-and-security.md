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
  | `SameSite` | `Lax` | `admin.mpfsl.lk` and `api.mpfsl.lk` are the same *site*, so the cookie is still sent |
  | `Domain` | `api.mpfsl.lk` (default, don't widen) | only the API ever sees it |
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
  `https://admin.mpfsl.lk` (or the dev origin) and rejects anything else.

## CORS

| Origin | Allowed |
|---|---|
| `https://mpfsl.lk` (and `www.`) | public `GET` routes only, no credentials |
| `https://admin.mpfsl.lk` | all routes, `credentials: true` |
| `http://localhost:5173` etc. | development only |

## Hardening checklist

Security is worth **20 points** in BestWeb.LK 2027 (target 19+, see
[bestweb-2027.md](bestweb-2027.md#security--20)). Judges can check the public site from outside
(HTTPS, TLS, headers), so those items matter as much as the API.

### API (done in code)

- [x] `helmet()` on the API with a strict Content-Security-Policy (`default-src 'none'`)
- [x] Validate every request body with zod; reject unknown fields (strict schemas in `shared/`)
- [x] Mongo queries only via Mongoose models with validated input (no raw `req.body` in queries — prevents NoSQL injection)
- [x] File uploads: size limits, real-type check with sharp, no SVG, EXIF stripped (see [media-storage-r2.md](media-storage-r2.md))
- [x] Error responses never include stack traces (generic message for unexpected errors)
- [x] Express `trust proxy` set (Railway runs behind a proxy) so secure cookies and rate limits work
- [x] Rate limiting on login and the whole API; per-account lockout
- [x] Log logins, failed logins, publishes and deletions (who + when) in an `auditlog` collection
- [x] Secrets only in environment variables; `.env` files git-ignored

### Hosting and launch

- [ ] Separate dev and prod R2 buckets / databases
- [ ] MongoDB Atlas: database user with access to this DB only; IP access list = Railway static outbound IPs (see [deployment.md](deployment.md#railway-setup-api))
- [ ] R2 token scoped to the one bucket
- [ ] HTTPS only + HSTS (on via Vercel); add `includeSubDomains` once `admin.`, `api.`, `media.` are all HTTPS; SSL Labs grade A
- [ ] WAF / DDoS: review Vercel Firewall for the website; Cloudflare WAF rules for `media.` (R2)
- [ ] Security headers on the **public site** (done in `Frontend-v2/vercel.json`, 29 Oct 2026) and the admin panel (when added) (see [deployment.md](deployment.md#security-headers)); grade A on securityheaders.com
- [ ] Daily MongoDB backups (Atlas backup or `mongodump` to a separate R2 bucket), **and a restore tested** — record the date
- [x] `npm audit` in CI + Dependabot alerts; keep dependencies updated (`.github/workflows/ci.yml`, `.github/dependabot.yml`)

### Before BestWeb submission

- [ ] Two-factor login (TOTP) for every admin and editor account
- [ ] Turnstile (Cloudflare CAPTCHA) + rate limiting on public forms (contact, newsletter)
- [ ] OWASP Top 10 review written up, findings fixed
- [ ] Incident contacts named (who is told, who can take the site down, who talks to the federation)
- [ ] Review admin accounts: remove unused ones, check roles
