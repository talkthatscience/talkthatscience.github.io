# Newsletter provider

**Status:** Signups land in a Google Sheet only — no mailing list yet.

## Why it matters

The homepage newsletter box currently POSTs into the same Google Sheet
as the other forms (see
[01-google-sheets-forms.md](01-google-sheets-forms.md)), so emails
collect there but nothing is actually sent to subscribers — you'd add
each one to a real list by hand.

## What to do

Pick a real mailing list provider (Buttondown, Mailchimp, etc.) and either:

- Point the newsletter form's `data-sheet-endpoint` in `index.html` at
  that provider's own form-submission endpoint, replacing the Google
  Sheet entirely for this one form, or
- Replace the newsletter `<form>` block with the provider's own embed
  snippet.

Update `content/settings.json`'s `newsletter.provider` note once done.
