'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Check, Copy, Send, ArrowLeft, ShieldCheck, Radio, Stamp } from 'lucide-react';
import { sounds } from '@/lib/sounds';

export default function ContactPage() {
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Archival Inquiry',
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
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-courier uppercase tracking-widest text-[#a89684] hover:text-[#c5a059] transition-colors mb-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Registry</span>
        </Link>
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#3a2c20] bg-[#16120e] text-[10px] font-courier uppercase tracking-[0.25em] text-[#c5a059]">
          <Radio className="w-3.5 h-3.5 text-[#c5a059]" />
          <span>BUREAU TELEGRAPH DISPATCH • EST. 1890</span>
        </div>
        <h1 className="font-garamond text-4xl sm:text-6xl italic text-[#f7f2e7]">
          Telegraph the Vault
        </h1>
        <p className="text-xs uppercase tracking-widest font-courier text-[#a89684] max-w-lg mx-auto">
          Direct human correspondence with the OneWishes Archival Bureau.
        </p>
      </div>

      {/* Primary Telegraph Card */}
      <div className="vintage-telegram-paper rounded-sm p-6 sm:p-10 border border-[#b08a44]/70 shadow-2xl relative space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-[#c8b48c] pb-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] font-courier uppercase tracking-[0.25em] text-[#7d1d23] font-bold block">
              WESTERN UNION DIRECT TELEGRAM ADDRESS
            </span>
            <div className="font-courier text-2xl sm:text-3xl font-bold text-[#241c18] tracking-wider break-all">
              {email}
            </div>
            <p className="text-[11px] font-courier text-[#6b584a] uppercase tracking-wider">
              ✦ Guaranteed transmission & response within 24 hours.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleCopyEmail}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 border border-[#a07e4b] hover:border-[#7d1d23] bg-white/60 text-xs font-courier font-bold uppercase tracking-widest text-[#241c18] transition-all rounded"
            >
              {copied ? <Check className="w-4 h-4 text-green-700" /> : <Copy className="w-4 h-4 text-[#7d1d23]" />}
              <span>{copied ? 'Address Copied!' : 'Copy Address'}</span>
            </button>

            <a
              href={`mailto:${email}`}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#7d1d23] hover:bg-[#922129] text-[#f7f2e7] text-xs font-courier font-bold uppercase tracking-widest transition-all shadow-md rounded"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Dispatch</span>
            </a>
          </div>
        </div>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 font-courier">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-[#241c18] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#7d1d23]" />
              Lifetime Scarcity
            </div>
            <p className="text-[11px] text-[#6b584a] leading-relaxed">
              Assistance with 35mm Gold Roll lifetime credentials and handle preservation.
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-[#241c18] flex items-center gap-1.5">
              <Stamp className="w-3.5 h-3.5 text-[#7d1d23]" />
              Date Monoliths
            </div>
            <p className="text-[11px] text-[#6b584a] leading-relaxed">
              Inquiries regarding calendar date exclusivity reservations and archival verification.
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-[#241c18] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#7d1d23]" />
              Archival Press
            </div>
            <p className="text-[11px] text-[#6b584a] leading-relaxed">
              Curatorial partnerships, historical inquiries, and colophon citations.
            </p>
          </div>
        </div>
      </div>

      {/* Direct Telegram Dispatch Form */}
      <div className="p-8 sm:p-10 bg-[#14100d] border border-[#3a2c20] rounded-sm space-y-6 shadow-xl">
        <div className="space-y-2 border-b border-[#3a2c20] pb-4">
          <span className="text-[10px] font-courier text-[#c5a059] uppercase tracking-[0.25em] font-bold">
            RAPID TELEGRAPH DISPATCH
          </span>
          <h2 className="font-garamond text-2xl sm:text-3xl italic text-[#f7f2e7]">
            Compose Official Wire
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 font-courier text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[#a89684] uppercase tracking-wider block">Your Name / Scribe Moniker</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Thomas Edison"
                className="w-full px-4 py-2.5 bg-[#0b0908] border border-[#3a2c20] text-[#f7f2e7] focus:outline-none focus:border-[#c5a059] rounded"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#a89684] uppercase tracking-wider block">Return Wire Address (Email)</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. scribe@domain.com"
                className="w-full px-4 py-2.5 bg-[#0b0908] border border-[#3a2c20] text-[#f7f2e7] focus:outline-none focus:border-[#c5a059] rounded"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[#a89684] uppercase tracking-wider block">Telegraph Subject</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Nature of inquiry..."
              className="w-full px-4 py-2.5 bg-[#0b0908] border border-[#3a2c20] text-[#f7f2e7] focus:outline-none focus:border-[#c5a059] rounded"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[#a89684] uppercase tracking-wider block">Wire Transmission (Message)</label>
            <textarea
              required
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Inscribe your dispatch here..."
              className="w-full px-4 py-2.5 bg-[#0b0908] border border-[#3a2c20] text-[#f7f2e7] focus:outline-none focus:border-[#c5a059] rounded"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#c5a059] hover:bg-[#d4b069] text-[#0b0908] font-courier font-bold uppercase tracking-widest text-xs transition-all shadow-md rounded flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4 text-[#0b0908]" />
            <span>Transmit Wire to Bureau</span>
          </button>
        </form>
      </div>
    </div>
  );
}
