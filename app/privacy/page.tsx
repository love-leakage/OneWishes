import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — OneWishes',
  description: 'Privacy Policy for OneWishes application.',
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-10">
      <div className="space-y-4 border-b border-[#2a3d35] pb-8">
        <Link href="/" className="text-xs uppercase font-bold tracking-widest text-[#72897e] hover:text-[#f3eee3]">
          ← Back to OneWishes
        </Link>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold uppercase tracking-tight text-[#f3eee3]">
          Privacy Policy
        </h1>
        <p className="text-xs uppercase tracking-widest text-[#a6b6ad]">
          Last Updated: October 2024
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-[#c6d4cc]">
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold uppercase tracking-wider text-[#f3eee3]">
            1. Information We Collect
          </h2>
          <p>
            When you sign in to OneWishes using Google OAuth, we collect basic profile information provided by Google, including your name, email address, and profile picture avatar. We also store the public username and optional Instagram handle you choose during onboarding.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold uppercase tracking-wider text-[#f3eee3]">
            2. How We Use Information
          </h2>
          <p>
            We use your information exclusively to:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Authenticate your account and maintain secure sessions.</li>
            <li>Enforce scarcity rules (1 permanent username per user, lifetime Golden Wish limits).</li>
            <li>Display your created wishes and personalized wish paths.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold uppercase tracking-wider text-[#f3eee3]">
            3. Data Sharing & Third Parties
          </h2>
          <p>
            We do not sell, rent, or trade your personal data. Authentication and database management are powered securely by Supabase.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold uppercase tracking-wider text-[#f3eee3]">
            4. Contact Us
          </h2>
          <p>
            If you have questions about this policy or your account data, please reach out to us at{' '}
            <span className="text-[#f3eee3] font-bold">rylyoga@gmail.com</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
