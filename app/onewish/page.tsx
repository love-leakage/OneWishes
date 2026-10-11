'use client';

import React from 'react';
import Link from 'next/link';

export default function OnewishPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-32 space-y-16 text-center">
      <div className="inline-block px-4 py-2 border border-[#72897e]/40 text-[#72897e] text-xs font-bold uppercase tracking-widest bg-[#1a2621]">
        Tier II • Front-Page Spotlight
      </div>

      <h1 className="font-serif text-5xl sm:text-6xl font-bold text-[#f3eee3] uppercase tracking-tighter">Onewish Spotlight</h1>

      <p className="text-[#a6b6ad] text-lg max-w-2xl mx-auto leading-relaxed uppercase tracking-wider">
        Claim the front-page spotlight for a specific calendar date worldwide. Only 1 slot is allowed per date globally.
      </p>

      <div className="p-12 border border-[#2a3d35] bg-[#1a2621] text-left space-y-6 max-w-3xl mx-auto shadow-[8px_8px_0px_0px_rgba(114,137,126,0.15)]">
        <h3 className="font-serif text-2xl font-bold text-[#f3eee3] uppercase tracking-widest">Atomic 1-Slot-Per-Date Guarantee</h3>
        <p className="text-sm text-[#a6b6ad] leading-relaxed uppercase tracking-widest">
          Database `onewish_bookings` table enforces a strict SQL `UNIQUE(booking_date)` constraint. Once a date is booked, no one else in the world can take it.
        </p>
      </div>

      <div className="pt-8">
        <Link
          href="/#create-section"
          className="inline-block px-10 py-5 bg-[#f3eee3] text-[#141f1b] font-bold text-sm uppercase tracking-widest hover:bg-white transition-colors shadow-[4px_4px_0px_0px_rgba(114,137,126,0.3)]"
        >
          Book Your Date
        </Link>
      </div>
    </div>
  );
}
