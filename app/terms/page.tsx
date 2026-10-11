import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — OneWishes',
  description: 'Terms of Service for OneWishes platform.',
};

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-10">
      <div className="space-y-4 border-b border-[#2a3d35] pb-8">
        <Link href="/" className="text-xs uppercase font-bold tracking-widest text-[#72897e] hover:text-[#f3eee3]">
          ← Back to OneWishes
        </Link>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold uppercase tracking-tight text-[#f3eee3]">
          Terms of Service
        </h1>
        <p className="text-xs uppercase tracking-widest text-[#a6b6ad]">
          Last Updated: October 2024
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-[#c6d4cc]">
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold uppercase tracking-wider text-[#f3eee3]">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using OneWishes (onewishes.com), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not use our service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold uppercase tracking-wider text-[#f3eee3]">
            2. Scarcity & Platform Rules
          </h2>
          <p>
            OneWishes operates on intentional digital scarcity:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Each user account is tied to exactly one unique, permanent username.</li>
            <li>Golden Wishes are strictly capped at 3 lifetime wishes per identity.</li>
            <li>Onewish Spotlight wishes are reserved for individual calendar dates.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold uppercase tracking-wider text-[#f3eee3]">
            3. User Conduct & Content
          </h2>
          <p>
            You agree not to post abusive, unlawful, or infringing content in wish messages or profiles. OneWishes reserves the right to moderate or remove content that violates community safety standards.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold uppercase tracking-wider text-[#f3eee3]">
            4. Contact
          </h2>
          <p>
            For support or questions regarding these terms, contact <span className="text-[#f3eee3] font-bold">rylyoga@gmail.com</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
