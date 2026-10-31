# Money Tracker

A modern personal finance and expense tracking web application built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

## Features

- 🔐 **Supabase Authentication**: Seamless Google OAuth login and server-side session management.
- 🎯 **Budget Management**: Set monthly spending limits per expense category, track usage with progress bars, and get clear "Aman", "Mendekati Batas", or "Melebihi Batas" statuses.
- 🐷 **Savings Goals**: Create financial targets with optional deadlines, record contributions that also appear as savings transactions, and track progress with status tabs and monthly estimates.
- 🧾 **Transaction History & Export**: Browse the full ledger with inclusive date-range filters, sort by date or amount, and export the filtered data to CSV or a styled XLSX workbook with summary sheets and native charts.
- 🏷️ **Category Management**: Grouped expense, income, and savings categories with custom colors, transaction usage counts, protected defaults, and safe deletion that reassigns transactions to a fallback category.
- 📊 **Financial Dashboard**:
  - Net balance, income, expense, and savings metrics.
  - Month-over-month (MoM) spending comparison.
  - Interactive 6-month cashflow trend chart powered by Recharts.
  - Monthly expense breakdown by category with visual progress bars.
  - Recent transactions list.
  - Quick widgets for budget limits and savings goal targets.
- 🛡️ **Robust Security**: Full Row-Level Security (RLS) policies on Supabase tables to ensure users only access their own data.
- 📱 **Responsive Design**: Modern dashboard layout with desktop sidebar and mobile drawer navigation.
- 🇮🇩 **Localized**: Currency formatting in Indonesian Rupiah (`IDR`) and localized dates.

## Routes

| Route | Description |
| --- | --- |
| `/` | Public landing page (redirects signed-in users to `/dashboard`) |
| `/login` | Google OAuth sign-in |
| `/auth/callback` | Supabase OAuth callback |
| `/dashboard` | Overview metrics, trend chart, budget/goal widgets |
| `/transaksi` | Month-based transaction ledger with filters and CRUD |
| `/anggaran` | Monthly budgets per expense category |
| `/tabungan` | Savings goals, contributions, status tabs |
| `/analisis` | 1/3/6/12-month analytics, category distribution, budget adherence |
| `/histori` | Date-range ledger with CSV/XLSX export |
| `/kategori` | Category management with protected defaults |
| `/api/export`, `/api/export/xlsx` | Authenticated CSV/XLSX downloads (`401` when signed out) |

All dashboard routes are protected by `proxy.ts` and redirect to `/login` when signed out.

## Tech Stack

- **Framework**: Next.js 16 (App Router & Turbopack)
- **Language**: TypeScript
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security, Auth)
- **UI & Styling**: Tailwind CSS, Base UI, Lucide Icons, Sonner
- **Charts**: Recharts
- **Date Handling**: date-fns

## Getting Started

### 1. Prerequisites

- Node.js 18+ installed
- A [Supabase](https://supabase.com) project

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/a1nzzz211/new-money-management-app.git
cd new-money-management-app
npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Supabase project credentials in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Database Setup

Apply the SQL migration file to your Supabase project:

1. Go to the Supabase Dashboard $\rightarrow$ **SQL Editor**.
2. Open `supabase/migrations/0001_init.sql` and execute the script.
3. If your project already had the initial schema applied, run `supabase/migrations/0002_hardening.sql` as well (safe to re-run).
4. Configure Google OAuth under **Authentication** $\rightarrow$ **Providers**.

### 5. Running Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

If you access the dev server through a VS Code/Codespaces tunnel, set `NEXT_PUBLIC_SITE_URL` to the tunnel HTTPS URL and add `<tunnel-url>/auth/callback` to the Supabase redirect allowlist. Do not use the tunnel URL for production.

## Deployment (Vercel)

Before deploying, complete this checklist:

1. **Environment variables** (Vercel → Project Settings → Environment Variables, for **Production** and **Preview**):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
   ```
   - `NEXT_PUBLIC_SITE_URL` must be the deployed origin with no trailing slash.
   - Redeploy after changing any `NEXT_PUBLIC_*` value; they are inlined at build time.
2. **Supabase Auth** (Authentication → URL Configuration):
   - Set **Site URL** to `https://your-app.vercel.app`.
   - Add `https://your-app.vercel.app/auth/callback` to **Redirect URLs**.
   - For preview deployments, also add a preview pattern such as `https://*-<team-slug>.vercel.app/**`, or set `NEXT_PUBLIC_SITE_URL` per preview environment.
3. **Google OAuth**: keep the Supabase callback `https://<project-ref>.supabase.co/auth/v1/callback` in Google Cloud Console → Credentials → Authorized redirect URIs. The Vercel domain is configured only in Supabase, not in Google Cloud.
4. **Database migrations**:
   - Fresh project: run `supabase/migrations/0001_init.sql`.
   - Existing project: run `supabase/migrations/0002_hardening.sql` (safe to re-run). This is still pending in `TASK.md`.
5. **Export size limit**: Vercel caps Function request/response bodies at **4.5 MB**. CSV/XLSX exports build the whole file in memory, so very large date ranges can fail with `413 FUNCTION_PAYLOAD_TOO_LARGE`. Keep ranges reasonable or switch the export handlers to streaming if large exports are required.
6. **Verify after deploy**:
   - Google sign-in, callback to `/auth/callback`, and logout.
   - Protected routes redirect to `/login` when signed out.
   - RLS with two separate users.
   - CSV and XLSX export for small and large ranges.
   - `npm run lint` and `npm run build` pass locally before pushing.

Notes:
- `.env.local` is gitignored; never commit it or copy its tunnel URL into Vercel.
- Node 22.x is recommended (Vercel default). Optionally pin it with `"engines": { "node": "22.x" }` in `package.json`.
- The tunnel settings in `next.config.ts` (`allowedDevOrigins`, `experimental.serverActions.allowedOrigins`) are harmless in production.

## Scripts

- `npm run dev`: Start local development server.
- `npm run build`: Build production bundle with typecheck.
- `npm run lint`: Run ESLint checks.
- `npm run start`: Start production server.

## License
