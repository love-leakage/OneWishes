'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Shield, Calendar, ArrowRight, CheckCircle2, Heart } from 'lucide-react';
import { YosemiteWidget } from '@/components/YosemiteWidget';
import { supabase } from '@/lib/supabase';
import { AuthModal } from '@/components/AuthModal';

export default function HomePage() {
  const [selectedTier, setSelectedTier] = useState<'spark' | 'golden' | 'neverfade'>('spark');
  const [toName, setToName] = useState('');
  const [message, setMessage] = useState('');
  const [fromName, setFromName] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [bookingDate, setBookingDate] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const scrollToCreate = () => {
    document.getElementById('create-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg('Sealing your wish...');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setIsAuthOpen(true);
      setStatusMsg('Please sign in to seal your wish.');
      return;
    }

    if (selectedTier === 'golden') {
      const { data: claimed, error: rpcErr } = await supabase.rpc('claim_golden_wish');
      if (rpcErr || !claimed) {
        setStatusMsg('You have used all 3 lifetime Golden wishes.');
        return;
      }
    }

    const slug = Math.random().toString(36).substring(2, 9);
    const wishData = {
      user_id: session.user.id,
      sender_username: session.user.email?.split('@')[0] || 'user',
      tier: selectedTier,
      from_name: fromName || 'Wisher',
      to_name: toName || 'Someone Special',
      message: message || 'May your path be clear...',
      media_url: mediaUrl || null,
      media_type: mediaUrl ? 'image' : null,
      privacy,
      slug,
    };

    const { data, error } = await supabase.from('wishes').insert([wishData]).select().single();

    if (error) {
      setStatusMsg('Error creating wish: ' + error.message);
      return;
    }

    if (selectedTier === 'neverfade') {
      const dateVal = bookingDate || new Date().toISOString().split('T')[0];
      await supabase.from('neverfade_bookings').insert([
        { booking_date: dateVal, wish_id: data.id, user_id: session.user.id }
      ]);
    }

    setStatusMsg('Wish sealed successfully! Redirecting...');
    setTimeout(() => {
      window.location.href = `/w/${slug}`;
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 pt-8">
      
      {/* ===== HERO SECTION ===== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[580px]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 space-y-6 text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Artificial Scarcity Wish Platform</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight text-white tracking-tight">
            A wish <span className="gradient-text">worth sending.</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
            OneWishes limits how many people you can wish, on purpose — so the ones you do wish know exactly what it cost you.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
            <button
              onClick={scrollToCreate}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-sm hover:scale-105 transition-transform shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              <span>Write a Wish</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              href="/gallery"
              className="px-8 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white font-semibold text-sm hover:border-slate-700 transition-colors"
            >
              Explore Showcase
            </Link>
          </div>
        </motion.div>

        {/* Yosemite 3D Interactive Widget Column */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-5 flex justify-center"
        >
          <YosemiteWidget onStartClick={scrollToCreate} />
        </motion.div>
      </section>

      {/* ===== THREE TIERS SHOWCASE ===== */}
      <section className="space-y-8 pt-8">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-3xl font-semibold text-white">Three Intentional Tiers</h2>
          <p className="text-slate-400 text-sm">Designed for emotional weight through purposeful constraints.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Spark Wish Card */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-8 rounded-3xl bg-[#0f172a] border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-4">
                <Sparkles className="w-4 h-4" />
                <span>Tier I • Unlimited</span>
              </div>
              <h3 className="font-serif text-2xl font-semibold text-white mb-2">Spark Wish</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Instant, simple, private shareable wish link. Unlimited usage forever.
              </p>
            </div>
            <button
              onClick={() => { setSelectedTier('spark'); scrollToCreate(); }}
              className="w-full py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-white hover:border-amber-400 hover:text-amber-400 transition-colors"
            >
              Create Spark →
            </button>
          </motion.div>

          {/* Golden Wish Card */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-8 rounded-3xl bg-gradient-to-b from-[#13132e] to-[#0f172a] border border-indigo-500/40 hover:border-indigo-400 transition-all flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 px-4 py-1 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider rounded-bl-xl border-l border-b border-indigo-500/30">
              Scarcity Tier
            </div>
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-4">
                <Shield className="w-4 h-4" />
                <span>Tier II • 3 Per Lifetime</span>
              </div>
              <h3 className="font-serif text-2xl font-semibold text-white mb-2">Golden Wish</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Rare keepsake wish attached to your identity. Exactly 3 allowed per user account.
              </p>
            </div>
            <button
              onClick={() => { setSelectedTier('golden'); scrollToCreate(); }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Create Golden →
            </button>
          </motion.div>

          {/* Neverfade Spotlight Card */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-8 rounded-3xl bg-[#0f172a] border border-slate-800 hover:border-rose-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400 mb-4">
                <Calendar className="w-4 h-4" />
                <span>Tier III • 1 Slot / Day</span>
              </div>
              <h3 className="font-serif text-2xl font-semibold text-white mb-2">Neverfade Spotlight</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Claim the front-page spotlight for a specific calendar date worldwide.
              </p>
            </div>
            <button
              onClick={() => { setSelectedTier('neverfade'); scrollToCreate(); }}
              className="w-full py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-white hover:border-rose-400 hover:text-rose-400 transition-colors"
            >
              Book Spotlight →
            </button>
          </motion.div>
        </div>
      </section>

      {/* ===== CREATE WISH FORM & LIVE PREVIEW ===== */}
      <section id="create-section" className="pt-12 scroll-mt-24 border-t border-slate-800/80">
        <div className="mb-8">
          <h2 className="font-serif text-3xl font-semibold text-white">Write Your Wish</h2>
          <p className="text-slate-400 text-sm">Select your tier, fill out recipient details, and seal your keepsake.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Box */}
          <div className="lg:col-span-7 p-8 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-6">
            
            {/* Tier Selector */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedTier('spark')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  selectedTier === 'spark'
                    ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                    : 'border-slate-800 bg-[#020617] text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold uppercase">Spark</div>
                <div className="text-[10px] text-slate-400">Free • Unlimited</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTier('golden')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  selectedTier === 'golden'
                    ? 'border-indigo-400 bg-indigo-400/10 text-indigo-300'
                    : 'border-slate-800 bg-[#020617] text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold uppercase">Golden</div>
                <div className="text-[10px] text-slate-400">3 / Lifetime</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTier('neverfade')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  selectedTier === 'neverfade'
                    ? 'border-rose-400 bg-rose-400/10 text-rose-300'
                    : 'border-slate-800 bg-[#020617] text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold uppercase">Neverfade</div>
                <div className="text-[10px] text-slate-400">1 Slot / Day</div>
              </button>
            </div>

            <form onSubmit={handleWishSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={toName}
                  onChange={(e) => setToName(e.target.value)}
                  placeholder="e.g. Maya"
                  required
                  className="w-full px-4 py-3 bg-[#020617] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Your Wish Message
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write something meaningful..."
                  required
                  className="w-full px-4 py-3 bg-[#020617] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Your Signature
                </label>
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="e.g. Alex"
                  required
                  className="w-full px-4 py-3 bg-[#020617] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Image or Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-[#020617] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              {selectedTier === 'neverfade' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Spotlight Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#020617] border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-rose-400 transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Privacy Setting
                </label>
                <select
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value)}
                  className="w-full px-4 py-3 bg-[#020617] border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                >
                  <option value="public">Public (Visible in Showcase Gallery)</option>
                  <option value="private">Private (Only viewable via direct link)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-bold text-sm tracking-wide hover:opacity-95 transition-opacity shadow-lg shadow-amber-500/20 mt-4"
              >
                Seal & Send Wish →
              </button>

              {statusMsg && (
                <p className="text-xs text-amber-400 text-center pt-2 font-medium">{statusMsg}</p>
              )}
            </form>
          </div>

          {/* Live Preview Card */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="p-8 rounded-3xl bg-[#020617] border border-amber-500/30 flex-1 flex flex-col justify-between shadow-2xl min-h-[420px]">
              <div>
                <div className="text-xs font-bold tracking-widest text-amber-400 uppercase mb-4">
                  TO: {toName ? toName.toUpperCase() : 'DEAR MAYA'}
                </div>
                <p className="font-serif text-xl sm:text-2xl text-white leading-relaxed italic">
                  "{message || 'May your path be clear, and every dream you carry find its light...'}"
                </p>
              </div>

              <div className="pt-8 border-t border-slate-800/80 flex items-center justify-between text-slate-400 text-xs">
                <span className="italic">— With love, {fromName || 'Alex'}</span>
                <span className="uppercase text-[10px] font-bold tracking-wider px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-amber-400">
                  {selectedTier}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
