# WEST Scholars — GitHub Pages preview

**This folder is generated. Do not edit anything in it.**
It is built from the application's real sources by:

```bash
php bin/build-pages.php
```

Re-run that after changing any CSS or JavaScript, or the preview will show
the old version.

---

## What this is

A front-end preview of the WEST Scholars scholar profile system, for hosting
on GitHub Pages.

GitHub Pages serves static files and **cannot run PHP**, so the real
application — PHP + MySQL — does not run here. This folder contains only the
browser-side half, with `localStorage` standing in for the database.

It is not a separate mock-up, though. The stylesheet and both client-side
scripts are copies of the ones the application actually ships, so the design
and every client-side validation rule are genuinely the real ones.

**What the preview cannot show**

- No server-side validation. In the real application every rule is enforced
  again in PHP, and that is the copy that actually protects the data.
- No database. "Saved" records live in your browser and go no further.
- No file storage. Uploaded files are never read — only the name, size and
  type are noted so the interface can be shown.
- No real sign-in. Pick a demo account; no password is checked.

---

## Publishing it

Everything here is self-contained — nothing refers to a file outside this
folder — so any of these work.

### Option 1 — a repository just for the preview (simplest)

1. Create a new repository on GitHub.
2. Upload the **contents** of this folder (not the folder itself) to the
   repository root. Include the `.nojekyll` file; GitHub's web uploader
   hides dotfiles, so if it does not appear, create it with
   **Add file → Create new file**, name it `.nojekyll`, and leave it empty.
3. **Settings → Pages → Source: Deploy from a branch**, branch `main`,
   folder **`/ (root)`**, then **Save**.

Live at `https://<your-username>.github.io/<repository>/` within a minute or
two.

### Option 2 — alongside the full project, in `/docs`

If the whole project is already on GitHub, rename this folder to `docs`,
commit it, then choose **Settings → Pages → branch `main`, folder `/docs`**.

### Option 3 — a `gh-pages` branch

```bash
git subtree push --prefix gh-pages origin gh-pages
```

Then set **Settings → Pages → branch `gh-pages`, folder `/ (root)`**.

---

## Trying it

- **Sign in** offers one administrator and several scholars.
- As the **administrator** you get the scholar directory: search, cohort and
  status filters, sortable columns and pagination.
- As a **scholar** you get your own profile and the four-section edit form.
- The form is worth poking at — the validation is real:
  - clear a required field and submit;
  - set the status to *Graduated* and leave the graduation year blank;
  - enter a graduation year earlier than the year enrolled;
  - choose *Working* and leave the company blank, then tick
    *Prefer not to disclose*;
  - switch employment between *Working* and *No job* and watch the company
    field appear and disappear.
- **Reset demo data** in the top bar puts everything back.

---

## Running the real thing

See the project's `README.md` and `docs/DEPLOYMENT.md`:

```bash
php bin/install.php migrate
php bin/install.php admin you@example.org "a-strong-admin-password"
php -S localhost:8000 -t public public/index.php
```
