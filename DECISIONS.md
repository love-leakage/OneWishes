# Architecture Decisions

## ADR-001
Decision: Use Supabase for the database.
Reason: Free Postgres + instant API + RLS, no server to manage.

## ADR-002
Decision: Deploy to Vercel instead of GitHub Pages.
Reason: Faster builds, preview deployments, env variable support; once
GitHub is connected, edits auto-deploy the same way GitHub Pages would.

## ADR-003
Decision: Use Cloudflare R2 for media storage instead of Supabase Storage.
Reason: Keep media traffic off Supabase's free bandwidth cap, and R2 has
zero egress fees — cheaper to scale than Supabase Storage or AWS S3 long
term.

## ADR-004
Decision: Considered AWS S3 for storage, chose R2 instead.
Reason: S3's free tier is only 12 months and has egress charges after;
R2's free tier has no time limit and no egress fees. (Note: S3 would have
been better for the user's own AWS learning practice — revisit if that
becomes a priority over cost.)

## ADR-005
Decision: Domain purchased is onewishes.com, not thewishone.com.
Reason: thewishone.com concept name kept for reference, but onewishes.com
was available, cheaper to reason about, and still communicates "one wish"
scarcity. Final branding (WishVault vs OneWishes) still pending.

## ADR-007
Decision: Considered Google Drive for media storage, chose Cloudflare R2.
Reason: Drive requires OAuth per uploader or dumps all files into one
personal account's 15GB quota (shared with Gmail) — not built for public,
anonymous uploads. R2 accepts direct uploads with no per-visitor login and
is CDN-backed for speed.

## ADR-008
Decision: Rebranded site copy from "WishVault" to "ONEWISHES" to match the
purchased domain (onewishes.com), and redesigned to a black-and-white,
text-first typographic style (no color, no icons/illustration).
Reason: User requested a distinct visual direction and brand/domain
consistency.

## ADR-009
Decision: Fresh-start reset of the Supabase database — dropped the old demo
`wishes` table and rebuilt schema with `profiles`, `wishes`, and
`spotlight_bookings`, plus an atomic `claim_golden_wish()` function.
Reason: The old schema only tracked Golden Wish usage in localStorage,
which was not a real limit (ADR-006). All previously created demo wishes
were deleted in this reset — expected, since it was placeholder data.

## ADR-010
Decision: Use Supabase Auth with email magic links, not phone OTP.
Reason: Phone OTP requires a paid third-party SMS provider (Twilio, etc.) —
not compatible with the free-tier-only requirement. Email magic links are
free on Supabase's free tier and still give a real, verified identity to
enforce the Golden Wish (max 3) and Spotlight (one booking per date) limits
server-side.


