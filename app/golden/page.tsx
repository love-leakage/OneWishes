'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ArrowRight, Star } from 'lucide-react';

export default function GoldenPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-12 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-widest">
        <Shield className="w-3.5 h-3.5" />
        <span>Tier II • Artificial Scarcity</span>
      </div>

      <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white">
        Golden Wish <span className="text-indigo-400">(3 / Lifetime)</span>
      </h1>

      <p className="text-slate-300 text-base max-w-2xl mx-auto leading-relaxed">
        Golden Wishes are strictly limited to exactly 3 per user account for a lifetime. Reserved for the people who defined your life.
      </p>

      <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 text-left space-y-4">
        <h3 className="font-serif text-xl font-semibold text-white">Server-Side Scarcity Enforcement</h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Every Golden wish claim is atomically locked and decremented in PostgreSQL (`claim_golden_wish()`). You cannot create a 4th Golden Wish from a new browser or device once your 3 credits are used.
        </p>
      </div>

      <div>
        <Link
          href="/#create-section"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-indigo-500 text-white font-bold text-sm hover:scale-105 transition-transform"
        >
          <span>Claim a Golden Wish</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
