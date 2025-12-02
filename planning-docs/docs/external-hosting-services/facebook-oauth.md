---
title: Facebook OAuth Notes
description: Practical notes for setting up Facebook Login without business verification, required permissions, and local callback configuration.
slug: facebook-oauth
---

## Overview

You can implement Facebook Login without a registered business. A personal Developer account is sufficient for basic permissions.

## Do You Need a Business?

- No business is required for basic Facebook Login.
- Business Verification applies only to certain permissions or features marked as "Verification required".

## Permissions

- Default: `public_profile` (granted by default).
- Common: `email` (typically does not require App Review for standard web login).
- Advanced or non‑login features may require App Review and possibly Business Verification.

## App Types

- Choose the Consumer app type for a typical web app.
- Add the Facebook Login use case in the App Dashboard.

## OAuth Redirects (Local)

- Example local callback:

```
http://localhost:3000/auth/facebook/callback
```

- If your app runs on a different port, update the callback accordingly.

## Dashboard Configuration Steps

- Create a Developer account and app.
- Enable Facebook Login.
- Add Valid OAuth Redirect URIs matching your app callback.
- If you add `email`, ensure your implementation requests scope `email`.

## App Modes

- Development mode: Test with users who have roles on the app.
- Live mode: Requires adherence to policies. Some permissions may need App Review.

## When Business Verification Is Needed

- Only when permissions/features show a status like "Verification required" in the dashboard.
- Examples: Certain Pages or Ads features, or higher access/rate limits.

## Environment Variables

- Set the following in your app:

```
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

## References

- Facebook Login overview: https://developers.facebook.com/docs/facebook-login
- Create an app and use case: https://developers.facebook.com/docs/development/create-an-app/facebook-login-use-case/
