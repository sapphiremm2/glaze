# Glaze 🎵
Song Promo & Earnings Tracker — Glassmorphism dark UI, React + Supabase + Vercel.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Supabase Setup
1. Go to your Supabase project → **SQL Editor**
2. Paste and run the contents of `supabase-schema.sql`
3. This creates the `promos` table, `user_settings` table, RLS policies, and `screenshots` storage bucket

### 3. Environment Variables
```bash
cp .env.example .env.local
```
Fill in from your Supabase project → Settings → API:
- `VITE_SUPABASE_URL` → Project URL
- `VITE_SUPABASE_ANON_KEY` → anon/public key

### 4. Run locally
```bash
npm run dev
```

### 5. Deploy to Vercel
1. Push to GitHub
2. Import repo in Vercel
3. Add the two env vars in Vercel project settings
4. Deploy 🚀

## Features
- **Auth** — Sign up / sign in via Supabase (email + password)
- **Queue** — Active promos list, priority toggle, swipe/tap to complete
- **Goal Bar** — Monthly goal with live progress, click to edit target
- **Completion Modal** — Add work link + payment screenshot upload
- **Stats** — Lifetime earnings, monthly chart, avg payment, best client, projection
- **History** — Feed of all past work with links and payment proof
- **RLS** — Each user only sees their own data
