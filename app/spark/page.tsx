'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Check } from 'lucide-react';

export default function SparkPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-12 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold uppercase tracking-widest">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Tier I • Unlimited Free Wishes</span>
      </div>

      <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white">Spark Wish</h1>

      <p className="text-slate-300 text-base max-w-2xl mx-auto leading-relaxed">
        Spark wishes are free, instant, and private shareable links. Send thoughtful messages to anyone without any lifetime limits.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-2">
          <Check className="w-5 h-5 text-amber-400" />
          <h4 className="font-semibold text-white text-sm">100% Free Forever</h4>
          <p className="text-xs text-slate-400">No hidden costs or restrictions.</p>
        </div>
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-2">
          <Check className="w-5 h-5 text-amber-400" />
          <h4 className="font-semibold text-white text-sm">Private & Shareable</h4>
          <p className="text-xs text-slate-400">Unique link only viewable by recipient.</p>
        </div>
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-2">
          <Check className="w-5 h-5 text-amber-400" />
          <h4 className="font-semibold text-white text-sm">Instant Delivery</h4>
          <p className="text-xs text-slate-400">Share via WhatsApp, SMS, or Email.</p>
        </div>
      </div>

      <div className="pt-4">
        <Link
          href="/#create-section"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-amber-400 text-black font-bold text-sm hover:scale-105 transition-transform"
        >
          <span>Create Spark Wish Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
