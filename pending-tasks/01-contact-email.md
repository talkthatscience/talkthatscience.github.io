# Contact email

**Status:** Not started — every form and footer link still points at a
placeholder address.

## Why it matters

`hello@talkthatscience.example` is a placeholder (`.example` is a reserved,
non-deliverable TLD) used in two ways across the site:

- The footer's `mailto:` "Email" link, on every page.
- The `data-mailto` attribute on all four forms (`suggest-topic.html`,
  `review-event.html`, `volunteer.html`, and the newsletter box in
  `index.html`) — see README "Forms". Since these forms have no
  form-backend service, this address is the *only* place a submission
  goes; until it's real, submissions open a draft addressed nowhere useful.

Note this is separate from `content/settings.json`'s `social.email` field
(see [08-content-copy-cleanup.md](08-content-copy-cleanup.md)) — that field
isn't currently read by any page, so editing it in `/admin` alone won't
change what the forms or footer actually use.

## What to do

1. Decide the real inbox this should go to.
2. Replace every occurrence of `hello@talkthatscience.example` across the
   `.html` files (`grep -rl hello@talkthatscience.example *.html`) with it.
3. Optionally also update `content/settings.json`'s `social.email` to match,
   for consistency, once CMS OAuth is set up.
