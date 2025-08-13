# ECE NTUA Student Portal (App)

Dark + light themed Next.js 15 application using Tailwind CSS with custom design tokens.

## Stack
- Next.js 15 (App Router, React 19)
- Tailwind CSS + custom CSS variables for theming
- TypeScript

## Development
```bash
npm install
npm run dev
```
Then open http://localhost:3000.

## Google Photos integration (optional)
To enable selecting photos from your Google Photos albums:
- Create a Google Cloud OAuth 2.0 Client (Web) and add authorized redirect URL: http://localhost:3000/api/auth/callback/google
- Add env vars in `.env`:
	- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
	- NEXTAUTH_SECRET
- Ensure your Google Cloud project has the Photos Library API enabled.
- Sign in with Google from /auth/signin.

Photos page: /photos
- It lists your albums and lets you browse items in an album.
- Optionally lock to a single album by setting in `.env`:
	- NEXT_PUBLIC_GOOGLE_PHOTOS_ALBUM_ID=<albumId>
	- NEXT_PUBLIC_GOOGLE_PHOTOS_LOCK=1

## Theming
Theme tokens live in `src/app/globals.css` under `:root[data-theme='dark']` and `:root[data-theme='light']`.
The toggle button (`ThemeToggle`) switches the `data-theme` attribute on `<html>`.

## Adding Components
Use Tailwind utilities. For repeated patterns make small component wrappers under `src/components`.

## Roadmap
- Announcements feed (RSS ingest)
- Lab partner matching tool
- Calendar auto updates
- Past exam archive with search
- Auth (Google / IEEE) + student network area

---
Generated from create-next-app; original template docs below.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
