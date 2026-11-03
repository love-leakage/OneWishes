'use client';

import React from 'react';
import Link from 'next/link';

export default function OnewishPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-32 space-y-16 text-center">
      <div className="inline-block px-4 py-2 border border-[#ff6b8b]/40 text-[#ff758c] text-xs font-bold uppercase tracking-widest bg-[#0d0910] shadow-[0_0_16px_rgba(255,107,139,0.2)]">
        Tier II • Front-Page Spotlight
      </div>

      <h1 className="font-serif text-5xl sm:text-6xl font-bold text-[#fbf8f5] uppercase tracking-tighter">Onewish Spotlight</h1>

      <p className="text-[#b5a5b5] text-lg max-w-2xl mx-auto leading-relaxed uppercase tracking-wider">
        Claim the front-page spotlight for a specific calendar date worldwide. Only 1 slot is allowed per date globally.
      </p>

      <div className="p-12 border border-[#26182a] bg-[#0d0910] text-left space-y-6 max-w-3xl mx-auto shadow-2xl">
        <h3 className="font-serif text-2xl font-bold text-[#fbf8f5] uppercase tracking-widest">Atomic 1-Slot-Per-Date Guarantee</h3>
        <p className="text-sm text-[#b5a5b5] leading-relaxed uppercase tracking-widest">
          Database `onewish_bookings` table enforces a strict SQL `UNIQUE(booking_date)` constraint. Once a date is booked, no one else in the world can take it.
        </p>
      </div>

      <div className="pt-8">
        <Link
          href="/#create-section"
          className="inline-block px-10 py-5 bg-gradient-to-r from-[#ff6b8b] to-[#f84f9c] text-white font-bold text-sm uppercase tracking-widest hover:opacity-95 transition-all shadow-[0_0_25px_rgba(255,107,139,0.35)]"
        >
          Book Your Date
        </Link>
      </div>
    </div>
  );
}
