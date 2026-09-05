# Newsletter provider

**Status:** Signups land in a Google Sheet only — no mailing list yet.

## Why it matters

Two newsletter signup forms — the homepage box (`index.html`) and the
dedicated `newsletter.html` Contact page — currently both POST into the
same Google Sheet as the other forms (see
[01-google-sheets-forms.md](01-google-sheets-forms.md)), so emails
collect there but nothing is actually sent to subscribers — you'd add
each one to a real list by hand.

## What to do

Pick a real mailing list provider (Buttondown, Mailchimp, etc.) and either:

- Point both newsletter forms' `data-sheet-endpoint` (in `index.html` and
  `newsletter.html`) at that provider's own form-submission endpoint,
  replacing the Google Sheet entirely for these, or
- Replace both newsletter `<form>` blocks with the provider's own embed
  snippet.

Update `content/settings.json`'s `newsletter.provider` note once done.
