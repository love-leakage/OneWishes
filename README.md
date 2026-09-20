# ONEWISHES — Setup & Integration Guide

## Overview
OneWishes (`onewishes.com`) makes emotional weight a designed-in feature through artificial scarcity:
- **Spark Wish**: Unlimited, free, private shareable link.
- **Golden Wish**: 3 per lifetime per verified user identity.
- **Spotlight**: 1 slot per calendar date worldwide (full front-page feature).

## Current Architecture & Status
- **Frontend**: Single static file ([index.html](file:///c:/Users/acer/Downloads/files/index.html)), built with vanilla HTML/CSS/JS.
- **Backend & Auth**: Supabase PostgreSQL database with Supabase Email Magic Link authentication (`signInWithOtp`).
- **Database Schema**: Rebuilt with server-side scarcity enforcement ([schema.sql](file:///c:/Users/acer/Downloads/files/schema.sql)).
- **Domain**: `onewishes.com` configured on Vercel.

---

## 1. Resetting the Database (Supabase SQL)
To apply the fresh database schema:
1. Open your **Supabase Dashboard** → Select project → Go to **SQL Editor**.
2. Paste the contents of [schema.sql](file:///c:/Users/acer/Downloads/files/schema.sql) and click **Run**.
3. This sets up `profiles`, `wishes`, `spotlight_bookings` tables, RLS policies, and the `claim_golden_wish()` function.

---

## 2. Connecting GitHub for Auto-Deploy
1. Go to **github.com** → **New repository** → Name it `onewishes` → Public → Create.
2. In your local workspace terminal, push the initialized Git repo:
   ```bash
   git remote add origin https://github.com/<your-username>/onewishes.git
   git branch -M main
   git push -u origin main
   ```
3. In **Vercel**:
   - Open your project → **Settings** → **Git**.
   - Click **Connect Git Repository** and select `onewishes`.
   - Any commit pushed to `main` will automatically rebuild and deploy to Vercel.

---

## 3. Custom Domain Setup (`onewishes.com`)
1. In **Vercel Dashboard**:
   - Navigate to **Project Settings** → **Domains**.
   - Add `onewishes.com` and `www.onewishes.com`.
2. In **Spaceship DNS Settings**:
   - **A Record**: Host `@`, Value `76.76.21.21` (Vercel IP).
   - **CNAME Record**: Host `www`, Value `cname.vercel-dns.com`.

---

## 4. Cloudflare R2 Media Storage (Free Tier)
1. Go to **Cloudflare Dashboard** → **R2 Object Storage**.
2. Create bucket: `onewishes-media`.
3. Enable CORS policy allowing `https://onewishes.com`.
4. R2 provides 10 GB free storage and zero egress fees.
