'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Share2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { JarLoader } from '@/components/JarLoader';
import { WishLikeButton } from '@/components/WishLikeButton';
import { WishMediaGallery } from '@/components/WishMediaGallery';
import { sounds } from '@/lib/sounds';

interface Wish {
  id: string;
  sender_username: string;
  tier: string;
  from_name: string;
  to_name: string;
  message: string;
  media_url?: string;
  media_type?: string;
  slug: string;
  likes_count: number;
}

export default function ViewWishPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [wish, setWish] = useState<Wish | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;

    async function fetchWish() {
      setLoading(true);
      const { data } = await supabase.from('wishes').select('*').eq('slug', slug).single();

      if (data) {
        // Automatically redirect to canonical path as specified by user rules
        if (data.tier === 'onewish') {
          const { data: booking } = await supabase
            .from('onewish_bookings')
            .select('booking_date')
            .eq('wish_id', data.id)
            .maybeSingle();
          const targetDate = booking?.booking_date || data.created_at?.split('T')[0];
          if (targetDate) {
            window.location.replace(`/${targetDate}`);
            return;
          }
        }

        if (data.tier === 'golden') {
          const targetUser = data.to_username || data.slug;
          const { count } = await supabase
            .from('wishes')
            .select('*', { count: 'exact', head: true })
            .or(`to_username.eq.${targetUser},slug.eq.${data.slug}`)
            .eq('tier', 'golden');
          const wishNum = count && count > 0 ? count : 1;
          window.location.replace(`/goldenwish/${targetUser}/${wishNum}`);
          return;
        }

        setWish(data);
        sounds.playChime();
        supabase.rpc('increment_wish_views', { target_wish_id: data.id });
      }
      setLoading(false);
    }
    fetchWish();
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    sounds.playChime();
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <JarLoader text="ONEWISHES" subtext="Unsealing wish letter..." />
      </div>
    );
  }

  if (!wish) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center space-y-6">
        <h2 className="font-serif text-4xl font-bold text-[#f3eee3] uppercase tracking-tighter">This letter never arrived</h2>
        <p className="text-[#a6b6ad] text-sm uppercase tracking-widest">The wish link may have expired or was typed incorrectly.</p>
        <Link href="/" className="inline-block px-8 py-4 bg-[#f3eee3] text-[#141f1b] font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors shadow-[4px_4px_0px_0px_rgba(114,137,126,0.3)]">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-24 space-y-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="p-10 sm:p-16 border border-[#72897e]/40 bg-[#1a2621] shadow-[8px_8px_0px_0px_rgba(114,137,126,0.2)] space-y-10 relative overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-[#2a3d35] pb-6">
          <div className="text-sm font-bold tracking-widest text-[#a6b6ad] uppercase">
            TO: {wish.to_name.toUpperCase()}
          </div>
          <span className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest ${
            wish.tier === 'golden' ? 'bg-[#e4c067] text-[#141f1b]' : 'bg-[#72897e] text-white'
          }`}>
            {wish.tier}
          </span>
        </div>

        <p className="font-serif text-2xl sm:text-4xl text-[#f3eee3] leading-loose uppercase italic tracking-wide">
          "{wish.message}"
        </p>

        {wish.media_url && (
          <WishMediaGallery mediaUrl={wish.media_url} mediaType={wish.media_type} />
        )}

        <div className="pt-8 mt-8 border-t border-[#2a3d35] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-sm text-[#f3eee3] font-bold uppercase tracking-widest">FROM: {wish.from_name}</div>

          <WishLikeButton wishId={wish.id} initialLikes={wish.likes_count} showText />
        </div>
      </motion.div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12">
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-3 px-8 py-4 border border-[#2a3d35] hover:border-[#72897e] text-[#f3eee3] font-bold text-xs uppercase tracking-widest transition-colors w-full sm:w-auto justify-center bg-[#1a2621]"
        >
          <Share2 className="w-4 h-4 text-[#72897e]" />
          <span>{copied ? 'LINK COPIED' : 'COPY LINK'}</span>
        </button>

        <Link
          href="/#create-section"
          className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#f3eee3] text-[#141f1b] font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors w-full sm:w-auto shadow-[4px_4px_0px_0px_rgba(114,137,126,0.3)]"
        >
          <span>Write Your Own</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
