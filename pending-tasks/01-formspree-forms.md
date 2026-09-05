# Formspree forms

**Status:** Not started — all 4 forms POST to a placeholder endpoint.

## Why it matters

The three Contact pages — `suggest-topic.html`, `review-event.html`,
`volunteer.html` — and the newsletter box on `index.html` all use
`action="https://formspree.io/f/YOUR_FORM_ID"`. Until this is replaced with
a real ID, submissions go nowhere.

## What to do

1. Sign up at [formspree.io](https://formspree.io) (free tier: 50
   submissions/month across the account).
2. Create 4 separate forms, one per use case — keeps notifications/inboxes
   separate:
   - Topic suggestion
   - Event review
   - Volunteer signup
   - Newsletter signup
3. Replace `YOUR_FORM_ID` in each matching `action="..."` attribute:
   - `suggest-topic.html`, `review-event.html`, `volunteer.html` — 1 each
   - `index.html` — 1 occurrence (newsletter box)
4. Submit each form once from the live site to confirm it lands in the
   right Formspree inbox.

No other code changes needed — `assets/js/site.js`'s `initForms()` already
posts each form to its own `action` URL via `fetch` and shows the inline
success message.

See also: `README.md` → "Forms".
