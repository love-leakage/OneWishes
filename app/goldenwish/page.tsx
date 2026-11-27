'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Stamp, ArrowRight } from 'lucide-react';

export default function GoldenPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 space-y-12 text-center">
      
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1 border border-[#3a2c20] text-[#c5a059] text-[10px] font-courier uppercase tracking-[0.25em] bg-[#16120e] rounded-full">
        <Sparkles className="w-3 h-3 text-[#c5a059]" />
        <span>SACRED COVENANT • 3 CANISTERS PER HUMAN LIFETIME</span>
      </div>

      <div className="space-y-3">
        <h1 className="font-garamond text-4xl sm:text-6xl italic text-[#f7f2e7]">
          The 35mm Gold Roll Keepsake
        </h1>
        <p className="text-[#a89684] text-xs sm:text-sm font-courier uppercase tracking-widest max-w-2xl mx-auto leading-relaxed">
          In a world of infinite disposable messages, scarcity is the only honest proof of reverence. You receive exactly 3 sacred cylinders for your entire existence.
        </p>
      </div>

      {/* Parchment Box */}
      <div className="vintage-parchment rounded-sm p-8 sm:p-12 text-left space-y-6 max-w-3xl mx-auto shadow-2xl border border-[#c4a882] relative">
        <div className="absolute top-3 left-3 w-4 h-4 vintage-brass-bracket-tl pointer-events-none" />
        <div className="absolute top-3 right-3 w-4 h-4 vintage-brass-bracket-tr pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-4 h-4 vintage-brass-bracket-bl pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-4 h-4 vintage-brass-bracket-br pointer-events-none" />

        <div className="flex items-center justify-between border-b border-[#d8c3a3] pb-4">
          <span className="font-courier text-[10px] uppercase tracking-[0.25em] text-[#7d1d23] font-bold">
            ARTICLE I • THE SACRED CONSTRAINTS
          </span>
          <div className="w-8 h-8 rounded-full wax-seal-emboss flex items-center justify-center text-[#f7f2e7] text-xs font-bold shadow-md">
            ✦
          </div>
        </div>

        <h3 className="font-garamond text-2xl sm:text-3xl italic text-[#231916]">
          The Irreversible Covenant of the Vault
        </h3>
        <p className="font-courier text-xs text-[#523d2f] leading-relaxed uppercase tracking-wider">
          Every Golden Roll claim is an unbreakable covenant inscribed in our immutable chronicle registry. Once you seal your 3 exposures, the darkroom canister is permanently locked to prevent further generation from any device or address on Earth.
        </p>
        <p className="font-courier text-xs text-[#7d1d23] font-bold uppercase tracking-wider">
          ✦ Reserved exclusively for the 3 souls who shaped your existence.
        </p>
      </div>

      <div className="pt-4">
        <Link
          href="/#darkroom-studio"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#c5a059] hover:bg-[#d4b069] text-[#0b0908] font-courier font-bold text-xs uppercase tracking-widest transition-all shadow-lg rounded"
        >
          <Stamp className="w-4 h-4 text-[#0b0908]" />
          <span>Inscribe a Golden Keepsake</span>
          <ArrowRight className="w-4 h-4 text-[#0b0908]" />
        </Link>
      </div>
    </div>
  );
}
