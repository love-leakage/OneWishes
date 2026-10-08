# ONEWISHES — Master Project Blueprint (திட்ட விவரக் குறிப்பு)

## 1. Project Overview & Architecture (திட்டக் கண்ணோட்டம் & கட்டமைப்பு)
OneWishes (`onewishes.com`) is a Next-Gen Full-Stack Dynamic Web Application designed with artificial scarcity at its core. It combines modern UI animations, secure user identity management, zero-cost media storage, transactional emails, and payment gateway capabilities.

```
[ User Browser / Client ]
           │
           ▼
[ Cloudflare Edge / Vercel ]
           │
     ┌─────┴─────────────────────────┐
     ▼                               ▼
[ Next.js Frontend ]        [ Next.js API Routes ]
(Tailwind + Framer Motion)           │
                                     ├──► [ Supabase (PostgreSQL & Auth) ]
                                     ├──► [ Cloudflare R2 (Media/Images) ]
                                     ├──► [ Resend (Welcome Emails) ]
                                     └──► [ Razorpay (Payment Processing) ]
```

---

## 2. Core Tech Stack (தொழில்நுட்ப அடுக்கு)

| அடுக்கு (Layer) | தொழில்நுட்பம் / சேவை | பயன்பாடு |
|---|---|---|
| **Language** | TypeScript | Type-safe, பிழைகளற்ற தொழில்முறை குறியீட்டு அமைப்பு |
| **Framework** | Next.js (React) | App Router, Server Components மற்றும் Serverless API Routes |
| **Styling** | Tailwind CSS | வேகமான, ரெஸ்பான்சிவ் மாடர்ன் டார்க்-தீம் UI |
| **Animations** | Framer Motion | ஸ்மூத்தான Page Transitions, Scroll & Hover அனிமேஷன்கள் |
| **Database & Auth** | Supabase | PostgreSQL டேட்டாபேஸ் மற்றும் பாதுகாப்பான User Authentication |
| **File Storage** | Cloudflare R2 | படங்கள், மீடியா கோப்புகளை கட்டணமின்றி சேமித்து வைக்க |
| **Email Service** | Resend | புதிய பயனர்களுக்கு தானியங்கி Welcome & Wish Confirmation Email |
| **Payment Gateway** | Razorpay | UPI, Cards, Netbanking வழியாக கட்டணம் பெற |
| **Hosting & DNS** | Cloudflare Pages / Vercel | 100% வரம்பற்ற பேண்ட்விட்த் கொண்ட இலவச கமர்ஷியல் ஹோஸ்டிங் |

---

## 3. Brand Identity & Design System (பிராண்ட் மற்றும் லேஅவுட் வடிவமைப்பு)

- **Theme & Colors**:
  - Dark Slate Base: `#020617` / `#0f172a`
  - Accent Gradients: `#6366f1` (Indigo) to `#f43f5e` (Rose)
  - Gold Accent: `#e4c067` (Keepsake Spark)
- **Monogram Logo**:
  - `OW` Monogram — Circle `O` framing an intertwined, modern minimalist `W`.
- **Favicon**:
  - High-resolution SVG favicon (`icon.svg`) for all mobile & desktop browser tabs.
- **Typography**:
  - `Inter` for clean UI text, `Fraunces` / `Georgia` for elegant serif headlines.

---

## 4. Zero-Cost Business Model (100% Free Tier Breakdown)

ஆரம்பக்கட்ட வணிக பயன்பாட்டிற்கு எவ்வித முன் பணமும் இன்றி முழுமையாக இயங்கும் கட்டமைப்பு:

| தளம் / சேவை | இலவச வரம்பு (Free Limit) | ஆரம்ப முதலீடு |
|---|---|---|
| **Cloudflare Pages / Vercel** | Unlimited Bandwidth, 100,000 Function requests/day | ₹0 |
| **Cloudflare R2** | 10 GB Storage, 1,000,000 Read operations/month | ₹0 |
| **Supabase** | 500 MB Database, 50,000 Monthly Active Users | ₹0 |
| **Resend** | 3,000 Emails/month (100 emails/day) | ₹0 |
| **Razorpay** | Setup fee இல்லை, பராமரிப்பு கட்டணம் இல்லை (வெற்றிபெறும் பரிவர்த்தனைகளுக்கு மட்டும் ~2%) | ₹0 |

---

## 5. Implementation Roadmap (படிப்படியான திட்டம்)

### Phase 1: Frontend Setup & UI Foundations
- [ ] Initialize Next.js App Router, Tailwind CSS, and Framer Motion.
- [ ] Create Brand Logo (`OW` Monogram SVG) and modern layout header/footer.
- [ ] Build interactive homepage, Hero section, and tier cards (Spark, Golden, Neverfade).

### Phase 2: Backend & Database Schema
- [ ] Connect Supabase PostgreSQL database.
- [ ] Execute `schema.sql` (Tables: `profiles`, `wishes`, `neverfade_bookings`).
- [ ] Setup Supabase Auth (Email OTP Magic Link & Google OAuth).

### Phase 3: Automated Email Communications
- [ ] Configure Resend API route (`/api/send-email`).
- [ ] Automatic Welcome email triggered upon user sign-up.
- [ ] Automatic Wish confirmation email sent to wish creators.

### Phase 4: Payment Gateway Integration (Razorpay)
- [ ] Setup Razorpay Test & Production Mode API credentials.
- [ ] Create `/api/create-razorpay-order` serverless route.
- [ ] Implement Razorpay Checkout popup for Spotlight date bookings.
- [ ] Implement payment verification webhook (`/api/verify-payment`).

### Phase 5: Production Deployment & Custom Domain
- [ ] Connect GitHub repository to Cloudflare Pages / Vercel.
- [ ] Configure `onewishes.com` DNS records in Cloudflare DNS.
- [ ] Live verification of end-to-end user flows.
