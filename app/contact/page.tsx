'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Check, Copy, Send, ArrowLeft, ShieldCheck, MessageSquare } from 'lucide-react';
import { sounds } from '@/lib/sounds';

export default function ContactPage() {
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });

  const email = 'admin@onewishes.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    sounds.playChime();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playSeal();
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(
      `[${formData.subject}] from ${formData.name}`
    )}&body=${encodeURIComponent(
      `From: ${formData.name} (${formData.email})\n\n${formData.message}`
    )}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-16">
      {/* Header */}
      <div className="space-y-4 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#b5afa6] hover:text-[#e5c07b] transition-colors mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#d4af37]/40 bg-[#14120e] text-[11px] font-bold uppercase tracking-widest text-[#e5c07b] shadow-[0_0_16px_rgba(212,175,55,0.2)]">
          <Mail className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Official Communications</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold uppercase tracking-tight text-[#f5f2eb]">
          Contact OneWishes
        </h1>
        <p className="text-sm uppercase tracking-widest font-mono text-[#b5afa6] max-w-lg mx-auto">
          Direct human correspondence with the OneWishes founding team.
        </p>
      </div>

      {/* Primary Email Card */}
      <div className="p-8 sm:p-10 bg-[#09090c] border border-[#d4af37]/25 space-y-6 shadow-2xl relative overflow-hidden rounded-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-[#d4af37]/20 pb-8">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#e5c07b] font-bold">
              Direct Administrative Email
            </span>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[#f5f2eb] tracking-wide break-all">
              {email}
            </div>
            <p className="text-xs text-[#b5afa6] uppercase tracking-wider">
              Guaranteed response within 24 hours.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleCopyEmail}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 border border-[#d4af37]/25 hover:border-[#e5c07b] bg-[#050505] text-xs font-bold uppercase tracking-widest text-[#f5f2eb] transition-all rounded-sm"
            >
              {copied ? <Check className="w-4 h-4 text-[#e5c07b]" /> : <Copy className="w-4 h-4 text-[#b5afa6]" />}
              <span>{copied ? 'Copied!' : 'Copy Email'}</span>
            </button>

            <a
              href={`mailto:${email}`}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#d4af37] via-[#e5c07b] to-[#b38728] text-[#050505] text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_16px_rgba(212,175,55,0.35)] hover:opacity-95 rounded-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Email</span>
            </a>
          </div>
        </div>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-[#f5f2eb] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#e5c07b]" />
              Account & Scarcity
            </div>
            <p className="text-[11px] text-[#b5afa6] leading-relaxed">
              Assistance with lifetime Golden Wish credits and handle reservations.
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-[#f5f2eb] flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#e5c07b]" />
              Press & Inquiries
            </div>
            <p className="text-[11px] text-[#b5afa6] leading-relaxed">
              Editorial interviews, features, and brand inquiries.
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-[#f5f2eb] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#e5c07b]" />
              Technical Support
            </div>
            <p className="text-[11px] text-[#b5afa6] leading-relaxed">
              Spotlight date booking or media attachment assistance.
            </p>
          </div>
        </div>
      </div>

      {/* Direct Contact Form */}
      <div className="p-8 sm:p-10 bg-[#09090c] border border-[#d4af37]/25 space-y-8 rounded-sm">
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold uppercase tracking-wide text-[#f5f2eb]">
            Send an Instant Message
          </h2>
          <p className="text-xs text-[#b5afa6] uppercase tracking-wider font-mono">
            This will open your email client pre-filled with your message.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-[#f5f2eb]">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. John Doe"
                className="w-full px-4 py-3 bg-[#070709] border border-[#d4af37]/20 text-sm text-[#f5f2eb] placeholder-[#605a54] focus:outline-none focus:border-[#d4af37] transition-colors uppercase tracking-wider rounded-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-[#f5f2eb]">
                Your Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
                className="w-full px-4 py-3 bg-[#070709] border border-[#d4af37]/20 text-sm text-[#f5f2eb] placeholder-[#605a54] focus:outline-none focus:border-[#d4af37] transition-colors uppercase tracking-wider rounded-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-[#f5f2eb]">
              Subject / Topic
            </label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 bg-[#070709] border border-[#d4af37]/20 text-sm text-[#f5f2eb] focus:outline-none focus:border-[#d4af37] transition-colors uppercase tracking-wider rounded-sm"
            >
              <option value="General Inquiry">General Inquiry</option>
              <option value="Account & Handle Issue">Account & Handle Issue</option>
              <option value="Golden Wish Credits">Golden Wish Credits</option>
              <option value="Onewish Date Booking">Onewish Date Booking</option>
              <option value="Bug Report">Bug Report</option>
              <option value="Partnership / Press">Partnership / Press</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-[#f5f2eb]">
              Message *
            </label>
            <textarea
              required
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Write your note here..."
              className="w-full px-4 py-3 bg-[#070709] border border-[#d4af37]/20 text-sm text-[#f5f2eb] placeholder-[#605a54] focus:outline-none focus:border-[#d4af37] transition-colors uppercase tracking-wider resize-none rounded-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-[#d4af37] via-[#e5c07b] to-[#b38728] hover:opacity-95 text-[#050505] font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(212,175,55,0.35)] flex items-center justify-center gap-2 rounded-sm"
          >
            <Send className="w-4 h-4" />
            <span>Send to admin@onewishes.com</span>
          </button>
        </form>
      </div>
    </div>
  );
}
