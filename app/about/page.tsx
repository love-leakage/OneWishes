import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Sparkles, Stamp, Feather, ArrowRight, ShieldCheck, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Colophon & Manifesto — The Philosophy of Artificial Scarcity | OneWishes',
  description: 'Why OneWishes limits how many wishes you can send. In a world of disposable messages, scarcity is the ultimate proof of love.',
};

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-20">
      
      {/* Editorial Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#3a2c20] bg-[#16120e] text-[10px] font-courier uppercase tracking-[0.25em] text-[#c5a059]">
          <Feather className="w-3.5 h-3.5 text-[#c5a059]" />
          <span>THE CHRONICLE MANIFESTO • EST. 1890</span>
        </div>

        <h1 className="font-garamond text-4xl sm:text-6xl italic text-[#f7f2e7] leading-tight">
          A Missive Worth Preserving.
        </h1>

        <p className="font-courier text-xs sm:text-sm text-[#a89684] uppercase tracking-widest leading-relaxed">
          In an era of disposable digital noise, scarcity remains the sole unforgeable proof of devotion.
        </p>
      </div>

      {/* Main Philosophy Narrative */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch border-t border-[#3a2c20] pt-14">
        <div className="space-y-6 text-[#a89684] text-xs sm:text-sm font-courier leading-relaxed">
          <h2 className="font-garamond text-2xl sm:text-3xl italic text-[#f7f2e7]">
            The Demise of the Birthday Message
          </h2>
          <p>
            Every single day, billions of automated alerts fire across WhatsApp, Instagram, and social media. People receive dozens of copy-pasted abbreviations from acquaintances they haven’t spoken to in years.
          </p>
          <p>
            When transmitting a sentiment costs zero consequence, zero thought, and zero scarcity, <strong className="text-[#f7f2e7]">receiving it carries zero weight</strong>.
          </p>
          <p>
            OneWishes was founded as a quiet insurrection against infinite abundance. We asked a foundational human question: <em className="text-[#c5a059] not-italic font-garamond text-lg">What if sending a wish demanded something you can never repurchase?</em>
          </p>
        </div>

        <div className="vintage-parchment rounded-sm p-8 sm:p-10 border border-[#c4a882] shadow-2xl space-y-6 relative flex flex-col justify-between">
          <div className="absolute top-2 left-2 w-3 h-3 vintage-brass-bracket-tl pointer-events-none" />
          <div className="absolute top-2 right-2 w-3 h-3 vintage-brass-bracket-tr pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-3 h-3 vintage-brass-bracket-bl pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-3 h-3 vintage-brass-bracket-br pointer-events-none" />

          <div className="space-y-4">
            <div className="text-[10px] font-courier font-bold uppercase tracking-[0.25em] text-[#7d1d23] flex items-center gap-2">
              <span>✦</span> THE SACRED AXIOM OF THE FOLIO
            </div>
            <blockquote className="font-garamond text-2xl sm:text-3xl text-[#231916] italic leading-relaxed">
              "If you can wish everyone, you have wished no one. If you can only wish three people across your entire mortal existence, you have bequeathed them a fragment of your soul."
            </blockquote>
          </div>

          <div className="pt-4 border-t border-[#d8c3a3] text-[10px] font-courier uppercase text-[#6b584a]">
            — OneWishes Archival Bureau Colophon
          </div>
        </div>
      </div>

      {/* The Two Constraints */}
      <div className="space-y-12 border-t border-[#3a2c20] pt-14">
        <div className="text-center space-y-2">
          <h2 className="font-garamond text-3xl sm:text-4xl italic text-[#f7f2e7]">
            Engineered Scarcity
          </h2>
          <p className="text-[11px] font-courier uppercase tracking-widest text-[#a89684]">
            Enforced cryptographically and permanently at the database core.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 bg-[#14100d] border border-[#3a2c20] rounded-sm space-y-4 shadow-lg">
            <div className="text-[10px] font-courier font-bold uppercase tracking-widest text-[#c5a059]">
              CANISTER I • 3 PER LIFETIME
            </div>
            <h3 className="font-garamond text-2xl italic text-[#f7f2e7]">
              The 35mm Golden Roll
            </h3>
            <p className="text-xs font-courier text-[#a89684] leading-relaxed">
              Every verified citizen receives exactly three 35mm Golden Rolls for their entire lifetime. No subscriptions, no microtransactions, no resets. When you seal an exposure, it is etched immutably into the permanent ledger.
            </p>
            <div className="pt-3 border-t border-[#3a2c20] text-[10px] font-courier text-[#c5a059]">
              ✦ Reserved for the 3 people who defined your mortal existence.
            </div>
          </div>

          <div className="p-8 bg-[#14100d] border border-[#3a2c20] rounded-sm space-y-4 shadow-lg">
            <div className="text-[10px] font-courier font-bold uppercase tracking-widest text-[#c5a059]">
              CANISTER II • 1 MONUMENT PER CALENDAR DAY
            </div>
            <h3 className="font-garamond text-2xl italic text-[#f7f2e7]">
              The Chronicle Date Spotlight
            </h3>
            <p className="text-xs font-courier text-[#a89684] leading-relaxed">
              Every calendar date worldwide possesses exactly one slot across the global registry. Protected by chronological exclusivity, once a date is inscribed, no soul on Earth can ever overwrite it.
            </p>
            <div className="pt-3 border-t border-[#3a2c20] text-[10px] font-courier text-[#c5a059]">
              ✦ Etched into the worldwide digital registry for eternity.
            </div>
          </div>
        </div>
      </div>

      {/* Return to Registry Call to Action */}
      <div className="text-center pt-6">
        <Link
          href="/#darkroom-studio"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#c5a059] hover:bg-[#d4b069] text-[#0b0908] font-courier font-bold text-xs uppercase tracking-widest transition-all shadow-lg rounded"
        >
          <Stamp className="w-4 h-4 text-[#0b0908]" />
          <span>Inscribe a Keepsake Now</span>
          <ArrowRight className="w-4 h-4 text-[#0b0908]" />
        </Link>
      </div>
    </div>
  );
}
