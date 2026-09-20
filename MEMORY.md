# Project Memory

## Current Status
Fresh-start reset done: Supabase schema rebuilt with real auth-backed
scarcity enforcement (profiles + claim_golden_wish RPC + spotlight_bookings
unique-date constraint). Frontend rebuilt with email magic-link sign-in.
Cloudflare R2 still blocked on the user enabling it via dashboard. GitHub
repo not created yet — this remains a manual step (no GitHub connector
available to Claude in this environment).

## Completed
- Fresh Supabase schema: profiles, wishes, spotlight_bookings, claim_golden_wish()
- Email magic-link auth wired into the frontend
- Golden Wish limit now enforced server-side (atomic RPC, not localStorage)
- Spotlight booking now enforced via UNIQUE(booking_date) constraint
- Black & white typographic redesign with marquee banner, expandable tier
  details, and an original poetry section
- Domain onewishes.com added to Vercel project (DNS pointing pending on
  Spaceship)

## Known Issues
- Cloudflare R2 not yet enabled (blocked on user's Cloudflare dashboard step)
- GitHub repo not created — Claude cannot create/push GitHub repos in this
  environment (no connector for it); this is a manual step for the user
- Vercel deploy_to_vercel tool has hit session limits repeatedly — once
  GitHub is connected to the Vercel project, this stops being an issue
  since deploys happen via git push instead
- Photo/video upload not yet built (waiting on R2)

## Next Step
1. User enables R2 in Cloudflare dashboard → create bucket → wire upload
2. User creates GitHub repo, uploads index.html → connects it to the
   existing Vercel project (Settings → Git)
3. Point onewishes.com DNS (A + CNAME records) at Vercel, on Spaceship
4. Add Turnstile spam protection (free, already on Cloudflare) before wider launch
