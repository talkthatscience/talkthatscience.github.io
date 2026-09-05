# Content copy cleanup

**Status:** A few fields in `content/settings.json` are still placeholders.

## Why it matters

Small text placeholders left in `content/settings.json` that should be
confirmed/replaced once known:

- `social.email` — currently `hello@talkthatscience.example` (an
  intentionally invalid example domain).
- `social.instagram` — currently `"#"` (no real Instagram URL yet).
- `venue.note` — "confirm current venue address / room details".

`about.teamNote` now has real content (the team's names/roles) and
`team.html` has a full interview — still missing: team member photos.

## What to do

Once the CMS OAuth backend is working (see
[02-cms-github-oauth.md](02-cms-github-oauth.md)), edit "Site Settings" in
`/admin` to fill these in — no code changes needed, they're plain CMS
fields.
