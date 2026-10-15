# MPFSL Admin Panel (`admin/`)

Staff-only app at **admin.website.lk** for managing news, the gallery and staff accounts.
React 19 + Vite + Tailwind CSS 4, light and dark mode. Talks to the API in `../server`.

Plans: [documentation/admin-panel.md](../documentation/admin-panel.md)

## What's built

| Screen | Status |
|---|---|
| Login, forced "choose your password", logout | ✅ |
| Layout: sidebar (drawer on phones), top bar, light/dark toggle | ✅ |
| Dashboard | ✅ (links only for now) |
| Users (admins only): create accounts, make admin/editor, deactivate, reset password | ✅ |
| My account: profile + change password | ✅ |
| News, Gallery, Media library | placeholder pages until their API exists (roadmap Phases 2–4) |

## Run it locally

```bash
# from the repo root, once
npm install

# start the API first (see server/README.md), then:
cp admin/.env.example admin/.env.local     # VITE_API_URL=http://localhost:8080/api
npm run dev:admin                           # http://localhost:5180
```

The API's `ADMIN_ORIGIN` must be `http://localhost:5180` (the default in `server/.env.example`),
otherwise the browser blocks the requests.

## Folder layout

```
src/
├── main.jsx, App.jsx     # providers + routes
├── api/                  # fetch wrapper (cookies, error format) + auth / users calls
├── hooks/                # useMe/useLogin/…, useUsers, useTheme, useToast
├── lib/                  # config, theme, query client, form error helper, formatting
├── styles/index.css      # Tailwind + theme colour tokens (light & dark)
├── components/
│   ├── layout/           # AdminLayout, Sidebar, AuthLayout, ThemeToggle, RouteGuards…
│   ├── forms/            # ChangePasswordForm
│   └── ui/               # Button, Field, Input, Modal, ConfirmDialog, Badge, Alert, Toast…
└── pages/                # one file (or folder) per screen
```

### Styling conventions

- Use the **semantic colours** — `bg-surface`, `text-ink`, `text-muted`, `border-line`, `bg-brand`,
  `text-danger`… They're defined in `styles/index.css` and switch automatically between light and
  dark mode, so components rarely need `dark:` classes.
- Headings use `font-display` (Barlow Condensed, uppercase italic) like the public site.
- Form validation uses the same zod schemas as the API (`@mpfsl/shared`).

## Deploying (Cloudflare Pages)

| Setting | Value |
|---|---|
| Root directory | *(repo root)* |
| Build command | `npm ci && npm run build --workspace admin` |
| Output directory | `admin/dist` |
| Environment variable | `VITE_API_URL=https://api.website.lk/api` |
| Custom domain | `admin.website.lk` |

`public/_redirects` makes page refreshes work on any URL; `public/_headers` adds security headers
and keeps the panel out of search engines. Update the domains in `_headers` when the real domain
is known.
