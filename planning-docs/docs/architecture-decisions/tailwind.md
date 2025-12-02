---
title: Tailwind CSS Pipeline
description: Decision notes comparing a proper Tailwind build pipeline versus temporary static CSS, with recommended setup for this project.
slug: tailwind-pipeline
---

## Summary

We currently use a simple static dark theme CSS (`public/tailwind.css`) for rapid styling without a build step. For production and scalability, we will adopt a proper Tailwind pipeline with PostCSS and Autoprefixer to access utility classes, variants, dark mode, and tree‑shaken output.

## Current Temporary Approach

- Static CSS file with custom variables and a few utility‑like classes.
- Pros: zero tooling, instant changes.
- Cons: no Tailwind utilities, no purge, limited responsiveness and variants.

## Proper Tailwind Pipeline (Recommended)

- Dependencies: `tailwindcss`, `postcss`, `autoprefixer`.
- Config files:
  - `tailwind.config.js`: set `content` globs and `darkMode: 'class'`.
  - `postcss.config.js`: include `tailwindcss` and `autoprefixer`.
- Source CSS (input): `@tailwind base; @tailwind components; @tailwind utilities;`.
- Output CSS (compiled): written to `public/tailwind.css`.
- Benefits: utility classes, responsive breakpoints, hover/focus/aria variants, and minimal bundle via content scanning.

## Setup Steps

1. Install packages:

```
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

2. Configure Tailwind (example):

```
// tailwind.config.js
export default {
  content: [
    './views/**/*.{ejs,html}',
    './src/**/*.{ts,tsx,js}',
  ],
  darkMode: 'class',
  theme: { extend: {} },
  plugins: [],
}
```

3. Create input CSS:

```
/* src/styles/tailwind.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

4. Build commands:

```
// Dev (watch)
npx tailwindcss -i ./src/styles/tailwind.css -o ./public/tailwind.css --watch

// Prod (minified)
npx tailwindcss -i ./src/styles/tailwind.css -o ./public/tailwind.css --minify
```

5. Update views to use Tailwind utilities (example button):

```
<button class="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400">Submit</button>
```

## Dark Mode Strategy

- Use `darkMode: 'class'` and toggle a `dark` class on `<html>` or `<body>`.
- Example container: `class="bg-white text-gray-900 dark:bg-neutral-900 dark:text-neutral-100"`.

## Migration Plan

- Keep the temporary static CSS during initial development.
- Introduce Tailwind build pipeline and gradually replace custom classes with utilities.
- Validate content paths so purge keeps CSS bundle small.

## Decision

Adopt Tailwind’s build pipeline and utility classes for consistency and scalability. Maintain the static stylesheet as a fallback until migration is complete.
