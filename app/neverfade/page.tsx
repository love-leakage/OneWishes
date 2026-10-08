'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, Sparkles } from 'lucide-react';

export default function NeverfadePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-12 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-semibold uppercase tracking-widest">
        <Calendar className="w-3.5 h-3.5" />
        <span>Tier III • Front-Page Spotlight</span>
      </div>

      <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white">Neverfade Spotlight</h1>

      <p className="text-slate-300 text-base max-w-2xl mx-auto leading-relaxed">
        Claim the front-page spotlight for a specific calendar date worldwide. Only 1 slot is allowed per date globally.
      </p>

      <div className="p-8 rounded-3xl bg-gradient-to-r from-rose-950/40 to-slate-900 border border-rose-500/30 text-left space-y-4">
        <h3 className="font-serif text-xl font-semibold text-white">Atomic 1-Slot-Per-Date Guarantee</h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Database `neverfade_bookings` table enforces a strict SQL `UNIQUE(booking_date)` constraint. Once a date is booked, no one else in the world can take it.
        </p>
      </div>

      <div>
        <Link
          href="/#create-section"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-rose-500 text-white font-bold text-sm hover:scale-105 transition-transform"
        >
          <span>Book Your Date</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
