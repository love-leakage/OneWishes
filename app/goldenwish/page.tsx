'use client';

import React from 'react';
import Link from 'next/link';

export default function GoldenPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-32 space-y-16 text-center">
      <div className="inline-block px-4 py-2 border border-[#e4c067]/40 text-[#e4c067] text-xs font-bold uppercase tracking-widest bg-[#0c0d0d]">
        Tier I • Artificial Scarcity
      </div>

      <h1 className="font-serif text-5xl sm:text-6xl font-bold text-[#f5f2eb] uppercase tracking-tighter">
        Golden Wish <span className="text-[#e4c067]">(3 / Lifetime)</span>
      </h1>

      <p className="text-[#a1b0a8] text-lg max-w-2xl mx-auto leading-relaxed uppercase tracking-wider">
        Golden Wishes are strictly limited to exactly 3 per user account for a lifetime. Reserved for the people who defined your life.
      </p>

      <div className="p-12 border border-[#1a1d1b] bg-[#0c0d0d] text-left space-y-6 max-w-3xl mx-auto shadow-xl">
        <h3 className="font-serif text-2xl font-bold text-[#f5f2eb] uppercase tracking-widest">Server-Side Scarcity Enforcement</h3>
        <p className="text-sm text-[#a1b0a8] leading-relaxed uppercase tracking-widest">
          Every Golden wish claim is atomically locked and decremented in PostgreSQL (`claim_golden_wish()`). You cannot create a 4th Golden Wish from a new browser or device once your 3 credits are used.
        </p>
      </div>

      <div className="pt-8">
        <Link
          href="/#create-section"
          className="inline-block px-10 py-5 bg-[#e4c067] text-[#050505] font-bold text-sm uppercase tracking-widest hover:bg-[#edd48d] transition-colors shadow-lg hover:shadow-[0_0_25px_rgba(228,192,103,0.3)]"
        >
          Claim a Golden Wish
        </Link>
      </div>
    </div>
  );
}
