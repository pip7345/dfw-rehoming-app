---
title: SMTP Email for Authentication
description: Free development setup with Ethereal, production SMTP options, alternatives, and a simple setup guide.
slug: email-sending-nodemailer
---

## Overview

Nodemailer is an open‑source Node.js library for sending email. It has no runtime dependencies and supports SMTP, Sendmail, AWS SES, and more.

## Free Plan?

Nodemailer itself is free (MIT licensed). It is a client library, not an email service. For development, you can use free test accounts from Ethereal.email (no real emails are delivered). For production, you need an SMTP service or provider; many offer free tiers.

## Development: Ethereal Test Accounts

- Ethereal provides ephemeral inboxes for testing.
- Messages are not delivered to real recipients.
- Nodemailer can create a test account or you can generate one on Ethereal.

Example:

```
npm install nodemailer
```

```
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: { user: 'user@ethereal.email', pass: 'password' },
});

await transporter.sendMail({
  from: 'DFW Rehoming <no-reply@example.com>',
  to: 'alice@example.com',
  subject: 'Verify your email',
  text: 'Hello! Please verify your email.',
});
```

## Production Options (SMTP Providers)

- Postmark: reliable delivery, free developer tier; API and SMTP.
- SendGrid: generous free tier; API and SMTP.
- Mailgun: trial/free tier; API and SMTP.
- Resend: modern API; free developer tier.
- AWS SES: low cost; requires domain verification and DKIM/SPF.

All of these can be used via SMTP credentials with Nodemailer (or via their HTTP APIs with separate SDKs).

## Simple Setup Guide (Verification Emails)

1. Choose a provider and set env vars:

```
SMTP_HOST=smtp.postmarkapp.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
MAIL_FROM="DFW Rehoming <no-reply@yourdomain>"
APP_URL=http://localhost:3000
```

2. Install Nodemailer:

```
npm install nodemailer
```

3. Create a mailer utility:

```
import nodemailer from 'nodemailer';

export function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

export async function sendVerificationEmail(to: string, token: string) {
  const transporter = createTransport();
  const verifyUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: 'Verify your email',
    text: `Verify your email: ${verifyUrl}`,
    html: `Verify your email: <a href="${verifyUrl}">${verifyUrl}</a>`,
  });
}
```

4. Add basic DNS:

- Set SPF and DKIM for your domain at your provider to improve deliverability.

## Alternatives to Nodemailer

- Provider SDKs (HTTP APIs): Postmark, SendGrid, Mailgun, Resend provide their own Node SDKs. These may include analytics, templates, and webhooks.
- AWS SES SDK: Use `@aws-sdk/client-ses` for direct AWS integration.
- EmailEngine (self‑hosted gateway): Adds webhooks, tracking, and queueing.

## Notes

- For development, Ethereal is fastest and free.
- For production, pick an SMTP/Email provider that fits your budget and deliverability needs.
- Keep secrets in environment variables; do not commit credentials.

## References

- Nodemailer home: https://nodemailer.com/
- Transports: https://nodemailer.com/transports/
- Ethereal: https://ethereal.email/
---