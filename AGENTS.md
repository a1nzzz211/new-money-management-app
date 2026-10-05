<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Money Tracker agent guide

This repo is a Next.js 16 app using the App Router, TypeScript, Tailwind, and Supabase auth. The product is a money-tracking dashboard and auth flow, so prefer small server/client boundaries and keep auth/session logic centralized.

## Quick start

- Install dependencies: `npm install`
- Run app locally: `npm run dev`
- Production build: `npm run build`
- Lint: `npm run lint`

## Project structure

- `app/`: App Router pages and route handlers
  - `app/page.tsx`: main landing/overview screen
  - `app/(auth)/login/page.tsx`: login page
  - `app/auth/callback/route.ts`: OAuth callback handler for Supabase
  - `app/layout.tsx`: root layout, font setup, global toaster
- `components/`: reusable UI and layout pieces
  - `components/ui/`: shadcn-style primitives for forms, dialogs, cards, tables, etc.
- `lib/`: business logic, utilities, validation, and integration code
  - `lib/auth/actions.ts`: Google sign-in / sign-out server actions
  - `lib/supabase/server.ts`: server-side Supabase client factory
  - `lib/supabase/client.ts`: browser-side Supabase client factory
  - `lib/validation.ts`: validation helpers
  - `lib/types.ts`: typed Supabase schema definitions
- `public/`: static assets
- `supabase/migrations/`: database migration SQL

## Conventions

- Use the `@/` alias for imports in TS files.
- Prefer App Router patterns: server components by default, `use server` for actions, and route handlers for auth callbacks.
- Keep auth/session code in the Supabase helpers rather than duplicating it across components.
- Use the UI primitives in `components/ui` before creating one-off components.
- Keep validation and formatting helpers in `lib/` instead of scattering logic in pages.
- Match the existing Indonesian app copy when updating UI text unless a task explicitly requires English content.

## Supabase auth

The app uses Supabase Auth with Google OAuth. Key behaviors to preserve:

- Sign-in is initiated from `lib/auth/actions.ts` using `supabase.auth.signInWithOAuth({ provider: "google" })`.
- Redirect target should remain `${SITE_URL}/auth/callback` unless a task intentionally changes the auth flow.
- The OAuth callback route is implemented in `app/auth/callback/route.ts` and should be preserved when changing auth behavior.
- Server-side access uses `createClient()` from `lib/supabase/server.ts`; it reads cookies per request and does not cache the client.
- Browser client creation is in `lib/supabase/client.ts` for client-side usage.

## Environment and runtime notes

- This project expects Supabase environment variables such as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Keep `NEXT_PUBLIC_SITE_URL` aligned with the local or deployment origin used for OAuth redirect URLs.
- If a task depends on framework behavior, check the local Next.js docs under `node_modules/next/dist/docs/` before assuming the common Next.js API matches the training data.

## Working style for agents

- Keep edits narrow and consistent with the existing app structure.
- Prefer modifying the nearest relevant module instead of creating many parallel patterns.
- When you need to understand a framework-specific behavior, inspect the shipped docs in `node_modules/next/dist/docs/` before changing code.
- Do not add unrelated setup or broad refactors unless the task explicitly asks for them.
- Validate with the smallest relevant command: `npm run lint` or a focused app check when necessary.

## Helpful references

- [README.md](README.md)
- [app/layout.tsx](app/layout.tsx)
- [lib/auth/actions.ts](lib/auth/actions.ts)
- [lib/supabase/server.ts](lib/supabase/server.ts)
- [app/auth/callback/route.ts](app/auth/callback/route.ts)
