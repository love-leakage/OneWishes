'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const [selectedTier, setSelectedTier] = useState<'golden' | 'onewish'>('golden');
  const [toName, setToName] = useState('');
  const [message, setMessage] = useState('');
  const [fromName, setFromName] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [bookingDate, setBookingDate] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const scrollToCreate = () => {
    document.getElementById('create-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg('Sealing your wish...');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href }});
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

    if (selectedTier === 'onewish') {
      const dateVal = bookingDate || new Date().toISOString().split('T')[0];
      await supabase.from('onewish_bookings').insert([
        { booking_date: dateVal, wish_id: data.id, user_id: session.user.id }
      ]);
    }

    setStatusMsg('Wish sealed successfully! Redirecting...');
    setTimeout(() => {
      window.location.href = `/w/${slug}`;
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32 pt-16 pb-24">
      
      {/* ===== HERO SECTION ===== */}
      <section className="flex flex-col items-center justify-center text-center min-h-[500px] space-y-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <img src="/logo.png" alt="Onewishes" className="w-32 h-32 md:w-48 md:h-48 object-contain mb-8 grayscale hover:grayscale-0 transition-all duration-700" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold leading-tight text-white uppercase tracking-tighter">
            A Wish <br/> Worth Sending.
          </h1>

          <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
            OneWishes limits how many people you can wish. 
            So the ones you do wish know exactly what it cost you.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
            <button
              onClick={scrollToCreate}
              className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors flex items-center gap-3"
            >
              <span>Write a Wish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* ===== TIERS SHOWCASE ===== */}
      <section className="space-y-12 pt-16 border-t border-white/10">
        <div className="text-center space-y-3">
          <h2 className="font-serif text-3xl font-bold text-white uppercase tracking-widest">The Tiers</h2>
          <p className="text-gray-500 text-sm uppercase tracking-wider">Two intentional constraints.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Golden Wish Card */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-10 border border-white/20 hover:border-white bg-black transition-all flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-white mb-6">
                Tier I • 3 Per Lifetime
              </div>
              <h3 className="font-serif text-3xl font-bold text-white mb-4 uppercase">Golden Wish</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-8">
                Rare keepsake wish attached to your identity. Exactly 3 allowed per user account.
              </p>
            </div>
            <button
              onClick={() => { setSelectedTier('golden'); scrollToCreate(); }}
              className="w-full py-4 border border-white text-white font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-colors"
            >
              Create Golden
            </button>
          </motion.div>

          {/* Onewish Spotlight Card */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-10 border border-white/20 hover:border-white bg-black transition-all flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-white mb-6">
                Tier II • 1 Slot / Day
              </div>
              <h3 className="font-serif text-3xl font-bold text-white mb-4 uppercase">Onewish Spotlight</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-8">
                Claim the front-page spotlight for a specific calendar date worldwide. Never fades.
              </p>
            </div>
            <button
              onClick={() => { setSelectedTier('onewish'); scrollToCreate(); }}
              className="w-full py-4 border border-white text-white font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-colors"
            >
              Book Onewish
            </button>
          </motion.div>
        </div>
      </section>

      {/* ===== CREATE WISH FORM & PREVIEW ===== */}
      <section id="create-section" className="pt-24 scroll-mt-24 border-t border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form Box */}
          <div className="lg:col-span-7 space-y-8">
            <h2 className="font-serif text-4xl font-bold text-white uppercase tracking-tighter">Write Your Wish</h2>
            
            {/* Tier Selector */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedTier('golden')}
                className={`p-4 border text-center transition-all ${
                  selectedTier === 'golden'
                    ? 'border-white bg-white text-black'
                    : 'border-white/20 text-gray-500 hover:border-white/50'
                }`}
              >
                <div className="text-sm font-bold uppercase tracking-widest">Golden</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTier('onewish')}
                className={`p-4 border text-center transition-all ${
                  selectedTier === 'onewish'
                    ? 'border-white bg-white text-black'
                    : 'border-white/20 text-gray-500 hover:border-white/50'
                }`}
              >
                <div className="text-sm font-bold uppercase tracking-widest">Onewish</div>
              </button>
            </div>

            <form onSubmit={handleWishSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-white mb-2">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={toName}
                  onChange={(e) => setToName(e.target.value)}
                  placeholder="E.G. MAYA"
                  required
                  className="w-full px-4 py-4 bg-black border border-white/20 text-white placeholder-gray-700 focus:outline-none focus:border-white transition-colors uppercase tracking-widest"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-white mb-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="WRITE SOMETHING MEANINGFUL..."
                  required
                  className="w-full px-4 py-4 bg-black border border-white/20 text-white placeholder-gray-700 focus:outline-none focus:border-white transition-colors resize-none uppercase tracking-wide text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-white mb-2">
                  Your Signature
                </label>
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="E.G. ALEX"
                  required
                  className="w-full px-4 py-4 bg-black border border-white/20 text-white placeholder-gray-700 focus:outline-none focus:border-white transition-colors uppercase tracking-widest"
                />
              </div>

              {selectedTier === 'onewish' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white mb-2">
                    Spotlight Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                    className="w-full px-4 py-4 bg-black border border-white/20 text-white focus:outline-none focus:border-white transition-colors tracking-widest uppercase"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-5 bg-white text-black font-bold text-sm tracking-widest uppercase hover:bg-gray-200 transition-colors mt-6"
              >
                Seal & Send Wish
              </button>

              {statusMsg && (
                <p className="text-xs text-white text-center pt-4 font-bold uppercase tracking-widest">{statusMsg}</p>
              )}
            </form>
          </div>

          {/* Live Preview Card */}
          <div className="lg:col-span-5 flex flex-col pt-16">
            <div className="p-10 border border-white bg-black flex-1 flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] min-h-[500px]">
              <div>
                <div className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-8 border-b border-white/20 pb-4">
                  TO: {toName ? toName.toUpperCase() : 'MAYA'}
                </div>
                <p className="font-serif text-2xl text-white leading-loose uppercase tracking-wide">
                  "{message || 'MAY YOUR PATH BE CLEAR, AND EVERY DREAM YOU CARRY FIND ITS LIGHT.'}"
                </p>
              </div>

              <div className="pt-8 border-t border-white/20 flex flex-col gap-4 text-white text-xs">
                <span className="font-bold tracking-widest uppercase">FROM: {fromName || 'ALEX'}</span>
                <span className="uppercase text-[10px] font-bold tracking-widest text-gray-500">
                  TIER: {selectedTier}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
