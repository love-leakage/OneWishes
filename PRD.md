# Product Requirements Document

## Product
OneWishes (domain: onewishes.com)

## Problem
Digital wishes have lost meaning — a WhatsApp forward or a 24-hour Instagram
story is the norm, and sending the same "HBD bro 🎂" to 100 people makes the
wish worthless to the receiver.

## Target Users
Anyone who wants to send a wish (birthday, anniversary, achievement) to
someone that actually feels meaningful — not a mass broadcast.

## Goal
Make emotional weight a designed-in product feature, using scarcity: the
fewer wishes you're allowed to send, the more each one matters.

## Core Features (Tiers)
1. **Spark Wish** — unlimited, free. Private link, message, optional
   photo/music.
2. **Golden Wish** — 3 per lifetime, enforced per verified identity (not per
   device). For the people who defined your life.
3. **Spotlight** — 1 slot per day, worldwide. Full front-page takeover for a
   day.

## MVP (current build)
- [x] Create a Spark Wish (name, message) → shareable link
- [x] View a wish via link (works across devices, stored in Supabase)
- [ ] Phone/OTP login (needed to enforce Golden Wish limit for real)
- [ ] Photo upload (Cloudflare R2)
- [ ] Golden Wish limit enforced server-side via SQL constraint
- [ ] Spotlight booking with atomic date-uniqueness (SQL UNIQUE constraint)

## Out of Scope (v1)
- Video uploads
- Payments / monetization
- Multi-language UI
- Mobile app (web-only for now)
- Analytics / CAPTCHA (add before public launch, not in v1 build)

## Success Criteria
A user should be able to:
1. Open the site and understand the three tiers in under 10 seconds
2. Create a Spark Wish and get a working link
3. Send that link to someone, who opens it on a different device and sees it
4. Be blocked from creating a 4th Golden Wish, even from a new browser/device
5. Be blocked from booking a Spotlight date someone else already booked,
   even under simultaneous requests
