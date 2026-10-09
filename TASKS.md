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

## Phase 3: Real Scarcity Enforcement & Admin Management
- [x] Add Supabase Auth (Google OAuth & Email Magic Link)
- [x] Create `profiles` table with `golden_used` column
- [x] Enforce Golden Wish limit via atomic SQL RPC (`claim_golden_wish`)
- [x] Create `spotlight_bookings` table with `UNIQUE(booking_date)` constraint
- [x] Build Spotlight booking flow using that constraint
- [x] Admin Dashboard (/admin) for rylyoga@gmail.com with live user metrics, username, email & usage table
- [x] Tier Showcase Galleries (/spark, /golden, /neverfade) for public wish browsing with search filter
- [x] Wish View Tracking (views_count + increment_wish_views RPC)
- [x] Author Wish Editing & Deletion on /history dashboard
- [x] Login welcome notification toast & email status

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

## Phase 7: UI Overhaul & Profile System
- [ ] UI Redesign: Implement Kinetic Typography & Text Masking style. Use only the logo's object for branding and animate it.
- [ ] User Onboarding: First-time sign-in requires users to create a unique username.
- [ ] User Profile UI: Show ONLY the profile image initially, NO name.
- [ ] Instagram Integration: Allow users to link their Instagram profile in their OneWishes profile. Add redirects to Instagram on clicking.
- [ ] Wish Creation (Sender): Allow sending wishes using the receiver's unique username or name.
- [ ] Media Support: Add image and video support to wishes, making them visible in the preview.
- [ ] Onewish Link Generation: Onewish links must include the booked date (e.g. `onewishes.com/[booked-date]`).
- [ ] Onewish Homepage Display: The homepage must exclusively display the Onewish of the current day.
- [ ] Likes: Add a like option directly when clicking on a wish.
- [ ] Profile Redirects: Clicking a receiver or sender username anywhere redirects to `onewishes.com/[username]`.
- [ ] Golden Wish Link: Golden wish links must format as `onewishes.com/golden/[username]`.
