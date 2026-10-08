# Architecture Overview

For the detailed Tamil/English Master Blueprint, see [PROJECT_BLUEPRINT.md](file:///c:/Users/acer/Downloads/files/PROJECT_BLUEPRINT.md).

## Frontend
Next.js (React App Router) with Tailwind CSS and Framer Motion for smooth micro-animations.

## Serverless Backend & API Routes
Next.js Serverless API Routes (`/api/*`) deployed on Vercel / Cloudflare Pages Edge network.

## Database & Auth
Supabase (PostgreSQL), project `onewishes`, with Supabase Auth (Email OTP Magic Link & Google OAuth) and Row Level Security (RLS).

## File Storage
Cloudflare R2 Object Storage (`onewishes-media`) — zero egress fees for uploaded images and media.

## Transactional Emails
Resend API (`welcome@onewishes.com`) integrated into serverless endpoint `/api/send-email.js` for automated welcome and wish notification emails.

## Payment Gateway
Razorpay SDK integration for UPI, Credit/Debit Cards, and Netbanking for Spotlight date bookings and premium features.

## Hosting & DNS
Vercel / Cloudflare Pages connected to GitHub `main` branch with auto-deploy to custom domain `onewishes.com`.

## Data Flow
```
User's browser
   → Next.js Frontend (Tailwind + Framer Motion)
   → Serverless API Routes (/api/*)
       → Supabase (PostgreSQL + RLS + Auth)
       → Cloudflare R2 (Media Storage)
       → Resend API (Emails)
       → Razorpay API (Payments)
```

## Key Architectural Rules
- Zero hardcoded secrets in frontend or backend code. All API keys (`RESEND_API_KEY`, `R2_SECRET_ACCESS_KEY`) must strictly come from environment variables.
- Scarcity rules (Golden Wish count max 3, Spotlight date uniqueness 1 per day) must be enforced server-side via PostgreSQL constraints & RPC functions.
