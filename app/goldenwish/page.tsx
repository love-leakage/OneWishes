'use client';

import React from 'react';
import Link from 'next/link';

export default function GoldenPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-32 space-y-16 text-center">
      <div className="inline-block px-4 py-2 border border-[#ff4d8d]/40 text-[#ff4d8d] text-xs font-bold uppercase tracking-widest bg-[#0d0910] shadow-[0_0_16px_rgba(248,79,156,0.2)]">
        Tier I • Infinite Artificial Scarcity
      </div>

      <h1 className="font-serif text-5xl sm:text-6xl font-bold text-[#fbf8f5] uppercase tracking-tighter">
        Golden Wish <span className="text-gradient-rose">(3 / Lifetime)</span>
      </h1>

      <p className="text-[#b5a5b5] text-lg max-w-2xl mx-auto leading-relaxed uppercase tracking-wider">
        Golden Wishes are strictly limited to exactly 3 per user account for a lifetime. Reserved for the people who defined your life.
      </p>

      <div className="p-12 border border-[#26182a] bg-[#0d0910] text-left space-y-6 max-w-3xl mx-auto shadow-2xl">
        <h3 className="font-serif text-2xl font-bold text-[#fbf8f5] uppercase tracking-widest">Server-Side Scarcity Enforcement</h3>
        <p className="text-sm text-[#b5a5b5] leading-relaxed uppercase tracking-widest">
          Every Golden wish claim is atomically locked and decremented in PostgreSQL (`claim_golden_wish()`). You cannot create a 4th Golden Wish from a new browser or device once your 3 credits are used.
        </p>
      </div>

      <div className="pt-8">
        <Link
          href="/#create-section"
          className="inline-block px-10 py-5 bg-gradient-to-r from-[#ff5376] to-[#f84f9c] text-white font-bold text-sm uppercase tracking-widest hover:opacity-95 transition-all shadow-[0_0_25px_rgba(248,79,156,0.35)]"
        >
          Claim a Golden Wish
        </Link>
      </div>
    </div>
  );
}
