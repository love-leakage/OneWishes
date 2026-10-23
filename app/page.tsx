'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, X, Image as ImageIcon, Film, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { JarLoader } from '@/components/JarLoader';
import { WishLikeButton } from '@/components/WishLikeButton';
import { WishMediaGallery } from '@/components/WishMediaGallery';
import { sounds } from '@/lib/sounds';

interface MediaPreview {
  file: File;
  previewUrl: string;
  type: 'image' | 'video';
}

export default function HomePage() {
  const [selectedTier, setSelectedTier] = useState<'golden' | 'onewish'>('golden');
  const [toName, setToName] = useState('');
  const [toUsername, setToUsername] = useState('');
  const [message, setMessage] = useState('');
  const [fromName, setFromName] = useState('');
  const [mediaList, setMediaList] = useState<MediaPreview[]>([]);
  const [privacy, setPrivacy] = useState('public');
  const [bookingDate, setBookingDate] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Today's Onewish State
  const [todayOnewish, setTodayOnewish] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);

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

    async function checkCurrentProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .maybeSingle();
        if (prof?.username) {
          setCurrentUserProfile(prof);
          setFromName((prev) => prev || `@${prof.username}`);
        }
      }
    }
    checkCurrentProfile();

    const handleProfileUpdate = (e: any) => {
      if (e.detail?.username) {
        setCurrentUserProfile(e.detail);
        setFromName((prev) => prev || `@${e.detail.username}`);
      }
    };
    window.addEventListener('onewishes:profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('onewishes:profile-updated', handleProfileUpdate);
  }, []);


  const scrollToCreate = () => {
    document.getElementById('create-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg('Sealing your wish...');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setIsSubmitting(false);
      await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href }});
      return;
    }

    // Ensure sender's verified unique profile username is used
    const { data: userProf } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', session.user.id)
      .maybeSingle();

    const senderUsername = userProf?.username || session.user.email?.split('@')[0] || 'user';

    if (selectedTier === 'golden') {
      const { data: claimed, error: rpcErr } = await supabase.rpc('claim_golden_wish');
      if (rpcErr || !claimed) {
        setIsSubmitting(false);
        setStatusMsg('You have used all 3 lifetime Golden wishes.');
        return;
      }
    }

    let finalMediaUrl: string | null = null;
    let finalMediaType: 'image' | 'video' | null = null;

    if (mediaList.length > 0) {
      setStatusMsg(`Sealing & uploading ${mediaList.length} media ${mediaList.length > 1 ? 'files' : 'file'}...`);
      try {
        const uploadPromises = mediaList.map(async (item) => {
          const res = await fetch(`/api/upload?filename=${encodeURIComponent(item.file.name)}&type=${encodeURIComponent(item.file.type)}`, {
            method: 'POST',
            body: item.file,
            headers: {
              'Content-Type': item.file.type
            }
          });
          const resData = await res.json();
          if (!resData.url) {
            throw new Error(resData.error || 'Failed to upload media file');
          }
          return { url: resData.url, type: item.type };
        });

        const uploadedItems = await Promise.all(uploadPromises);
        if (uploadedItems.length === 1) {
          finalMediaUrl = uploadedItems[0].url;
          finalMediaType = uploadedItems[0].type;
        } else {
          finalMediaUrl = JSON.stringify(uploadedItems);
          finalMediaType = uploadedItems.some(u => u.type === 'video') ? 'video' : 'image';
        }
      } catch (err: any) {
        setIsSubmitting(false);
        setStatusMsg(`Media upload failed: ${err.message || 'Network error'}`);
        return;
      }
    }

    setStatusMsg('Saving your wish in the vault...');

    const slug = Math.random().toString(36).substring(2, 9);
    const cleanToUsername = toUsername ? toUsername.trim().replace(/^@/, '').toLowerCase() : null;

    if (selectedTier === 'golden' && !cleanToUsername && !toName.trim()) {
      setIsSubmitting(false);
      setStatusMsg('Please provide a Recipient Username for Golden Wish.');
      return;
    }

    const wishData = {
      user_id: session.user.id,
      sender_username: senderUsername,
      tier: selectedTier,
      from_name: fromName || `@${senderUsername}`,
      to_name: toName || (cleanToUsername ? '' : 'Someone Special'),
      to_username: cleanToUsername,
      message: message || 'May your path be clear...',
      media_url: finalMediaUrl,
      media_type: finalMediaType,
      privacy,
      slug,
    };

    const { data, error } = await supabase.from('wishes').insert([wishData]).select().single();

    if (error) {
      setIsSubmitting(false);
      setStatusMsg('Error creating wish: ' + error.message);
      return;
    }

    // Play subtle celestial seal sound
    sounds.playSeal();

    if (selectedTier === 'onewish') {
      const dateVal = bookingDate || new Date().toISOString().split('T')[0];
      const { error: bookingErr } = await supabase.from('onewish_bookings').insert([
        { booking_date: dateVal, wish_id: data.id, user_id: session.user.id }
      ]);
      
      if (bookingErr) {
        setIsSubmitting(false);
        await supabase.from('wishes').delete().eq('id', data.id);
        setStatusMsg('Sorry, this date is already booked! Choose another date.');
        return;
      }

      setStatusMsg('Wish sealed! Redirecting...');
      setTimeout(() => {
        window.location.href = `/${dateVal}`;
      }, 500);
      return;
    } else {
      // Golden Wish: website + goldenwish + username + wish count
      const targetUser = cleanToUsername || (toName ? toName.toLowerCase().replace(/[^a-z0-9_]/g, '') : slug);
      const { count } = await supabase
        .from('wishes')
        .select('*', { count: 'exact', head: true })
        .eq('to_username', targetUser)
        .eq('tier', 'golden');
      
      const wishNum = count && count > 0 ? count : 1;
      setStatusMsg('Wish sealed! Redirecting...');
      setTimeout(() => {
        window.location.href = `/goldenwish/${targetUser}/${wishNum}`;
      }, 500);
      return;
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentVideos = mediaList.filter(m => m.type === 'video').length;
    const newVideos = files.filter(f => f.type.startsWith('video/')).length;

    if (currentVideos + newVideos > 1) {
      setStatusMsg('Only 1 video is allowed per wish (along with up to 4 photos).');
      return;
    }

    if (mediaList.length + files.length > 5) {
      setStatusMsg('Maximum 5 media items allowed (e.g. 5 photos, or 1 video + 4 photos).');
      return;
    }

    const newPreviews: MediaPreview[] = files.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image',
    }));

    setMediaList(prev => [...prev, ...newPreviews].slice(0, 5));
    setStatusMsg(null);
  };

  const removeMediaItem = (idx: number) => {
    setMediaList(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32 pt-16 pb-24">
      
      {/* ===== KINETIC HERO SECTION ===== */}
      <section className="flex flex-col items-center justify-start pt-24 text-center min-h-[50vh] space-y-12 relative overflow-hidden">
        
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
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8 relative z-10"
        >
          {/* Text Masking Style Heading */}
          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-black leading-[0.9] text-[#f3eee3] uppercase tracking-tighter">
            A WISH <br/> <span className="text-transparent" style={{ WebkitTextStroke: '2px #72897e' }}>WORTH</span> SENDING
          </h1>

          <p className="text-[#a6b6ad] text-sm md:text-base uppercase tracking-widest max-w-lg mx-auto leading-loose font-bold">
            ARTIFICIAL SCARCITY. <br/> So the ones you wish know what it cost you.
          </p>
          {/* Today's Onewish Banner */}
          {todayOnewish && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-16 w-full max-w-4xl mx-auto p-1 border border-[#72897e]/40 bg-[#1a2621]/60 backdrop-blur-sm shadow-[8px_8px_0px_0px_rgba(114,137,126,0.15)]"
            >
              <div className="bg-[#141f1b] p-8 sm:p-10 border border-[#2a3d35]">
                <div className="text-xs font-bold uppercase tracking-widest text-[#72897e] mb-6 flex items-center justify-between">
                  <span>Today's Onewish Spotlight</span>
                  <span className="text-[#a6b6ad]">{new Date().toISOString().split('T')[0]}</span>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-[#2a3d35] pb-4">
                    <Link href={`/${todayOnewish.to_username || ''}`} className="text-sm font-bold tracking-widest text-[#a6b6ad] uppercase hover:text-[#f3eee3] transition-colors">
                      TO: {todayOnewish.to_name.toUpperCase()} {todayOnewish.to_username ? `(@${todayOnewish.to_username})` : ''}
                    </Link>
                  </div>
                  
                  {todayOnewish.media_url && (
                    <WishMediaGallery mediaUrl={todayOnewish.media_url} mediaType={todayOnewish.media_type} />
                  )}

                  <p className="font-serif text-2xl md:text-3xl text-[#f3eee3] leading-loose uppercase italic tracking-wide">
                    "{todayOnewish.message}"
                  </p>

                  <div className="pt-6 mt-6 border-t border-[#2a3d35] flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                    <Link href={`/${todayOnewish.sender_username}`} className="text-[#f3eee3] hover:text-[#72897e]">FROM: @{todayOnewish.sender_username}</Link>
                    <WishLikeButton wishId={todayOnewish.id} initialLikes={todayOnewish.likes_count} showText />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4 pt-12">
            <button
              onClick={scrollToCreate}
              className="px-8 py-4 bg-[#f3eee3] text-[#141f1b] font-bold uppercase tracking-widest text-sm hover:bg-white transition-colors flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(114,137,126,0.3)]"
            >
              <span>Write a Wish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* ===== TIERS SHOWCASE ===== */}
      <section className="space-y-12 pt-16 border-t border-[#2a3d35]">
        <div className="text-center space-y-3">
          <h2 className="font-serif text-3xl font-bold text-[#f3eee3] uppercase tracking-widest">The Tiers</h2>
          <p className="text-[#a6b6ad] text-sm uppercase tracking-wider">Two intentional constraints.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Golden Wish Card */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-10 border border-[#e4c067]/40 hover:border-[#e4c067] bg-[#1a2621] transition-all flex flex-col justify-between shadow-[6px_6px_0px_0px_rgba(228,192,103,0.15)]"
          >
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#e4c067] mb-6">
                Tier I • 3 Per Lifetime
              </div>
              <h3 className="font-serif text-3xl font-bold text-[#f3eee3] mb-4 uppercase">Golden Wish</h3>
              <p className="text-sm text-[#a6b6ad] leading-relaxed mb-8">
                Rare keepsake wish attached to your identity. Exactly 3 allowed per user account.
              </p>
            </div>
            <button
              onClick={() => { setSelectedTier('golden'); scrollToCreate(); }}
              className="w-full py-4 border border-[#e4c067] text-[#e4c067] font-bold uppercase tracking-widest text-xs hover:bg-[#e4c067] hover:text-[#141f1b] transition-colors"
            >
              Create Golden
            </button>
          </motion.div>

          {/* Onewish Spotlight Card */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-10 border border-[#2a3d35] hover:border-[#72897e] bg-[#1a2621] transition-all flex flex-col justify-between shadow-[6px_6px_0px_0px_rgba(114,137,126,0.15)]"
          >
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#72897e] mb-6">
                Tier II • 1 Slot / Day
              </div>
              <h3 className="font-serif text-3xl font-bold text-[#f3eee3] mb-4 uppercase">Onewish Spotlight</h3>
              <p className="text-sm text-[#a6b6ad] leading-relaxed mb-8">
                Claim the front-page spotlight for a specific calendar date worldwide. Never fades.
              </p>
            </div>
            <button
              onClick={() => { setSelectedTier('onewish'); scrollToCreate(); }}
              className="w-full py-4 border border-[#2a3d35] text-[#f3eee3] font-bold uppercase tracking-widest text-xs hover:border-[#72897e] hover:bg-[#72897e]/20 transition-colors"
            >
              Book Onewish
            </button>
          </motion.div>
        </div>
      </section>

      {/* ===== CREATE WISH FORM & PREVIEW ===== */}
      <section id="create-section" className="pt-24 scroll-mt-24 border-t border-[#2a3d35]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form Box */}
          <div className="lg:col-span-7 space-y-8">
            <h2 className="font-serif text-4xl font-bold text-[#f3eee3] uppercase tracking-tighter">Write Your Wish</h2>
            
            {/* Tier Selector */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedTier('golden')}
                className={`p-4 border text-center transition-all ${
                  selectedTier === 'golden'
                    ? 'border-[#e4c067] bg-[#e4c067] text-[#141f1b]'
                    : 'border-[#2a3d35] text-[#a6b6ad] hover:border-[#72897e]'
                }`}
              >
                <div className="text-sm font-bold uppercase tracking-widest">Golden</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTier('onewish')}
                className={`p-4 border text-center transition-all ${
                  selectedTier === 'onewish'
                    ? 'border-[#72897e] bg-[#72897e] text-white'
                    : 'border-[#2a3d35] text-[#a6b6ad] hover:border-[#72897e]'
                }`}
              >
                <div className="text-sm font-bold uppercase tracking-widest">Onewish</div>
              </button>
            </div>

            <form onSubmit={handleWishSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#f3eee3] mb-2">
                  Recipient Name (Optional if Username provided)
                </label>
                <input
                  type="text"
                  value={toName}
                  onChange={(e) => setToName(e.target.value)}
                  placeholder="E.G. MAYA"
                  className="w-full px-4 py-4 bg-[#121b18] border border-[#2a3d35] text-[#f3eee3] placeholder-[#425e52] focus:outline-none focus:border-[#72897e] transition-colors uppercase tracking-widest"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#f3eee3] mb-2">
                  {selectedTier === 'golden' ? 'Recipient Username * (For /goldenwish/username/count)' : 'Recipient Username (Optional)'}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-4 text-[#72897e] font-bold">@</span>
                  <input
                    type="text"
                    value={toUsername}
                    onChange={(e) => setToUsername(e.target.value)}
                    placeholder="USERNAME"
                    required={selectedTier === 'golden'}
                    className="w-full pl-8 pr-4 py-4 bg-[#121b18] border border-[#2a3d35] text-[#f3eee3] placeholder-[#425e52] focus:outline-none focus:border-[#72897e] transition-colors uppercase tracking-widest"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#f3eee3]">
                    Attach Media <span className="text-[#a6b6ad] font-normal">(Up to 5 photos, or 1 video + photos)</span>
                  </label>
                  <span className="text-[10px] font-mono font-bold text-[#e4c067]">
                    {mediaList.length}/5 SELECTED
                  </span>
                </div>

                {mediaList.length < 5 && (
                  <label className="flex flex-col items-center justify-center border border-dashed border-[#2a3d35] hover:border-[#72897e] bg-[#121b18] p-5 cursor-pointer transition-all group">
                    <div className="flex items-center gap-3 text-[#a6b6ad] group-hover:text-[#f3eee3] transition-colors">
                      <Upload className="w-4 h-4 text-[#72897e]" />
                      <span className="text-xs uppercase font-bold tracking-widest">
                        Choose Photos or Video (Max 5)
                      </span>
                    </div>
                    <span className="text-[10px] text-[#72897e] mt-1 uppercase tracking-wider">
                      Supports JPG, PNG, WEBP, MP4, WEBM
                    </span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {/* Selected Media Thumbnails Grid */}
                {mediaList.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-3">
                    {mediaList.map((item, idx) => (
                      <div key={idx} className="relative aspect-square border border-[#2a3d35] bg-[#1a2621] overflow-hidden group">
                        {item.type === 'video' ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-black/60 text-[#e4c067]">
                            <Film className="w-5 h-5 mb-1" />
                            <span className="text-[8px] font-bold uppercase tracking-wider">Video</span>
                          </div>
                        ) : (
                          <img src={item.previewUrl} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => removeMediaItem(idx)}
                          className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-red-900/80 text-white rounded-full transition-colors opacity-90 hover:opacity-100"
                          title="Remove item"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#f3eee3] mb-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="WRITE SOMETHING MEANINGFUL..."
                  required
                  className="w-full px-4 py-4 bg-[#121b18] border border-[#2a3d35] text-[#f3eee3] placeholder-[#425e52] focus:outline-none focus:border-[#72897e] transition-colors resize-none uppercase tracking-wide text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#f3eee3] mb-2 flex items-center justify-between">
                  <span>Your Signature</span>
                  {currentUserProfile?.username && (
                    <span className="text-[10px] text-[#72897e] font-normal tracking-wider">
                      Verified as @{currentUserProfile.username}
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder={currentUserProfile?.username ? `@${currentUserProfile.username}` : "E.G. ALEX"}
                  required
                  className="w-full px-4 py-4 bg-[#121b18] border border-[#2a3d35] text-[#f3eee3] placeholder-[#425e52] focus:outline-none focus:border-[#72897e] transition-colors uppercase tracking-widest"
                />
              </div>

              {selectedTier === 'onewish' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#f3eee3] mb-2">
                    Spotlight Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                    className="w-full px-4 py-4 bg-[#121b18] border border-[#2a3d35] text-[#f3eee3] focus:outline-none focus:border-[#72897e] transition-colors tracking-widest uppercase"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-5 bg-[#f3eee3] text-[#141f1b] font-bold text-sm tracking-widest uppercase hover:bg-white transition-colors mt-6 shadow-[4px_4px_0px_0px_rgba(114,137,126,0.3)]"
              >
                Seal & Send Wish
              </button>

              {statusMsg && (
                <p className="text-xs text-[#72897e] text-center pt-4 font-bold uppercase tracking-widest">{statusMsg}</p>
              )}
            </form>
          </div>

          {/* Live Preview Card */}
          <div className="lg:col-span-5 flex flex-col pt-16">
            <div className="p-10 border border-[#72897e]/40 bg-[#1a2621] flex-1 flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(114,137,126,0.2)] min-h-[500px]">
              <div>
                <div className="text-xs font-bold tracking-widest text-[#a6b6ad] uppercase mb-8 border-b border-[#2a3d35] pb-4">
                  TO: {toName ? toName.toUpperCase() : (toUsername ? `@${toUsername}` : 'MAYA')}
                </div>
                
                {mediaList.length > 0 && (
                  <div className="mb-8">
                    <WishMediaGallery
                      mediaUrl={JSON.stringify(mediaList.map((m) => ({ url: m.previewUrl, type: m.type })))}
                    />
                  </div>
                )}

                <p className="font-serif text-2xl text-[#f3eee3] leading-loose uppercase tracking-wide italic">
                  "{message || 'MAY YOUR PATH BE CLEAR, AND EVERY DREAM YOU CARRY FIND ITS LIGHT.'}"
                </p>
              </div>

              <div className="pt-8 border-t border-[#2a3d35] flex flex-col gap-4 text-[#f3eee3] text-xs">
                <span className="font-bold tracking-widest uppercase">FROM: {fromName || 'ALEX'}</span>
                <span className="uppercase text-[10px] font-bold tracking-widest text-[#72897e]">
                  TIER: {selectedTier}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isSubmitting && (
        <JarLoader fullScreen text="ONEWISHES" subtext={statusMsg || 'Sealing your wish...'} size="lg" />
      )}
    </div>
  );
}
