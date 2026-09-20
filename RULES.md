# Development Rules

## General
- Keep the site a single static `index.html` unless a task genuinely
  requires a framework — don't introduce build tooling casually.
- Reuse existing CSS variables and classes (see DESIGN.md) instead of
  inventing new colors/components per feature.
- Do not modify unrelated sections when implementing one feature.

## Before Coding
- Read PRD.md, ARCHITECTURE.md, and DESIGN.md first.
- Check TASKS.md for what's already planned before adding new scope.
- Check DECISIONS.md before changing a technology choice already made.

## UI
- Follow DESIGN.md exactly (colors, fonts, one-hero-animation rule).
- Maintain responsive behavior at the 860px breakpoint.
- Include loading and error states for anything that talks to Supabase.

## Security
- Never put a Supabase *service role* key or any secret key in this file —
  only the publishable/anon key belongs here.
- Any new table needs an explicit RLS policy before going live — no table
  should be created "open" by default.
- Scarcity rules (Golden Wish count, Spotlight date) must be enforced with
  database constraints, never client-side only.

## Infra
- Keep every service (Supabase, Vercel, Cloudflare R2) on free tier unless
  explicitly told otherwise.
- Don't add a new cloud service without checking if an existing one
  (Supabase, R2) already covers the need.

## Git (once GitHub is connected)
- Small, descriptive commits.
- Test on the Vercel preview URL before promoting to production.
