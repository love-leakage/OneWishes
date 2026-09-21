# Tasks

## Phase 1: Setup
- [x] Static site scaffolded (index.html)
- [x] Supabase project created (ap-south-1)
- [x] `wishes` table created with RLS
- [x] Deployed to Vercel
- [x] Domain purchased (onewishes.com)
- [ ] Connect GitHub repo to Vercel for auto-deploy on push
- [ ] Point onewishes.com DNS at Vercel

## Phase 2: Core Wish Flow
- [x] Create a Spark Wish → get shareable link
- [x] View a wish from its link (cross-device, via Supabase)
- [x] Clean HTML5 path routing (/w/slug, /neverfade/date, /history) without hash tags
- [x] Vercel SPA Rewrites (vercel.json)
- [x] Basic form validation (required fields)
- [ ] Inline field-level error messages (currently status line)

## Phase 3: Real Scarcity Enforcement
- [x] Add Supabase Auth (Email Magic Link / OTP)
- [x] Create `profiles` table with `golden_used` column
- [x] Enforce Golden Wish limit via atomic SQL RPC (`claim_golden_wish`)
- [x] Create `spotlight_bookings` table with `UNIQUE(booking_date)` constraint
- [x] Build Spotlight booking flow using that constraint

## Phase 4: Media
- [ ] Enable Cloudflare R2 (waiting on user to enable via dashboard)
- [ ] Create R2 bucket (`onewishes-media`)
- [ ] Add photo upload to Spark/Golden Wish creation form
- [ ] Add image display on the view-wish page

## Phase 5: Pre-Launch
- [x] Favicon
- [x] Meta title/description + OG tags
- [x] robots.txt + sitemap.xml
- [x] Custom 404 page
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Spam protection (Cloudflare Turnstile — free)
- [ ] Analytics (optional)

## Phase 6: Rebrand
- [x] Decide final name: ONEWISHES (domain: onewishes.com)
- [x] Update all UI copy, title tags, auxiliary files, and docs to ONEWISHES
