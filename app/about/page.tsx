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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#e4c067]/40 bg-[#0c0d0d] text-xs font-bold uppercase tracking-widest text-[#e4c067]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Manifesto</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl font-bold uppercase tracking-tight text-[#f5f2eb] leading-tight">
          A Wish Worth Sending.
        </h1>

        <p className="text-base sm:text-lg text-[#a1b0a8] uppercase tracking-widest font-mono leading-relaxed">
          In a world of infinite digital noise, scarcity is the only honest proof of care.
        </p>
      </div>

      {/* Main Philosophy Narrative */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center border-t border-[#1a1d1b] pt-16">
        <div className="space-y-6 text-[#a1b0a8] text-sm sm:text-base leading-relaxed">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#f5f2eb] uppercase tracking-wide">
            The Death of the Birthday Message
          </h2>
          <p>
            Every single day, billions of automated notifications fire across WhatsApp, Instagram, and social media. You receive fifty copy-pasted "HBD!" messages from people you haven’t spoken to in three years.
          </p>
          <p>
            When sending a message costs zero effort, zero thought, and zero consequence, <strong className="text-[#f5f2eb]">receiving it means nothing</strong>.
          </p>
          <p>
            OneWishes was born out of a rebellion against infinite abundance. We asked a simple question: <em className="text-[#e4c067] not-italic font-serif">What if wishing someone actually cost you something you can never get back?</em>
          </p>
        </div>

        <div className="p-8 sm:p-10 bg-[#0c0d0d] border border-[#1a1d1b] space-y-6 shadow-2xl relative">
          <div className="text-xs uppercase tracking-widest font-bold text-[#e4c067] flex items-center gap-2">
            <span>✦</span> The Core Axiom
          </div>
          <blockquote className="font-serif text-xl sm:text-2xl text-[#f5f2eb] italic leading-relaxed">
            "If you can wish everyone, you have wished no one. If you can only wish three people in your lifetime, you have given them a part of your soul."
          </blockquote>
          <div className="pt-4 border-t border-[#1a1d1b] text-xs font-mono uppercase text-[#6e7d75]">
            — OneWishes Architecture Team
          </div>
        </div>
      </div>

      {/* The Two Constraints */}
      <div className="space-y-12 border-t border-[#1a1d1b] pt-16">
        <div className="text-center space-y-3">
          <h2 className="font-serif text-3xl font-bold text-[#f5f2eb] uppercase tracking-widest">
            Engineered Scarcity
          </h2>
          <p className="text-xs font-mono uppercase tracking-widest text-[#a1b0a8]">
            Enforced cryptographically and at the database level.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 bg-[#0c0d0d] border border-[#e4c067]/30 space-y-4">
            <div className="text-xs font-bold uppercase tracking-widest text-[#e4c067]">
              Tier I • 3 Per Lifetime
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#f5f2eb] uppercase">
              The Golden Wish
            </h3>
            <p className="text-sm text-[#a1b0a8] leading-relaxed">
              Every verified citizen receives exactly three Golden Wishes for their entire lifetime. No subscriptions, no in-app purchases, no second chances. When you use one, it is permanently deducted via atomic PostgreSQL locks.
            </p>
            <div className="pt-4 border-t border-[#1a1d1b] text-xs font-mono text-[#e4c067]">
              Reserved for the 3 people who defined your existence.
            </div>
          </div>

          <div className="p-8 bg-[#0c0d0d] border border-[#1a1d1b] space-y-4">
            <div className="text-xs font-bold uppercase tracking-widest text-[#8da095]">
              Tier II • 1 Slot Per Calendar Date
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#f5f2eb] uppercase">
              The Onewish Spotlight
            </h3>
            <p className="text-sm text-[#a1b0a8] leading-relaxed">
              Every calendar date worldwide has exactly one slot on the front page of onewishes.com. Enforced by strict SQL UNIQUE constraints, once a date is claimed, no human on Earth can ever overwrite it.
            </p>
            <div className="pt-4 border-t border-[#1a1d1b] text-xs font-mono text-[#8da095]">
              Etched into the global digital registry for eternity.
            </div>
          </div>
        </div>
      </div>

      {/* A Note On Our Name */}
      <div className="p-10 sm:p-14 bg-[#0c0d0d] border border-[#1a1d1b] text-center space-y-6">
        <div className="inline-block px-3 py-1 bg-[#050505] border border-[#1a1d1b] text-[11px] font-bold uppercase tracking-widest text-[#e4c067]">
          A Note On Our Name
        </div>
        <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#f5f2eb] uppercase">
          "We made a mistake in our name — but don't make the mistake of leaving your memories unsaid."
        </h2>
        <p className="text-sm sm:text-base text-[#a1b0a8] max-w-2xl mx-auto leading-relaxed">
          Grammar says it should be <em>One Wish</em>. But when one soul pours everything into a single eternal keepsake, singular and plural blend into feeling. Memories don’t care about spelling rules.
        </p>
      </div>

      {/* Contact & Founding Team */}
      <div className="border-t border-[#1a1d1b] pt-16 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="font-serif text-2xl font-bold text-[#f5f2eb] uppercase">
            Have Questions or Need Direct Help?
          </h3>
          <p className="text-xs text-[#a1b0a8] uppercase tracking-wider font-mono">
            Direct Founder Inbox: <strong className="text-[#e4c067]">admin@onewishes.com</strong>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/contact"
            className="px-6 py-3 border border-[#1a1d1b] hover:border-[#e4c067] text-[#f5f2eb] text-xs font-bold uppercase tracking-widest transition-all bg-[#0c0d0d]"
          >
            Contact Support
          </Link>
          <Link
            href="/#create-section"
            className="px-6 py-3 bg-[#e4c067] hover:bg-[#ebd38d] text-[#050505] text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(228,192,103,0.2)] flex items-center gap-2"
          >
            <span>Write a Wish</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

