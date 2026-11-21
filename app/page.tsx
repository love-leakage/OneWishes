'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, X, Image as ImageIcon, Film, Upload, Loader2, Sparkles, CheckCircle2, Shield, Calendar, Lock, Globe, Clock, Infinity as InfinityIcon } from 'lucide-react';
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
    // Check URL parameters for pre-selected tier or date
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
    setStatusMsg('Sealing your keepsake wish...');

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
      setStatusMsg('Please wait a moment while media finishes uploading to archival vault...');
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

    setStatusMsg('Sealing your wish in the archival vault...');

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

      // Pre-warm sessionStorage so today spotlight shows instantly
      try {
        sessionStorage.setItem(`onewishes_today_${dateVal}`, JSON.stringify(data));
      } catch (e) {}

      setStatusMsg(`Wish sealed for ${dateVal}! Redirecting to spotlight...`);
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

  /**
   * Way 1: Direct-to-R2 Presigned Upload
   * Client fetches a presigned PUT URL in < 1ms Worker CPU, then uploads direct to R2.
   * Completely bypasses Worker CPU time limits!
   */
  const uploadSingleMediaItem = async (item: MediaPreview) => {
    setMediaList(prev => prev.map(m => m.id === item.id ? { ...m, isUploading: true, uploadError: undefined } : m));

    try {
      // 1. Ultra-fast compression (80-150KB target, resilient timeouts)
      const { file: optimizedFile, originalSize, compressedSize } = await compressMedia(item.file);

      // 2. Abort controller with 25-second timeout
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 25000);

      let publicUrl = '';

      // Step A: Request Presigned URL from Worker (< 1ms CPU)
      try {
        const presignRes = await fetch(
          `/api/upload?filename=${encodeURIComponent(optimizedFile.name)}&type=${encodeURIComponent(optimizedFile.type)}`,
          { signal: controller.signal }
        );
        const presignData = await presignRes.json();
        
        if (presignRes.ok && presignData.uploadUrl) {
          // Step B: Direct PUT to Cloudflare R2 bucket (0ms Worker CPU!)
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
        console.warn('Direct R2 upload fallback to worker:', directErr);
      }

      // Step C: Fallback to Worker POST if direct upload didn't succeed
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
          // If removed while uploading, purge immediately from R2
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
        console.warn('Failed to delete removed media from R2:', err);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-36 pt-12 pb-32 relative overflow-hidden">
      
      {/* ===== LAYERED PARALLAX BACKGROUND ARCHITECTURE ===== */}
      {/* Parallax Layer 1: Celestial Golden Stardust Particles (Slow Drift) */}
      <div className="absolute inset-0 pointer-events-none -z-20 overflow-hidden opacity-35 select-none animate-celestial-drift">
        <div className="absolute top-[8%] left-[12%] w-1.5 h-1.5 rounded-full bg-[#f3e5ab] shadow-[0_0_12px_#d4af37]" />
        <div className="absolute top-[18%] right-[15%] w-1 h-1 rounded-full bg-[#e5c07b] shadow-[0_0_8px_#d4af37]" />
        <div className="absolute top-[35%] left-[22%] w-2 h-2 rounded-full bg-[#d4af37] shadow-[0_0_14px_#d4af37] opacity-80" />
        <div className="absolute top-[48%] right-[28%] w-1.5 h-1.5 rounded-full bg-[#f5f2eb] shadow-[0_0_10px_#f5f2eb]" />
        <div className="absolute top-[65%] left-[8%] w-1 h-1 rounded-full bg-[#e5c07b] shadow-[0_0_8px_#d4af37]" />
        <div className="absolute top-[78%] right-[10%] w-2 h-2 rounded-full bg-[#d4af37] shadow-[0_0_16px_#d4af37]" />
        <div className="absolute top-[90%] left-[30%] w-1.5 h-1.5 rounded-full bg-[#f3e5ab] shadow-[0_0_10px_#d4af37]" />
      </div>

      {/* Parallax Layer 2: Moving Amber & Gold Atmospheric Light Nebulae */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[750px] h-[400px] bg-gradient-to-b from-[#d4af37]/18 via-[#e5c07b]/08 to-transparent blur-[140px] pointer-events-none rounded-full animate-ambient-glow -z-10" />
      <div className="absolute top-[950px] right-0 w-[550px] h-[450px] bg-gradient-to-br from-[#d4af37]/12 via-[#8c6d23]/06 to-transparent blur-[160px] pointer-events-none rounded-full animate-celestial-drift-reverse -z-10" />

      {/* ===== KINETIC HERO SECTION (Obsidian Luxe & Champagne Gold) ===== */}
      <section className="flex flex-col items-center justify-start pt-16 text-center min-h-[50vh] space-y-12 relative">
        
        {/* Parallax Layer 3: Kinetic Background Typographic River */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col justify-center opacity-[0.035] select-none -z-10">
          <div className="flex whitespace-nowrap animate-marquee-left font-serif text-[15vw] font-bold uppercase leading-none tracking-tighter text-[#e5c07b]">
            <span className="mr-8">ONEWISHES ONEWISHES ONEWISHES ONEWISHES</span>
            <span className="mr-8">ONEWISHES ONEWISHES ONEWISHES ONEWISHES</span>
          </div>
          <div 
            className="flex whitespace-nowrap animate-marquee-right font-serif text-[15vw] font-bold uppercase leading-none tracking-tighter text-transparent"
            style={{ WebkitTextStroke: '2px rgba(229, 192, 123, 0.7)' }}
          >
            <span className="mr-8">A WISH WORTH SENDING A WISH WORTH SENDING</span>
            <span className="mr-8">A WISH WORTH SENDING A WISH WORTH SENDING</span>
          </div>
        </div>

        {/* Parallax Layer 4: Foreground Hero Content with 3D Depth */}
        <motion.div 
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-10 relative z-10 max-w-5xl mx-auto"
        >
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#d4af37]/35 bg-[#0a0a0d]/90 shadow-[0_0_20px_rgba(212,175,55,0.15)] text-[10px] font-mono uppercase tracking-[0.25em] text-[#e5c07b]">
            <Sparkles className="w-3 h-3 text-[#d4af37]" />
            <span>SACRED ARTIFICIAL SCARCITY PROTOCOL</span>
          </div>

          {/* Obsidian Luxe Display Heading */}
          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-[0.9] text-[#f5f2eb] uppercase tracking-tighter">
            A WISH <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffffff] via-[#f3e5ab] to-[#d4af37] drop-shadow-[0_0_40px_rgba(212,175,55,0.4)]">
              WORTH
            </span> SENDING
          </h1>

          <p className="text-[#b5afa6] text-xs sm:text-sm md:text-base uppercase tracking-[0.25em] max-w-xl mx-auto leading-relaxed font-mono">
            When wishing costs something you can never reclaim, <br className="hidden sm:block" />
            the ones you love know what it cost you.
          </p>

          {/* Genuine Human-Grade Emotional Metrics Row (Zero Server Jargon) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 pb-4 border-y border-[#d4af37]/20 select-none">
            <div className="px-4 py-3 flex flex-col items-center justify-center border-r border-[#d4af37]/15 last:border-r-0">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-[#f5f2eb] tracking-tight">3</span>
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-[#e5c07b] mt-1">Lifetime Seals</span>
              <span className="text-[8px] text-[#7a756f] uppercase tracking-wider font-mono">Granted to Each Soul</span>
            </div>
            <div className="px-4 py-3 flex flex-col items-center justify-center md:border-r border-[#d4af37]/15">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-[#f5f2eb] tracking-tight">1 / 365</span>
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-[#e5c07b] mt-1">Calendar Monument</span>
              <span className="text-[8px] text-[#7a756f] uppercase tracking-wider font-mono">1 Worldwide Frontpage</span>
            </div>
            <div className="px-4 py-3 flex flex-col items-center justify-center border-r border-[#d4af37]/15">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-[#f5f2eb] tracking-tight">100%</span>
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-[#e5c07b] mt-1">Lossless Memories</span>
              <span className="text-[8px] text-[#7a756f] uppercase tracking-wider font-mono">Pristine Archival Vault</span>
            </div>
            <div className="px-4 py-3 flex flex-col items-center justify-center">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-[#f5f2eb] tracking-tight">∞</span>
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-[#e5c07b] mt-1">Eternal Ledger</span>
              <span className="text-[8px] text-[#7a756f] uppercase tracking-wider font-mono">Never Erased by Time</span>
            </div>
          </div>

          {/* Inspo-Engineered Interactive Marquee Loop */}
          <div 
            className="w-full max-w-4xl mx-auto overflow-hidden py-3 border-b border-[#d4af37]/20 relative select-none"
            style={{
              maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
            }}
          >
            <div className="flex w-fit gap-10 whitespace-nowrap animate-marquee-left">
              {[0, 1, 2].map((i) => (
                <span key={i} className="text-[10px] sm:text-[11px] font-mono tracking-[0.25em] uppercase text-[#e5c07b]/80 flex items-center gap-5">
                  <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-[#d4af37]" /> 3 SACRED LIFETIME SEALS</span>
                  <span className="text-[#d4af37]/40">•</span>
                  <span>1 WORLDWIDE CALENDAR MONUMENT PER DATE</span>
                  <span className="text-[#d4af37]/40">•</span>
                  <span>UNBREAKABLE SENTIMENTAL PROVENANCE</span>
                  <span className="text-[#d4af37]/40">•</span>
                  <span>PRESERVED ACROSS ETERNITY</span>
                  <span className="text-[#d4af37]/40">•</span>
                </span>
              ))}
            </div>
          </div>

          {/* Action CTAs (High-End Nested 'Button-in-Button' Island Architecture) */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={scrollToCreate}
              className="group relative inline-flex items-center gap-4 pl-8 pr-2.5 py-2.5 rounded-full bg-gradient-to-r from-[#d4af37] via-[#e5c07b] to-[#b38728] text-[#050505] font-bold uppercase tracking-widest text-xs sm:text-sm shadow-[0_0_30px_rgba(212,175,55,0.35)] hover:shadow-[0_0_45px_rgba(212,175,55,0.55)] active:scale-[0.98] transition-all"
            >
              <span>Write a Keepsake Wish</span>
              <span className="w-9 h-9 rounded-full bg-black/15 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4 text-[#050505]" />
              </span>
            </button>
            <button
              onClick={() => {
                document.getElementById('inspo-bento')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-7 py-3.5 border border-[#d4af37]/35 hover:border-[#e5c07b] text-[#f5f2eb] hover:text-[#e5c07b] font-mono uppercase tracking-widest text-xs transition-all rounded-full bg-[#0a0a0d]/70 backdrop-blur-md active:scale-[0.98]"
            >
              Explore Archival Philosophy ↓
            </button>
          </div>

          {/* ===== TODAY'S ONEWISH: DOUBLE-BEZEL ARCHIVAL KEEPSAKE LETTER ===== */}
          {todayOnewish && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-16 w-full max-w-4xl mx-auto p-1.5 sm:p-2.5 rounded-[2rem] bg-white/[0.02] border border-[#d4af37]/35 shadow-[0_12px_50px_rgba(0,0,0,0.85)] relative"
            >
              <div className="archival-letter p-8 sm:p-12 rounded-[calc(2rem-0.5rem)] bg-[#050507] border border-[#d4af37]/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] relative">
                {/* Corner Accents */}
                <div className="absolute top-4 left-4 w-3.5 h-3.5 border-t-2 border-l-2 border-[#d4af37]" />
                <div className="absolute top-4 right-4 w-3.5 h-3.5 border-t-2 border-r-2 border-[#d4af37]" />
                <div className="absolute bottom-4 left-4 w-3.5 h-3.5 border-b-2 border-l-2 border-[#d4af37]" />
                <div className="absolute bottom-4 right-4 w-3.5 h-3.5 border-b-2 border-r-2 border-[#d4af37]" />

                {/* Wax-Seal Archival Crest Badge */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#d4af37]/25 pb-6 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full wax-seal-badge text-[#050505] flex items-center justify-center font-serif font-black text-sm shadow-[0_0_18px_rgba(212,175,55,0.45)]">
                      ✦
                    </div>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#e5c07b]">
                        GLOBAL ARCHIVAL SPOTLIGHT
                      </div>
                      <div className="text-[10px] font-mono text-[#b5afa6]">
                        {new Date().toISOString().split('T')[0]} • WORLDWIDE KEEPSAKE
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/${new Date().toISOString().split('T')[0]}`}
                    className="px-4 py-2 bg-gradient-to-r from-[#d4af37] via-[#e5c07b] to-[#b38728] text-[#050505] text-[10px] font-bold uppercase tracking-widest shadow-[0_0_14px_rgba(212,175,55,0.35)] hover:brightness-110 active:scale-[0.98] transition-all rounded-full flex items-center gap-1.5"
                  >
                    <span>View Date Archive</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="space-y-8">
                  {/* Recipient Letterhead */}
                  <div className="flex items-center justify-between">
                    <Link 
                      href={`/${todayOnewish.to_username || ''}`} 
                      className="text-xs sm:text-sm font-bold tracking-[0.2em] text-[#e5c07b] uppercase hover:text-[#f5f2eb] transition-colors"
                    >
                      FOR: {todayOnewish.to_name.toUpperCase()} {todayOnewish.to_username ? `(@${todayOnewish.to_username})` : ''}
                    </Link>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#8c827a] px-3 py-1 border border-[#d4af37]/25 rounded-full bg-[#0d0d10]">
                      ONEWISH TIER
                    </span>
                  </div>
                  
                  {/* Cinematic Letterbox Media Montage */}
                  {todayOnewish.media_url && (
                    <div className="rounded-xl overflow-hidden border border-[#d4af37]/30 shadow-2xl">
                      <WishMediaGallery mediaUrl={todayOnewish.media_url} mediaType={todayOnewish.media_type} />
                    </div>
                  )}

                  {/* Letter Message in Serif Italic */}
                  <div className="relative py-4 px-2 sm:px-6">
                    <span className="text-[#d4af37]/30 font-serif text-6xl leading-none absolute -top-4 left-0 select-none">“</span>
                    <p className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#f5f2eb] leading-relaxed italic tracking-wide text-center pt-2">
                      {todayOnewish.message}
                    </p>
                    <span className="text-[#d4af37]/30 font-serif text-6xl leading-none absolute -bottom-8 right-0 select-none">”</span>
                  </div>

                  {/* Archival Signature Seal Line */}
                  <div className="pt-8 mt-6 border-t border-[#d4af37]/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <span className="text-[#8c827a]">SEALED BY:</span>
                      <Link href={`/${todayOnewish.sender_username}`} className="text-[#f5f2eb] hover:text-[#e5c07b] transition-colors">
                        @{todayOnewish.sender_username}
                      </Link>
                    </div>
                    <WishLikeButton wishId={todayOnewish.id} initialLikes={todayOnewish.likes_count} showText />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* ===== INSPO BENTO GRID (Editorial Architecture & Micro-Interactions) ===== */}
      <section id="inspo-bento" className="pt-16 space-y-12 border-t border-[#d4af37]/20">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#14120e] border border-[#d4af37]/35 text-[#e5c07b] text-[10px] font-mono font-bold uppercase tracking-widest rounded-full">
            <span>✦ THE ARCHIVAL PROTOCOL</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#f5f2eb] uppercase tracking-tight">
            Engineered For Permanence
          </h2>
          <p className="text-[#b5afa6] text-xs sm:text-sm uppercase tracking-wider font-mono">
            Every layer crafted with intentional restraint to honor human connection.
          </p>
        </div>

        {/* 6-Tile Irregular Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          
          {/* Tile 1: Lead Tile (Spans 2 columns, 2 rows) */}
          <motion.article 
            whileHover={{ y: -3 }}
            transition={{ duration: 0.3 }}
            className="md:col-span-2 md:row-span-2 inspo-bento-card p-8 sm:p-12 flex flex-col justify-between rounded-sm relative overflow-hidden"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#e5c07b]">
                  01 / CORE THESIS
                </span>
                <span className="px-2.5 py-0.5 bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#e5c07b] text-[9px] font-mono uppercase tracking-widest rounded-full">
                  SCARCITY BY DESIGN
                </span>
              </div>
              <h3 className="font-serif text-3xl sm:text-5xl font-bold text-[#f5f2eb] leading-[1.08] tracking-tight">
                When wishing costs what you can never get back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffffff] via-[#f3e5ab] to-[#d4af37]">love is proven</span>.
              </h3>
              <p className="text-sm sm:text-base text-[#b5afa6] leading-relaxed max-w-xl">
                Every day, people send billions of disposable texts and post stories that disappear in 24 hours. Because they cost nothing to make, they mean almost nothing to keep. OneWishes re-engineers human expression through scarcity: each wish is strictly limited, beautifully sealed, and preserved forever.
              </p>
            </div>

            <div className="pt-8 mt-8 border-t border-[#d4af37]/20 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs font-mono text-[#e5c07b]">
                <Shield className="w-4 h-4 text-[#d4af37]" />
                <span>IRREVERSIBLE DEDICATION • PERPETUAL PROVENANCE</span>
              </div>
              <button
                onClick={scrollToCreate}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#f5f2eb] hover:text-[#e5c07b] transition-colors"
              >
                <span>Compose in Archival Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.article>

          {/* Tile 2: Tier I Golden Wish */}
          <motion.article 
            whileHover={{ y: -3 }}
            transition={{ duration: 0.3 }}
            className="inspo-bento-card p-8 flex flex-col justify-between rounded-sm relative"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#e5c07b]">
                  02 / INTIMATE BOND
                </span>
                <span className="px-2 py-0.5 bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#e5c07b] text-[8.5px] font-mono font-bold uppercase tracking-widest rounded-full">
                  3 PER SOUL
                </span>
              </div>
              <h4 className="font-serif text-2xl font-bold text-[#f5f2eb] uppercase tracking-wide mb-2">
                The Golden Wish
              </h4>
              <p className="text-xs text-[#b5afa6] leading-relaxed">
                Bound directly to a recipient's unique handle. A permanent token of devotion accessible anytime at <code className="text-[#e5c07b] font-mono">/goldenwish/@username/count</code>.
              </p>
            </div>
            <button
              onClick={() => { setSelectedTier('golden'); scrollToCreate(); }}
              className="mt-6 w-full py-3 bg-gradient-to-r from-[#d4af37] via-[#e5c07b] to-[#b38728] text-[#050505] font-bold uppercase tracking-widest text-[11px] rounded-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)]"
            >
              Select Golden Tier
            </button>
          </motion.article>

          {/* Tile 3: Tier II Onewish Spotlight */}
          <motion.article 
            whileHover={{ y: -3 }}
            transition={{ duration: 0.3 }}
            className="inspo-bento-card p-8 flex flex-col justify-between rounded-sm relative"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#e5c07b]">
                  03 / WORLD MONUMENT
                </span>
                <span className="px-2 py-0.5 bg-[#e5c07b]/15 border border-[#e5c07b]/30 text-[#e5c07b] text-[8.5px] font-mono font-bold uppercase tracking-widest rounded-full">
                  1 SLOT PER DAY
                </span>
              </div>
              <h4 className="font-serif text-2xl font-bold text-[#f5f2eb] uppercase tracking-wide mb-2">
                Onewish Spotlight
              </h4>
              <p className="text-xs text-[#b5afa6] leading-relaxed">
                Claim the front-page spotlight for a specific calendar date worldwide. Celebrate birthdays, wedding anniversaries, or life tributes across history.
              </p>
            </div>
            <button
              onClick={() => { setSelectedTier('onewish'); scrollToCreate(); }}
              className="mt-6 w-full py-3 border border-[#d4af37] text-[#e5c07b] hover:bg-[#d4af37]/15 font-bold uppercase tracking-widest text-[11px] rounded-sm active:scale-[0.98] transition-all"
            >
              Select Onewish Tier
            </button>
          </motion.article>

          {/* Tile 4: Timeless Heirloom Preservation (Spans 2 columns) */}
          <motion.article 
            whileHover={{ y: -3 }}
            transition={{ duration: 0.3 }}
            className="md:col-span-2 inspo-bento-card p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-sm"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#e5c07b]">
                  04 / HEIRLOOM PRESERVATION
                </span>
                <span className="px-2 py-0.5 bg-[#00ffaa]/10 border border-[#00ffaa]/30 text-[#00ffaa] text-[8.5px] font-mono uppercase tracking-wider rounded-full">
                  EVERLASTING
                </span>
              </div>
              <h4 className="font-serif text-2xl font-bold text-[#f5f2eb] uppercase tracking-wide">
                Pristine Memory Vault
              </h4>
              <p className="text-xs text-[#b5afa6] max-w-lg leading-relaxed">
                Photographs and moving video memories are kept in pristine museum quality. No compression artifacts, no expiring links, and no vanishing stories.
              </p>
            </div>
            <div className="shrink-0 flex sm:flex-col items-center justify-center gap-1 bg-[#14120e] p-4 border border-[#d4af37]/20 rounded-sm">
              <span className="font-serif text-3xl font-bold text-[#e5c07b]">100%</span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#7a756f]">Permanence</span>
            </div>
          </motion.article>

          {/* Tile 5: The Philosophy & Name Origin */}
          <motion.article 
            whileHover={{ y: -3 }}
            transition={{ duration: 0.3 }}
            className="inspo-bento-card p-8 flex flex-col justify-between rounded-sm"
          >
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#e5c07b]">
                05 / BRAND MANIFESTO
              </span>
              <h4 className="font-serif text-xl font-bold text-[#f5f2eb] uppercase tracking-wide mt-3 mb-2">
                Feelings Don't Follow Grammar
              </h4>
              <p className="text-xs text-[#b5afa6] leading-relaxed italic font-serif">
                "We made a mistake in our name — but don't make the mistake of leaving your memories unsaid."
              </p>
            </div>
            <div className="pt-4 border-t border-[#d4af37]/20 text-[9px] font-mono uppercase tracking-widest text-[#e5c07b]">
              One person wishes • Lasts forever
            </div>
          </motion.article>

        </div>
      </section>

      {/* ===== CREATE WISH FORM & PREVIEW ===== */}
      <section id="create-section" className="pt-24 scroll-mt-24 border-t border-[#d4af37]/20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form Box */}
          <div className="lg:col-span-7 space-y-8">
            <h2 className="font-serif text-4xl font-bold text-[#f5f2eb] uppercase tracking-tighter">Write Your Wish</h2>
            
            {/* Tier Selector */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedTier('golden')}
                className={`p-4 border text-center transition-all rounded-sm ${
                  selectedTier === 'golden'
                    ? 'border-[#d4af37] bg-gradient-to-r from-[#d4af37] via-[#e5c07b] to-[#b38728] text-[#050505] font-bold shadow-[0_0_20px_rgba(212,175,55,0.35)]'
                    : 'border-[#d4af37]/20 bg-[#09090c] text-[#b5afa6] hover:border-[#d4af37]/50'
                }`}
              >
                <div className="text-sm font-bold uppercase tracking-widest">Golden</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTier('onewish')}
                className={`p-4 border text-center transition-all rounded-sm ${
                  selectedTier === 'onewish'
                    ? 'border-[#e5c07b] bg-[#e5c07b] text-[#050505] shadow-[0_0_20px_rgba(229,192,123,0.35)] font-bold'
                    : 'border-[#d4af37]/20 bg-[#09090c] text-[#b5afa6] hover:border-[#e5c07b]/50'
                }`}
              >
                <div className="text-sm font-bold uppercase tracking-widest">Onewish</div>
              </button>
            </div>

            <form onSubmit={handleWishSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#f5f2eb] mb-2">
                  Recipient Name (Optional if Username provided)
                </label>
                <input
                  type="text"
                  value={toName}
                  onChange={(e) => setToName(e.target.value)}
                  placeholder="E.G. MAYA"
                  className="w-full px-4 py-4 bg-[#070709] border border-[#d4af37]/20 text-[#f5f2eb] placeholder-[#605a54] focus:outline-none focus:border-[#d4af37] transition-colors uppercase tracking-widest rounded-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#f5f2eb] mb-2">
                  {selectedTier === 'golden' ? 'Recipient Username * (For /goldenwish/username/count)' : 'Recipient Username (Optional)'}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-4 text-[#e5c07b] font-bold">@</span>
                  <input
                    type="text"
                    value={toUsername}
                    onChange={(e) => setToUsername(e.target.value)}
                    placeholder="USERNAME"
                    required={selectedTier === 'golden'}
                    className="w-full pl-8 pr-4 py-4 bg-[#070709] border border-[#d4af37]/20 text-[#f5f2eb] placeholder-[#605a54] focus:outline-none focus:border-[#d4af37] transition-colors uppercase tracking-widest rounded-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#f5f2eb]">
                    Attach Media <span className="text-[#b5afa6] font-normal">(Up to 5 photos, or 1 video + photos)</span>
                  </label>
                  <span className="text-[10px] font-mono font-bold text-[#e5c07b]">
                    {mediaList.length}/5 SELECTED
                  </span>
                </div>

                {mediaList.length < 5 && (
                  <label className="flex flex-col items-center justify-center border border-dashed border-[#d4af37]/30 hover:border-[#d4af37]/70 bg-[#070709] p-5 cursor-pointer transition-all group rounded-sm">
                    <div className="flex items-center gap-3 text-[#b5afa6] group-hover:text-[#f5f2eb] transition-colors">
                      <Upload className="w-4 h-4 text-[#e5c07b]" />
                      <span className="text-xs uppercase font-bold tracking-widest">
                        Choose Photos or Video (Max 5)
                      </span>
                    </div>
                    <span className="text-[10px] text-[#7a756f] mt-1 uppercase tracking-wider">
                      Compressed automatically without quality loss • Supports JPG, PNG, WEBP, MP4, WEBM
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
                      <div key={item.id} className="relative aspect-square border border-[#d4af37]/25 bg-[#09090c] overflow-hidden group rounded-sm shadow-md">
                        {item.type === 'video' ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-black/80 text-[#e5c07b]">
                            <Film className="w-6 h-6 mb-1" />
                            <span className="text-[9px] font-bold uppercase tracking-wider">Video</span>
                            <span className="text-[8px] text-[#b5afa6] font-mono mt-0.5">{formatBytes(item.compressedSize)}</span>
                          </div>
                        ) : (
                          <img src={item.previewUrl} alt="Upload preview" className="w-full h-full object-cover" />
                        )}

                        {/* Uploading / Optimizing Overlay */}
                        {item.isUploading && (
                          <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-1 z-10">
                            <Loader2 className="w-5 h-5 text-[#e5c07b] animate-spin mb-1" />
                            <span className="text-[8px] font-bold text-[#f5f2eb] uppercase tracking-wider">Vault Sync</span>
                            <span className="text-[7px] text-[#d4af37] uppercase font-mono">Immortalizing...</span>
                          </div>
                        )}

                        {/* Ready badge with size info */}
                        {!item.isUploading && item.r2Url && (
                          <div className="absolute bottom-0 inset-x-0 bg-black/85 backdrop-blur-[2px] py-0.5 px-1 flex items-center justify-between text-[8px] font-mono border-t border-[#d4af37]/20 z-10">
                            <span className="text-[#e5c07b] flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5 text-[#00ffaa]" /> Vaulted
                            </span>
                            <span className="text-[#b5afa6]">{formatBytes(item.compressedSize)}</span>
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
                              className="text-[7.5px] font-bold bg-[#d4af37] hover:bg-[#b38728] text-[#050505] px-2 py-0.5 rounded-sm uppercase tracking-wider transition-colors shadow"
                            >
                              Retry
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => removeMediaItem(item.id)}
                          className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-red-600 text-white rounded-full transition-colors opacity-90 hover:opacity-100 z-20 shadow"
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
                <label className="block text-xs font-bold uppercase tracking-widest text-[#f5f2eb] mb-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="WRITE SOMETHING MEANINGFUL..."
                  required
                  className="w-full px-4 py-4 bg-[#070709] border border-[#d4af37]/20 text-[#f5f2eb] placeholder-[#605a54] focus:outline-none focus:border-[#d4af37] transition-colors resize-none uppercase tracking-wide text-sm rounded-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#f5f2eb] mb-2 flex items-center justify-between">
                  <span>Your Signature</span>
                  {currentUserProfile?.username && (
                    <span className="text-[10px] text-[#e5c07b] font-normal tracking-wider">
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
                  className="w-full px-4 py-4 bg-[#070709] border border-[#d4af37]/20 text-[#f5f2eb] placeholder-[#605a54] focus:outline-none focus:border-[#d4af37] transition-colors uppercase tracking-widest rounded-sm"
                />
              </div>

              {selectedTier === 'onewish' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#f5f2eb]">
                      Frontpage Spotlight Date
                    </label>
                    {dateAvailability === 'checking' && (
                      <span className="text-[10px] text-[#b5afa6] font-mono flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin text-[#e5c07b]" /> Checking slot...
                      </span>
                    )}
                    {dateAvailability === 'available' && (
                      <span className="text-[10px] text-[#00ffaa] font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Slot Available
                      </span>
                    )}
                    {dateAvailability === 'booked' && (
                      <span className="text-[10px] text-[#ff6b6b] font-mono flex items-center gap-1 font-bold">
                        <X className="w-3 h-3" /> Date Already Claimed
                      </span>
                    )}
                  </div>
                  <input
                    type="date"
                    value={bookingDate}
                    min={getLocalDateString()}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                    className="w-full px-4 py-4 bg-[#070709] border border-[#d4af37]/20 text-[#f5f2eb] focus:outline-none focus:border-[#d4af37] transition-colors tracking-widest uppercase font-mono rounded-sm"
                  />
                  <p className="text-[10px] text-[#b5afa6] tracking-wider uppercase font-mono">
                    Only 1 wish exists per date globally. Once sealed, it belongs to you across infinity.
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="group relative w-full py-3.5 pl-8 pr-3 rounded-full bg-gradient-to-r from-[#d4af37] via-[#e5c07b] to-[#b38728] text-[#050505] font-bold text-xs sm:text-sm tracking-widest uppercase hover:shadow-[0_0_35px_rgba(212,175,55,0.45)] active:scale-[0.98] transition-all mt-6 shadow-[0_0_25px_rgba(212,175,55,0.35)] flex items-center justify-between"
              >
                <span className="mx-auto pl-6">Seal & Send Keepsake Wish</span>
                <span className="w-9 h-9 rounded-full bg-black/15 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4 text-[#050505]" />
                </span>
              </button>

              {statusMsg && (
                <p className="text-xs text-[#e5c07b] text-center pt-4 font-bold uppercase tracking-widest">{statusMsg}</p>
              )}
            </form>
          </div>

          {/* Live Preview Card (Archival Keepsake Letter Format) */}
          <div className="lg:col-span-5 flex flex-col pt-8 lg:pt-0">
            <div className="sticky top-28 space-y-4">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-[#e5c07b]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00ffaa] animate-pulse" /> LIVE KEEPSAKE PREVIEW
                </span>
                <span>{selectedTier === 'golden' ? 'TIER I • GOLDEN' : 'TIER II • ONEWISH'}</span>
              </div>

              {/* Double-Bezel Outer Shell */}
              <div className="p-1.5 sm:p-2 rounded-[2rem] bg-white/[0.02] border border-[#d4af37]/35 shadow-[0_12px_45px_rgba(0,0,0,0.85)] relative">
                <div className="archival-letter p-8 sm:p-10 rounded-[calc(2rem-0.5rem)] bg-[#050507] border border-[#d4af37]/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex flex-col justify-between min-h-[520px] relative">
                  {/* Golden Corner Accents */}
                  <div className="absolute top-4 left-4 w-3 h-3 border-t-2 border-l-2 border-[#d4af37]" />
                  <div className="absolute top-4 right-4 w-3 h-3 border-t-2 border-r-2 border-[#d4af37]" />
                  <div className="absolute bottom-4 left-4 w-3 h-3 border-b-2 border-l-2 border-[#d4af37]" />
                  <div className="absolute bottom-4 right-4 w-3 h-3 border-b-2 border-r-2 border-[#d4af37]" />

                  <div>
                    {/* Archival Preview Header with Wax Seal */}
                    <div className="border-b border-[#d4af37]/25 pb-4 mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full wax-seal-badge text-[#050505] flex items-center justify-center font-serif font-black text-xs shadow">
                          ✦
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e5c07b]">
                            {selectedTier === 'golden' ? 'GOLDEN VAULT KEEPSAKE' : 'GLOBAL SPOTLIGHT'}
                          </div>
                          <div className="text-[9px] font-mono text-[#8c827a]">
                            {selectedTier === 'onewish' ? (bookingDate || 'SELECT DATE') : 'ETERNAL REGISTRY'}
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-[#8c827a] uppercase tracking-widest border border-[#d4af37]/20 px-2 py-0.5 rounded-full">
                        UNSEALED
                      </span>
                    </div>

                    <div className="text-xs font-bold tracking-widest text-[#b5afa6] uppercase mb-6 flex items-center justify-between">
                      <span>TO: {toName ? toName.toUpperCase() : (toUsername ? `@${toUsername.toUpperCase()}` : 'MAYA')}</span>
                    </div>
                    
                    {mediaList.length > 0 && (
                      <div className="mb-6 rounded-xl overflow-hidden border border-[#d4af37]/30 shadow-md">
                        <WishMediaGallery
                          mediaUrl={JSON.stringify(mediaList.map((m) => ({ url: m.previewUrl, type: m.type })))}
                        />
                      </div>
                    )}

                    <div className="relative py-2">
                      <span className="text-[#d4af37]/25 font-serif text-5xl leading-none absolute -top-4 left-0 select-none">“</span>
                      <p className="font-serif text-2xl sm:text-3xl text-[#f5f2eb] leading-relaxed uppercase tracking-wide italic text-center px-4">
                        {message || 'MAY YOUR PATH BE CLEAR, AND EVERY DREAM YOU CARRY FIND ITS LIGHT.'}
                      </p>
                      <span className="text-[#d4af37]/25 font-serif text-5xl leading-none absolute -bottom-6 right-0 select-none">”</span>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#d4af37]/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold tracking-widest uppercase text-[#f5f2eb]">
                      <span className="text-[#8c827a]">SEALED BY:</span>
                      <span className="text-[#e5c07b]">{fromName || (currentUserProfile?.username ? `@${currentUserProfile.username}` : '@ALEX')}</span>
                    </div>
                    <span className="text-[9px] font-mono text-[#7a756f] uppercase">
                      ONEWISHES.COM
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isSubmitting && (
        <JarLoader fullScreen text="ONEWISHES" subtext={statusMsg || 'Sealing your keepsake wish...'} size="lg" />
      )}
    </div>
  );
}
