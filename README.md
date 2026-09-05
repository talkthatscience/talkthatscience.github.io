# Talk That Science — website

A zero-server-maintenance site for the *Talk That Science* Echobox Radio show
and its live Science Bar Talks at Oedipus Brewery. Plain HTML/CSS/JS — no
build step, no framework, no backend to patch or pay for. Content is edited
through a Git-backed CMS (Decap CMS) at `/admin`, and forms submit straight
into a Google Sheet via a small Google Apps Script — no third-party form
service, no cost (see "Forms" below).

This is built to run entirely on **GitHub + Google**: GitHub Pages for
hosting, a GitHub OAuth App for CMS login, and a free Google Apps Script
Web App (since GitHub itself has no form-handling) for the site's forms.
Every internal link, `<img src>`, script tag, and JSON fetch in this repo
uses a **relative path** (`assets/...`, `content/...`) rather than a
root-relative one (`/assets/...`), which works whether the site is served
at a domain root or a subpath.

## What's real vs. placeholder right now

- **Real:**
  - The show's actual tagline, Echobox show URL, Spotify/Apple/SoundCloud
    links, and the "monthly show + live bar night" format.
  - **The visual design** — colour palette, logo, and hero illustration are
    now the real "Talk That Science" brand assets you provided:
    - The logo lockup (`assets/img/logo.png`) is used as-is in the header.
    - The hero illustration (`assets/img/hero-illustration.png`) is your
      actual show artwork.
    - The cream background (`--bg`, `--bg-alt`) and near-black ink
      (`--ink`) are colour-picked directly from those two assets.
    - The six accent colours (`--c-orange`, `--c-blue`, `--c-purple`,
      `--c-coral`, `--c-yellow`, `--c-teal`) are colour-picked from the
      rainbow stripe on the Echobox Radio site, reused here for badges,
      buttons, and the stripe under the header — a visual nod to where the
      show lives. Blue and purple were lightened slightly from Echobox's
      exact values so text sitting on them meets accessibility contrast
      guidelines (verified with WCAG contrast ratios); if you have official
      hex codes for the full brand palette, hand them over and I'll swap
      these estimates for the exact values.
    - Headings use **Archivo** (a bold geometric sans close to the logo's
      lettering); body text stays on **Inter** for readability.
  - All of this lives in `assets/css/style.css`'s `:root` block plus the
    two files in `assets/img/` — easy to hand-tune further or swap if you
    get an official style guide with exact specs later.
- **Still placeholder (replace when ready):**
  - `content/events.json` holds real episodes from `data/episodes.jsonl`
    (see "Episode data" below) with real descriptions, but no guest
    photos, theme photos, excerpt audio, or slide decks yet — those still
    need filling in via `/admin` (or `assets/media/<event-id>/`, see
    "Media files" below) as they become available.
  - The five `data-sheet-endpoint="YOUR_APPS_SCRIPT_URL"` attributes (one
    each in `suggest-topic.html`, `review-event.html`, `volunteer.html`,
    `newsletter.html`, and the newsletter box in `index.html`) need your
    deployed Google Apps Script Web App URL — see "Forms" below.
  - The `backend:` block in `admin/config.yml` needs your GitHub
    username/repo and your deployed OAuth proxy URL — see "Turning on the
    CMS" below.

## Site structure

```
index.html              Homepage — hero, next event, latest episode,
                         newsletter signup
events.html              Event & Slide Hub — every broadcast + bar night,
                         filterable, with excerpt audio + slide links
calendar.html            Chronological list of upcoming broadcasts + events
about.html                About Talk That Science
suggest-topic.html        Contact — topic suggestion form
review-event.html         Contact — bar night review form
volunteer.html            Contact — volunteer signup form
newsletter.html           Contact — newsletter signup form
admin/                   Decap CMS (config.yml + index.html)
data/
  episodes.jsonl          Source-of-truth episode facts — see "Episode data"
scripts/
  sync-episodes.js        Regenerates content/events.json from episodes.jsonl
content/
  settings.json           Site-wide text (tagline, venue, about copy, links)
  events.json             What the site actually renders — edited via
                          /admin, and via episodes.jsonl for core facts
assets/
  css/style.css           All styling + the colour variables
  js/site.js              Fetches content/*.json and renders it into pages
  media/<event-id>/       One folder per event — see "Media files"
.github/workflows/pages.yml  GitHub Actions workflow that deploys to Pages
.nojekyll                  Tells GitHub Pages not to run this through Jekyll
```

There's no templating engine and no build step on purpose: the CMS commits
plain JSON to `content/`, and a small script (`assets/js/site.js`) fetches
that JSON in the browser and renders it. Deploy = push these files as-is.

## Episode data

`data/episodes.jsonl` is the source of truth for each episode's core
facts — one JSON object per line:

```json
{"episode_number": 20, "date": "2024-01-18", "title": "Coral Reefs", "guests": ["Sarah Solomon", "René Zande"], "faculties": ["Natural Sciences"], "topics": ["marine-biology", "climate-change"], "url": "https://..."}
```

`url` is the episode's real listen-back link — fill it in by hand once
you know it (`null` until then). It's the one field here that maps
straight to a display field (`episodeLink`, used for the card title link
and the "Listen on Echobox" button) rather than getting combined/reshaped
— see why below.

The site itself never reads this file directly — it fetches
`content/events.json`, same as always. `scripts/sync-episodes.js` bridges
the two: it converts each episode into the site's event shape (joining
`guests` into one string, combining `faculties` + `topics` into `tags`,
deriving an `id` from the date + slugified title) and writes the result
into `content/events.json`.

**To add a new episode:**

1. Append a line to `data/episodes.jsonl`.
2. Run `node scripts/sync-episodes.js` (no dependencies to install — plain
   Node).
3. Commit both files, then add the description/excerpt audio/slides for
   the new event via `/admin`, same as any other event.

The script is safe to re-run any time and won't clobber CMS work: for an
event whose `id` already exists in `content/events.json`, it refreshes
the core fields (title/date/guest/tags/**episodeLink**) and leaves
`description`, `excerptAudioUrl`, `slideUrl`, `guestPhotos`,
`themePhotoUrl`, `venue`, and `type` exactly as they were. **episodeLink
is sourced from `url` in episodes.jsonl, not from `/admin`** — edit it
there, not in the CMS, since a CMS edit would just get overwritten on the
next sync. Anything in `content/events.json` that doesn't come from
`episodes.jsonl` at all — e.g. a live Oedipus bar night you added by hand,
which has no episode number — is left completely untouched.

One thing the script can't know: `episodes.jsonl` has no field
distinguishing a live bar night from a radio broadcast, so every synced
event defaults to `type: "broadcast"`. Fix individual ones to "Live Bar
Talk" (+ venue) via `/admin` where that's wrong — see
`pending-tasks/05-real-event-content.md`.

## Media files

Every event gets its own folder: `assets/media/<event-id>/` (the same
`id` as in `content/events.json`, e.g. `assets/media/2024-01-18-coral-reefs/`).
`scripts/sync-episodes.js` creates one automatically for every episode
synced from `data/episodes.jsonl`, so a folder exists before any content
does — drop files in directly, or upload through `/admin` (see below).

- **Uploading via `/admin`**: the Guest Photos, Theme Photo, Excerpt
  Audio, and Slide Deck fields each have a `media_folder`/`public_folder`
  override pointing at `assets/media/{{id}}` — Decap CMS resolves `{{id}}`
  against that same event's own `id` field, so a drag-and-drop upload on
  any event lands directly in its folder, not one flat pile. **Guest
  Photos is a list** (one entry per guest — name + photo each), since an
  episode can have more than one guest. This hasn't been tested against a
  live `/admin` yet (needs the CMS OAuth backend — see
  `pending-tasks/02-cms-github-oauth.md`); the Guest Photos list in
  particular nests one field level deeper than the others, so its
  `{{id}}` resolution is less certain than the flat fields — worth
  confirming both once that's set up, and letting me know if `{{id}}`
  doesn't resolve as expected.
- **Uploading directly**: drop a file into the matching
  `assets/media/<event-id>/` folder, then in `content/events.json` either
  set `themePhotoUrl`/`excerptAudioUrl`/`slideUrl` to its path, or — for a
  guest photo — add an entry to that event's `guestPhotos` array:
  `{"name": "Guest Name", "photoUrl": "assets/media/<event-id>/photo.jpg"}`
  (one array entry per guest). Then commit. `content/events.json`'s
  `2024-01-18-coral-reefs` entry is a worked example with two guests.
- A `.gitkeep` file in each folder is the only thing keeping empty ones
  tracked by git — delete it once the folder has real content in it.

## Deploying (GitHub Pages, ~5 minutes)

1. Push this folder to a new GitHub repository.
2. In the repo: **Settings → Pages → Source**, choose **GitHub Actions**.
   (The workflow at `.github/workflows/pages.yml` is already in this repo —
   it just needs Pages pointed at it. No build command, it deploys the
   files as-is.)
3. Push to `main` (or run the workflow manually from the **Actions** tab).
   Your site goes live at `https://yourusername.github.io/reponame/`.
4. Optional: **Settings → Pages → Custom domain** to put it on your own
   domain instead. If you do, root-relative paths (`/assets/...`) would also
   work, but the relative paths already in this repo keep working too —
   nothing to change.

## Turning on the CMS (`/admin`)

Decap CMS needs a login system and a way to write back to your git repo.
Without Netlify, the `github` backend does this directly against the GitHub
API — but GitHub's OAuth flow requires one small server-side step Decap
can't do alone, so you need a tiny OAuth proxy in front of it. The easiest
option is a free Cloudflare Worker running an existing open-source proxy
([sterlingwes/decap-proxy](https://github.com/sterlingwes/decap-proxy)) —
no code to write, just deploy and configure:

1. **Create a GitHub OAuth App**: [github.com/settings/applications/new](https://github.com/settings/applications/new).
   - Homepage URL: the URL your Worker will live at, e.g.
     `https://decap-auth.yoursubdomain.workers.dev`.
   - Authorization callback URL: the same URL + `/callback`.
   - Save the **Client ID** and **Client Secret** it gives you.
2. **Deploy the OAuth proxy** as a Cloudflare Worker (needs a free
   Cloudflare account and `npx wrangler login` once):
   ```
   git clone https://github.com/sterlingwes/decap-proxy
   cd decap-proxy
   cp wrangler.toml.sample wrangler.toml
   npx wrangler secret put GITHUB_OAUTH_ID       # paste the Client ID
   npx wrangler secret put GITHUB_OAUTH_SECRET   # paste the Client Secret
   npx wrangler deploy
   ```
   This gives you a `https://<name>.<subdomain>.workers.dev` URL — visiting
   it should say "Hello 👋" if it worked.
3. **Update `admin/config.yml`** in this repo with your real values:
   ```yaml
   backend:
     name: github
     repo: yourusername/your-repo-name
     branch: main
     base_url: https://<name>.<subdomain>.workers.dev
     auth_endpoint: /auth
   ```
4. **Add content managers as GitHub collaborators** on this repo (**Settings
   → Collaborators**) — the `github` backend authenticates people as
   themselves, so anyone editing content needs push access to the repo
   itself (unlike Netlify Identity, there's no separate invite-only login
   system layered on top).
5. Visit `yoursite/admin/` — log in with GitHub, and you'll see the "Site
   Settings" and "Events & Broadcasts" collections, with drag-and-drop
   upload for PDFs and audio.

## Forms

`suggest-topic.html`, `review-event.html`, `volunteer.html`, and
`newsletter.html` (the four Contact pages), plus the newsletter box on
the homepage, all submit into a **Google Sheet** — no third-party form
service, no account beyond Google, no cost, no submission cap.

How it works: each submission POSTs to a small **Google Apps Script Web
App** bound to a Google Sheet you create. The script appends a row to a
tab named after the form (e.g. "topic-suggestion"), creating that tab
with headers the first time it gets a submission. The script itself lives
in this repo at `scripts/google-sheets-form-handler.gs` (Apps Script has
its own execution environment — you paste that file's contents into a
Google Sheet's script editor, it doesn't run as part of this site).

**One-time setup:**

1. Create a new Google Sheet.
2. Extensions → Apps Script, delete the placeholder code, and paste in
   the contents of `scripts/google-sheets-form-handler.gs`.
3. Deploy → New deployment → type **Web app** → Execute as **Me** → Who
   has access **Anyone**. ("Anyone" is required for a visitor's browser to
   be able to POST here at all — it only exposes this one write endpoint,
   not your sheet's data.)
4. Copy the deployment URL (ends in `/exec`) and replace
   `YOUR_APPS_SCRIPT_URL` with it in the `data-sheet-endpoint="..."`
   attribute of all five forms: one each in `suggest-topic.html`,
   `review-event.html`, `volunteer.html`, `newsletter.html`, and the
   newsletter box in `index.html`.
5. Submit each form once from the live site and confirm a row lands in
   the matching tab.

Tradeoffs worth knowing:
- **No delivery confirmation.** Apps Script's redirect breaks normal
  CORS, so the fetch in `initForms()` uses `mode: "no-cors"` — the
  request still reaches the script and the row still gets written, but
  the response is opaque, so a wrong URL or a script error looks
  identical to success from the page's point of view. Test it after
  setup rather than trusting the success message alone.
- **Light spam filtering.** The hidden `_gotcha` field is a
  Formspree-style honeypot, checked both client-side (JS won't even send
  the request) and inside the Apps Script itself (in case something POSTs
  directly, bypassing the page) — but there's nothing like Formspree's
  more sophisticated bot detection behind it.
- **You're relying on Google's uptime/quotas**, not a dedicated
  form-backend service's — fine at this site's expected volume, but
  Apps Script Web Apps do have execution quotas on a free Google account.

If you'd rather use a different form service later (Formspree etc.), only
`assets/js/site.js`'s `initForms()` and each form's
`data-sheet-endpoint="..."` attribute need to change — the HTML field
structure itself doesn't.

## Extending into the workflows from the brief

A handful of things in the original brief are editorial/automation
workflows rather than website features, so they're intentionally left as
"next steps" rather than fake-built here:

- **Newsletter delivery** — the homepage signup form currently lands as a
  row in a Google Sheet (see "Forms" above), so you'd add each subscriber
  to a real mailing list by hand. Connect it to an actual list provider
  (Buttondown, Mailchimp, etc.) by pointing the form's `data-sheet-endpoint`
  at their API/embed endpoint instead, or by replacing the form with
  their embed snippet.
- **Pre-interview reminder emails** (with a calendar link + prep notes) and
  **daily audio-excerpt suggestions** are internal workflows, not public
  pages — a small scheduled automation (e.g. a GitHub Actions scheduled
  workflow, or Zapier/Make triggered off new rows in `content/events.json`)
  is the natural way to build these without standing up a server. Happy to
  build either once you tell me which calendar/email tool you use.
- **Auto-drafting episode descriptions** from guest papers and prep notes
  is an AI-assisted writing step best done as a Claude workflow when a new
  event is added, rather than static site code — ask any time you want that
  wired up.

## Adjusting the design further

**Whenever you edit `assets/css/style.css` or `assets/js/site.js`, bump the
`?v=N` query string** on every `<link>`/`<script>` tag that loads it (all 5
`.html` files). GitHub Pages caches these files for 10 minutes
(`cache-control: max-age=600`), so without a cache-buster, visitors who
loaded the page just before your change can see new HTML paired with old
CSS/JS for up to 10 minutes after you deploy — which is exactly how a
missing style rule ends up looking like "nothing happened" or an unstyled
element suddenly rendering huge. A one-line find-and-replace across the 5
files (`style.css?v=1` → `?v=2`, same for `site.js`) is enough.

Everything visual is controlled from a few places:

- `assets/css/style.css` → the `:root { ... }` block at the top holds every
  colour as a variable. Change one there and it updates everywhere it's used.
- `assets/img/logo.png` and `assets/img/hero-illustration.png` are your
  actual brand files — replace them with updated exports any time (keep the
  same filenames, or update the `<img src>` references in the `.html` files
  if you rename them).
- The Echobox-style rainbow stripe is the `.rainbow-bar` component in
  `style.css` — it's plain CSS (six flex children), not an image, so its
  colours follow the `--c-*` variables automatically.
- Footer icons (Echobox Radio / Oedipus Brewery chips) are inline SVG
  directly in each `.html` file (search for `<svg`) — swap for real logo
  marks as `<img>` tags whenever you have usage rights to them.
