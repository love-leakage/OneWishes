'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, X, Image as ImageIcon, Film, Upload, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { JarLoader } from '@/components/JarLoader';
import { WishLikeButton } from '@/components/WishLikeButton';
import { WishMediaGallery } from '@/components/WishMediaGallery';
import { sounds } from '@/lib/sounds';
import { compressMedia, formatBytes } from '@/lib/compressMedia';

interface MediaPreview {
  id: string;
  file: File;
  previewUrl: string;
  type: 'image' | 'video';
  originalSize: number;
  compressedSize: number;
  r2Url?: string;
  isUploading?: boolean;
  uploadError?: string;
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

  // Today's Onewish State (Instant hydration from sessionStorage)
  const [todayOnewish, setTodayOnewish] = useState<any>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const today = new Date().toISOString().split('T')[0];
      const cached = sessionStorage.getItem(`onewishes_today_${today}`);
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });

  const [currentUserProfile, setCurrentUserProfile] = useState<any>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem('onewishes_cached_profile');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    // If profile already in local storage, initialize fromName immediately
    if (currentUserProfile?.username) {
      setFromName((prev) => prev || `@${currentUserProfile.username}`);
    }

    async function loadInitialData() {
      try {
        const today = new Date().toISOString().split('T')[0];
        const [bookingRes, sessionRes] = await Promise.all([
          supabase
            .from('onewish_bookings')
            .select('wish_id, wishes (*)')
            .eq('booking_date', today)
            .maybeSingle(),
          supabase.auth.getSession(),
        ]);

        if (bookingRes.data?.wish_id) {
          const wish = (bookingRes.data as any).wishes;
          if (wish) {
            setTodayOnewish(wish);
            try {
              sessionStorage.setItem(`onewishes_today_${today}`, JSON.stringify(wish));
            } catch (e) {}
          } else {
            // Fallback lookup if join isn't configured
            const { data: directWish } = await supabase
              .from('wishes')
              .select('*')
              .eq('id', bookingRes.data.wish_id)
              .maybeSingle();
            if (directWish) {
              setTodayOnewish(directWish);
              try {
                sessionStorage.setItem(`onewishes_today_${today}`, JSON.stringify(directWish));
              } catch (e) {}
            }
          }
        }

        if (sessionRes.data?.session?.user) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', sessionRes.data.session.user.id)
            .maybeSingle();
          if (prof?.username) {
            setCurrentUserProfile(prof);
            setFromName((prev) => prev || `@${prof.username}`);
            try {
              localStorage.setItem('onewishes_cached_profile', JSON.stringify(prof));
            } catch (e) {}
          }
        }
      } catch (e) {
        console.error('Home load error:', e);
      }
    }

    loadInitialData();

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

    // 1. Verify if any media is still in the middle of compressing or uploading
    const stillUploading = mediaList.some(m => m.isUploading);
    if (stillUploading) {
      setIsSubmitting(false);
      setStatusMsg('Please wait a moment while media finishes uploading to vault...');
      return;
    }

    // 2. Strict Check: Only attach media items currently confirmed in mediaList
    const activeMediaItems = mediaList.filter(m => m.r2Url);

    let finalMediaUrl: string | null = null;
    let finalMediaType: 'image' | 'video' | null = null;

    if (activeMediaItems.length === 1) {
      finalMediaUrl = activeMediaItems[0].r2Url!;
      finalMediaType = activeMediaItems[0].type;
    } else if (activeMediaItems.length > 1) {
      finalMediaUrl = JSON.stringify(
        activeMediaItems.map(m => ({ url: m.r2Url, type: m.type }))
      );
      finalMediaType = activeMediaItems.some(m => m.type === 'video') ? 'video' : 'image';
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

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files || []);
    if (rawFiles.length === 0) return;

    // Reset input value so same files can be re-selected if removed
    e.target.value = '';

    const currentVideos = mediaList.filter(m => m.type === 'video').length;
    const newVideos = rawFiles.filter(f => f.type.startsWith('video/')).length;

    if (currentVideos + newVideos > 1) {
      setStatusMsg('Only 1 video is allowed per wish (along with up to 4 photos).');
      return;
    }

    if (mediaList.length + rawFiles.length > 5) {
      setStatusMsg('Maximum 5 media items allowed (e.g. 5 photos, or 1 video + 4 photos).');
      return;
    }

    setStatusMsg(null);

    const pendingItems: MediaPreview[] = rawFiles.map(file => ({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image',
      originalSize: file.size,
      compressedSize: file.size,
      isUploading: true,
    }));

    setMediaList(prev => [...prev, ...pendingItems].slice(0, 5));

    // Upload items with fast compression and abort timeouts
    pendingItems.forEach(item => {
      uploadSingleMediaItem(item);
    });
  };

  const uploadSingleMediaItem = async (item: MediaPreview) => {
    setMediaList(prev => prev.map(m => m.id === item.id ? { ...m, isUploading: true, uploadError: undefined } : m));

    try {
      // 1. Ultra-fast compression (80-150KB target, resilient timeouts)
      const { file: optimizedFile, originalSize, compressedSize } = await compressMedia(item.file);

      // 2. Abort controller with 20-second timeout to prevent hanging forever
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 20000);

      const res = await fetch(`/api/upload?filename=${encodeURIComponent(optimizedFile.name)}&type=${encodeURIComponent(optimizedFile.type)}`, {
        method: 'POST',
        body: optimizedFile,
        headers: {
          'Content-Type': optimizedFile.type,
        },
        signal: controller.signal,
      });
      clearTimeout(timer);

      const resData = await res.json();
      if (!res.ok || !resData.url) {
        throw new Error(resData.error || 'Upload failed');
      }

      setMediaList(prev => {
        const exists = prev.some(m => m.id === item.id);
        if (!exists) {
          // If removed while uploading, purge immediately from R2
          fetch(`/api/upload?url=${encodeURIComponent(resData.url)}`, { method: 'DELETE' }).catch(() => {});
          return prev;
        }
        return prev.map(m => m.id === item.id ? {
          ...m,
          file: optimizedFile,
          originalSize,
          compressedSize,
          r2Url: resData.url,
          isUploading: false,
          uploadError: undefined,
        } : m);
      });
    } catch (err: any) {
      const isTimeout = err.name === 'AbortError';
      const msg = isTimeout ? 'Timed out. Tap retry' : (err.message || 'Upload error');
      setMediaList(prev => prev.map(m => m.id === item.id ? {
        ...m,
        isUploading: false,
        uploadError: msg,
      } : m));
    }
  };

  const retryUpload = (id: string) => {
    const item = mediaList.find(m => m.id === id);
    if (item) {
      uploadSingleMediaItem(item);
    }
  };

  const removeMediaItem = async (id: string) => {
    const target = mediaList.find(m => m.id === id);
    if (!target) return;

    // Revoke object URL from memory
    try {
      URL.revokeObjectURL(target.previewUrl);
    } catch {}

    // Immediately remove from UI
    setMediaList(prev => prev.filter(m => m.id !== id));

    // If already uploaded to R2, immediately delete from R2 storage
    if (target.r2Url) {
      try {
        await fetch(`/api/upload?url=${encodeURIComponent(target.r2Url)}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.warn('Failed to delete removed media from R2:', err);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32 pt-16 pb-24">
      
      {/* ===== KINETIC HERO SECTION ===== */}
      <section className="flex flex-col items-center justify-start pt-24 text-center min-h-[50vh] space-y-12 relative overflow-hidden">
        
        {/* Kinetic Background Text (100% GPU CSS Hardware Accelerated) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col justify-center opacity-[0.06] select-none">
          <div className="flex whitespace-nowrap animate-marquee-left font-serif text-[15vw] font-bold uppercase leading-none tracking-tighter">
            <span className="mr-8">ONEWISHES ONEWISHES ONEWISHES ONEWISHES</span>
            <span className="mr-8">ONEWISHES ONEWISHES ONEWISHES ONEWISHES</span>
          </div>
          <div 
            className="flex whitespace-nowrap animate-marquee-right font-serif text-[15vw] font-bold uppercase leading-none tracking-tighter text-transparent"
            style={{ WebkitTextStroke: '2px rgba(255, 255, 255, 0.9)' }}
          >
            <span className="mr-8">A WISH WORTH SENDING A WISH WORTH SENDING</span>
            <span className="mr-8">A WISH WORTH SENDING A WISH WORTH SENDING</span>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8 relative z-10"
        >
          {/* Text Masking Style Heading */}
          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-black leading-[0.9] text-[#fbf8f5] uppercase tracking-tighter">
            A WISH <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b8b] via-[#f84f9c] to-[#ff2a85] drop-shadow-[0_0_30px_rgba(248,79,156,0.35)]">WORTH</span> SENDING
          </h1>

          <p className="text-[#b5a5b5] text-sm md:text-base uppercase tracking-widest max-w-lg mx-auto leading-loose font-bold">
            ARTIFICIAL SCARCITY. <br/> So the ones you wish know what it cost you.
          </p>
          {/* Today's Onewish Banner */}
          {todayOnewish && (
            <div className="mt-16 w-full max-w-4xl mx-auto p-1 border border-[#26182a] bg-[#0d0910] shadow-[0_0_35px_rgba(248,79,156,0.15)]">
              <div className="bg-[#08050a] p-8 sm:p-10 border border-[#211624]">
                <div className="text-xs font-bold uppercase tracking-widest text-[#ff4d8d] mb-6 flex items-center justify-between">
                  <span className="flex items-center gap-2">✦ Today's Onewish Spotlight</span>
                  <span className="text-[#b5a5b5] font-mono">{new Date().toISOString().split('T')[0]}</span>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-[#211624] pb-4">
                    <Link href={`/${todayOnewish.to_username || ''}`} className="text-sm font-bold tracking-widest text-[#b5a5b5] uppercase hover:text-[#fbf8f5] transition-colors">
                      TO: {todayOnewish.to_name.toUpperCase()} {todayOnewish.to_username ? `(@${todayOnewish.to_username})` : ''}
                    </Link>
                  </div>
                  
                  {todayOnewish.media_url && (
                    <WishMediaGallery mediaUrl={todayOnewish.media_url} mediaType={todayOnewish.media_type} />
                  )}

                  <p className="font-serif text-2xl md:text-3xl text-[#fbf8f5] leading-loose uppercase italic tracking-wide">
                    "{todayOnewish.message}"
                  </p>

                  <div className="pt-6 mt-6 border-t border-[#211624] flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                    <Link href={`/${todayOnewish.sender_username}`} className="text-[#fbf8f5] hover:text-[#ff4d8d] transition-colors">FROM: @{todayOnewish.sender_username}</Link>
                    <WishLikeButton wishId={todayOnewish.id} initialLikes={todayOnewish.likes_count} showText />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4 pt-12">
            <button
              onClick={scrollToCreate}
              className="px-9 py-4 bg-gradient-to-r from-[#ff5376] via-[#f84f9c] to-[#ff2a85] text-white font-bold uppercase tracking-widest text-sm hover:opacity-95 hover:shadow-[0_0_30px_rgba(248,79,156,0.5)] transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(248,79,156,0.3)] rounded-full"
            >
              <span>Write a Wish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* ===== TIERS SHOWCASE ===== */}
      <section className="space-y-12 pt-16 border-t border-[#211624]">
        <div className="text-center space-y-3">
          <h2 className="font-serif text-3xl font-bold text-[#fbf8f5] uppercase tracking-widest">The Tiers</h2>
          <p className="text-[#b5a5b5] text-sm uppercase tracking-wider">Two intentional constraints.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Golden Wish Card */}
          <div className="p-10 border border-[#ff4d8d]/35 hover:border-[#ff4d8d] bg-[#0d0910] transition-all flex flex-col justify-between shadow-[0_0_30px_rgba(248,79,156,0.1)] hover:shadow-[0_0_40px_rgba(248,79,156,0.2)]">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#ff4d8d] mb-6 flex items-center gap-2">
                <span>✦</span> Tier I • 3 Per Lifetime
              </div>
              <h3 className="font-serif text-3xl font-bold text-[#fbf8f5] mb-4 uppercase">Golden Wish</h3>
              <p className="text-sm text-[#b5a5b5] leading-relaxed mb-8">
                Rare keepsake wish attached to your identity. Exactly 3 allowed per user account.
              </p>
            </div>
            <button
              onClick={() => { setSelectedTier('golden'); scrollToCreate(); }}
              className="w-full py-4 bg-gradient-to-r from-[#ff5376] to-[#f84f9c] text-white font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all shadow-[0_0_18px_rgba(248,79,156,0.3)]"
            >
              Create Golden
            </button>
          </div>

          {/* Onewish Spotlight Card */}
          <div className="p-10 border border-[#ff6b8b]/30 hover:border-[#ff6b8b] bg-[#0d0910] transition-all flex flex-col justify-between shadow-[0_0_30px_rgba(255,107,139,0.08)] hover:shadow-[0_0_40px_rgba(255,107,139,0.18)]">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#ff758c] mb-6 flex items-center gap-2">
                <span>✦</span> Tier II • 1 Slot / Day
              </div>
              <h3 className="font-serif text-3xl font-bold text-[#fbf8f5] mb-4 uppercase">Onewish Spotlight</h3>
              <p className="text-sm text-[#b5a5b5] leading-relaxed mb-8">
                Claim the front-page spotlight for a specific calendar date worldwide. Never fades.
              </p>
            </div>
            <button
              onClick={() => { setSelectedTier('onewish'); scrollToCreate(); }}
              className="w-full py-4 border border-[#ff6b8b] text-[#ff758c] font-bold uppercase tracking-widest text-xs hover:bg-[#ff6b8b]/15 transition-all"
            >
              Book Onewish
            </button>
          </div>
        </div>
      </section>

      {/* ===== PHILOSOPHY / A NOTE ON OUR NAME ===== */}
      <section className="py-8 border-t border-[#211624]">
        <div className="max-w-3xl mx-auto p-8 sm:p-12 border border-[#211624] bg-[#0d0910] text-center space-y-6 shadow-[0_0_30px_rgba(248,79,156,0.08)] relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#050505] border border-[#ff4d8d]/35 rounded-full text-[11px] font-bold uppercase tracking-widest text-[#ff4d8d]">
            ✦ A Note On Our Name
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#fbf8f5] uppercase tracking-tight leading-snug">
            "Grammar says <span className="italic text-[#b5a5b5]">One Wish</span>. <br className="hidden sm:block" />
            Feelings don't follow grammar."
          </h2>

          <p className="text-sm sm:text-base text-[#b5a5b5] leading-relaxed max-w-xl mx-auto">
            Yes, we might have broken English rules with our name. But in a world full of temporary stories and disposable texts, we built this with one truth:
          </p>

          <p className="text-base sm:text-lg font-serif italic text-gradient-rose tracking-wide max-w-xl mx-auto leading-relaxed">
            "We made a mistake in our name — but don't make the mistake of leaving your memories unsaid."
          </p>

          <div className="pt-4 border-t border-[#211624] text-[11px] uppercase tracking-widest text-[#ff758c] font-mono font-bold">
            When ONE person WISHES with all their heart, it lasts forever.
          </div>
        </div>
      </section>

      {/* ===== CREATE WISH FORM & PREVIEW ===== */}
      <section id="create-section" className="pt-24 scroll-mt-24 border-t border-[#211624]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form Box */}
          <div className="lg:col-span-7 space-y-8">
            <h2 className="font-serif text-4xl font-bold text-[#fbf8f5] uppercase tracking-tighter">Write Your Wish</h2>
            
            {/* Tier Selector */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedTier('golden')}
                className={`p-4 border text-center transition-all ${
                  selectedTier === 'golden'
                    ? 'border-[#ff4d8d] bg-gradient-to-r from-[#ff5376] to-[#f84f9c] text-white shadow-[0_0_20px_rgba(248,79,156,0.35)]'
                    : 'border-[#241727] bg-[#0d0910] text-[#b5a5b5] hover:border-[#ff4d8d]/50'
                }`}
              >
                <div className="text-sm font-bold uppercase tracking-widest">Golden</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTier('onewish')}
                className={`p-4 border text-center transition-all ${
                  selectedTier === 'onewish'
                    ? 'border-[#ff6b8b] bg-[#ff6b8b] text-[#050505] shadow-[0_0_20px_rgba(255,107,139,0.35)] font-bold'
                    : 'border-[#241727] bg-[#0d0910] text-[#b5a5b5] hover:border-[#ff6b8b]/50'
                }`}
              >
                <div className="text-sm font-bold uppercase tracking-widest">Onewish</div>
              </button>
            </div>

            <form onSubmit={handleWishSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#fbf8f5] mb-2">
                  Recipient Name (Optional if Username provided)
                </label>
                <input
                  type="text"
                  value={toName}
                  onChange={(e) => setToName(e.target.value)}
                  placeholder="E.G. MAYA"
                  className="w-full px-4 py-4 bg-[#08050a] border border-[#241727] text-[#fbf8f5] placeholder-[#5a485e] focus:outline-none focus:border-[#ff4d8d] transition-colors uppercase tracking-widest"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#fbf8f5] mb-2">
                  {selectedTier === 'golden' ? 'Recipient Username * (For /goldenwish/username/count)' : 'Recipient Username (Optional)'}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-4 text-[#ff4d8d] font-bold">@</span>
                  <input
                    type="text"
                    value={toUsername}
                    onChange={(e) => setToUsername(e.target.value)}
                    placeholder="USERNAME"
                    required={selectedTier === 'golden'}
                    className="w-full pl-8 pr-4 py-4 bg-[#08050a] border border-[#241727] text-[#fbf8f5] placeholder-[#5a485e] focus:outline-none focus:border-[#ff4d8d] transition-colors uppercase tracking-widest"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#fbf8f5]">
                    Attach Media <span className="text-[#b5a5b5] font-normal">(Up to 5 photos, or 1 video + photos)</span>
                  </label>
                  <span className="text-[10px] font-mono font-bold text-[#ff4d8d]">
                    {mediaList.length}/5 SELECTED
                  </span>
                </div>

                {mediaList.length < 5 && (
                  <label className="flex flex-col items-center justify-center border border-dashed border-[#241727] hover:border-[#ff4d8d]/60 bg-[#08050a] p-5 cursor-pointer transition-all group">
                    <div className="flex items-center gap-3 text-[#b5a5b5] group-hover:text-[#fbf8f5] transition-colors">
                      <Upload className="w-4 h-4 text-[#ff4d8d]" />
                      <span className="text-xs uppercase font-bold tracking-widest">
                        Choose Photos or Video (Max 5)
                      </span>
                    </div>
                    <span className="text-[10px] text-[#7a6a7a] mt-1 uppercase tracking-wider">
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
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3">
                    {mediaList.map((item) => (
                      <div key={item.id} className="relative aspect-square border border-[#241727] bg-[#0c0810] overflow-hidden group rounded-sm shadow-md">
                        {item.type === 'video' ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-black/80 text-[#ff4d8d]">
                            <Film className="w-6 h-6 mb-1" />
                            <span className="text-[9px] font-bold uppercase tracking-wider">Video</span>
                            <span className="text-[8px] text-[#b5a5b5] font-mono mt-0.5">{formatBytes(item.compressedSize)}</span>
                          </div>
                        ) : (
                          <img src={item.previewUrl} alt="Upload preview" className="w-full h-full object-cover" />
                        )}

                        {/* Uploading / Optimizing Overlay */}
                        {item.isUploading && (
                          <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-1 z-10">
                            <Loader2 className="w-5 h-5 text-[#ff4d8d] animate-spin mb-1" />
                            <span className="text-[8px] font-bold text-[#fbf8f5] uppercase tracking-wider">Optimizing</span>
                            <span className="text-[7px] text-[#ff6b8b] uppercase font-mono">Uploading R2</span>
                          </div>
                        )}

                        {/* Ready badge with size info */}
                        {!item.isUploading && item.r2Url && (
                          <div className="absolute bottom-0 inset-x-0 bg-black/85 backdrop-blur-[2px] py-0.5 px-1 flex items-center justify-between text-[8px] font-mono border-t border-[#241727] z-10">
                            <span className="text-[#00ffaa] flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Ready
                            </span>
                            <span className="text-[#b5a5b5]">{formatBytes(item.compressedSize)}</span>
                          </div>
                        )}

                        {/* Error overlay with retry */}
                        {item.uploadError && !item.isUploading && (
                          <div className="absolute inset-0 bg-red-950/90 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-1 z-10 space-y-1">
                            <span className="text-[7.5px] font-bold text-red-200 uppercase leading-tight line-clamp-1">
                              {item.uploadError}
                            </span>
                            <button
                              type="button"
                              onClick={() => retryUpload(item.id)}
                              className="text-[7.5px] font-bold bg-[#ff4d8d] hover:bg-[#ff2a85] text-white px-2 py-0.5 rounded-sm uppercase tracking-wider transition-colors shadow"
                            >
                              Retry
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => removeMediaItem(item.id)}
                          className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-red-600 text-white rounded-full transition-colors opacity-90 hover:opacity-100 z-20 shadow"
                          title="Remove item & delete from R2"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#fbf8f5] mb-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="WRITE SOMETHING MEANINGFUL..."
                  required
                  className="w-full px-4 py-4 bg-[#08050a] border border-[#241727] text-[#fbf8f5] placeholder-[#5a485e] focus:outline-none focus:border-[#ff4d8d] transition-colors resize-none uppercase tracking-wide text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#f5f2eb] mb-2 flex items-center justify-between">
                  <span>Your Signature</span>
                  {currentUserProfile?.username && (
                    <span className="text-[10px] text-[#8da095] font-normal tracking-wider">
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
                  className="w-full px-4 py-4 bg-[#08050a] border border-[#241727] text-[#fbf8f5] placeholder-[#5a485e] focus:outline-none focus:border-[#ff4d8d] transition-colors uppercase tracking-widest"
                />
              </div>

              {selectedTier === 'onewish' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#fbf8f5] mb-2">
                    Spotlight Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                    className="w-full px-4 py-4 bg-[#08050a] border border-[#241727] text-[#fbf8f5] focus:outline-none focus:border-[#ff4d8d] transition-colors tracking-widest uppercase"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-5 bg-gradient-to-r from-[#ff5376] via-[#f84f9c] to-[#ff2a85] text-white font-bold text-sm tracking-widest uppercase hover:opacity-95 transition-all mt-6 shadow-[0_0_25px_rgba(248,79,156,0.35)]"
              >
                Seal & Send Wish
              </button>

              {statusMsg && (
                <p className="text-xs text-[#ff758c] text-center pt-4 font-bold uppercase tracking-widest">{statusMsg}</p>
              )}
            </form>
          </div>

          {/* Live Preview Card */}
          <div className="lg:col-span-5 flex flex-col pt-16">
            <div className="p-10 border border-[#26182a] bg-[#0d0910] flex-1 flex flex-col justify-between shadow-[0_0_35px_rgba(248,79,156,0.12)] min-h-[500px]">
              <div>
                <div className="text-xs font-bold tracking-widest text-[#b5a5b5] uppercase mb-8 border-b border-[#211624] pb-4 flex items-center justify-between">
                  <span>TO: {toName ? toName.toUpperCase() : (toUsername ? `@${toUsername}` : 'MAYA')}</span>
                  <span className="text-[#ff4d8d] text-base">✦</span>
                </div>
                
                {mediaList.length > 0 && (
                  <div className="mb-8">
                    <WishMediaGallery
                      mediaUrl={JSON.stringify(mediaList.map((m) => ({ url: m.previewUrl, type: m.type })))}
                    />
                  </div>
                )}

                <p className="font-serif text-2xl text-[#fbf8f5] leading-loose uppercase tracking-wide italic">
                  "{message || 'MAY YOUR PATH BE CLEAR, AND EVERY DREAM YOU CARRY FIND ITS LIGHT.'}"
                </p>
              </div>

              <div className="pt-8 border-t border-[#211624] flex flex-col gap-4 text-[#fbf8f5] text-xs">
                <span className="font-bold tracking-widest uppercase">FROM: {fromName || 'ALEX'}</span>
                <span className="uppercase text-[10px] font-bold tracking-widest text-[#ff4d8d]">
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
