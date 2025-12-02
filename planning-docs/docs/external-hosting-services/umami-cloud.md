---
sidebar_position: 20
title: Umami Cloud Analytics
---

Track site usage with privacy‑friendly, cookie‑less analytics using Umami Cloud.

## Why Umami
- Privacy‑first, GDPR‑friendly out of the box
- Simple script embed, no consent banner required (no cookies)
- Fast, lightweight, and open‑source (with a managed cloud)

## Account & Site Setup
1. Sign up: https://umami.is/
2. Create a website in Umami Cloud
   - Website Name: DFW Rehoming
   - Domain: your production domain (or localhost for dev)
3. Copy the embed script (your unique website ID is required)

Example (using our site):
```html
<script defer src="https://cloud.umami.is/script.js" data-website-id="fdfa9645-4750-41cc-a302-e68a0e658048"></script>
```

Owner: pip7345

## Installing on the App
We include the Umami snippet on every page via a shared partial:
- Partial: `src/web/views/partials/analytics-umami.ejs`
- Included in the `<head>` of all EJS pages (home, pack, dashboard, auth, checkout, etc.)

## Verifying Events
- Open your site and navigate a few pages
- In Umami dashboard, check Realtime to see pageviews

## Custom Events (Optional)
Use `umami.track('event-name', { key: 'value' })` for custom actions.
```js
if (window.umami) {
  umami.track('pack-viewed', { packId: '<id>' });
}
```

Docs: https://umami.is/docs

## Environments
- Dev and Prod can each be separate websites in Umami with unique IDs
- Use environment variables if you want to toggle the script per env

## Alternatives
- Cloudflare Web Analytics (no script if proxied) – https://www.cloudflare.com/web-analytics/
- Plausible – https://plausible.io/
- Google Analytics (requires consent banner) – https://analytics.google.com/
