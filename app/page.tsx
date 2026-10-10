'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const [selectedTier, setSelectedTier] = useState<'golden' | 'onewish'>('golden');
  const [toName, setToName] = useState('');
  const [toUsername, setToUsername] = useState('');
  const [message, setMessage] = useState('');
  const [fromName, setFromName] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [privacy, setPrivacy] = useState('public');
  const [bookingDate, setBookingDate] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Today's Onewish State
  const [todayOnewish, setTodayOnewish] = useState<any>(null);

  useEffect(() => {
    async function loadTodayOnewish() {
      const today = new Date().toISOString().split('T')[0];
      const { data: booking } = await supabase
        .from('onewish_bookings')
        .select('wish_id')
        .eq('booking_date', today)
        .single();
        
      if (booking) {
        const { data: wish } = await supabase
          .from('wishes')
          .select('*')
          .eq('id', booking.wish_id)
          .single();
        setTodayOnewish(wish);
      }
    }
    loadTodayOnewish();
  }, []);


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

    let finalMediaUrl = mediaUrl || null;

    if (mediaFile) {
      setStatusMsg('Uploading media to Cloudflare R2...');
      const formData = new FormData();
      formData.append('file', mediaFile);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const resData = await res.json();
        if (resData.url) {
          finalMediaUrl = resData.url;
        } else {
          setStatusMsg('Media upload failed.');
          return;
        }
      } catch (err) {
        setStatusMsg('Media upload error.');
        return;
      }
    }

    setStatusMsg('Saving your wish...');

    const slug = Math.random().toString(36).substring(2, 9);
    const wishData = {
      user_id: session.user.id,
      sender_username: session.user.email?.split('@')[0] || 'user',
      tier: selectedTier,
      from_name: fromName || 'Wisher',
      to_name: toName || (toUsername ? '' : 'Someone Special'),
      to_username: toUsername ? toUsername.replace('@', '') : null,
      message: message || 'May your path be clear...',
      media_url: finalMediaUrl,
      media_type: mediaType,
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
      const { error: bookingErr } = await supabase.from('onewish_bookings').insert([
        { booking_date: dateVal, wish_id: data.id, user_id: session.user.id }
      ]);
      
      if (bookingErr) {
        await supabase.from('wishes').delete().eq('id', data.id);
        setStatusMsg('Sorry, this date is already booked! Choose another date.');
        return;
      }
    }

    setStatusMsg('Wish sealed successfully! Redirecting...');
    setTimeout(() => {
      // Redirect based on tier
      if (selectedTier === 'onewish') {
        const finalDate = bookingDate || new Date().toISOString().split('T')[0];
        window.location.href = `/${finalDate}`;
      } else {
        window.location.href = `/golden/${toUsername ? toUsername.replace('@', '') : slug}`;
      }
    }, 800);
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const url = URL.createObjectURL(file);
      setMediaUrl(url);
      setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32 pt-16 pb-24">
      
      {/* ===== KINETIC HERO SECTION ===== */}
      <section className="flex flex-col items-center justify-center text-center min-h-[70vh] space-y-12 relative overflow-hidden">
        
        {/* Kinetic Background Text */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col justify-center opacity-10">
          <motion.div 
            animate={{ x: [0, -1000] }} 
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="whitespace-nowrap font-serif text-[15vw] font-bold uppercase leading-none tracking-tighter"
          >
            ONEWISHES ONEWISHES ONEWISHES ONEWISHES
          </motion.div>
          <motion.div 
            animate={{ x: [-1000, 0] }} 
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            className="whitespace-nowrap font-serif text-[15vw] font-bold uppercase leading-none tracking-tighter text-transparent"
            style={{ WebkitTextStroke: '2px white' }}
          >
            A WISH WORTH SENDING A WISH WORTH SENDING
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10"
        >
          {/* Logo Object Only */}
          <div className="relative w-48 h-48 mx-auto mb-10 overflow-hidden group rounded-full border border-white/20 p-4">
            <img 
              src="/logo.png" 
              alt="Onewishes" 
              className="w-full h-full object-cover grayscale transition-transform duration-1000 group-hover:scale-110 group-hover:grayscale-0" 
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8 relative z-10"
        >
          {/* Text Masking Style Heading */}
          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-black leading-[0.9] text-white uppercase tracking-tighter mix-blend-difference">
            A WISH <br/> <span className="text-transparent" style={{ WebkitTextStroke: '2px white' }}>WORTH</span> SENDING
          </h1>

          <p className="text-gray-400 text-sm md:text-base uppercase tracking-widest max-w-lg mx-auto leading-loose font-bold">
            ARTIFICIAL SCARCITY. <br/> So the ones you wish know what it cost you.
          </p>
          {/* Today's Onewish Banner */}
          {todayOnewish && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-20 w-full max-w-4xl mx-auto p-1 border border-white bg-white/5"
            >
              <div className="bg-black p-10 border border-white/20">
                <div className="text-xs font-bold uppercase tracking-widest text-white mb-6 flex items-center justify-between">
                  <span>Today's Onewish Spotlight</span>
                  <span className="text-gray-500">{new Date().toISOString().split('T')[0]}</span>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/20 pb-4">
                    <Link href={`/${todayOnewish.to_username || ''}`} className="text-sm font-bold tracking-widest text-gray-400 uppercase hover:text-white transition-colors">
                      TO: {todayOnewish.to_name.toUpperCase()} {todayOnewish.to_username ? `(@${todayOnewish.to_username})` : ''}
                    </Link>
                  </div>
                  
                  {todayOnewish.media_url && (
                    <div className="border border-white/20 p-2">
                      {todayOnewish.media_type === 'video' ? (
                        <video src={todayOnewish.media_url} autoPlay loop muted playsInline className="w-full h-auto max-h-[300px] object-cover grayscale" />
                      ) : (
                        <img src={todayOnewish.media_url} alt="Media" className="w-full h-auto max-h-[300px] object-cover grayscale" />
                      )}
                    </div>
                  )}

                  <p className="font-serif text-2xl md:text-3xl text-white leading-loose uppercase italic tracking-wide">
                    "{todayOnewish.message}"
                  </p>

                  <div className="pt-6 mt-6 border-t border-white/20 flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                    <Link href={`/${todayOnewish.sender_username}`} className="text-white hover:text-gray-400">FROM: @{todayOnewish.sender_username}</Link>
                    <button 
                      onClick={async (e) => {
                        e.preventDefault();
                        setTodayOnewish({ ...todayOnewish, likes_count: todayOnewish.likes_count + 1 });
                        await supabase.from('wishes').update({ likes_count: todayOnewish.likes_count + 1 }).eq('id', todayOnewish.id);
                      }}
                      className="flex items-center gap-2 text-white hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-4 h-4 fill-current hover:scale-125 transition-transform" /> {todayOnewish.likes_count}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4 pt-12">
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
                  Recipient Name (Optional if Username provided)
                </label>
                <input
                  type="text"
                  value={toName}
                  onChange={(e) => setToName(e.target.value)}
                  placeholder="E.G. MAYA"
                  className="w-full px-4 py-4 bg-black border border-white/20 text-white placeholder-gray-700 focus:outline-none focus:border-white transition-colors uppercase tracking-widest"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-white mb-2">
                  Recipient Username (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-4 text-gray-500 font-bold">@</span>
                  <input
                    type="text"
                    value={toUsername}
                    onChange={(e) => setToUsername(e.target.value)}
                    placeholder="USERNAME"
                    className="w-full pl-8 pr-4 py-4 bg-black border border-white/20 text-white placeholder-gray-700 focus:outline-none focus:border-white transition-colors uppercase tracking-widest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-white mb-2">
                  Attach Media (Image / Video)
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  className="w-full px-4 py-3 bg-black border border-white/20 text-white focus:outline-none focus:border-white transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-bold file:uppercase file:bg-white file:text-black hover:file:bg-gray-200"
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
                  TO: {toName ? toName.toUpperCase() : (toUsername ? `@${toUsername}` : 'MAYA')}
                </div>
                
                {mediaUrl && (
                  <div className="mb-8 border border-white/20 p-2 relative overflow-hidden">
                    {mediaType === 'video' ? (
                      <video src={mediaUrl} autoPlay loop muted playsInline className="w-full max-h-[300px] object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                    ) : (
                      <img src={mediaUrl} alt="Preview" className="w-full max-h-[300px] object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                    )}
                  </div>
                )}

                <p className="font-serif text-2xl text-white leading-loose uppercase tracking-wide italic">
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
