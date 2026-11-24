'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Heart, X, Film, Upload, Loader2, Sparkles, 
  CheckCircle2, Camera, Calendar, Clock, Share2, Bookmark,
  Layers, Disc, ChevronRight, Check, Compass, MessageCircle,
  Radio, Send, RotateCw, Volume2, Stamp
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
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

type WishingEra = '1890s' | '1930s' | '1950s' | '1970s';

export default function HomePage() {
  const [selectedTier, setSelectedTier] = useState<'golden' | 'onewish'>('golden');
  const [selectedEra, setSelectedEra] = useState<WishingEra>('1890s');
  const [spotlightEra, setSpotlightEra] = useState<WishingEra>('1890s');
  
  // Interactive animation states
  const [isWaxBroken, setIsWaxBroken] = useState(false);
  const [isPostcardFlipped, setIsPostcardFlipped] = useState(false);
  const [isPolaroidDeveloped, setIsPolaroidDeveloped] = useState(true);
  const [morseKeyActive, setMorseKeyActive] = useState(false);
  const [morseLog, setMorseLog] = useState<string>('••• ——— •••');

  // Form states
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

  // Today's Onewish State
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

  const scrollToStudio = () => {
    sounds.playChime();
    document.getElementById('inscription-studio')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCopySpotlight = () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/${getLocalDateString()}`;
    navigator.clipboard.writeText(url);
    sounds.playChime();
    setCopiedSpotlight(true);
    setTimeout(() => setCopiedSpotlight(false), 2200);
  };

  // Interactive Morse key sound trigger
  const triggerMorseKey = (isDah: boolean) => {
    sounds.playMorseKey(isDah);
    setMorseKeyActive(true);
    setMorseLog(prev => (prev + (isDah ? ' —' : ' •')).slice(-18));
    setTimeout(() => setMorseKeyActive(false), 120);
  };

  // Break Wax Seal action
  const handleBreakWax = () => {
    sounds.playWaxSealBreak();
    setIsWaxBroken(true);
  };

  // Develop Polaroid action
  const handleDevelopPolaroid = () => {
    sounds.playCameraShutter();
    setIsPolaroidDeveloped(false);
    setTimeout(() => {
      setIsPolaroidDeveloped(true);
    }, 50);
  };

  // Flip Postcard action
  const handleFlipPostcard = () => {
    sounds.playStampImpact();
    setIsPostcardFlipped(!isPostcardFlipped);
  };

  // Wish Media Handlers
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (mediaList.length + files.length > 4) {
      alert('You may attach up to 4 historical artifacts or photos.');
      return;
    }

    sounds.playTypewriterStrike();

    for (const file of files) {
      const isVideo = file.type.startsWith('video');
      const tempId = Math.random().toString(36).substring(7);
      const previewUrl = URL.createObjectURL(file);

      const newPreview: MediaPreview = {
        id: tempId,
        file,
        previewUrl,
        type: isVideo ? 'video' : 'image',
        originalSize: file.size,
        compressedSize: file.size,
        isUploading: true,
      };

      setMediaList((prev) => [...prev, newPreview]);

      try {
        const compressedResult = await compressMedia(file);
        const compSize = compressedResult.compressedSize;

        setMediaList((prev) =>
          prev.map((item) =>
            item.id === tempId ? { ...item, compressedSize: compSize } : item
          )
        );

        const formData = new FormData();
        formData.append('file', compressedResult.file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          throw new Error('Upload to vault failed');
        }

        const data = await res.json();
        setMediaList((prev) =>
          prev.map((item) =>
            item.id === tempId
              ? { ...item, r2Url: data.url, isUploading: false }
              : item
          )
        );
      } catch (err: any) {
        setMediaList((prev) =>
          prev.map((item) =>
            item.id === tempId
              ? { ...item, isUploading: false, uploadError: err.message }
              : item
          )
        );
      }
    }
  };

  const removeMedia = (id: string) => {
    sounds.playTypewriterStrike();
    setMediaList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg('Inscribing your historic wish into the eternal vault...');

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
      setStatusMsg('Please wait a moment while historical media completes development...');
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

    setStatusMsg('Committing missive to the permanent archive...');

    const slug = Math.random().toString(36).substring(2, 9);
    const cleanToUsername = toUsername ? toUsername.trim().replace(/^@/, '').toLowerCase() : null;

    if (selectedTier === 'golden' && !cleanToUsername && !toName.trim()) {
      setIsSubmitting(false);
      setStatusMsg('Please specify a Recipient Name or Username.');
      return;
    }

    // Prepend era tag if chosen, so reader renders with historical ritual
    const formattedMessage = message || 'May our hopes outlive the stars and time itself.';

    const wishData = {
      user_id: session.user.id,
      sender_username: senderUsername,
      tier: selectedTier,
      from_name: fromName || `@${senderUsername}`,
      to_name: toName || (cleanToUsername ? '' : 'Esteemed Recipient'),
      to_username: cleanToUsername,
      message: formattedMessage,
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
      const { error: bookErr } = await supabase.from('onewish_bookings').insert({
        booking_date: dateVal,
        user_id: session.user.id,
        wish_id: data.id,
      });

      if (bookErr) {
        setIsSubmitting(false);
        setStatusMsg('Wish created, but date allocation conflict: ' + bookErr.message);
        return;
      }
    }

    window.location.href = `/w/${slug}`;
  };

  return (
    <main className="min-h-screen bg-[#0b0908] text-[#f7f2e7] selection:bg-[#c5a059] selection:text-[#0b0908] font-sans pb-28 relative overflow-x-hidden">
      
      {/* Ambient Historic Vignette & Grain */}
      <div className="fixed inset-0 pointer-events-none vignette-radial opacity-90 z-0" />
      <div className="fixed inset-0 pointer-events-none ambient-aurora opacity-50 z-0" />

      {/* =========================================================================
          SECTION 1: TODAY'S WORLDWIDE SPOTLIGHT MONUMENT (HISTORIC ERAS)
          Placed at the very TOP of the website as requested.
         ========================================================================= */}
      <section className="relative z-10 pt-6 sm:pt-10 px-4 sm:px-6 max-w-5xl mx-auto">
        
        {/* Era Showcase Tab Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-5 pb-3 border-b border-[#3a2c20]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059] animate-pulse" />
            <span className="text-[11px] font-courier tracking-[0.25em] uppercase text-[#c5a059] font-bold">
              THE WORLDWIDE MONUMENT • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          {/* Historic Era Selection Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#16120f] border border-[#423326] rounded-full shadow-inner">
            {(['1890s', '1930s', '1950s', '1970s'] as WishingEra[]).map((era) => (
              <button
                key={era}
                onClick={() => {
                  sounds.playTypewriterStrike();
                  setSpotlightEra(era);
                }}
                className={`px-3 py-1 rounded-full text-[11px] font-courier tracking-widest transition-all ${
                  spotlightEra === era
                    ? 'bg-[#c5a059] text-[#0b0908] font-bold shadow-md'
                    : 'text-[#9e8b78] hover:text-[#f7f2e7]'
                }`}
              >
                {era === '1890s' && '📜 1890s Wax'}
                {era === '1930s' && '📠 1930s Wire'}
                {era === '1950s' && '✈️ 1950s Post'}
                {era === '1970s' && '📷 1970s Film'}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Historic Card Rendering */}
        <div className="relative">
          
          {/* ERA 1: 1890s VICTORIAN WAX-SEALED EPISTLE */}
          {spotlightEra === '1890s' && (
            <div className="vintage-parchment rounded-sm p-6 sm:p-10 relative overflow-hidden transition-all shadow-[0_30px_90px_rgba(0,0,0,0.95)]">
              {/* Corner Brass Brackets */}
              <div className="absolute top-3 left-3 w-4 h-4 vintage-brass-bracket-tl" />
              <div className="absolute top-3 right-3 w-4 h-4 vintage-brass-bracket-tr" />
              <div className="absolute bottom-3 left-3 w-4 h-4 vintage-brass-bracket-bl" />
              <div className="absolute bottom-3 right-3 w-4 h-4 vintage-brass-bracket-br" />

              {/* Postal Header */}
              <div className="flex items-center justify-between border-b border-[#d8c3a3] pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-courier tracking-[0.2em] uppercase text-[#7d1d23] font-bold block">
                    REGISTERED MISSIVE • FOLIO NO. {new Date().getFullYear()}
                  </span>
                  <h3 className="font-garamond text-xl sm:text-2xl text-[#231916] italic font-medium">
                    To: {todayOnewish?.to_name || 'All Kindred Souls Across the Earth'}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="vintage-postmark">
                    PARCHMENT CERTIFIED
                  </div>
                </div>
              </div>

              {/* Interactive Unfolding Content */}
              <div className="relative py-4">
                {!isWaxBroken ? (
                  /* Sealed Envelope View */
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <p className="font-garamond text-base sm:text-lg text-[#5a4336] italic mb-6 max-w-md">
                      This sacred daily wish rests sealed in tea-stained parchment under molten carmine beeswax. Break the wax seal to unveil its inscription.
                    </p>

                    <button
                      onClick={handleBreakWax}
                      className="group relative flex flex-col items-center justify-center p-5 rounded-full wax-seal-emboss transition-transform hover:scale-105 active:scale-95"
                    >
                      <div className="w-16 h-16 rounded-full border border-[#ffb3b1]/40 flex flex-col items-center justify-center text-center shadow-inner">
                        <Stamp className="w-6 h-6 text-[#ffdcd9] mb-0.5" />
                        <span className="text-[9px] font-courier tracking-widest text-[#ffdcd9] font-bold uppercase">
                          BREAK SEAL
                        </span>
                      </div>
                    </button>
                    <span className="text-[10px] font-courier text-[#8c6228] mt-4 tracking-widest uppercase">
                      Tap wax emblem to open letter
                    </span>
                  </div>
                ) : (
                  /* Unfolded Letter View */
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <p className="font-garamond text-xl sm:text-3xl text-[#231916] leading-relaxed italic mb-8 animate-film-flicker">
                      "{todayOnewish?.message || 'May the light find you wherever the evening shadows fall, and may every quiet courage in your heart be met with grace.'}"
                    </p>

                    {todayOnewish?.media_url && (
                      <div className="mb-6 rounded overflow-hidden border border-[#d8c3a3] shadow-md max-w-md">
                        <WishMediaGallery mediaUrl={todayOnewish.media_url} mediaType={todayOnewish.media_type} />
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between pt-4 border-t border-[#d8c3a3] text-[11px] font-courier text-[#5a4336]">
                      <span>INSCRIBED BY: <strong className="text-[#231916]">{todayOnewish?.from_name || 'An Anonymous Pilgrim'}</strong></span>
                      <button
                        onClick={() => setIsWaxBroken(false)}
                        className="text-[#7d1d23] hover:underline uppercase tracking-wider font-bold"
                      >
                        Fold & Reseal Missive
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* ERA 2: 1930s WESTERN UNION TELEGRAPH CABLEGRAM */}
          {spotlightEra === '1930s' && (
            <div className="vintage-telegram-paper rounded-sm p-6 sm:p-10 relative overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.95)]">
              {/* Top Placard */}
              <div className="border-b-2 border-[#241c18] pb-3 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-courier font-black text-lg sm:text-2xl tracking-[0.2em] uppercase text-[#241c18]">
                    WESTERN UNION TELEGRAM
                  </span>
                  <p className="text-[10px] font-courier tracking-widest text-[#5e4b3c] uppercase">
                    WORLDWIDE CABLE RELAY NO. 401-A • TRANSMITTED VIA HIGH-SPEED COPPER WIRE
                  </p>
                </div>
                <div className="text-right font-courier text-xs text-[#241c18]">
                  <span>STANDARD RATE: 25¢</span> • <strong>PRIORITY DISPATCH</strong>
                </div>
              </div>

              {/* Punched Ticker Paper Message */}
              <div className="bg-[#ede1c2] border border-[#d3be98] p-5 sm:p-8 rounded my-4 relative shadow-inner">
                <div className="text-[10px] font-courier tracking-widest text-[#7a6450] mb-3 uppercase">
                  DELIVERY TO: {todayOnewish?.to_name?.toUpperCase() || 'EVERY CORNER OF THE GLOBE'} . STOP
                </div>

                <p className="font-courier text-lg sm:text-2xl font-bold text-[#1f1713] leading-relaxed tracking-wider uppercase">
                  {(todayOnewish?.message || 'HOLD FAST TO HOPE . STOP . THE DARKNESS NEVER OUTLASTS THE DAWN . STOP . YOU ARE REMEMBERED AND CHERISHED . STOP .')
                    .replace(/\. /g, ' . STOP . ')}
                </p>

                <div className="mt-6 pt-3 border-t border-[#d3be98] text-xs font-courier text-[#5e4b3c] flex justify-between">
                  <span>ORIGIN: {todayOnewish?.from_name?.toUpperCase() || 'ONEWISHES VAULT'}</span>
                  <span>SPEED: 60 WPM</span>
                </div>
              </div>

              {/* Interactive Brass Morse Key Transmitter */}
              <div className="mt-6 p-4 rounded bg-[#1c1613] border border-[#4a392d] text-[#f7f2e7] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3.5 h-3.5 rounded-full ${morseKeyActive ? 'bg-[#c5a059] shadow-[0_0_15px_#c5a059]' : 'bg-[#4a3a2d]'}`} />
                  <div>
                    <span className="text-xs font-courier uppercase tracking-widest text-[#c5a059] font-bold block">
                      BRASS TELEGRAPH KEY TRANSLATOR
                    </span>
                    <span className="text-[11px] font-courier text-[#a89684]">
                      Ticker Signal: {morseLog}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => triggerMorseKey(false)}
                    className="px-4 py-2 rounded bg-[#2e231c] hover:bg-[#423326] active:scale-95 border border-[#5a4433] text-xs font-courier font-bold text-[#f7f2e7] tracking-wider"
                  >
                    [ • DIT ]
                  </button>
                  <button
                    onClick={() => triggerMorseKey(true)}
                    className="px-4 py-2 rounded bg-[#2e231c] hover:bg-[#423326] active:scale-95 border border-[#5a4433] text-xs font-courier font-bold text-[#f7f2e7] tracking-wider"
                  >
                    [ — DAH ]
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ERA 3: 1950s PAR AVION TRANSATLANTIC AIRMAIL */}
          {spotlightEra === '1950s' && (
            <div className="p-2 sm:p-3 rounded par-avion-chevrons shadow-[0_30px_90px_rgba(0,0,0,0.95)]">
              <div className="bg-[#faf6ee] text-[#1e1916] rounded p-6 sm:p-10 relative">
                
                {/* Airmail Banner */}
                <div className="flex items-center justify-between pb-4 border-b border-[#d8c3a3] mb-6">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#1d3557] text-white px-3 py-1 text-xs font-courier font-bold tracking-[0.2em] rounded">
                      PAR AVION
                    </span>
                    <span className="text-xs font-courier text-[#a62626] font-bold tracking-wider">
                      BY AIR MAIL • TRANSATLANTIC 1958
                    </span>
                  </div>

                  <button
                    onClick={handleFlipPostcard}
                    className="flex items-center gap-1.5 text-xs font-courier font-bold text-[#1d3557] hover:underline"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    Flip Postcard
                  </button>
                </div>

                {/* Flippable Content */}
                {!isPostcardFlipped ? (
                  /* Front: Heartfelt Fountain Pen Message */
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center py-2">
                    <div className="md:col-span-8">
                      <p className="font-garamond text-2xl sm:text-3xl text-[#1e1916] italic leading-relaxed mb-6">
                        "{todayOnewish?.message || 'Dearest friend, wishing you fair winds over the Atlantic, laughter beneath golden sunsets, and safe returns to the ones who love you.'}"
                      </p>
                      <div className="font-courier text-xs text-[#6e5849]">
                        WITH EVERLASTING AFFECTION, <br />
                        <strong className="text-sm font-bold text-[#1e1916]">{todayOnewish?.from_name || 'A Devoted Correspondent'}</strong>
                      </div>
                    </div>

                    <div className="md:col-span-4 border-l border-[#d8c3a3] pl-0 md:pl-6 flex flex-col items-center justify-center text-center">
                      <div className="w-24 h-32 border-2 border-dashed border-[#1d3557] rounded flex flex-col items-center justify-center p-2 text-center bg-[#f0eae0] shadow-sm mb-3">
                        <span className="text-[10px] font-courier font-bold text-[#a62626] uppercase">30 FRANCS</span>
                        <Film className="w-6 h-6 text-[#1d3557] my-1" />
                        <span className="text-[8px] font-courier text-[#5e4b3c]">AIR POST 1958</span>
                      </div>
                      <div className="vintage-postmark text-[10px]">
                        PARIS - NEW YORK
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Back: Vintage Postal Manifest & Address */
                  <div className="py-6 text-center">
                    <h4 className="font-courier text-xs tracking-widest text-[#a62626] uppercase font-bold mb-2">
                      AIRMAIL ROUTE DISPATCH LOG
                    </h4>
                    <p className="font-courier text-sm text-[#4a3b30] max-w-md mx-auto mb-6">
                      DISPATCH TERMINAL: ORLY AIRPORT (PARIS) → GANDER NEWFOUNDLAND → IDLEWILD TERMINAL (NEW YORK) VIA DOUGLAS DC-7 AIRLINER.
                    </p>
                    <div className="inline-block border border-[#1d3557] p-4 rounded bg-[#eef3f9] text-left font-courier text-xs text-[#1d3557]">
                      <div>RECIPIENT: {todayOnewish?.to_name || 'A Wandering Traveler'}</div>
                      <div>POSTAL CODE: OW-AIR-1958</div>
                      <div>STATUS: DELIVERED IN FLIGHT</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ERA 4: 1970s DEVELOPING POLAROID INSTANT FILM */}
          {spotlightEra === '1970s' && (
            <div className="polaroid-frame rounded-sm p-6 sm:p-8 max-w-xl mx-auto shadow-[0_30px_90px_rgba(0,0,0,0.95)]">
              {/* Photo viewport */}
              <div className="relative aspect-[4/3] bg-[#181513] rounded-sm overflow-hidden border border-[#dcd0be] mb-6 shadow-inner">
                <div className={`w-full h-full flex items-center justify-center relative ${isPolaroidDeveloped ? 'animate-polaroid-develop' : 'brightness-20'}`}>
                  {todayOnewish?.media_url ? (
                    <img 
                      src={todayOnewish.media_url} 
                      alt="Polaroid Memory" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-[#3a2c1f] via-[#755535] to-[#c5a059] flex items-center justify-center p-6 text-center">
                      <p className="font-garamond text-xl sm:text-2xl text-[#f7f2e7] italic drop-shadow-md">
                        "{todayOnewish?.message || 'May this moment stay frozen in golden light forever.'}"
                      </p>
                    </div>
                  )}

                  {/* Vintage Emulsion Glare */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-white/10 pointer-events-none" />
                </div>
              </div>

              {/* Lower White Border with Ballpoint Pen Handwriting */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-[#2b241f]">
                <div>
                  <span className="font-garamond text-lg sm:text-xl italic font-bold block text-[#1a1410]">
                    For: {todayOnewish?.to_name || 'Someone Timeless'}
                  </span>
                  <span className="text-[11px] font-courier text-[#6b584a]">
                    EXPOSURE: SUMMER '74 • DEVELOPED ON DEMAND
                  </span>
                </div>

                <button
                  onClick={handleDevelopPolaroid}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#8c735d] text-xs font-courier font-bold text-[#423428] hover:bg-[#ece2d0] active:scale-95 transition-all"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Re-Develop Emulsion
                </button>
              </div>
            </div>
          )}

          {/* Spotlight Actions Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-courier text-[#a89684]">
            <div className="flex items-center gap-4">
              {todayOnewish?.id && (
                <WishLikeButton wishId={todayOnewish.id} initialLikes={todayOnewish.likes || 0} />
              )}
              <button
                onClick={handleCopySpotlight}
                className="flex items-center gap-1.5 text-[#c5a059] hover:underline"
              >
                <Share2 className="w-3.5 h-3.5" />
                {copiedSpotlight ? 'Artifact Link Copied!' : 'Share Today’s Artifact'}
              </button>
            </div>

            <button
              onClick={scrollToStudio}
              className="flex items-center gap-1 text-[#f7f2e7] hover:text-[#c5a059] font-bold"
            >
              Inscribe Your Own Wish Below <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: THE 4 SACRED EPOCHS OF WISHING (STITCH EXHIBITION HALL)
         ========================================================================= */}
      <section className="relative z-10 py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-courier tracking-[0.25em] uppercase text-[#c5a059] font-bold block mb-2">
            THE CHRONICLE ARCHIVE • 1890 TO PRESENT
          </span>
          <h2 className="font-garamond text-3xl sm:text-5xl text-[#f7f2e7] italic font-normal mb-4">
            How Humanity Conveyed Hope
          </h2>
          <p className="font-courier text-xs sm:text-sm text-[#b8a694] leading-relaxed">
            Before digital noise made words instantaneous and cheap, every wish carried physical weight, friction, and permanence.
          </p>
        </div>

        {/* 4 Historic Eras Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: 1890s */}
          <div className="p-6 rounded bg-[#161210] border border-[#3d2e24] flex flex-col justify-between hover:border-[#c5a059]/60 transition-all group">
            <div>
              <div className="w-10 h-10 rounded-full wax-seal-emboss flex items-center justify-center text-[#ffdcd9] mb-4">
                <Stamp className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-courier tracking-widest text-[#c5a059] uppercase block mb-1">
                EPOCH 01 • 1890 - 1899
              </span>
              <h3 className="font-garamond text-xl text-[#f7f2e7] italic font-bold mb-2">
                Victorian Carmine Wax
              </h3>
              <p className="font-courier text-xs text-[#a89684] leading-relaxed mb-4">
                Parchment folded by hand, inscribed in iron gall ink, and sealed with molten crimson wax to protect its sanctity.
              </p>
            </div>
            <div className="pt-3 border-t border-[#2e231c] text-[10px] font-courier text-[#c5a059]">
              RITUAL: WAX MELT & FRACTURE
            </div>
          </div>

          {/* Card 2: 1930s */}
          <div className="p-6 rounded bg-[#161210] border border-[#3d2e24] flex flex-col justify-between hover:border-[#c5a059]/60 transition-all group">
            <div>
              <div className="w-10 h-10 rounded bg-[#2e231c] border border-[#5a4433] flex items-center justify-center text-[#c5a059] mb-4">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <span className="text-[10px] font-courier tracking-widest text-[#c5a059] uppercase block mb-1">
                EPOCH 02 • 1930 - 1939
              </span>
              <h3 className="font-garamond text-xl text-[#f7f2e7] italic font-bold mb-2">
                Western Union Wires
              </h3>
              <p className="font-courier text-xs text-[#a89684] leading-relaxed mb-4">
                Telegraph dispatches counted word-by-word. Each sentence punctuated by STOP, carrying raw urgency across continents.
              </p>
            </div>
            <div className="pt-3 border-t border-[#2e231c] text-[10px] font-courier text-[#c5a059]">
              RITUAL: MORSE TICKER STRIKE
            </div>
          </div>

          {/* Card 3: 1950s */}
          <div className="p-6 rounded bg-[#161210] border border-[#3d2e24] flex flex-col justify-between hover:border-[#c5a059]/60 transition-all group">
            <div>
              <div className="w-10 h-10 rounded bg-[#1d3557] flex items-center justify-center text-white mb-4">
                <Send className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-courier tracking-widest text-[#c5a059] uppercase block mb-1">
                EPOCH 03 • 1950 - 1959
              </span>
              <h3 className="font-garamond text-xl text-[#f7f2e7] italic font-bold mb-2">
                Par Avion Airmail
              </h3>
              <p className="font-courier text-xs text-[#a89684] leading-relaxed mb-4">
                Featherlight blue-and-red chevron envelopes flown at 20,000 feet, bearing postmark cancellations across oceans.
              </p>
            </div>
            <div className="pt-3 border-t border-[#2e231c] text-[10px] font-courier text-[#c5a059]">
              RITUAL: 3D CARD ROTATION
            </div>
          </div>

          {/* Card 4: 1970s */}
          <div className="p-6 rounded bg-[#161210] border border-[#3d2e24] flex flex-col justify-between hover:border-[#c5a059]/60 transition-all group">
            <div>
              <div className="w-10 h-10 rounded bg-[#f7f2e7] flex items-center justify-center text-[#1e1916] mb-4">
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-courier tracking-widest text-[#c5a059] uppercase block mb-1">
                EPOCH 04 • 1970 - 1979
              </span>
              <h3 className="font-garamond text-xl text-[#f7f2e7] italic font-bold mb-2">
                Instant Polaroid Film
              </h3>
              <p className="font-courier text-xs text-[#a89684] leading-relaxed mb-4">
                Chemical emulsion slowly warming before your eyes. A physical print with a handwritten date on the bottom margin.
              </p>
            </div>
            <div className="pt-3 border-t border-[#2e231c] text-[10px] font-courier text-[#c5a059]">
              RITUAL: EMULSION DEVELOP
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 3: THE SCRIBE'S WORKBENCH (CREATE YOUR HISTORIC WISH)
         ========================================================================= */}
      <section id="inscription-studio" className="relative z-10 py-12 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="p-6 sm:p-12 rounded bg-[#120f0d] border border-[#423326] shadow-[0_30px_90px_rgba(0,0,0,0.95)] relative">
          
          {/* Header */}
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-courier tracking-[0.25em] uppercase text-[#c5a059] font-bold block mb-2">
              THE SCRIBE’S WORKBENCH
            </span>
            <h2 className="font-garamond text-3xl sm:text-4xl text-[#f7f2e7] italic font-normal mb-2">
              Inscribe an Everlasting Missive
            </h2>
            <p className="font-courier text-xs text-[#a89684]">
              Choose your historical era format, compose your message, and seal it into the permanent archive.
            </p>
          </div>

          {/* Step 1: Select Historical Era Format */}
          <div className="mb-8">
            <label className="block text-xs font-courier tracking-widest uppercase text-[#c5a059] font-bold mb-3">
              1. Choose Historical Format
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: '1890s', label: '1890s Wax Letter', icon: '📜' },
                { id: '1930s', label: '1930s Telegram', icon: '📠' },
                { id: '1950s', label: '1950s Airmail', icon: '✈️' },
                { id: '1970s', label: '1970s Polaroid', icon: '📷' },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    sounds.playTypewriterStrike();
                    setSelectedEra(item.id as WishingEra);
                  }}
                  className={`p-3 rounded border text-left transition-all ${
                    selectedEra === item.id
                      ? 'bg-[#2a2018] border-[#c5a059] text-[#f7f2e7] shadow-md'
                      : 'bg-[#181411] border-[#3a2c20] text-[#9e8b78] hover:border-[#6b533e]'
                  }`}
                >
                  <span className="text-xl block mb-1">{item.icon}</span>
                  <span className="text-xs font-courier font-bold block">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Select Sacred Archival Canister */}
          <div className="mb-8">
            <label className="block text-xs font-courier tracking-widest uppercase text-[#c5a059] font-bold mb-3">
              2. Select Archival Canister
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Canister 01: Golden Wish */}
              <button
                type="button"
                onClick={() => {
                  sounds.playTypewriterStrike();
                  setSelectedTier('golden');
                }}
                className={`p-4 rounded border text-left transition-all ${
                  selectedTier === 'golden'
                    ? 'bg-[#2a2018] border-[#c5a059] shadow-lg'
                    : 'bg-[#181411] border-[#3a2c20] hover:border-[#6b533e]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-courier text-[#c5a059] font-bold tracking-widest uppercase">
                    CANISTER 01 • GOLD ROLL
                  </span>
                  <span className="text-[10px] font-courier bg-[#c5a059]/20 text-[#c5a059] px-2 py-0.5 rounded">
                    3 IN A LIFETIME
                  </span>
                </div>
                <h4 className="font-garamond text-lg text-[#f7f2e7] italic font-bold">
                  The Golden Keepsake
                </h4>
                <p className="font-courier text-xs text-[#a89684] mt-1">
                  Private or public. Strictly limited to 3 lifetime exposures per soul.
                </p>
              </button>

              {/* Canister 02: Onewish Master Negative */}
              <button
                type="button"
                onClick={() => {
                  sounds.playTypewriterStrike();
                  setSelectedTier('onewish');
                }}
                className={`p-4 rounded border text-left transition-all ${
                  selectedTier === 'onewish'
                    ? 'bg-[#2a2018] border-[#c5a059] shadow-lg'
                    : 'bg-[#181411] border-[#3a2c20] hover:border-[#6b533e]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-courier text-[#c5a059] font-bold tracking-widest uppercase">
                    CANISTER 02 • CALENDAR MASTER
                  </span>
                  <span className="text-[10px] font-courier bg-[#7d1d23]/40 text-[#ffdad8] px-2 py-0.5 rounded">
                    1 WORLDWIDE / DAY
                  </span>
                </div>
                <h4 className="font-garamond text-lg text-[#f7f2e7] italic font-bold">
                  The Worldwide Monument
                </h4>
                <p className="font-courier text-xs text-[#a89684] mt-1">
                  Spotlighted on the website top for 24 hours across all timezones.
                </p>
              </button>

            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleWishSubmit} className="space-y-6">
            
            {/* If Onewish, show Calendar Date Allocation */}
            {selectedTier === 'onewish' && (
              <div className="p-4 rounded bg-[#1a1512] border border-[#523e2d]">
                <label className="block text-xs font-courier tracking-widest uppercase text-[#c5a059] font-bold mb-2">
                  Allocate Date on Calendar
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="date"
                    value={bookingDate}
                    min={getLocalDateString()}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2 rounded bg-[#0b0908] border border-[#423326] text-[#f7f2e7] font-courier text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                  <div className="text-xs font-courier">
                    {dateAvailability === 'checking' && <span className="text-[#a89684]">Inspecting calendar ledger...</span>}
                    {dateAvailability === 'available' && <span className="text-emerald-400 font-bold">✓ Date Open & Available</span>}
                    {dateAvailability === 'booked' && <span className="text-[#ff8d8c] font-bold">✕ Date already claimed by another soul</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Recipient Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-courier tracking-widest uppercase text-[#a89684] mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Eleanor Vance"
                  value={toName}
                  onChange={(e) => setToName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded bg-[#181411] border border-[#3a2c20] text-[#f7f2e7] font-garamond text-base italic focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <label className="block text-xs font-courier tracking-widest uppercase text-[#a89684] mb-1">
                  Recipient Username (Optional)
                </label>
                <input
                  type="text"
                  placeholder="@username"
                  value={toUsername}
                  onChange={(e) => setToUsername(e.target.value)}
                  className="w-full px-4 py-2.5 rounded bg-[#181411] border border-[#3a2c20] text-[#f7f2e7] font-courier text-xs focus:outline-none focus:border-[#c5a059]"
                />
              </div>
            </div>

            {/* Inscription Message */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-courier tracking-widest uppercase text-[#a89684]">
                  Sacred Inscription {selectedEra === '1930s' && '(Simulated telegram text)'}
                </label>
                <span className="text-[10px] font-courier text-[#c5a059]">
                  {message.length} Characters
                </span>
              </div>
              <textarea
                rows={4}
                placeholder={
                  selectedEra === '1930s' 
                    ? "WISHING YOU LIGHT AND STRENGTH THROUGH ALL STORMS . STOP . WE ARE WITH YOU ALWAYS . STOP ." 
                    : "May the years ahead be kind to your spirit..."
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-4 rounded bg-[#181411] border border-[#3a2c20] text-[#f7f2e7] font-garamond text-lg italic focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            {/* Attached Photos / Historical Media */}
            <div>
              <label className="block text-xs font-courier tracking-widest uppercase text-[#a89684] mb-2">
                Attach Artifact Photo / Film Negative (Max 4)
              </label>
              
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2.5 rounded bg-[#1e1814] hover:bg-[#2c221b] border border-[#4a392d] text-xs font-courier text-[#c5a059] cursor-pointer transition-all">
                  <Upload className="w-4 h-4" />
                  <span>Upload Media Artifact</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                </label>

                {mediaList.map((item) => (
                  <div key={item.id} className="relative w-16 h-16 rounded overflow-hidden border border-[#5a4433] group">
                    <img src={item.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    {item.isUploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-[#c5a059] animate-spin" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(item.id)}
                      className="absolute top-0.5 right-0.5 p-0.5 bg-black/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Message */}
            {statusMsg && (
              <div className="p-3 rounded bg-[#241a14] border border-[#5a3e2b] text-xs font-courier text-[#c5a059]">
                {statusMsg}
              </div>
            )}

            {/* Action Submit Button */}
            <div className="pt-4 border-t border-[#3a2c20] flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[11px] font-courier text-[#8c735d]">
                ARCHIVE VERIFICATION • EST. 1890 - 2026
              </span>

              <button
                type="submit"
                disabled={isSubmitting || dateAvailability === 'booked'}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full wax-seal-emboss text-white font-courier text-xs tracking-[0.2em] font-bold uppercase transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Inscribing into Vault...</span>
                  </>
                ) : (
                  <>
                    <Stamp className="w-4 h-4 text-[#ffdcd9]" />
                    <span>Affix Seal & Inscribe Forever</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      </section>

    </main>
  );
}
