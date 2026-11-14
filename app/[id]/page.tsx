'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Heart, Instagram, Share2, Check, MessageCircle, Send, Sparkles } from 'lucide-react';
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
      // 1. Check logged-in user profile in localStorage
      const userCached = localStorage.getItem('onewishes_cached_profile');
      if (userCached) {
        const parsed = JSON.parse(userCached);
        if (parsed?.username && parsed.username.toLowerCase() === cleanUser) {
          return parsed;
        }
      }
      // 2. Check session cache for other users
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

      // PARALLEL PROMISE.ALL EXECUTION: Everything runs at the same time in 1 roundtrip
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

          // Update cache for instantaneous subsequent visits
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

          // Also check if user sent wishes under different username with their user_id
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
          // Unclaimed Profile: Wishes were sealed for this name/username before registration!
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
          title: `@${profile.username} on OneWishes`,
          text: `Send a rare, everlasting wish to @${profile.username} on OneWishes!`,
          url,
        });
        return;
      } catch (e) {}
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      sounds.playChime();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <JarLoader text="ONEWISHES" subtext="Opening wish envelope..." />
      </div>
    );
  }

  // DATE SPOTLIGHT VIEW
  if (isDate) {
    const formattedDate = (() => {
      try {
        const d = new Date(id + 'T00:00:00');
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        }
      } catch {}
      return id;
    })();

    if (!onewish) {
      return (
        <div className="max-w-lg mx-auto px-4 py-32 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ff4d8d]/10 border border-[#ff4d8d]/30 rounded-full text-[10px] font-mono text-[#ff4d8d] uppercase tracking-widest shadow-sm">
            <span>✦ UNCLAIMED CALENDAR DATE</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-black text-[#fbf8f5] uppercase tracking-tighter">
            Spotlight Open
          </h2>
          <p className="text-[#ff6b8b] font-mono text-sm uppercase tracking-widest font-bold">
            {formattedDate}
          </p>
          <p className="text-[#b5a5b5] text-xs uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
            No one has claimed this date worldwide. Be the sole individual across infinity to seal an eternal wish on this day.
          </p>
          <div className="pt-2">
            <Link
              href={`/?date=${id}#create-section`}
              className="inline-block px-8 py-4 bg-gradient-to-r from-[#ff5376] via-[#f84f9c] to-[#ff2a85] text-white font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_24px_rgba(248,79,156,0.35)]"
            >
              Claim {id} Spotlight
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto px-4 py-20 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#ff4d8d]/15 border border-[#ff4d8d]/40 rounded-full text-[10px] font-mono text-[#ff4d8d] uppercase tracking-widest shadow-[0_0_15px_rgba(248,79,156,0.25)]">
            <span>✦ WORLDWIDE FRONTPAGE SPOTLIGHT</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-black uppercase tracking-tighter text-[#fbf8f5]">
            THE ONEWISH
          </h1>
          <p className="text-[#ff6b8b] font-bold tracking-widest uppercase text-sm sm:text-base font-mono">
            {formattedDate}
          </p>
        </div>
        
        <div className="p-8 sm:p-14 border border-[#26182a] bg-[#0d0910] shadow-[0_0_40px_rgba(0,0,0,0.9)] space-y-8 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#211624] pb-5">
            <Link href={`/${onewish.to_username || ''}`} className="text-sm font-bold tracking-widest text-[#b5a5b5] uppercase hover:text-[#fbf8f5] transition-colors">
              TO: {onewish.to_name.toUpperCase()} {onewish.to_username ? `(@${onewish.to_username})` : ''}
            </Link>
            <span className="px-3.5 py-1 bg-gradient-to-r from-[#ff5376] to-[#f84f9c] text-white text-[10px] font-bold uppercase tracking-widest shadow-[0_0_12px_rgba(248,79,156,0.4)]">
              ONEWISH SPOTLIGHT
            </span>
          </div>

          <p className="font-serif text-2xl sm:text-4xl text-[#fbf8f5] leading-relaxed uppercase italic tracking-wide">
            &ldquo;{onewish.message}&rdquo;
          </p>

          {onewish.media_url && (
            <WishMediaGallery mediaUrl={onewish.media_url} mediaType={onewish.media_type} />
          )}

          <div className="pt-6 border-t border-[#211624] flex flex-col sm:flex-row items-center justify-between gap-6">
            <Link href={`/${onewish.sender_username}`} className="text-sm text-[#fbf8f5] font-bold uppercase tracking-widest hover:text-[#ff4d8d] transition-colors">
              FROM: @{onewish.sender_username}
            </Link>
            <WishLikeButton wishId={onewish.id} initialLikes={onewish.likes_count} showText />
          </div>
        </div>
      </div>
    );
  }

  // USER PROFILE NOT FOUND
  if (!profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center space-y-6">
        <h2 className="font-serif text-4xl font-bold text-[#fbf8f5] uppercase tracking-tighter">Profile Not Found</h2>
        <p className="text-[#b5a5b5] text-sm uppercase tracking-widest">The user @{id} does not exist.</p>
        <Link href="/" className="inline-block px-8 py-4 bg-gradient-to-r from-[#ff5376] to-[#f84f9c] text-white font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_20px_rgba(248,79,156,0.35)]">
          Return to Home
        </Link>
      </div>
    );
  }

  // GOLDEN BADGES CALCULATION
  const goldenUsed = profile.golden_used || 0;
  const goldenRemaining = Math.max(0, 3 - goldenUsed);
  const activeWishesList = activeTab === 'received' ? receivedWishes : sentWishes;

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 space-y-16">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-[#ff4d8d]/50 p-1 overflow-hidden bg-[#0d0910] shadow-[0_0_24px_rgba(248,79,156,0.2)]">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#ff5376] to-[#f84f9c] text-white flex items-center justify-center font-serif text-5xl font-bold uppercase">
              {profile.username.charAt(0)}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ff4d8d]/15 border border-[#ff4d8d]/40 rounded-full text-[10px] font-mono text-[#ff4d8d] uppercase tracking-widest shadow-sm">
            {profile.isUnclaimed ? '✦ UNCLAIMED CITIZEN VAULT' : '✦ VERIFIED ONEWISHES CITIZEN'}
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold uppercase tracking-tighter text-[#fbf8f5]">
            @{profile.username}
          </h1>
          <p className="text-xs uppercase tracking-widest text-[#b5a5b5]">
            {profile.isUnclaimed ? 'Wishes sealed across infinity for this recipient' : 'Permanent Keepsake Vault'}
          </p>
        </div>

        {/* Golden Wish Scarcity Badges */}
        <div className="flex flex-col items-center gap-3 p-4 sm:p-5 bg-[#0d0910] border border-[#ff4d8d]/30 rounded-2xl max-w-md w-full shadow-[0_0_30px_rgba(248,79,156,0.15)]">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#ff4d8d] flex flex-wrap items-center justify-center gap-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LIFETIME GOLDEN CREDITS</span>
            </div>
            <span className="px-2 py-0.5 bg-[#ff4d8d]/15 border border-[#ff4d8d]/40 rounded-full text-[10px]">
              {goldenRemaining} / 3 AVAILABLE
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full">
            {[1, 2, 3].map((slot) => {
              const isUsed = slot <= goldenUsed;
              return (
                <div
                  key={slot}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-2 px-1 sm:px-3 rounded-xl sm:rounded-full border text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all text-center ${
                    isUsed
                      ? 'border-[#211624] bg-[#070608] text-[#7a6a7a] opacity-50'
                      : 'border-[#ff4d8d] bg-[#ff4d8d]/10 text-[#ff4d8d] shadow-[0_0_12px_rgba(248,79,156,0.25)]'
                  }`}
                >
                  <span>✦ Wish {slot}</span>
                  <span className="text-[9px] font-normal">{isUsed ? 'Claimed' : 'Available'}</span>
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
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#0d0910] border border-[#241727] hover:border-[#ff4d8d]/60 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#b5a5b5] hover:text-[#fbf8f5] transition-all truncate"
            >
              <Instagram className="w-3.5 h-3.5 text-[#ff4d8d] shrink-0" />
              <span className="truncate">@{profile.instagram_handle}</span>
            </a>
          )}

          <button
            onClick={handleShareProfile}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#fbf8f5] hover:bg-white text-[#050505] rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all shadow-sm truncate"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-700 shrink-0" /> : <Share2 className="w-3.5 h-3.5 shrink-0" />}
            <span>{copied ? 'Copied!' : 'Share'}</span>
          </button>

          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Send a rare, everlasting wish to @${profile.username} on OneWishes: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#0d0910] border border-[#241727] hover:border-[#ff6b8b] rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#b5a5b5] hover:text-[#fbf8f5] transition-all truncate"
          >
            <MessageCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
            <span>WhatsApp</span>
          </a>

          <Link
            href={`/?to=${profile.username}#create-section`}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[#ff5376] to-[#f84f9c] text-white rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_16px_rgba(248,79,156,0.35)] truncate hover:opacity-95"
          >
            <Send className="w-3.5 h-3.5 shrink-0" />
            <span>Send Wish</span>
          </Link>
        </div>
      </div>

      {/* Tabs: Received vs Sent Wishes (Responsive Grid to prevent mobile line-wrapping) */}
      <div className="space-y-8">
        <div className="w-full max-w-md mx-auto grid grid-cols-2 border-b border-[#211624]">
          <button
            onClick={() => setActiveTab('received')}
            className={`pb-3 sm:pb-4 px-2 sm:px-6 text-xs sm:text-sm font-bold uppercase tracking-wider sm:tracking-widest transition-all relative text-center ${
              activeTab === 'received'
                ? 'text-[#fbf8f5]'
                : 'text-[#7a6a7a] hover:text-[#b5a5b5]'
            }`}
          >
            <span>Received ({receivedWishes.length})</span>
            {activeTab === 'received' && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#ff6b8b] to-[#ff2a85] shadow-[0_0_8px_#ff4d8d]"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('sent')}
            className={`pb-3 sm:pb-4 px-2 sm:px-6 text-xs sm:text-sm font-bold uppercase tracking-wider sm:tracking-widest transition-all relative text-center ${
              activeTab === 'sent'
                ? 'text-[#fbf8f5]'
                : 'text-[#7a6a7a] hover:text-[#b5a5b5]'
            }`}
          >
            <span>Sent ({sentWishes.length})</span>
            {activeTab === 'sent' && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff6b8b]"
              />
            )}
          </button>
        </div>

        {/* Wishes Grid */}
        {loadingWishes && activeWishesList.length === 0 ? (
          <div className="py-20 flex items-center justify-center">
            <JarLoader text="ONEWISHES" subtext="Unsealing wishes..." size="sm" />
          </div>
        ) : activeWishesList.length === 0 ? (
          <div className="text-center py-16 space-y-4 bg-[#0d0910] border border-[#26182a] p-8">
            <p className="text-sm text-[#b5a5b5] uppercase tracking-widest font-bold">
              {activeTab === 'received'
                ? `No wishes received yet for @${profile.username}.`
                : `@${profile.username} has not sent any wishes yet.`}
            </p>
            <Link
              href="/#create-section"
              className="inline-block px-6 py-3 bg-gradient-to-r from-[#ff5376] to-[#f84f9c] text-white font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_16px_rgba(248,79,156,0.3)]"
            >
              Write First Wish
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
                  className="p-6 sm:p-8 bg-[#0d0910] border border-[#26182a] hover:border-[#ff4d8d]/50 transition-all flex flex-col justify-between group shadow-xl hover:shadow-[0_0_30px_rgba(248,79,156,0.18)] min-h-[320px] relative"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-[#211624] pb-4">
                      <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                        w.tier === 'golden' ? 'bg-gradient-to-r from-[#ff5376] to-[#f84f9c] text-white' : 'bg-[#ff6b8b] text-[#050505]'
                      }`}>
                        {w.tier}
                      </span>
                      <span className="text-[10px] font-mono text-[#b5a5b5]">
                        {new Date(w.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {w.media_url && (
                      <div>
                        <WishMediaGallery mediaUrl={w.media_url} mediaType={w.media_type} maxHeight="max-h-[220px]" />
                      </div>
                    )}

                    <Link href={wishHref} className="block group-hover:text-[#ff758c] transition-colors">
                      <p className="text-sm text-[#fbf8f5] leading-relaxed line-clamp-4 font-serif italic uppercase">
                        "{w.message}"
                      </p>
                    </Link>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#211624] flex flex-wrap gap-2 justify-between items-center text-xs font-bold uppercase tracking-widest z-10">
                    <span className="text-[#b5a5b5] truncate max-w-[140px] sm:max-w-[180px]">
                      {activeTab === 'received' ? `FROM: @${w.sender_username}` : `TO: @${w.to_username || 'Recipient'}`}
                    </span>
                    <div className="flex items-center gap-3 shrink-0">
                      <Link
                        href={wishHref}
                        className="text-[11px] text-[#ff4d8d] hover:underline flex items-center gap-1 font-mono font-bold"
                      >
                        <span>View</span>
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
