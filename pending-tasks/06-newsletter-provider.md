# Newsletter provider

**Status:** Signups just email you (via `mailto:`, see README "Forms") —
no mailing list yet.

## Why it matters

The homepage newsletter box currently opens a `mailto:` draft to
[01-contact-email.md](01-contact-email.md)'s address with the visitor's
email in the body — you'd have to add each one to a mailing list by hand.
Nothing is actually sent to subscribers on any schedule.

## What to do

Pick a real mailing list provider (Buttondown, Mailchimp, etc.) and either:

- Point the newsletter form's `action` in `index.html` at that provider's
  own form-submission endpoint, replacing the `data-mailto` approach
  entirely for this one form, or
- Replace the newsletter `<form>` block with the provider's own embed
  snippet.

Update `content/settings.json`'s `newsletter.provider` note once done.
