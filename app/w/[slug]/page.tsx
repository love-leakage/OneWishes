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
      try {
        setLoading(true);
        const { data, error } = await supabase.from('wishes').select('*').eq('slug', slug).maybeSingle();

        if (error) {
          console.error('Error fetching wish:', error);
        }

        if (data) {
          // Automatically redirect to canonical path
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
      } catch (err) {
        console.error('Failed to load wish:', err);
      } finally {
        setLoading(false);
      }
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
        <JarLoader text="ONEWISHES" subtext="Unsealing keepsake letter..." />
      </div>
    );
  }

  if (!wish) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center space-y-6">
        <h2 className="font-serif text-4xl font-bold text-[#f5f2eb] uppercase tracking-tighter">This letter never arrived</h2>
        <p className="text-[#b5afa6] text-sm uppercase tracking-widest">The wish link may have expired or was typed incorrectly.</p>
        <Link href="/" className="inline-block px-8 py-4 bg-gradient-to-r from-[#d4af37] via-[#e5c07b] to-[#b38728] text-[#050505] font-bold text-xs uppercase tracking-widest hover:opacity-95 transition-all shadow-lg rounded-sm">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-24 space-y-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="archival-letter p-1 border border-[#d4af37]/35 bg-[#09090b] shadow-[0_0_45px_rgba(212,175,55,0.12)] relative rounded-sm"
      >
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#d4af37]/70" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#d4af37]/70" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#d4af37]/70" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#d4af37]/70" />

        <div className="bg-[#050507] p-8 sm:p-14 border border-[#d4af37]/20 space-y-8 relative">
          <div className="flex items-center justify-between border-b border-[#d4af37]/25 pb-6">
            <div className="text-sm font-bold tracking-[0.2em] text-[#e5c07b] uppercase">
              FOR: {wish.to_name.toUpperCase()}
            </div>
            <span className="px-3.5 py-1 bg-gradient-to-r from-[#d4af37] via-[#e5c07b] to-[#b38728] text-[#050505] text-[10px] font-bold uppercase tracking-widest shadow-[0_0_12px_rgba(212,175,55,0.35)] rounded-sm">
              {wish.tier} KEEPSAKE
            </span>
          </div>

          <div className="relative py-4 px-2 sm:px-6">
            <span className="text-[#d4af37]/30 font-serif text-6xl leading-none absolute -top-4 left-0 select-none">“</span>
            <p className="font-serif text-2xl sm:text-4xl text-[#f5f2eb] leading-relaxed uppercase italic tracking-wide text-center">
              {wish.message}
            </p>
            <span className="text-[#d4af37]/30 font-serif text-6xl leading-none absolute -bottom-8 right-0 select-none">”</span>
          </div>

          {wish.media_url && (
            <div className="rounded-sm overflow-hidden border border-[#d4af37]/30 shadow-2xl">
              <WishMediaGallery mediaUrl={wish.media_url} mediaType={wish.media_type} />
            </div>
          )}

          <div className="pt-8 mt-8 border-t border-[#d4af37]/20 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-sm text-[#f5f2eb] font-bold uppercase tracking-widest">
              SEALED BY: {wish.from_name}
            </div>

            <WishLikeButton wishId={wish.id} initialLikes={wish.likes_count} showText />
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-3 px-8 py-4 border border-[#d4af37]/30 hover:border-[#e5c07b] text-[#f5f2eb] font-bold text-xs uppercase tracking-widest transition-colors w-full sm:w-auto justify-center bg-[#09090c] rounded-sm"
        >
          <Share2 className="w-4 h-4 text-[#e5c07b]" />
          <span>{copied ? 'LINK COPIED' : 'COPY ARCHIVE LINK'}</span>
        </button>

        <Link
          href="/#create-section"
          className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#d4af37] via-[#e5c07b] to-[#b38728] text-[#050505] font-bold text-xs uppercase tracking-widest hover:opacity-95 transition-all w-full sm:w-auto shadow-lg rounded-sm"
        >
          <span>Write Your Own</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
