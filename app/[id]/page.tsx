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

  const [loading, setLoading] = useState<boolean>(() => !initialCachedProf);
  const [isDate, setIsDate] = useState<boolean>(isDateParam);
  const [profile, setProfile] = useState<any>(initialCachedProf);
  const [onewish, setOnewish] = useState<any>(null);
  const [receivedWishes, setReceivedWishes] = useState<any[]>(() => getCachedWishes('received'));
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
          .select('wish_id')
          .eq('booking_date', cleanUser)
          .maybeSingle();

        if (booking?.wish_id) {
          const { data: wish } = await supabase
            .from('wishes')
            .select('*')
            .eq('id', booking.wish_id)
            .single();
          setOnewish(wish);
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
            .ilike('to_username', cleanUser)
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
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
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
    if (!onewish) {
      return (
        <div className="max-w-md mx-auto px-4 py-32 text-center space-y-6">
          <h2 className="font-serif text-4xl font-bold text-[#f3eee3] uppercase tracking-tighter">No Onewish Found</h2>
          <p className="text-[#a6b6ad] text-sm uppercase tracking-widest">There is no Onewish booked for {id}.</p>
          <Link href="/onewish" className="inline-block px-8 py-4 bg-[#f3eee3] text-[#141f1b] font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors">
            Book this date
          </Link>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto px-4 py-24 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="font-serif text-5xl font-bold uppercase tracking-tighter text-[#f3eee3]">THE ONEWISH</h1>
          <p className="text-[#72897e] font-bold tracking-widest uppercase text-sm">{id}</p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-10 sm:p-16 border border-[#72897e]/40 bg-[#1a2621] shadow-[8px_8px_0px_0px_rgba(114,137,126,0.2)] space-y-10 relative overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-[#2a3d35] pb-6">
            <Link href={`/${onewish.to_username}`} className="text-sm font-bold tracking-widest text-[#a6b6ad] uppercase hover:text-[#f3eee3] transition-colors">
              TO: {onewish.to_name.toUpperCase()} {onewish.to_username ? `(@${onewish.to_username})` : ''}
            </Link>
            <span className="px-4 py-1.5 bg-[#72897e] text-white text-[10px] font-bold uppercase tracking-widest">
              ONEWISH
            </span>
          </div>

          <p className="font-serif text-2xl sm:text-4xl text-[#f3eee3] leading-loose uppercase italic tracking-wide">
            "{onewish.message}"
          </p>

          {onewish.media_url && (
            <WishMediaGallery mediaUrl={onewish.media_url} mediaType={onewish.media_type} />
          )}

          <div className="pt-8 mt-8 border-t border-[#2a3d35] flex flex-col sm:flex-row items-center justify-between gap-6">
            <Link href={`/${onewish.sender_username}`} className="text-sm text-[#f3eee3] font-bold uppercase tracking-widest hover:text-[#72897e] transition-colors">
              FROM: @{onewish.sender_username}
            </Link>
            <WishLikeButton wishId={onewish.id} initialLikes={onewish.likes_count} showText />
          </div>
        </motion.div>
      </div>
    );
  }

  // USER PROFILE NOT FOUND
  if (!profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center space-y-6">
        <h2 className="font-serif text-4xl font-bold text-[#f3eee3] uppercase tracking-tighter">Profile Not Found</h2>
        <p className="text-[#a6b6ad] text-sm uppercase tracking-widest">The user @{id} does not exist.</p>
        <Link href="/" className="inline-block px-8 py-4 bg-[#f3eee3] text-[#141f1b] font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors shadow-[4px_4px_0px_0px_rgba(114,137,126,0.3)]">
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
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-[#72897e] p-1 overflow-hidden bg-[#1a2621] shadow-[0_0_24px_rgba(114,137,126,0.25)]">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
          ) : (
            <div className="w-full h-full bg-[#f3eee3] text-[#141f1b] flex items-center justify-center font-serif text-5xl font-bold uppercase">
              {profile.username.charAt(0)}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold uppercase tracking-tighter text-[#f3eee3]">
            @{profile.username}
          </h1>
          <p className="text-xs uppercase tracking-widest text-[#a6b6ad]">
            Verified OneWishes Citizen
          </p>
        </div>

        {/* Golden Wish Scarcity Badges */}
        <div className="flex flex-col items-center gap-3 p-5 bg-[#1a2621] border border-[#e4c067]/30 rounded-2xl max-w-md w-full shadow-[4px_4px_0px_0px_rgba(228,192,103,0.15)]">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#e4c067] flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>LIFETIME GOLDEN CREDITS</span>
            <span className="px-2.5 py-0.5 bg-[#e4c067]/20 border border-[#e4c067]/40 rounded-full text-[10px]">
              {goldenRemaining} / 3 AVAILABLE
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {[1, 2, 3].map((slot) => {
              const isUsed = slot <= goldenUsed;
              return (
                <div
                  key={slot}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-wider transition-all ${
                    isUsed
                      ? 'border-[#2a3d35] bg-[#121b18] text-[#72897e] opacity-60'
                      : 'border-[#e4c067] bg-[#e4c067]/10 text-[#e4c067] shadow-[0_0_12px_rgba(228,192,103,0.25)]'
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
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {profile.instagram_handle && (
            <a
              href={`https://instagram.com/${profile.instagram_handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a2621] border border-[#2a3d35] hover:border-[#72897e] rounded-full text-xs font-bold uppercase tracking-widest text-[#a6b6ad] hover:text-[#f3eee3] transition-all"
            >
              <Instagram className="w-4 h-4 text-[#e4c067]" />
              @{profile.instagram_handle}
            </a>
          )}

          <button
            onClick={handleShareProfile}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#f3eee3] hover:bg-white text-[#141f1b] rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-green-700" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'Link Copied!' : 'Share Profile'}</span>
          </button>

          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Send a rare, everlasting wish to @${profile.username} on OneWishes: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a2621] border border-[#2a3d35] hover:border-[#72897e] rounded-full text-xs font-bold uppercase tracking-widest text-[#a6b6ad] hover:text-[#f3eee3] transition-all"
          >
            <MessageCircle className="w-4 h-4 text-green-500" />
            <span>WhatsApp</span>
          </a>

          <Link
            href={`/?to=${profile.username}#create-section`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#e4c067] hover:bg-[#ebd38d] text-[#141f1b] rounded-full text-xs font-bold uppercase tracking-widest transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Wish</span>
          </Link>
        </div>
      </div>

      {/* Tabs: Received vs Sent Wishes */}
      <div className="space-y-8">
        <div className="flex items-center justify-center border-b border-[#2a3d35]">
          <button
            onClick={() => setActiveTab('received')}
            className={`pb-4 px-8 text-sm font-bold uppercase tracking-widest transition-all relative ${
              activeTab === 'received'
                ? 'text-[#f3eee3]'
                : 'text-[#72897e] hover:text-[#a6b6ad]'
            }`}
          >
            <span>Received Wishes ({receivedWishes.length})</span>
            {activeTab === 'received' && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e4c067]"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('sent')}
            className={`pb-4 px-8 text-sm font-bold uppercase tracking-widest transition-all relative ${
              activeTab === 'sent'
                ? 'text-[#f3eee3]'
                : 'text-[#72897e] hover:text-[#a6b6ad]'
            }`}
          >
            <span>Sent Wishes ({sentWishes.length})</span>
            {activeTab === 'sent' && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#72897e]"
              />
            )}
          </button>
        </div>

        {/* Wishes Grid */}
        {activeWishesList.length === 0 ? (
          <div className="text-center py-16 space-y-4 bg-[#1a2621]/40 border border-[#2a3d35] p-8">
            <p className="text-sm text-[#a6b6ad] uppercase tracking-widest font-bold">
              {activeTab === 'received'
                ? `No wishes received yet for @${profile.username}.`
                : `@${profile.username} has not sent any wishes yet.`}
            </p>
            <Link
              href="/#create-section"
              className="inline-block px-6 py-3 bg-[#f3eee3] text-[#141f1b] font-bold text-xs uppercase tracking-widest hover:bg-white transition-all shadow-[2px_2px_0px_0px_rgba(114,137,126,0.3)]"
            >
              Write First Wish
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activeWishesList.map((w) => (
              <div
                key={w.id}
                className="p-8 bg-[#1a2621] border border-[#2a3d35] hover:border-[#72897e] transition-all flex flex-col justify-between group shadow-[4px_4px_0px_0px_rgba(114,137,126,0.15)] hover:shadow-[6px_6px_0px_0px_rgba(114,137,126,0.3)] min-h-[320px] relative"
              >
                <div 
                  className="space-y-6 cursor-pointer" 
                  onClick={() => {
                    if (w.tier === 'onewish') {
                      const d = w.created_at ? w.created_at.split('T')[0] : '';
                      window.location.href = d ? `/${d}` : '/onewish';
                    } else {
                      window.location.href = `/goldenwish/${w.to_username || profile.username}/1`;
                    }
                  }}
                >
                  <div className="flex items-center justify-between border-b border-[#2a3d35] pb-4">
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                      w.tier === 'golden' ? 'bg-[#e4c067] text-[#141f1b]' : 'bg-[#72897e] text-white'
                    }`}>
                      {w.tier}
                    </span>
                    <span className="text-[10px] font-mono text-[#72897e]">
                      {new Date(w.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {w.media_url && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <WishMediaGallery mediaUrl={w.media_url} mediaType={w.media_type} maxHeight="max-h-[220px]" />
                    </div>
                  )}

                  <p className="text-sm text-[#f3eee3] leading-relaxed line-clamp-4 font-serif italic uppercase">
                    "{w.message}"
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#2a3d35] flex justify-between items-center text-xs font-bold uppercase tracking-widest z-10">
                  <span className="text-[#a6b6ad]">
                    {activeTab === 'received' ? `FROM: @${w.sender_username}` : `TO: @${w.to_username || 'Recipient'}`}
                  </span>
                  <WishLikeButton wishId={w.id} initialLikes={w.likes_count} showText />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
