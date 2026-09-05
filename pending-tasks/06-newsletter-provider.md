# Newsletter provider

**Status:** Signups land in Formspree only — no mailing list yet.

## Why it matters

The homepage newsletter box currently just POSTs to Formspree (see
[01-formspree-forms.md](01-formspree-forms.md)), so emails collect there
but nothing is actually sent to subscribers.

## What to do

Pick a real mailing list provider (Buttondown, Mailchimp, etc.) and either:

- Point the newsletter form's `action` in `index.html` at that provider's
  own form-submission endpoint, replacing Formspree entirely for this one
  form, or
- Replace the newsletter `<form>` block with the provider's own embed
  snippet.

Update `content/settings.json`'s `newsletter.provider` note once done.
