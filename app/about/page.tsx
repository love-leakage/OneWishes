import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Sparkles, Heart, ShieldCheck, Mail, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About OneWishes — The Philosophy of Artificial Scarcity',
  description: 'Why OneWishes limits how many wishes you can send. In a world of disposable messages, scarcity is the ultimate proof of love.',
};

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-24">
      {/* Editorial Header */}
      <div className="space-y-6 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#ff4d8d]/40 bg-[#0d0910] text-xs font-bold uppercase tracking-widest text-[#ff4d8d] shadow-[0_0_16px_rgba(248,79,156,0.2)]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Manifesto</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl font-bold uppercase tracking-tight text-[#fbf8f5] leading-tight">
          A Wish Worth Sending.
        </h1>

        <p className="text-base sm:text-lg text-[#b5a5b5] uppercase tracking-widest font-mono leading-relaxed">
          In a world of infinite digital noise, scarcity is the only honest proof of care.
        </p>
      </div>

      {/* Main Philosophy Narrative */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center border-t border-[#211624] pt-16">
        <div className="space-y-6 text-[#b5a5b5] text-sm sm:text-base leading-relaxed">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#fbf8f5] uppercase tracking-wide">
            The Death of the Birthday Message
          </h2>
          <p>
            Every single day, billions of automated notifications fire across WhatsApp, Instagram, and social media. You receive fifty copy-pasted "HBD!" messages from people you haven’t spoken to in three years.
          </p>
          <p>
            When sending a message costs zero effort, zero thought, and zero consequence, <strong className="text-[#fbf8f5]">receiving it means nothing</strong>.
          </p>
          <p>
            OneWishes was born out of a rebellion against infinite abundance. We asked a simple question: <em className="text-[#ff4d8d] not-italic font-serif">What if wishing someone actually cost you something you can never get back?</em>
          </p>
        </div>

        <div className="p-8 sm:p-10 bg-[#0d0910] border border-[#26182a] space-y-6 shadow-2xl relative">
          <div className="text-xs uppercase tracking-widest font-bold text-[#ff4d8d] flex items-center gap-2">
            <span>✦</span> The Core Axiom
          </div>
          <blockquote className="font-serif text-xl sm:text-2xl text-[#fbf8f5] italic leading-relaxed">
            "If you can wish everyone, you have wished no one. If you can only wish three people in your lifetime, you have given them a part of your soul."
          </blockquote>
          <div className="pt-4 border-t border-[#211624] text-xs font-mono uppercase text-[#7a6a7a]">
            — OneWishes Architecture Team
          </div>
        </div>
      </div>

      {/* The Two Constraints */}
      <div className="space-y-12 border-t border-[#211624] pt-16">
        <div className="text-center space-y-3">
          <h2 className="font-serif text-3xl font-bold text-[#fbf8f5] uppercase tracking-widest">
            Engineered Scarcity
          </h2>
          <p className="text-xs font-mono uppercase tracking-widest text-[#b5a5b5]">
            Enforced cryptographically and at the database level.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 bg-[#0d0910] border border-[#ff4d8d]/30 space-y-4 shadow-[0_0_30px_rgba(248,79,156,0.1)]">
            <div className="text-xs font-bold uppercase tracking-widest text-[#ff4d8d]">
              Tier I • 3 Per Lifetime
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#fbf8f5] uppercase">
              The Golden Wish
            </h3>
            <p className="text-sm text-[#b5a5b5] leading-relaxed">
              Every verified citizen receives exactly three Golden Wishes for their entire lifetime. No subscriptions, no in-app purchases, no second chances. When you use one, it is permanently deducted via atomic PostgreSQL locks.
            </p>
            <div className="pt-4 border-t border-[#211624] text-xs font-mono text-[#ff4d8d]">
              Reserved for the 3 people who defined your existence.
            </div>
          </div>

          <div className="p-8 bg-[#0d0910] border border-[#ff6b8b]/30 space-y-4 shadow-[0_0_30px_rgba(255,107,139,0.08)]">
            <div className="text-xs font-bold uppercase tracking-widest text-[#ff758c]">
              Tier II • 1 Slot Per Calendar Date
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#fbf8f5] uppercase">
              The Onewish Spotlight
            </h3>
            <p className="text-sm text-[#b5a5b5] leading-relaxed">
              Every calendar date worldwide has exactly one slot on the front page of onewishes.com. Enforced by strict SQL UNIQUE constraints, once a date is claimed, no human on Earth can ever overwrite it.
            </p>
            <div className="pt-4 border-t border-[#211624] text-xs font-mono text-[#ff758c]">
              Etched into the global digital registry for eternity.
            </div>
          </div>
        </div>
      </div>

      {/* A Note On Our Name */}
      <div className="p-10 sm:p-14 bg-[#0d0910] border border-[#211624] text-center space-y-6">
        <div className="inline-block px-3 py-1 bg-[#050505] border border-[#ff4d8d]/35 text-[11px] font-bold uppercase tracking-widest text-[#ff4d8d]">
          A Note On Our Name
        </div>
        <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#fbf8f5] uppercase">
          "We made a mistake in our name — but don't make the mistake of leaving your memories unsaid."
        </h2>
        <p className="text-sm sm:text-base text-[#b5a5b5] max-w-2xl mx-auto leading-relaxed">
          Grammar says it should be <em>One Wish</em>. But when one soul pours everything into a single eternal keepsake, singular and plural blend into feeling. Memories don’t care about spelling rules.
        </p>
      </div>

      {/* Contact & Founding Team */}
      <div className="border-t border-[#211624] pt-16 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="font-serif text-2xl font-bold text-[#fbf8f5] uppercase">
            Have Questions or Need Direct Help?
          </h3>
          <p className="text-xs text-[#b5a5b5] uppercase tracking-wider font-mono">
            Direct Founder Inbox: <strong className="text-[#ff4d8d]">admin@onewishes.com</strong>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/contact"
            className="px-6 py-3 border border-[#241727] hover:border-[#ff4d8d] text-[#fbf8f5] text-xs font-bold uppercase tracking-widest transition-all bg-[#0d0910]"
          >
            Contact Support
          </Link>
          <Link
            href="/#create-section"
            className="px-6 py-3 bg-gradient-to-r from-[#ff5376] to-[#f84f9c] text-white text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(248,79,156,0.3)] flex items-center gap-2 hover:opacity-95"
          >
            <span>Write a Wish</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
