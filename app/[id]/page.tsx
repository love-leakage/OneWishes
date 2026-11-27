'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Heart, Instagram, Share2, Check, MessageCircle, Send, Sparkles, ArrowRight, Stamp, Feather, Radio } from 'lucide-react';
import { motion } from 'framer-motion';
import { JarLoader } from '@/components/JarLoader';
import { WishLikeButton } from '@/components/WishLikeButton';
import { WishMediaGallery } from '@/components/WishMediaGallery';
import { sounds } from '@/lib/sounds';

export default function DynamicRootPage() {
  const params = useParams();
  const id = params?.id as string;
  const cleanUser = id ? id.toLowerCase().replace(/^@/, '') : '';
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const isDateParam = dateRegex.test(cleanUser);

  // Synchronous cache lookup for instant 0ms load!
  const getCachedProfile = () => {
    if (typeof window === 'undefined' || isDateParam || !cleanUser) return null;
    try {
      const userCached = localStorage.getItem('onewishes_cached_profile');
      if (userCached) {
        const parsed = JSON.parse(userCached);
        if (parsed?.username && parsed.username.toLowerCase() === cleanUser) {
          return parsed;
        }
      }
      const sessionCached = sessionStorage.getItem(`onewishes_prof_${cleanUser}`);
      if (sessionCached) return JSON.parse(sessionCached);
    } catch (e) {}
    return null;
  };

  const getCachedWishes = (key: 'received' | 'sent') => {
    if (typeof window === 'undefined' || isDateParam || !cleanUser) return [];
    try {
      const cached = sessionStorage.getItem(`onewishes_${key}_${cleanUser}`);
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [];
  };

  const initialCachedProf = getCachedProfile();
  const initialCachedReceived = getCachedWishes('received');

  const [loading, setLoading] = useState<boolean>(() => !initialCachedProf);
  const [loadingWishes, setLoadingWishes] = useState<boolean>(() => initialCachedReceived.length === 0);
  const [isDate, setIsDate] = useState<boolean>(isDateParam);
  const [profile, setProfile] = useState<any>(initialCachedProf);
  const [onewish, setOnewish] = useState<any>(null);
  const [receivedWishes, setReceivedWishes] = useState<any[]>(() => initialCachedReceived);
  const [sentWishes, setSentWishes] = useState<any[]>(() => getCachedWishes('sent'));
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!cleanUser) return;

    async function loadData() {
      if (isDateParam) {
        setIsDate(true);
        const { data: booking } = await supabase
          .from('onewish_bookings')
          .select('wish_id, wishes (*)')
          .eq('booking_date', cleanUser)
          .maybeSingle();

        if (booking) {
          const joinedWish = (booking as any).wishes;
          if (joinedWish) {
            setOnewish(Array.isArray(joinedWish) ? joinedWish[0] : joinedWish);
          } else if (booking.wish_id) {
            const { data: directWish } = await supabase
              .from('wishes')
              .select('*')
              .eq('id', booking.wish_id)
              .maybeSingle();
            setOnewish(directWish);
          }
        }
        setLoading(false);
        return;
      }

      setIsDate(false);

      // Parallel execution for instant profile hydration
      try {
        const [profRes, receivedRes, sentRes] = await Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .ilike('username', cleanUser)
            .maybeSingle(),
          supabase
            .from('wishes')
            .select('*')
            .or(`to_username.ilike.${cleanUser},to_name.ilike.${cleanUser}`)
            .order('created_at', { ascending: false }),
          supabase
            .from('wishes')
            .select('*')
            .ilike('sender_username', cleanUser)
            .order('created_at', { ascending: false }),
        ]);

        if (profRes.data) {
          setProfile(profRes.data);

          try {
            sessionStorage.setItem(`onewishes_prof_${cleanUser}`, JSON.stringify(profRes.data));
            const userCached = localStorage.getItem('onewishes_cached_profile');
            if (userCached) {
              const parsed = JSON.parse(userCached);
              if (parsed?.id === profRes.data.id) {
                localStorage.setItem('onewishes_cached_profile', JSON.stringify(profRes.data));
              }
            }
          } catch (e) {}

          let finalSent = sentRes.data || [];

          if (profRes.data.id) {
            const { data: userSent } = await supabase
              .from('wishes')
              .select('*')
              .eq('user_id', profRes.data.id)
              .order('created_at', { ascending: false });

            if (userSent && userSent.length > 0) {
              const map = new Map();
              finalSent.forEach((w) => map.set(w.id, w));
              userSent.forEach((w) => map.set(w.id, w));
              finalSent = Array.from(map.values()).sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              );
            }
          }

          setReceivedWishes(receivedRes.data || []);
          setSentWishes(finalSent);

          try {
            sessionStorage.setItem(`onewishes_received_${cleanUser}`, JSON.stringify(receivedRes.data || []));
            sessionStorage.setItem(`onewishes_sent_${cleanUser}`, JSON.stringify(finalSent));
          } catch (e) {}
        } else if ((receivedRes.data && receivedRes.data.length > 0) || (sentRes.data && sentRes.data.length > 0)) {
          setProfile({
            username: cleanUser,
            avatar_url: null,
            golden_used: 0,
            isUnclaimed: true,
          });
          setReceivedWishes(receivedRes.data || []);
          setSentWishes(sentRes.data || []);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
        setLoadingWishes(false);
      }
    }

    loadData();
  }, [cleanUser, isDateParam]);

  const handleShareProfile = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: `@${profile?.username || cleanUser} | Chronicle Archival Folio`,
          text: `Inspect @${profile?.username || cleanUser}'s historic archival keepsakes on OneWishes:`,
          url,
        });
        return;
      } catch (err) {}
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      sounds.playChime();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading && !profile && !onewish) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <JarLoader text="CHRONICLE VAULT" subtext="Accessing archival register..." size="md" />
      </div>
    );
  }

  // ==================== DATE SPOTLIGHT VIEW ====================
  if (isDate) {
    const dateObj = new Date(cleanUser + 'T00:00:00');
    const formattedDate = !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : cleanUser;

    if (!onewish) {
      return (
        <div className="max-w-xl mx-auto px-4 py-28 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#181310] border border-[#3a2c20] flex items-center justify-center text-[#c5a059] text-2xl font-garamond shadow-xl">
            ✦
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#16120e] border border-[#3a2c20] text-[10px] font-courier uppercase tracking-widest text-[#c5a059]">
            <Radio className="w-3 h-3 text-[#c5a059]" />
            <span>CHRONICLE SPOTLIGHT OPEN</span>
          </div>
          <h2 className="font-garamond text-4xl sm:text-5xl italic text-[#f7f2e7]">
            Ledger Page Unclaimed
          </h2>
          <p className="font-courier text-xs uppercase tracking-widest text-[#c5a059] font-bold">
            {formattedDate}
          </p>
          <p className="font-courier text-xs text-[#a89684] uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
            No person has yet inscribed this date into the global monument. Be the sole individual in human history to seal this day forever.
          </p>
          <div className="pt-2">
            <Link
              href={`/?date=${id}#darkroom-studio`}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#c5a059] hover:bg-[#d4b069] text-[#0b0908] font-courier font-bold text-xs uppercase tracking-widest transition-all shadow-lg rounded"
            >
              <Stamp className="w-4 h-4 text-[#0b0908]" />
              <span>Inscribe {id} Missive</span>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-12">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#16120e] border border-[#3a2c20] rounded-full text-[10px] font-courier text-[#c5a059] uppercase tracking-[0.25em]">
            <Sparkles className="w-3 h-3 text-[#c5a059]" />
            <span>WORLDWIDE CHRONICLE MONUMENT • SOLE INSCRIPTION</span>
          </div>
          <h1 className="font-garamond text-4xl sm:text-6xl italic text-[#f7f2e7]">
            The Historic Monument
          </h1>
          <p className="text-[#c5a059] font-bold tracking-widest uppercase text-xs sm:text-sm font-courier">
            RECORDED ON: {formattedDate}
          </p>
        </div>
        
        {/* Vintage Parchment Monument Container */}
        <div className="vintage-parchment rounded-sm p-6 sm:p-12 md:p-16 relative shadow-2xl border border-[#c4a882] space-y-8">
          {/* Corner Brass Brackets */}
          <div className="absolute top-3 left-3 w-4 h-4 vintage-brass-bracket-tl pointer-events-none" />
          <div className="absolute top-3 right-3 w-4 h-4 vintage-brass-bracket-tr pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-4 h-4 vintage-brass-bracket-bl pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-4 h-4 vintage-brass-bracket-br pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#d8c3a3] pb-6 gap-4">
            <div>
              <span className="font-courier text-[10px] uppercase tracking-[0.25em] text-[#7d1d23] font-bold block">
                IMMUTABLE DATE REGISTRATION
              </span>
              <Link href={`/${onewish.to_username || ''}`} className="font-garamond text-2xl sm:text-3xl italic font-bold text-[#231916] hover:text-[#7d1d23] transition-colors">
                FOR: {onewish.to_name.toUpperCase()} {onewish.to_username ? `(@${onewish.to_username})` : ''}
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="vintage-postmark text-[9px] hidden sm:block">
                GLOBAL SPOTLIGHT
              </div>
              <div className="w-12 h-12 rounded-full wax-seal-emboss flex items-center justify-center text-[#f7f2e7] font-garamond text-xl font-bold shadow-lg shrink-0">
                ✦
              </div>
            </div>
          </div>

          <div className="relative py-6 px-4 sm:px-8 bg-white/30 rounded border border-[#d8c3a3]/60 shadow-inner">
            <span className="text-[#c5a059]/40 font-garamond text-8xl leading-none absolute -top-6 left-2 select-none">“</span>
            <p className="font-garamond text-2xl sm:text-4xl text-[#231916] leading-[1.4] italic text-center font-normal relative z-10">
              {onewish.message}
            </p>
            <span className="text-[#c5a059]/40 font-garamond text-8xl leading-none absolute -bottom-14 right-2 select-none">”</span>
          </div>

          {onewish.media_url && (
            <div className="polaroid-frame p-3 sm:p-5 rounded-sm max-w-xl mx-auto shadow-xl space-y-3">
              <div className="overflow-hidden rounded-sm border border-[#d6c7b2]">
                <WishMediaGallery mediaUrl={onewish.media_url} mediaType={onewish.media_type} />
              </div>
              <div className="text-center font-courier text-[10px] text-[#7a6453] tracking-widest uppercase">
                ✦ ARCHIVAL PHOTOGRAPHIC SPECIMEN ✦
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-[#d8c3a3] flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href={`/${onewish.sender_username}`} className="font-courier text-xs text-[#523d2f] uppercase hover:text-[#7d1d23] transition-colors">
              ENGRAVED BY: <strong className="text-[#7d1d23]">@{onewish.sender_username}</strong>
            </Link>
            <WishLikeButton wishId={onewish.id} initialLikes={onewish.likes_count} showText />
          </div>
        </div>
      </div>
    );
  }

  // ==================== USER PROFILE NOT FOUND ====================
  if (!profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#181310] border border-[#3a2c20] flex items-center justify-center text-[#c5a059] text-2xl font-garamond shadow-xl">
          ✦
        </div>
        <h2 className="font-garamond text-4xl italic text-[#f7f2e7]">Archival Folio Unfound</h2>
        <p className="font-courier text-xs text-[#a89684] uppercase tracking-widest">The scribe @{id} is not registered in the historical ledger.</p>
        <Link
          href="/"
          className="inline-block px-8 py-3.5 bg-[#c5a059] hover:bg-[#d4b069] text-[#0b0908] font-courier font-bold text-xs uppercase tracking-widest transition-all rounded shadow-md"
        >
          Return to Registry
        </Link>
      </div>
    );
  }

  // ==================== USER PROFILE VIEW ====================
  const goldenUsed = profile.golden_used || 0;
  const goldenRemaining = Math.max(0, 3 - goldenUsed);
  const activeWishesList = activeTab === 'received' ? receivedWishes : sentWishes;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-16">
      
      {/* Scribe Folio Header */}
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-[#c5a059]/60 p-1 overflow-hidden bg-[#16120e] shadow-[0_0_24px_rgba(197,160,89,0.25)]">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#c5a059] to-[#8c6228] text-[#0b0908] flex items-center justify-center font-garamond text-5xl font-bold uppercase">
              {profile.username.charAt(0)}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#16120e] border border-[#3a2c20] rounded-full text-[10px] font-courier text-[#c5a059] uppercase tracking-widest">
            {profile.isUnclaimed ? '✦ UNCLAIMED HISTORICAL CITIZEN' : '✦ VERIFIED SCRIBE OF THE CHRONICLE VAULT'}
          </div>
          <h1 className="font-garamond text-4xl sm:text-6xl italic text-[#f7f2e7]">
            @{profile.username}
          </h1>
          <p className="text-xs font-courier uppercase tracking-widest text-[#a89684]">
            {profile.isUnclaimed ? 'Preserved missives inscribed for this recipient' : 'Personal Archival Folio • Permanent Registry'}
          </p>
        </div>

        {/* Golden Roll Scarcity Badges */}
        <div className="flex flex-col items-center gap-3 p-4 sm:p-5 bg-[#14100d] border border-[#3a2c20] rounded-lg max-w-md w-full shadow-lg">
          <div className="text-[11px] font-courier font-bold uppercase tracking-widest text-[#c5a059] flex flex-wrap items-center justify-center gap-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>35mm GOLD ROLLS (LIFETIME COVENANT)</span>
            </div>
            <span className="px-2.5 py-0.5 bg-[#1b1511] border border-[#3a2c20] rounded-full text-[10px]">
              {goldenRemaining} OF 3 REMAINING
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full">
            {[1, 2, 3].map((slot) => {
              const isUsed = slot <= goldenUsed;
              return (
                <div
                  key={slot}
                  className={`flex flex-col items-center justify-center gap-1 py-2 px-2 rounded border text-[10px] font-courier font-bold uppercase tracking-wider transition-all text-center ${
                    isUsed
                      ? 'border-[#2a221d] bg-[#0d0a08] text-[#6b584a] opacity-60'
                      : 'border-[#c5a059] bg-[#1e1713] text-[#c5a059] shadow-sm'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${isUsed ? 'bg-[#4a3a2d]' : 'bg-[#c5a059] animate-pulse'}`} />
                    Roll {slot}
                  </span>
                  <span className="text-[8px] font-normal tracking-tight">{isUsed ? 'Exposed & Sealed' : 'Virgin Film'}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Social Links & Sharing Actions */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2.5 sm:gap-3 w-full max-w-md mx-auto pt-2">
          {profile.instagram_handle && (
            <a
              href={`https://instagram.com/${profile.instagram_handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#14100d] border border-[#3a2c20] hover:border-[#c5a059] rounded text-[11px] font-courier font-bold uppercase tracking-wider text-[#a89684] hover:text-[#f7f2e7] transition-all truncate"
            >
              <Instagram className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
              <span className="truncate">@{profile.instagram_handle}</span>
            </a>
          )}

          <button
            onClick={handleShareProfile}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#f7f2e7] hover:bg-white text-[#0b0908] rounded text-[11px] font-courier font-bold uppercase tracking-wider transition-all shadow-sm truncate"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-700 shrink-0" /> : <Share2 className="w-3.5 h-3.5 shrink-0" />}
            <span>{copied ? 'Copied!' : 'Share Folio'}</span>
          </button>

          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Dispatch an eternal keepsake missive to @${profile.username} on OneWishes Chronicle Vault: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#14100d] border border-[#3a2c20] hover:border-[#c5a059] rounded text-[11px] font-courier font-bold uppercase tracking-wider text-[#a89684] hover:text-[#f7f2e7] transition-all truncate"
          >
            <MessageCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
            <span>Telegram</span>
          </a>

          <Link
            href={`/?to=${profile.username}#darkroom-studio`}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#c5a059] hover:bg-[#d4b069] text-[#0b0908] rounded text-[11px] font-courier font-bold uppercase tracking-wider transition-all shadow-md truncate"
          >
            <Send className="w-3.5 h-3.5 shrink-0" />
            <span>Send Missive</span>
          </Link>
        </div>
      </div>

      {/* Tabs: Received vs Sent Wishes */}
      <div className="space-y-8">
        <div className="w-full max-w-md mx-auto grid grid-cols-2 border-b border-[#3a2c20]">
          <button
            onClick={() => {
              sounds.playTypewriterStrike();
              setActiveTab('received');
            }}
            className={`pb-3.5 px-4 text-xs font-courier font-bold uppercase tracking-widest transition-all relative text-center ${
              activeTab === 'received'
                ? 'text-[#f7f2e7]'
                : 'text-[#6b584a] hover:text-[#a89684]'
            }`}
          >
            <span>Received Ledger ({receivedWishes.length})</span>
            {activeTab === 'received' && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c5a059] shadow-[0_0_8px_#c5a059]"
              />
            )}
          </button>

          <button
            onClick={() => {
              sounds.playTypewriterStrike();
              setActiveTab('sent');
            }}
            className={`pb-3.5 px-4 text-xs font-courier font-bold uppercase tracking-widest transition-all relative text-center ${
              activeTab === 'sent'
                ? 'text-[#f7f2e7]'
                : 'text-[#6b584a] hover:text-[#a89684]'
            }`}
          >
            <span>Dispatched Ledger ({sentWishes.length})</span>
            {activeTab === 'sent' && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c5a059]"
              />
            )}
          </button>
        </div>

        {/* Wishes Grid */}
        {loadingWishes && activeWishesList.length === 0 ? (
          <div className="py-20 flex items-center justify-center">
            <JarLoader text="CHRONICLE LEDGER" subtext="Unsealing folio records..." size="sm" />
          </div>
        ) : activeWishesList.length === 0 ? (
          <div className="text-center py-16 space-y-4 bg-[#14100d] border border-dashed border-[#3a2c20] p-8 rounded">
            <p className="text-xs font-courier text-[#a89684] uppercase tracking-widest">
              {activeTab === 'received'
                ? `No keepsake missives have been received by @${profile.username} yet.`
                : `@${profile.username} has not yet dispatched any missives.`}
            </p>
            <Link
              href="/#darkroom-studio"
              className="inline-block px-6 py-2.5 bg-[#c5a059] hover:bg-[#d4b069] text-[#0b0908] font-courier font-bold text-xs uppercase tracking-widest transition-all shadow-md rounded"
            >
              Inscribe First Missive
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activeWishesList.map((w) => {
              const wishHref = w.slug
                ? `/w/${w.slug}`
                : (w.tier === 'onewish'
                  ? (w.created_at ? `/${w.created_at.split('T')[0]}` : '/onewish')
                  : `/goldenwish/${w.to_username || profile.username}/1`);

              return (
                <div
                  key={w.id}
                  className="vintage-parchment rounded-sm p-6 sm:p-8 border border-[#c4a882] shadow-xl flex flex-col justify-between group min-h-[320px] relative overflow-hidden"
                >
                  {/* Brass Corner Brackets */}
                  <div className="absolute top-2 left-2 w-3 h-3 vintage-brass-bracket-tl pointer-events-none" />
                  <div className="absolute top-2 right-2 w-3 h-3 vintage-brass-bracket-tr pointer-events-none" />
                  <div className="absolute bottom-2 left-2 w-3 h-3 vintage-brass-bracket-bl pointer-events-none" />
                  <div className="absolute bottom-2 right-2 w-3 h-3 vintage-brass-bracket-br pointer-events-none" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[#d8c3a3] pb-3">
                      <span className={`px-2.5 py-0.5 text-[9px] font-courier font-bold uppercase tracking-widest rounded ${
                        w.tier === 'golden' ? 'bg-[#7d1d23] text-[#f7f2e7]' : 'bg-[#c5a059] text-[#0b0908]'
                      }`}>
                        {w.tier === 'golden' ? 'GOLDEN CYLINDER' : 'CHRONICLE MONUMENT'}
                      </span>
                      <span className="text-[10px] font-courier text-[#6b584a]">
                        {new Date(w.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {w.media_url && (
                      <div className="polaroid-frame p-2 rounded-sm border border-[#d6c7b2]">
                        <WishMediaGallery mediaUrl={w.media_url} mediaType={w.media_type} maxHeight="max-h-[200px]" />
                      </div>
                    )}

                    <Link href={wishHref} className="block group-hover:text-[#7d1d23] transition-colors">
                      <p className="text-base sm:text-lg text-[#231916] leading-relaxed line-clamp-4 font-garamond italic">
                        "{w.message}"
                      </p>
                    </Link>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#d8c3a3] flex flex-wrap gap-2 justify-between items-center text-xs font-courier uppercase tracking-widest z-10">
                    <span className="text-[#523d2f] truncate max-w-[150px] sm:max-w-[200px]">
                      {activeTab === 'received' ? `FROM: @${w.sender_username}` : `TO: @${w.to_username || 'Recipient'}`}
                    </span>
                    <div className="flex items-center gap-3 shrink-0">
                      <Link
                        href={wishHref}
                        className="text-[11px] text-[#7d1d23] font-bold hover:underline flex items-center gap-1 font-courier"
                      >
                        <span>Inspect</span>
                        <span>→</span>
                      </Link>
                      <WishLikeButton wishId={w.id} initialLikes={w.likes_count} showText />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
