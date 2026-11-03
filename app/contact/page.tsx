'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Copy, Check, Send, ShieldCheck, MessageSquare, ArrowLeft } from 'lucide-react';
import { sounds } from '@/lib/sounds';

export default function ContactPage() {
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });

  const email = 'admin@onewishes.com';

  const handleCopyEmail = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email);
      setCopied(true);
      sounds.playChime();
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(`[OneWishes] ${formData.subject} - ${formData.name}`)}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nTopic: ${formData.subject}\n\nMessage:\n${formData.message}`
    )}`;
    window.location.href = mailtoUrl;
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-16">
      {/* Header */}
      <div className="space-y-4 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#b5a5b5] hover:text-[#ff4d8d] transition-colors mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#ff4d8d]/40 bg-[#0d0910] text-[11px] font-bold uppercase tracking-widest text-[#ff4d8d] shadow-[0_0_16px_rgba(248,79,156,0.2)]">
          <Mail className="w-3.5 h-3.5" />
          <span>Official Communications</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold uppercase tracking-tight text-[#fbf8f5]">
          Contact OneWishes
        </h1>
        <p className="text-sm uppercase tracking-widest font-mono text-[#b5a5b5] max-w-lg mx-auto">
          Direct human correspondence with the OneWishes founding team.
        </p>
      </div>

      {/* Primary Email Card */}
      <div className="p-8 sm:p-10 bg-[#0d0910] border border-[#26182a] space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-[#211624] pb-8">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#ff4d8d] font-bold">
              Direct Administrative Email
            </span>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[#fbf8f5] tracking-wide break-all">
              {email}
            </div>
            <p className="text-xs text-[#b5a5b5] uppercase tracking-wider">
              Guaranteed response within 24 hours.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleCopyEmail}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 border border-[#241727] hover:border-[#ff4d8d] bg-[#050505] text-xs font-bold uppercase tracking-widest text-[#fbf8f5] transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-[#ff4d8d]" /> : <Copy className="w-4 h-4 text-[#b5a5b5]" />}
              <span>{copied ? 'Copied!' : 'Copy Email'}</span>
            </button>

            <a
              href={`mailto:${email}`}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#ff5376] to-[#f84f9c] text-white text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_16px_rgba(248,79,156,0.35)] hover:opacity-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Email</span>
            </a>
          </div>
        </div>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-[#fbf8f5] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#ff4d8d]" />
              Account & Scarcity
            </div>
            <p className="text-[11px] text-[#b5a5b5] leading-relaxed">
              Assistance with lifetime Golden Wish credits and handle reservations.
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-[#fbf8f5] flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#ff6b8b]" />
              Press & Inquiries
            </div>
            <p className="text-[11px] text-[#b5a5b5] leading-relaxed">
              Editorial interviews, features, and brand inquiries.
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-[#fbf8f5] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#ff4d8d]" />
              Bug Reports
            </div>
            <p className="text-[11px] text-[#b5a5b5] leading-relaxed">
              Technical feedback, suggestions, and platform enhancements.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Dispatch Form */}
      <div className="p-8 sm:p-10 bg-[#0d0910] border border-[#26182a] space-y-8 shadow-xl">
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold uppercase text-[#fbf8f5] tracking-wide">
            Dispatch a Direct Note
          </h2>
          <p className="text-xs text-[#b5a5b5] uppercase tracking-wider font-mono">
            Fill this form to open your default mail client pre-addressed to {email}.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-[#fbf8f5]">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. John Doe"
                className="w-full px-4 py-3 bg-[#08050a] border border-[#241727] text-sm text-[#fbf8f5] placeholder-[#5a485e] focus:outline-none focus:border-[#ff4d8d] transition-colors uppercase tracking-wider"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-[#fbf8f5]">
                Your Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
                className="w-full px-4 py-3 bg-[#08050a] border border-[#241727] text-sm text-[#fbf8f5] placeholder-[#5a485e] focus:outline-none focus:border-[#ff4d8d] transition-colors uppercase tracking-wider"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-[#fbf8f5]">
              Subject / Topic
            </label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 bg-[#08050a] border border-[#241727] text-sm text-[#fbf8f5] focus:outline-none focus:border-[#ff4d8d] transition-colors uppercase tracking-wider"
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
            <label className="block text-xs font-bold uppercase tracking-widest text-[#fbf8f5]">
              Message *
            </label>
            <textarea
              required
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Write your note here..."
              className="w-full px-4 py-3 bg-[#08050a] border border-[#241727] text-sm text-[#fbf8f5] placeholder-[#5a485e] focus:outline-none focus:border-[#ff4d8d] transition-colors uppercase tracking-wider resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-[#ff5376] to-[#f84f9c] hover:opacity-95 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(248,79,156,0.35)] flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Send to admin@onewishes.com</span>
          </button>
        </form>
      </div>
    </div>
  );
}
