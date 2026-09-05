# Google Sheets form backend

**Status:** Not started — all 4 forms POST to a placeholder Apps Script URL.

## Why it matters

`suggest-topic.html`, `review-event.html`, `volunteer.html`, and the
newsletter box on `index.html` all use
`data-sheet-endpoint="YOUR_APPS_SCRIPT_URL"`. Until this is replaced with
a real deployment URL, submissions go nowhere.

## What to do

1. Create a new Google Sheet.
2. Extensions → Apps Script, delete the placeholder code, and paste in
   the contents of `scripts/google-sheets-form-handler.gs`.
3. Deploy → New deployment → type **Web app** → Execute as **Me** → Who
   has access **Anyone**.
4. Copy the deployment URL (ends in `/exec`) and replace
   `YOUR_APPS_SCRIPT_URL` in each matching `data-sheet-endpoint="..."`
   attribute:
   - `suggest-topic.html`, `review-event.html`, `volunteer.html` — 1 each
   - `index.html` — 1 occurrence (newsletter box)
5. Submit each form once from the live site to confirm a row lands in
   the matching tab of the Sheet (one tab per form, created
   automatically on first submission).

No other code changes needed — `assets/js/site.js`'s `initForms()`
already posts each form's fields to its own `data-sheet-endpoint` and
shows the inline success message.

See also: `README.md` → "Forms".
