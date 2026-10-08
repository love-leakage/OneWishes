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

## Security & API Key Governance
- **Zero Hardcoded Secrets**: NEVER hardcode API keys, secret tokens, private keys, or passwords anywhere in source code or Git commits — whether in plain text or obfuscated (e.g. base64, hex, XOR).
- **Server Environment Variables Only**: All server-side API keys (e.g. `RESEND_API_KEY`, `R2_SECRET_ACCESS_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) MUST strictly be read from environment variables (`process.env.KEY_NAME`).
- **Client-Side Limits**: Only public/publishable keys (such as Supabase Anon Key) protected by Row Level Security (RLS) policies are permitted in client-side code (`index.html`).
- **Git Safeguards**: All `.env*` files containing credentials must be listed in `.gitignore` and never committed to version control.
- **Database RLS Enforcement**: Any new table needs explicit RLS policies before going live — no table should be created open by default.
- **Server-Side Scarcity Enforcement**: Scarcity rules (Golden Wish count, Spotlight date) must be enforced with database constraints/RPC, never client-side only.

## Infra
- Keep every service (Supabase, Vercel, Cloudflare R2) on free tier unless
  explicitly told otherwise.
- Don't add a new cloud service without checking if an existing one
  (Supabase, R2) already covers the need.

## Git (once GitHub is connected)
- Small, descriptive commits.
- Test on the Vercel preview URL before promoting to production.
