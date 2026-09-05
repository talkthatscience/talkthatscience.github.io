# Google Sheets form backend

**Status:** Deployed — the real Apps Script Web App URL is wired into all
5 forms. Not yet verified end-to-end.

## Why it matters

`suggest-topic.html`, `review-event.html`, `volunteer.html`,
`newsletter.html`, and the newsletter box on `index.html` all POST to the
deployed Google Apps Script Web App now, instead of a placeholder. What's
left is confirming each one actually lands correctly — see README
"Forms" for the tradeoffs of this approach (no real delivery
confirmation from the page, since Apps Script's redirect breaks CORS).

## What to do

Submit each of the 5 forms once from the live site and confirm a row
lands in the matching tab of the Google Sheet (one tab per form name —
`topic-suggestion`, `event-review`, `volunteer-signup`, `newsletter` —
created automatically on that form's first submission).

If a tab doesn't appear or a row is missing:
- Re-check the deployment's "Who has access" is set to **Anyone** (Execute
  as **Me**) — a stricter setting silently blocks the site's requests.
- Re-deploy (Deploy → Manage deployments → edit → New version) after any
  change to `scripts/google-sheets-form-handler.gs`'s contents in the
  Apps Script editor — edits don't take effect on the live URL until
  redeployed.

See also: `README.md` → "Forms".
