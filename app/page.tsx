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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32 pt-16 pb-24">
      
      {/* ===== KINETIC HERO SECTION (Obsidian Luxe & Champagne Gold) ===== */}
      <section className="flex flex-col items-center justify-start pt-20 text-center min-h-[50vh] space-y-12 relative overflow-hidden">
        
        {/* Kinetic Background Text (GPU CSS Hardware Accelerated) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col justify-center opacity-[0.04] select-none">
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

        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8 relative z-10"
        >
          {/* Obsidian Luxe Heading */}
          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-black leading-[0.9] text-[#f5f2eb] uppercase tracking-tighter">
            A WISH <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffffff] via-[#f3e5ab] to-[#d4af37] drop-shadow-[0_0_35px_rgba(212,175,55,0.35)]">
              WORTH
            </span> SENDING
          </h1>

          <p className="text-[#b5afa6] text-sm md:text-base uppercase tracking-widest max-w-lg mx-auto leading-loose font-bold">
            ARTIFICIAL SCARCITY. <br/> So the ones you wish know what it cost you.
          </p>

          {/* Inspo-Engineered Interactive Marquee Loop */}
          <div 
            className="w-full max-w-4xl mx-auto overflow-hidden py-3 border-y border-[#d4af37]/25 relative select-none"
            style={{
              maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
            }}
          >
            <div className="flex w-fit gap-10 whitespace-nowrap animate-marquee-left">
              {[0, 1, 2].map((i) => (
                <span key={i} className="text-[10px] sm:text-[11px] font-mono tracking-[0.25em] uppercase text-[#e5c07b]/80 flex items-center gap-5">
                  <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-[#d4af37]" /> 3 LIFETIME GOLDEN WISHES</span>
                  <span className="text-[#d4af37]/40">•</span>
                  <span>1 FRONTPAGE SPOTLIGHT PER CALENDAR DATE</span>
                  <span className="text-[#d4af37]/40">•</span>
                  <span>DIRECT-TO-VAULT CLOUDFLARE R2 MEDIA</span>
                  <span className="text-[#d4af37]/40">•</span>
                  <span>ETCHED ACROSS INFINITY</span>
                  <span className="text-[#d4af37]/40">•</span>
                </span>
              ))}
            </div>
          </div>

          {/* ===== TODAY'S ONEWISH: LUXURY ARCHIVAL KEEPSAKE LETTER ===== */}
          {todayOnewish && (
            <div className="mt-16 w-full max-w-4xl mx-auto archival-letter p-1 border border-[#d4af37]/35 bg-[#09090b] shadow-[0_0_45px_rgba(212,175,55,0.12)] relative rounded-sm">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#d4af37]/70" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#d4af37]/70" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#d4af37]/70" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#d4af37]/70" />

              <div className="bg-[#050507] p-8 sm:p-12 border border-[#d4af37]/20 relative">
                
                {/* Wax-Seal Archival Crest Badge */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#d4af37]/25 pb-6 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4af37] via-[#e5c07b] to-[#8c6d23] text-[#050505] flex items-center justify-center font-serif font-black text-xs shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                      ✦
                    </div>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#e5c07b]">
                        ARCHIVAL SPOTLIGHT
                      </div>
                      <div className="text-[10px] font-mono text-[#b5afa6]">
                        {new Date().toISOString().split('T')[0]} • WORLDWIDE KEEPSAKE
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/${new Date().toISOString().split('T')[0]}`}
                    className="px-4 py-1.5 bg-gradient-to-r from-[#d4af37] via-[#e5c07b] to-[#b38728] text-[#050505] text-[10px] font-bold uppercase tracking-widest shadow-[0_0_14px_rgba(212,175,55,0.35)] hover:brightness-110 transition-all rounded-sm flex items-center gap-1.5"
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
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#8c827a]">
                      ONEWISH TIER
                    </span>
                  </div>
                  
                  {/* Cinematic Letterbox Media Montage */}
                  {todayOnewish.media_url && (
                    <div className="rounded-sm overflow-hidden border border-[#d4af37]/30 shadow-2xl">
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
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4 pt-10">
            <button
              onClick={scrollToCreate}
              className="px-9 py-4 bg-gradient-to-r from-[#d4af37] via-[#e5c07b] to-[#b38728] text-[#050505] font-bold uppercase tracking-widest text-sm hover:opacity-95 hover:shadow-[0_0_30px_rgba(212,175,55,0.45)] transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(212,175,55,0.3)] rounded-full"
            >
              <span>Write a Keepsake Wish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* ===== TIERS SHOWCASE (Inspo Bento Architecture & Obsidian Luxe) ===== */}
      <section className="space-y-12 pt-16 border-t border-[#d4af37]/20">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#14120e] border border-[#d4af37]/30 text-[#e5c07b] text-[10px] font-bold uppercase tracking-widest rounded-full">
            <span>✦ TWO INTENTIONAL CONSTRAINTS</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#f5f2eb] uppercase tracking-widest">The Tiers</h2>
          <p className="text-[#b5afa6] text-xs sm:text-sm uppercase tracking-wider font-mono">When wishing costs something you can never get back, love is proven.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Golden Wish Bento Card */}
          <div className="p-8 sm:p-10 border border-[#d4af37]/35 hover:border-[#e5c07b] bg-gradient-to-b from-[#0d0d10] via-[#09090c] to-[#060608] transition-all flex flex-col justify-between shadow-[0_0_35px_rgba(212,175,55,0.08)] hover:shadow-[0_0_45px_rgba(212,175,55,0.18)] rounded-sm relative group overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-[#14120e] border-b border-l border-[#d4af37]/30 text-[9px] font-mono font-bold uppercase text-[#e5c07b] tracking-widest">
              3 PER ACCOUNT
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#e5c07b] mb-6 flex items-center gap-2">
                <span>✦</span> Tier I • Identity Vault
              </div>
              <h3 className="font-serif text-3xl font-bold text-[#f5f2eb] mb-3 uppercase tracking-wide">Golden Wish</h3>
              <p className="text-sm text-[#b5afa6] leading-relaxed mb-8">
                Rare keepsake wish attached to your identity forever. Exactly 3 allowed per user account. Enforced atomically via PostgreSQL locks.
              </p>
            </div>
            <button
              onClick={() => { setSelectedTier('golden'); scrollToCreate(); }}
              className="w-full py-4 bg-gradient-to-r from-[#d4af37] via-[#e5c07b] to-[#b38728] text-[#050505] font-bold uppercase tracking-widest text-xs hover:brightness-110 transition-all shadow-[0_0_20px_rgba(212,175,55,0.25)] rounded-sm"
            >
              Create Golden Wish
            </button>
          </div>

          {/* Onewish Spotlight Bento Card */}
          <div className="p-8 sm:p-10 border border-[#e5c07b]/30 hover:border-[#e5c07b] bg-gradient-to-b from-[#0d0d10] via-[#09090c] to-[#060608] transition-all flex flex-col justify-between shadow-[0_0_35px_rgba(212,175,55,0.08)] hover:shadow-[0_0_45px_rgba(212,175,55,0.18)] rounded-sm relative group overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-[#14120e] border-b border-l border-[#d4af37]/30 text-[9px] font-mono font-bold uppercase text-[#e5c07b] tracking-widest">
              1 SLOT / DAY
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#e5c07b] mb-6 flex items-center gap-2">
                <span>✦</span> Tier II • Global Registry
              </div>
              <h3 className="font-serif text-3xl font-bold text-[#f5f2eb] mb-3 uppercase tracking-wide">Onewish Spotlight</h3>
              <p className="text-sm text-[#b5afa6] leading-relaxed mb-8">
                Claim the front-page spotlight for a specific calendar date worldwide. Enforced by unique SQL constraint. Once sealed, it belongs to you across infinity.
              </p>
            </div>
            <button
              onClick={() => { setSelectedTier('onewish'); scrollToCreate(); }}
              className="w-full py-4 border border-[#d4af37] text-[#e5c07b] hover:bg-[#d4af37]/15 font-bold uppercase tracking-widest text-xs transition-all rounded-sm"
            >
              Book Onewish Spotlight
            </button>
          </div>
        </div>
      </section>

      {/* ===== PHILOSOPHY / A NOTE ON OUR NAME ===== */}
      <section className="py-8 border-t border-[#d4af37]/20">
        <div className="max-w-3xl mx-auto p-8 sm:p-12 border border-[#d4af37]/25 bg-[#09090c] text-center space-y-6 shadow-[0_0_30px_rgba(212,175,55,0.06)] relative overflow-hidden rounded-sm">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#050505] border border-[#d4af37]/40 rounded-full text-[11px] font-bold uppercase tracking-widest text-[#e5c07b]">
            ✦ A Note On Our Name
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#f5f2eb] uppercase tracking-tight leading-snug">
            "Grammar says <span className="italic text-[#b5afa6]">One Wish</span>. <br className="hidden sm:block" />
            Feelings don't follow grammar."
          </h2>

          <p className="text-sm sm:text-base text-[#b5afa6] leading-relaxed max-w-xl mx-auto">
            Yes, we might have broken English rules with our name. But in a world full of temporary stories and disposable texts, we built this with one truth:
          </p>

          <p className="text-base sm:text-lg font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#ffffff] via-[#f3e5ab] to-[#d4af37] tracking-wide max-w-xl mx-auto leading-relaxed">
            "We made a mistake in our name — but don't make the mistake of leaving your memories unsaid."
          </p>

          <div className="pt-4 border-t border-[#d4af37]/20 text-[11px] uppercase tracking-widest text-[#e5c07b] font-mono font-bold">
            When ONE person WISHES with all their heart, it lasts forever.
          </div>
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
                            <span className="text-[7px] text-[#d4af37] uppercase font-mono">Uploading R2</span>
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
                className="w-full py-5 bg-gradient-to-r from-[#d4af37] via-[#e5c07b] to-[#b38728] text-[#050505] font-bold text-sm tracking-widest uppercase hover:opacity-95 transition-all mt-6 shadow-[0_0_25px_rgba(212,175,55,0.35)] rounded-sm"
              >
                Seal & Send Keepsake Wish
              </button>

              {statusMsg && (
                <p className="text-xs text-[#e5c07b] text-center pt-4 font-bold uppercase tracking-widest">{statusMsg}</p>
              )}
            </form>
          </div>

          {/* Live Preview Card (Archival Keepsake Letter Format) */}
          <div className="lg:col-span-5 flex flex-col pt-16">
            <div className="p-8 sm:p-10 border border-[#d4af37]/35 bg-[#08080a] flex-1 flex flex-col justify-between shadow-[0_0_35px_rgba(212,175,55,0.1)] min-h-[500px] relative rounded-sm">
              {/* Golden Corner Accents */}
              <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#d4af37]" />
              <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-[#d4af37]" />
              <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-[#d4af37]" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[#d4af37]" />

              <div>
                <div className="text-xs font-bold tracking-widest text-[#b5afa6] uppercase mb-8 border-b border-[#d4af37]/20 pb-4 flex items-center justify-between">
                  <span>TO: {toName ? toName.toUpperCase() : (toUsername ? `@${toUsername}` : 'MAYA')}</span>
                  <span className="text-[#e5c07b] text-base">✦</span>
                </div>
                
                {mediaList.length > 0 && (
                  <div className="mb-8 rounded-sm overflow-hidden border border-[#d4af37]/20">
                    <WishMediaGallery
                      mediaUrl={JSON.stringify(mediaList.map((m) => ({ url: m.previewUrl, type: m.type })))}
                    />
                  </div>
                )}

                <p className="font-serif text-2xl text-[#f5f2eb] leading-loose uppercase tracking-wide italic">
                  "{message || 'MAY YOUR PATH BE CLEAR, AND EVERY DREAM YOU CARRY FIND ITS LIGHT.'}"
                </p>
              </div>

              <div className="pt-8 border-t border-[#d4af37]/20 flex flex-col gap-3 text-[#f5f2eb] text-xs">
                <span className="font-bold tracking-widest uppercase">FROM: {fromName || 'ALEX'}</span>
                <span className="uppercase text-[10px] font-bold tracking-widest text-[#e5c07b]">
                  TIER: {selectedTier} • ARCHIVAL KEEPSAKE
                </span>
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
