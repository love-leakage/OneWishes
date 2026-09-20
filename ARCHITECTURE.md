# Architecture

## Frontend
Single static `index.html` (HTML/CSS/vanilla JS) — no framework, no build
step. Chosen for simplicity and free static hosting.

## Backend
None (serverless) — the frontend talks directly to Supabase using the
publishable/anon key, protected by Row Level Security (RLS) policies.

## Database
Supabase (PostgreSQL), project `onewishes`, region ap-south-1 (Mumbai).

## File Storage
Cloudflare R2 (photos/video for wishes) — chosen over Supabase Storage to
keep media traffic off Supabase's free-tier bandwidth limit, and over AWS S3
for zero egress fees.

## Authentication
Not yet implemented. Required before Golden Wish limits can be enforced
per-identity rather than per-browser. Planned: Supabase Auth with phone OTP.

## Hosting / Deployment
Vercel, deployed directly (not yet connected to GitHub — see DECISIONS.md).

## Domain
onewishes.com (purchased via Hostinger, DNS to be pointed at Vercel).

## Data Flow
```
User's browser
   → index.html (static, served by Vercel)
   → Supabase client (JS, anon key)
       → PostgreSQL (wishes table, RLS-protected)
   → Cloudflare R2 (media uploads, once added)
```

## Key Tables
- `wishes` — id, tier, from_name, to_name, message, created_at
  - RLS: anyone can INSERT, anyone can SELECT by id (needed for public
    shareable links)
- `spotlight_bookings` (planned) — date (UNIQUE), wish_id
- `profiles` (planned, needs auth) — id, phone, golden_used (int, max 3)

## Architectural Rules
- No secrets in frontend code beyond the Supabase *publishable* key, which
  is safe by design (protected by RLS, not a secret).
- Scarcity limits (Golden Wish count, Spotlight date uniqueness) must be
  enforced by database constraints/atomic SQL, never by client-side JS or
  localStorage alone.
- Keep the site a single static file for as long as possible — only
  introduce a framework/build step if a feature genuinely requires it.
