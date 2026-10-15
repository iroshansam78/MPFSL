# Admin Panel (`admin.website.lk`)

Part of the same frontend as the public site: `Frontend-v2/src/admin/`. One build is served on both
`website.lk` and `admin.website.lk`; the admin panel loads only on the `admin.` address, as a separate
chunk with its own styles, so public visitors never download it. Uses the brand colours (navy,
maroon, gold) in a plain, functional layout — usability over looks.

| Decided | |
|---|---|
| Styling | **Tailwind CSS 4** with semantic colour tokens (`bg-surface`, `text-ink`, `bg-brand`…) |
| Themes | **Light and dark mode**, toggle in the top bar, follows the system setting until chosen, no flash on load |
| Libraries | `react-router` (pages), `@tanstack/react-query` (API data, "session expired → login"), `react-hook-form` + `zod` (forms, same schemas as the API via `@mpfsl/shared`), `lucide-react` (icons), `@dnd-kit` later for drag-and-drop ordering |

Built so far: login, forced password change, layout, dashboard, Users, My account — see
[Frontend-v2/README.md](../Frontend-v2/README.md#admin-panel).

## Screens

### 1. Login

- Email + password. No "sign up" — accounts are created by an admin.
- Clear error on wrong details; after 5 failures the account is locked for 15 minutes.
- Visiting any page while logged out redirects here, then back to that page after login.

### 2. Dashboard

- Counts: published stories, drafts, gallery photos.
- "Recent changes": last 10 edits with who made them.
- Quick buttons: **New story**, **Upload to gallery**, **View public site**.

### 3. News — list

- Table: title, tag, status badge (Draft / Published / ★ Featured), date, last edited by.
- Filter by status, search by title.
- Row actions: Edit, Publish/Unpublish, Make featured, Delete (with confirmation).

### 4. News — edit / create

| Area | Fields |
|---|---|
| Basics | Title, Tag line (e.g. "Coaching · 27–31 May 2025"), Date, Lead paragraph |
| Body | **Block editor**: add/reorder/remove blocks — Subheading, Paragraph, List (each item: bold part + text) |
| Links | List of label + URL (hashtags, partner pages); quick "#hashtag" helper that builds the Facebook hashtag URL |
| Photos | Upload new or pick from the media library; drag to reorder; **alt text required** for each; first photo can be set as cover |
| Featured (optional) | Toggle "Featured story" → shows Heading, Highlight word, Meta line, Stat (value + label), Milestones list |

- **Save draft** (anytime) and **Publish** (validates required fields first).
- **Preview** button: shows the story using the public site's own story component, in light and
  dark theme, before publishing.
- Warn before leaving with unsaved changes.

### 5. Gallery

- Grid matching the public gallery layout (tall/wide tiles shown at their real shape).
- **Upload**: drag several photos in at once; each asks for a caption (alt text).
- Drag tiles to reorder → **Save order**.
- Per tile: caption, size (Normal / Tall / Wide), Show/Hide, Remove.
- Optional credit (name + link) for stock photos.

### 6. Media library

- All uploaded images, newest first, with a search by caption and an "unused" filter.
- Edit default caption; delete unused images.
- Used as the "pick existing photo" dialog in the story editor.

### 7. Users (admins only — hidden from editors)

- List of staff accounts with role and last login.
- **Create editor** (email, name, role — editor by default) → shows a one-time temporary password
  to pass on securely; the user must change it at first login.
- Change role (editor ↔ admin), deactivate, reset password.
- An admin can't deactivate or demote themselves, so there is always at least one active admin.

### 8. Account

- Change own password, log out.

## Upload UX details

- Show a progress bar per file; failed files can be retried without re-adding the others.
- Before uploading, shrink very large phone photos in the browser (to ~3000 px) to make uploads on
  mobile data faster — the server still does the final processing.
- Accept HEIC so iPhone photos work directly.

## Accessibility & mobile

- Works on a phone (staff may post straight from an event).
- Keyboard-usable, visible focus, form errors linked to their fields.
- Alt text is required everywhere — the admin panel explains why ("describes the photo for blind
  visitors and search engines").
