'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Heart, X, Film, Upload, Loader2, Sparkles, 
  CheckCircle2, Camera, Calendar, Clock, Share2, Bookmark,
  Layers, Disc, ChevronRight, Check, Compass, MessageCircle
} from 'lucide-react';
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
  const [copiedSpotlight, setCopiedSpotlight] = useState(false);

  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [bookingDate, setBookingDate] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const queryDate = urlParams.get('date');
      if (queryDate && /^\d{4}-\d{2}-\d{2}$/.test(queryDate)) {
        return queryDate;
      }
    }
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const [dateAvailability, setDateAvailability] = useState<'checking' | 'available' | 'booked' | null>(null);
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
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const qTier = urlParams.get('tier');
      const qDate = urlParams.get('date');
      if (qTier === 'onewish' || qDate) {
        setSelectedTier('onewish');
      } else if (qTier === 'golden') {
        setSelectedTier('golden');
      }
      if (qDate && /^\d{4}-\d{2}-\d{2}$/.test(qDate)) {
        setBookingDate(qDate);
      }
    }
  }, []);

  // Real-time booking date availability checker
  useEffect(() => {
    if (!bookingDate || selectedTier !== 'onewish') {
      setDateAvailability(null);
      return;
    }
    let active = true;
    setDateAvailability('checking');
    supabase
      .from('onewish_bookings')
      .select('id')
      .eq('booking_date', bookingDate)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        if (data) {
          setDateAvailability('booked');
        } else {
          setDateAvailability('available');
        }
      });
    return () => { active = false; };
  }, [bookingDate, selectedTier]);

  useEffect(() => {
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

  const scrollToDarkroom = () => {
    sounds.playChime();
    document.getElementById('darkroom-studio')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCopySpotlight = () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/${getLocalDateString()}`;
    navigator.clipboard.writeText(url);
    sounds.playChime();
    setCopiedSpotlight(true);
    setTimeout(() => setCopiedSpotlight(false), 2200);
  };

  const handleWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg('Developing your keepsake into the archive...');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setIsSubmitting(false);
      await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href }});
      return;
    }

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
        setStatusMsg('All 3 lifetime exposures have already been developed.');
        return;
      }
    }

    const stillUploading = mediaList.some(m => m.isUploading);
    if (stillUploading) {
      setIsSubmitting(false);
      setStatusMsg('Please wait a moment while film negatives finish developing...');
      return;
    }

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

    setStatusMsg('Committing negative to permanent vault...');

    const slug = Math.random().toString(36).substring(2, 9);
    const cleanToUsername = toUsername ? toUsername.trim().replace(/^@/, '').toLowerCase() : null;

    if (selectedTier === 'golden' && !cleanToUsername && !toName.trim()) {
      setIsSubmitting(false);
      setStatusMsg('Please provide a Recipient Name or Username.');
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
      setStatusMsg('Error archiving wish: ' + error.message);
      return;
    }

    sounds.playSeal();

    if (selectedTier === 'onewish') {
      const dateVal = bookingDate || getLocalDateString();
      const { error: bookingErr } = await supabase.from('onewish_bookings').insert([
        { booking_date: dateVal, wish_id: data.id, user_id: session.user.id }
      ]);
      
      if (bookingErr) {
        setIsSubmitting(false);
        await supabase.from('wishes').delete().eq('id', data.id);
        setStatusMsg(`Date ${dateVal} was already booked! Please pick another date.`);
        setDateAvailability('booked');
        return;
      }

      try {
        sessionStorage.setItem(`onewishes_today_${dateVal}`, JSON.stringify(data));
      } catch (e) {}

      setStatusMsg(`Wish archived for ${dateVal}! Opening showcase...`);
      setTimeout(() => {
        window.location.href = `/${dateVal}`;
      }, 500);
      return;
    } else {
      const targetUser = cleanToUsername || (toName ? toName.toLowerCase().replace(/[^a-z0-9_]/g, '') : slug);
      const { count } = await supabase
        .from('wishes')
        .select('*', { count: 'exact', head: true })
        .eq('to_username', targetUser)
        .eq('tier', 'golden');
      
      const wishNum = count && count > 0 ? count : 1;
      setStatusMsg('Archived! Opening your golden keepsake...');
      setTimeout(() => {
        window.location.href = `/goldenwish/${targetUser}/${wishNum}`;
      }, 500);
      return;
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files || []);
    if (rawFiles.length === 0) return;

    e.target.value = '';

    const currentVideos = mediaList.filter(m => m.type === 'video').length;
    const newVideos = rawFiles.filter(f => f.type.startsWith('video/')).length;

    if (currentVideos + newVideos > 1) {
      setStatusMsg('Only 1 motion clip is allowed per roll (with up to 4 photos).');
      return;
    }

    if (mediaList.length + rawFiles.length > 5) {
      setStatusMsg('Maximum 5 exposures per film roll.');
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

    pendingItems.forEach(item => {
      uploadSingleMediaItem(item);
    });
  };

  const uploadSingleMediaItem = async (item: MediaPreview) => {
    setMediaList(prev => prev.map(m => m.id === item.id ? { ...m, isUploading: true, uploadError: undefined } : m));

    try {
      const { file: optimizedFile, originalSize, compressedSize } = await compressMedia(item.file);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 25000);

      let publicUrl = '';

      try {
        const presignRes = await fetch(
          `/api/upload?filename=${encodeURIComponent(optimizedFile.name)}&type=${encodeURIComponent(optimizedFile.type)}`,
          { signal: controller.signal }
        );
        const presignData = await presignRes.json();
        
        if (presignRes.ok && presignData.uploadUrl) {
          const r2PutRes = await fetch(presignData.uploadUrl, {
            method: 'PUT',
            body: optimizedFile,
            headers: {
              'Content-Type': optimizedFile.type,
            },
            signal: controller.signal,
          });

          if (r2PutRes.ok) {
            publicUrl = presignData.publicUrl;
          }
        }
      } catch (directErr) {
        console.warn('Direct upload fallback:', directErr);
      }

      if (!publicUrl) {
        const res = await fetch(
          `/api/upload?filename=${encodeURIComponent(optimizedFile.name)}&type=${encodeURIComponent(optimizedFile.type)}`,
          {
            method: 'POST',
            body: optimizedFile,
            headers: {
              'Content-Type': optimizedFile.type,
            },
            signal: controller.signal,
          }
        );
        const resData = await res.json();
        if (!res.ok || !resData.url) {
          throw new Error(resData.error || 'Upload failed');
        }
        publicUrl = resData.url;
      }
      clearTimeout(timer);

      setMediaList(prev => {
        const exists = prev.some(m => m.id === item.id);
        if (!exists) {
          fetch(`/api/upload?url=${encodeURIComponent(publicUrl)}`, { method: 'DELETE' }).catch(() => {});
          return prev;
        }
        return prev.map(m => m.id === item.id ? {
          ...m,
          file: optimizedFile,
          originalSize,
          compressedSize,
          r2Url: publicUrl,
          isUploading: false,
          uploadError: undefined,
        } : m);
      });
    } catch (err: any) {
      const isTimeout = err.name === 'AbortError';
      const msg = isTimeout ? 'Developing timed out. Tap retry' : (err.message || 'Film processing error');
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

    try {
      URL.revokeObjectURL(target.previewUrl);
    } catch {}

    setMediaList(prev => prev.filter(m => m.id !== id));

    if (target.r2Url) {
      try {
        await fetch(`/api/upload?url=${encodeURIComponent(target.r2Url)}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.warn('Failed to delete media:', err);
      }
    }
  };

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="min-h-screen bg-[#0c0a08] text-[#ede3d2] relative overflow-hidden film-grain-overlay selection:bg-[#dca766] selection:text-[#120e0a]">
      
      {/* Ambient Vintage Darkroom Lamp Warmth with Breathe Animation */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[980px] h-[500px] bg-gradient-to-b from-[#dca766]/15 via-[#a8713a]/08 to-transparent blur-[160px] pointer-events-none -z-10 animate-vintage-glow" />
      <div className="absolute top-[800px] -left-40 w-[620px] h-[520px] bg-gradient-to-tr from-[#8a4f22]/10 to-transparent blur-[180px] pointer-events-none -z-10" />

      {/* 35mm Film Sprocket Runner Ticker with Spinning Reel Glyphs */}
      <div className="border-b border-[#3d332a]/70 bg-[#090806]/95 py-2.5 overflow-hidden relative select-none">
        <div className="flex whitespace-nowrap animate-marquee-left font-mono text-[10px] tracking-[0.25em] text-[#b8956e] uppercase">
          <span className="mx-6 flex items-center gap-2">
            <span className="w-2.5 h-2.5 border border-dashed border-[#dca766] rounded-full inline-block animate-reel-spin" />
            35MM ANALOG CHRONICLE // ARCHIVE EST. 2026 // TIME CAPSULE REGISTRY
          </span>
          <span className="mx-6">★ 3 SACRED LIFETIME EXPOSURES</span>
          <span className="mx-6">★ 1 CALENDAR MASTER NEGATIVE PER DATE</span>
          <span className="mx-6">★ UNBREAKABLE SENTIMENTAL PROVENANCE</span>
          <span className="mx-6">★ NEVER OVERWRITTEN • DEVELOPED FOR ETERNITY</span>
          <span className="mx-6 flex items-center gap-2">
            <span className="w-2.5 h-2.5 border border-dashed border-[#dca766] rounded-full inline-block animate-reel-spin" />
            35MM ANALOG CHRONICLE // ARCHIVE EST. 2026 // TIME CAPSULE REGISTRY
          </span>
          <span className="mx-6">★ 3 SACRED LIFETIME EXPOSURES</span>
          <span className="mx-6">★ 1 CALENDAR MASTER NEGATIVE PER DATE</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-28 pt-8 pb-32">

        {/* =========================================================================
            1. TOP HEROIC SPOTLIGHT: TODAY'S WORLDWIDE ONEWISH MONUMENT
            (Placed right at the TOP with vintage brass brackets & projector flicker)
           ========================================================================= */}
        <section className="space-y-6 pt-4">
          
          {/* Eyebrow Status Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#dca766]/35 bg-[#14110e]/95 shadow-[0_0_20px_rgba(220,167,102,0.12)] text-[10px] font-mono uppercase tracking-[0.25em] text-[#dca766]">
              <span className="w-2 h-2 rounded-full bg-[#00ffaa] animate-pulse" />
              <span>THE WORLD MONUMENT OF THE DAY • {todayFormatted.toUpperCase()}</span>
            </div>

            <div className="flex items-center gap-3 font-mono text-[10px] text-[#bfae9c] tracking-widest uppercase">
              <div className="vintage-postmark text-[8px] py-0.5 px-2">
                1 OF 1 WORLDWIDE
              </div>
              <span className="hidden md:inline">• CHRONOLOGICAL PROVENANCE</span>
            </div>
          </div>

          {/* Vintage Double-Bezel Frame with Brass Brackets */}
          <div className="p-2 sm:p-3.5 rounded-[2.5rem] bg-gradient-to-b from-[#3a2f26]/70 via-[#1c1612]/80 to-[#0e0c0a] border border-[#dca766]/40 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.95)] relative group">
            
            {/* Physical Vintage Brass Corner Accents */}
            <div className="absolute top-4 left-4 w-4 h-4 vintage-brass-bracket-tl rounded-tl-sm pointer-events-none" />
            <div className="absolute top-4 right-4 w-4 h-4 vintage-brass-bracket-tr rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-4 h-4 vintage-brass-bracket-bl rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-4 h-4 vintage-brass-bracket-br rounded-br-sm pointer-events-none" />

            <div className="rounded-[calc(2.5rem-0.75rem)] bg-[#120f0c] p-6 sm:p-12 md:p-16 border border-[#dca766]/25 relative overflow-hidden flex flex-col justify-between min-h-[440px]">
              
              {/* Subtle Film Grain Texture */}
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#dca766_1px,transparent_1px)] [background-size:16px_16px]" />

              {todayOnewish ? (
                /* When Today's Wish is Sealed */
                <div className="space-y-10 relative z-10">
                  
                  {/* Header Row: Dedication & Postmark Seal */}
                  <div className="border-b border-[#3d332a]/80 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#dca766]">
                        OFFICIAL DEDICATION
                      </span>
                      <h3 className="font-serif text-2xl sm:text-4xl font-bold text-[#f7f3ea] tracking-wide uppercase">
                        FOR: {todayOnewish.to_name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full wax-seal-badge flex items-center justify-center text-[#120e0a] font-serif font-black text-sm shadow-[0_0_18px_rgba(220,167,102,0.45)] animate-stamp-impact">
                        ✦
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[10px] text-[#f7f3ea] font-bold tracking-wider uppercase">
                          SEALED FOR ETERNITY
                        </div>
                        <div className="font-mono text-[9px] text-[#a8713a] uppercase">
                          {getLocalDateString()} • FRONT PAGE
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cinematic Media Showcase (If Present) with Washi Tape Mount */}
                  {todayOnewish.media_url && (
                    <div className="max-w-3xl mx-auto rounded-xl overflow-hidden border border-[#dca766]/35 shadow-[0_15px_40px_rgba(0,0,0,0.85)] relative">
                      <div className="washi-tape" />
                      <WishMediaGallery
                        mediaUrl={todayOnewish.media_url}
                        mediaType={todayOnewish.media_type}
                      />
                    </div>
                  )}

                  {/* High-Impact Fraunces Serif Message with Soft Film Flutter */}
                  <div className="relative py-6 max-w-4xl mx-auto text-center px-4 animate-film-flicker">
                    <span className="text-[#dca766]/25 font-serif text-7xl sm:text-8xl leading-none absolute -top-8 left-0 select-none">“</span>
                    <p className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-[#f7f3ea] leading-[1.25] tracking-tight italic font-light">
                      {todayOnewish.message}
                    </p>
                    <span className="text-[#dca766]/25 font-serif text-7xl sm:text-8xl leading-none absolute -bottom-10 right-0 select-none">”</span>
                  </div>

                  {/* Provenance Footer Bar */}
                  <div className="pt-8 border-t border-[#3d332a]/80 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3 font-mono text-xs text-[#bfae9c]">
                      <span className="text-[#7a6a5d] uppercase">SEALED BY:</span>
                      <span className="px-3.5 py-1 rounded-full bg-[#1e1713] border border-[#dca766]/30 text-[#dca766] font-bold tracking-wider uppercase">
                        {todayOnewish.from_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <WishLikeButton wishId={todayOnewish.id} initialLikes={todayOnewish.likes_count} showText />

                      <button
                        onClick={handleCopySpotlight}
                        className="px-4 py-2 border border-[#423528] hover:border-[#dca766] text-xs font-mono uppercase tracking-wider text-[#ede3d2] hover:text-[#f7f3ea] bg-[#1a1410] rounded-full transition-colors flex items-center gap-1.5"
                      >
                        {copiedSpotlight ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#00ffaa]" />
                            <span className="text-[#00ffaa]">LINK COPIED ✦</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3.5 h-3.5 text-[#dca766]" />
                            <span>SHARE LETTER</span>
                          </>
                        )}
                      </button>

                      <Link
                        href={`/${getLocalDateString()}`}
                        className="px-5 py-2 bg-gradient-to-r from-[#dca766] to-[#a8713a] text-[#120e0a] text-xs font-mono font-bold uppercase tracking-wider rounded-full shadow-[0_0_15px_rgba(220,167,102,0.3)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-1.5"
                      >
                        <span>PERMANENT URL</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                </div>
              ) : (
                /* When Today's Wish is Unclaimed */
                <div className="space-y-8 relative z-10 text-center py-8 max-w-3xl mx-auto">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#dca766]/40 bg-[#1e1713] text-[#dca766] text-xs font-mono uppercase tracking-widest">
                    <span>★ TODAY&apos;S STAGE IS CURRENTLY OPEN ★</span>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-serif text-3xl sm:text-5xl font-normal text-[#f7f3ea] leading-tight">
                      No wish has claimed <br />
                      <span className="text-[#dca766] italic underline decoration-[#a8713a]/50 decoration-wavy underline-offset-8">
                        {todayFormatted} yet.
                      </span>
                    </h3>
                    <p className="font-mono text-sm text-[#bfae9c] max-w-xl mx-auto leading-relaxed uppercase tracking-wider">
                      Be the only human in history to dedicate this calendar date to someone who means everything to you. Once sealed, it holds this frontpage spot forever.
                    </p>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                      onClick={() => {
                        setSelectedTier('onewish');
                        setBookingDate(getLocalDateString());
                        scrollToDarkroom();
                      }}
                      className="px-8 py-4 rounded-full bg-[#dca766] hover:bg-[#e8bc82] text-[#120e0a] font-mono font-bold text-xs uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(220,167,102,0.35)] active:scale-[0.98] transition-all flex items-center gap-2 group"
                    >
                      <Sparkles className="w-4 h-4 text-[#120e0a] group-hover:rotate-12 transition-transform" />
                      <span>CLAIM TODAY&apos;S SPOTLIGHT NOW</span>
                    </button>

                    <Link
                      href="/gallery"
                      className="px-6 py-4 rounded-full border border-[#423528] hover:border-[#dca766] font-mono text-xs uppercase tracking-widest text-[#ede3d2] transition-colors"
                    >
                      BROWSE PAST COMMITTED DATES
                    </Link>
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>

        {/* =========================================================================
            2. VINTAGE HERO MANIFESTO & POLAROID PHOTO STACKS
            (Nostalgic 1900s Darkroom Narrative with Floating Polaroid Gallery)
           ========================================================================= */}
        <section className="flex flex-col items-center text-center space-y-12 pt-6">
          
          {/* Eyebrow Stamp */}
          <div className="stamp-seal font-mono text-xs animate-stamp-impact">
            ★ TIME CAPSULE ARCHIVE // 35MM NEGATIVE VAULT ★
          </div>

          {/* Hero Typography with Typewriter Cursor Animation */}
          <div className="space-y-6 max-w-4xl mx-auto">
            <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal leading-[1.05] tracking-tight text-[#f7f3ea]">
              Before memories dissolved into feeds, <br />
              <span className="italic font-light text-[#dca766] underline decoration-[#a8713a]/50 decoration-wavy underline-offset-8">
                love was committed to film.
              </span>
              <span className="animate-typewriter-caret text-[#dca766] ml-1 select-none">|</span>
            </h2>

            <p className="text-[#bfae9c] text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-mono uppercase tracking-wider">
              We reject disposable feeds and fleeting notifications. OneWishes is an analog sanctuary: physical-feeling keepsakes, locked to 35mm film, preserved forever.
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={scrollToDarkroom}
              className="px-8 py-4 rounded-full bg-[#dca766] hover:bg-[#e8bc82] text-[#120e0a] font-mono font-bold text-xs uppercase tracking-[0.2em] shadow-[0_10px_25px_-5px_rgba(220,167,102,0.4)] active:scale-[0.98] transition-all flex items-center gap-2.5 group"
            >
              <Camera className="w-4 h-4 text-[#120e0a]" />
              <span>DEVELOP A KEEPSAKE</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>

            <Link
              href="/gallery"
              className="px-8 py-4 rounded-full border border-[#524438] hover:border-[#dca766] text-[#ede3d2] hover:text-[#f7f3ea] font-mono text-xs uppercase tracking-[0.2em] bg-[#161310]/80 transition-all flex items-center gap-2"
            >
              <Film className="w-4 h-4 text-[#dca766]" />
              <span>BROWSE FILM VAULT</span>
            </Link>
          </div>

          {/* Vintage Polaroid Photo Stacks with Authentic Float Animation */}
          <div className="pt-8 w-full max-w-5xl mx-auto">
            <div className="relative py-8 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-6 min-h-[380px]">
              
              {/* Polaroid 1 (Left Tilt) */}
              <div className="polaroid-card w-72 sm:w-80 rotate-[-4deg] relative shrink-0 animate-float">
                <div className="washi-tape" />
                <div className="aspect-[4/3] bg-[#1a1614] overflow-hidden mb-3 border border-black/10">
                  <img
                    src="https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=800&auto=format&fit=crop"
                    alt="Analog moment"
                    className="w-full h-full object-cover vintage-film-filter"
                  />
                </div>
                <div className="text-left font-serif text-sm text-[#2b231d] italic px-1">
                  “For Mom — the gentle lighthouse that guided all my storms.”
                </div>
                <div className="mt-2 text-right font-mono text-[9px] text-[#7a6a5d] tracking-wider">
                  GOLDEN EXPOSURE 01/03 • REC. 2026
                </div>
              </div>

              {/* Polaroid 2 (Center Hero Focus) */}
              <div className="polaroid-card w-76 sm:w-84 rotate-[1.5deg] relative z-10 shrink-0 shadow-2xl">
                <div className="washi-tape" />
                <div className="aspect-[4/3] bg-[#1a1614] overflow-hidden mb-3 border border-black/10 relative">
                  <img
                    src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=800&auto=format&fit=crop"
                    alt="Heirloom portrait"
                    className="w-full h-full object-cover vintage-film-filter"
                  />
                  <div className="absolute top-2 left-2 stamp-seal font-mono text-[9px] px-2 py-0.5 bg-[#f8f4ec]/90">
                    MASTER NEGATIVE
                  </div>
                </div>
                <div className="text-left font-serif text-base text-[#1f1915] italic px-1 font-semibold">
                  “You gave meaning to every sunrise we shared.”
                </div>
                <div className="mt-2 flex items-center justify-between font-mono text-[9px] text-[#7a6a5d] tracking-wider px-1">
                  <span>TO: @MAYA</span>
                  <span>SPOTLIGHT: NOV 23</span>
                </div>
              </div>

              {/* Polaroid 3 (Right Tilt) */}
              <div className="polaroid-card w-72 sm:w-80 rotate-[3.8deg] relative shrink-0 animate-float" style={{ animationDelay: '1.5s' }}>
                <div className="washi-tape" />
                <div className="aspect-[4/3] bg-[#1a1614] overflow-hidden mb-3 border border-black/10">
                  <img
                    src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800&auto=format&fit=crop"
                    alt="Coastline keepsake"
                    className="w-full h-full object-cover vintage-film-filter"
                  />
                </div>
                <div className="text-left font-serif text-sm text-[#2b231d] italic px-1">
                  “Across miles, years, and silences. Still my compass.”
                </div>
                <div className="mt-2 text-right font-mono text-[9px] text-[#7a6a5d] tracking-wider">
                  GOLDEN EXPOSURE 02/03 • REC. 2026
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            3. THE SACRED ARCHIVAL CANISTERS (THE COVENANT OF SCARCITY)
           ========================================================================= */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="stamp-seal font-mono text-[10px]">
              THE ARCHIVAL COVENANT
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#f7f3ea]">
              Two Canisters. Finite Exposures.
            </h2>
            <p className="font-mono text-xs text-[#bfae9c] uppercase tracking-wider">
              Scarcity is what turns simple text into an heirloom. Choose where your sentiment belongs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Canister 01 */}
            <div className="bg-[#14110e] border border-[#423528] hover:border-[#dca766] p-8 sm:p-10 rounded-[2rem] relative transition-all group space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#3d332a] pb-4">
                <span className="font-mono text-xs text-[#dca766] tracking-[0.2em] uppercase font-bold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full border border-dashed border-[#dca766] inline-block group-hover:animate-reel-spin" />
                  CANISTER 01 // 35MM GOLD ROLL
                </span>
                <span className="stamp-seal font-mono text-[9px]">
                  3 FOR A LIFETIME
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="font-serif text-2xl sm:text-3xl text-[#f7f3ea]">
                  The Golden Wish
                </h3>
                <p className="text-sm font-mono text-[#bfae9c] leading-relaxed">
                  Every human receives exactly three Golden exposures for their entire existence. No resets, no refills. Once developed, it is permanently engraved into our immutable ledger.
                </p>
              </div>

              <div className="pt-4 border-t border-[#3d332a] flex items-center justify-between text-xs font-mono">
                <span className="text-[#a8713a]">Reserved for the 3 who shaped you</span>
                <button
                  onClick={() => {
                    setSelectedTier('golden');
                    scrollToDarkroom();
                  }}
                  className="text-[#dca766] hover:text-[#f7f3ea] font-bold uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                >
                  <span>Select Roll</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Canister 02 */}
            <div className="bg-[#14110e] border border-[#423528] hover:border-[#dca766] p-8 sm:p-10 rounded-[2rem] relative transition-all group space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#3d332a] pb-4">
                <span className="font-mono text-xs text-[#dca766] tracking-[0.2em] uppercase font-bold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full border border-dashed border-[#dca766] inline-block group-hover:animate-reel-spin" />
                  CANISTER 02 // MASTER NEGATIVE
                </span>
                <span className="stamp-seal font-mono text-[9px]">
                  1 PER CALENDAR DATE
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="font-serif text-2xl sm:text-3xl text-[#f7f3ea]">
                  The Onewish Spotlight
                </h3>
                <p className="text-sm font-mono text-[#bfae9c] leading-relaxed">
                  365 dates in a year. Exactly one negative is chosen per date to hold the worldwide front page. Once sealed, no person on Earth can ever overwrite that day.
                </p>
              </div>

              <div className="pt-4 border-t border-[#3d332a] flex items-center justify-between text-xs font-mono">
                <span className="text-[#a8713a]">Your date etched into human history</span>
                <button
                  onClick={() => {
                    setSelectedTier('onewish');
                    scrollToDarkroom();
                  }}
                  className="text-[#dca766] hover:text-[#f7f3ea] font-bold uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                >
                  <span>Claim A Date</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            4. THE DARKROOM STUDIO (WISH CREATION WORKBENCH)
           ========================================================================= */}
        <section id="darkroom-studio" className="scroll-mt-24 space-y-12">
          
          <div className="border-b border-[#3d332a] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="stamp-seal font-mono text-xs mb-2">
                THE DARKROOM WORKBENCH
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl text-[#f7f3ea]">
                Develop Your Keepsake
              </h2>
            </div>
            <p className="font-mono text-xs text-[#bfae9c] uppercase tracking-wider max-w-md">
              Choose your film format, develop your memories without loss of detail, and inscribe your letter.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Form Column */}
            <div className="lg:col-span-7 bg-[#14110e] border border-[#423528] p-6 sm:p-10 rounded-[2rem] shadow-2xl space-y-8">
              
              <form onSubmit={handleWishSubmit} className="space-y-6">
                
                {/* Step 1: Format Selector */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-[0.2em] text-[#dca766] mb-3">
                    01 // CHOOSE FILM FORMAT
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setSelectedTier('golden')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        selectedTier === 'golden'
                          ? 'border-[#dca766] bg-[#221c16] text-[#f7f3ea] shadow-md'
                          : 'border-[#3d332a] bg-[#0c0a09] text-[#7a6a5d] hover:border-[#524438]'
                      }`}
                    >
                      <div className="font-serif text-lg font-bold">The Golden Wish</div>
                      <div className="font-mono text-[10px] text-[#b8956e] mt-1 uppercase">3 Lifetime Exposures</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedTier('onewish')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        selectedTier === 'onewish'
                          ? 'border-[#dca766] bg-[#221c16] text-[#f7f3ea] shadow-md'
                          : 'border-[#3d332a] bg-[#0c0a09] text-[#7a6a5d] hover:border-[#524438]'
                      }`}
                    >
                      <div className="font-serif text-lg font-bold">Onewish Spotlight</div>
                      <div className="font-mono text-[10px] text-[#b8956e] mt-1 uppercase">1 Exclusive Date Worldwide</div>
                    </button>
                  </div>
                </div>

                {/* Step 2: Recipient */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-[0.2em] text-[#dca766] mb-2">
                    02 // RECIPIENT
                  </label>
                  <input
                    type="text"
                    value={toName}
                    onChange={(e) => setToName(e.target.value)}
                    placeholder="E.G. MAYA"
                    required
                    className="w-full px-4 py-3.5 bg-[#090807] border border-[#3d332a] text-[#f7f3ea] placeholder-[#5a4d40] focus:outline-none focus:border-[#dca766] font-mono uppercase tracking-wider text-sm rounded-xl transition-colors"
                  />
                  {selectedTier === 'golden' && (
                    <input
                      type="text"
                      value={toUsername}
                      onChange={(e) => setToUsername(e.target.value)}
                      placeholder="RECIPIENT USERNAME (OPTIONAL)"
                      className="w-full px-4 py-3 bg-[#090807] border border-[#3d332a] text-[#f7f3ea] placeholder-[#5a4d40] focus:outline-none focus:border-[#dca766] font-mono uppercase tracking-wider text-xs rounded-xl mt-2 transition-colors"
                    />
                  )}
                </div>

                {/* Step 3: Media Upload (Lossless Development) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#dca766]">
                      03 // DEVELOP MEMORIES (MAX 5)
                    </label>
                    <span className="text-[10px] font-mono text-[#b8956e]">
                      {mediaList.length}/5 EXPOSURES
                    </span>
                  </div>

                  {mediaList.length < 5 && (
                    <label className="flex flex-col items-center justify-center border border-dashed border-[#524438] hover:border-[#dca766] bg-[#0c0a09] p-6 cursor-pointer transition-all rounded-xl group">
                      <Upload className="w-5 h-5 text-[#dca766] mb-2 group-hover:scale-110 transition-transform" />
                      <span className="font-mono text-xs uppercase font-bold text-[#f7f3ea] tracking-wider">
                        Select Photos or Motion Clip
                      </span>
                      <span className="font-mono text-[9px] text-[#7a6a5d] mt-1 uppercase">
                        Preserves original quality with instant darkroom development
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

                  {/* Thumbnail Row */}
                  {mediaList.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3">
                      {mediaList.map((item) => (
                        <div key={item.id} className="relative aspect-square border border-[#423528] bg-[#090807] overflow-hidden rounded-lg group">
                          {item.type === 'video' ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-black/90 text-[#dca766]">
                              <Film className="w-5 h-5 mb-1" />
                              <span className="text-[8px] font-mono uppercase">Motion</span>
                            </div>
                          ) : (
                            <img src={item.previewUrl} alt="Negative" className="w-full h-full object-cover vintage-film-filter" />
                          )}

                          {item.isUploading && (
                            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center text-center p-1">
                              <Loader2 className="w-4 h-4 text-[#dca766] animate-spin mb-1" />
                              <span className="text-[8px] font-mono text-[#dca766] uppercase">Developing</span>
                            </div>
                          )}

                          {!item.isUploading && item.r2Url && (
                            <div className="absolute bottom-0 inset-x-0 bg-black/80 py-0.5 px-1 flex items-center justify-between text-[7px] font-mono text-[#dca766]">
                              <span>VAULTED</span>
                              <span>{formatBytes(item.compressedSize)}</span>
                            </div>
                          )}

                          {item.uploadError && !item.isUploading && (
                            <div className="absolute inset-0 bg-red-950/90 flex flex-col items-center justify-center p-1">
                              <button
                                type="button"
                                onClick={() => retryUpload(item.id)}
                                className="text-[8px] font-mono font-bold bg-[#dca766] text-[#120e0a] px-2 py-0.5 rounded-sm uppercase"
                              >
                                Retry
                              </button>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => removeMediaItem(item.id)}
                            className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-red-600 text-white rounded-full transition-colors"
                            title="Remove exposure"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Step 4: Message */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-[0.2em] text-[#dca766] mb-2">
                    04 // THE LETTER
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="WRITE SOMETHING TIMELESS..."
                    required
                    className="w-full px-4 py-3.5 bg-[#090807] border border-[#3d332a] text-[#f7f3ea] placeholder-[#5a4d40] focus:outline-none focus:border-[#dca766] font-mono uppercase tracking-wider text-sm rounded-xl resize-none transition-colors"
                  />
                </div>

                {/* Step 5: Signature */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-[0.2em] text-[#dca766] mb-2">
                    05 // SENDER SIGNATURE
                  </label>
                  <input
                    type="text"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    placeholder={currentUserProfile?.username ? `@${currentUserProfile.username}` : "E.G. ALEX"}
                    required
                    className="w-full px-4 py-3.5 bg-[#090807] border border-[#3d332a] text-[#f7f3ea] placeholder-[#5a4d40] focus:outline-none focus:border-[#dca766] font-mono uppercase tracking-wider text-sm rounded-xl transition-colors"
                  />
                </div>

                {/* Frontpage Date (if Onewish) */}
                {selectedTier === 'onewish' && (
                  <div className="space-y-2 border-t border-[#3d332a] pt-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-mono uppercase tracking-[0.2em] text-[#dca766]">
                        CALENDAR DATE SPOTLIGHT
                      </label>
                      {dateAvailability === 'checking' && (
                        <span className="text-[10px] font-mono text-[#b8956e]">Checking slot...</span>
                      )}
                      {dateAvailability === 'available' && (
                        <span className="stamp-seal font-mono text-[9px] px-2 py-0 border-[#28a745] text-[#28a745]">
                          DATE AVAILABLE
                        </span>
                      )}
                      {dateAvailability === 'booked' && (
                        <span className="stamp-seal font-mono text-[9px] px-2 py-0">
                          ALREADY CLAIMED
                        </span>
                      )}
                    </div>
                    <input
                      type="date"
                      value={bookingDate}
                      min={getLocalDateString()}
                      onChange={(e) => setBookingDate(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-[#090807] border border-[#3d332a] text-[#f7f3ea] font-mono text-sm uppercase rounded-xl transition-colors"
                    />
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-[#dca766] hover:bg-[#e8bc82] text-[#120e0a] font-mono font-bold text-xs uppercase tracking-[0.25em] shadow-[0_10px_30px_rgba(220,167,102,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-8 group"
                >
                  <Camera className="w-4 h-4 text-[#120e0a] group-hover:scale-110 transition-transform" />
                  <span>DEVELOP &amp; COMMIT TO ARCHIVE</span>
                </button>

                {statusMsg && (
                  <p className="font-mono text-xs text-[#dca766] text-center pt-2 uppercase tracking-wider">
                    {statusMsg}
                  </p>
                )}
              </form>

            </div>

            {/* Live Developing Museum Keepsake Preview */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="sticky top-28 space-y-4 w-full">
                
                <div className="flex items-center justify-between font-mono text-[10px] text-[#b8956e] uppercase tracking-widest px-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#dca766] animate-pulse" />
                    LIVE KEEPSAKE LETTER PREVIEW
                  </span>
                  <span>{selectedTier === 'golden' ? 'GOLDEN ROLL' : 'CALENDAR NEGATIVE'}</span>
                </div>

                {/* The Double-Bezel Keepsake Letter Preview */}
                <div className="p-2 sm:p-2.5 rounded-[2rem] bg-gradient-to-b from-[#3a2f26]/60 via-[#1c1612]/70 to-[#0e0c0a] border border-[#dca766]/35 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.9)] relative">
                  
                  {/* Brass Corner Accents */}
                  <div className="absolute top-3 left-3 w-3 h-3 vintage-brass-bracket-tl rounded-tl-sm pointer-events-none" />
                  <div className="absolute top-3 right-3 w-3 h-3 vintage-brass-bracket-tr rounded-tr-sm pointer-events-none" />
                  <div className="absolute bottom-3 left-3 w-3 h-3 vintage-brass-bracket-bl rounded-bl-sm pointer-events-none" />
                  <div className="absolute bottom-3 right-3 w-3 h-3 vintage-brass-bracket-br rounded-br-sm pointer-events-none" />

                  <div className="rounded-[calc(2rem-0.5rem)] bg-[#120f0c] p-6 sm:p-8 border border-[#dca766]/20 relative space-y-6">
                    
                    {/* Header */}
                    <div className="border-b border-[#3d332a]/80 pb-3 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-[#dca766]">
                          FOR RECIPIENT
                        </span>
                        <div className="font-serif text-lg font-bold text-[#f7f3ea] uppercase">
                          {toName ? toName.toUpperCase() : 'SOMEONE SPECIAL'}
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-full wax-seal-badge flex items-center justify-center text-[#120e0a] font-serif font-black text-xs shadow">
                        ✦
                      </div>
                    </div>

                    {/* Media area */}
                    {mediaList.length > 0 && (
                      <div className="rounded-lg overflow-hidden border border-[#dca766]/30 shadow-md">
                        <WishMediaGallery
                          mediaUrl={JSON.stringify(mediaList.map((m) => ({ url: m.previewUrl, type: m.type })))}
                        />
                      </div>
                    )}

                    {/* Letter Inscription */}
                    <div className="relative py-2 text-center px-2">
                      <span className="text-[#dca766]/25 font-serif text-5xl leading-none absolute -top-4 left-0 select-none">“</span>
                      <p className="font-serif text-xl sm:text-2xl text-[#f7f3ea] italic leading-relaxed">
                        {message || 'May your path be clear, and every dream you carry find its light.'}
                      </p>
                      <span className="text-[#dca766]/25 font-serif text-5xl leading-none absolute -bottom-5 right-0 select-none">”</span>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-[#3d332a]/80 flex items-center justify-between font-mono text-[9px] text-[#bfae9c]">
                      <span>SEALED BY: <strong className="text-[#dca766] uppercase">{fromName || '@ALEX'}</strong></span>
                      <span className="text-[#a8713a] font-bold">ONEWISHES.COM</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

      </div>

      {isSubmitting && (
        <JarLoader fullScreen text="ONEWISHES" subtext={statusMsg || 'Developing into the archive...'} size="lg" />
      )}
    </div>
  );
}
