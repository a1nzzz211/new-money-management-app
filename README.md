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

## Scripts

- `npm run dev`: Start local development server.
- `npm run build`: Build production bundle with typecheck.
- `npm run lint`: Run ESLint checks.
- `npm run start`: Start production server.

## License
