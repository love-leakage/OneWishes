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
    <div className="max-w-4xl mx-auto px-4 py-20 space-y-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="p-2 sm:p-3 rounded-[2.5rem] bg-gradient-to-b from-[#3a2f26]/60 via-[#1c1612]/70 to-[#0e0c0a] border border-[#dca766]/35 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.95)] relative group"
      >
        {/* Brass Corner Brackets */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[#dca766]/70 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[#dca766]/70 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[#dca766]/70 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[#dca766]/70 rounded-br-sm pointer-events-none" />

        <div className="rounded-[calc(2.5rem-0.75rem)] bg-[#120f0c] p-6 sm:p-12 md:p-16 border border-[#dca766]/20 relative overflow-hidden space-y-8">
          <div className="flex items-center justify-between border-b border-[#3d332a]/80 pb-6">
            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#dca766]">
                OFFICIAL KEEPSAKE LETTER
              </span>
              <div className="text-xl sm:text-2xl font-serif font-bold text-[#f7f3ea] uppercase">
                FOR: {wish.to_name.toUpperCase()}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full wax-seal-badge flex items-center justify-center text-[#120e0a] font-serif font-black text-xs shadow-[0_0_15px_rgba(220,167,102,0.4)]">
                ✦
              </div>
              <span className="px-3 py-1 bg-[#1e1713] border border-[#dca766]/40 text-[#dca766] text-[10px] font-mono font-bold uppercase tracking-widest rounded-full">
                {wish.tier} ARCHIVE
              </span>
            </div>
          </div>

          <div className="relative py-4 px-2 sm:px-6">
            <span className="text-[#dca766]/20 font-serif text-7xl leading-none absolute -top-4 left-0 select-none">“</span>
            <p className="font-serif text-2xl sm:text-4xl md:text-5xl text-[#f7f3ea] leading-[1.25] tracking-tight italic font-light text-center">
              {wish.message}
            </p>
            <span className="text-[#dca766]/20 font-serif text-7xl leading-none absolute -bottom-8 right-0 select-none">”</span>
          </div>

          {wish.media_url && (
            <div className="rounded-xl overflow-hidden border border-[#dca766]/35 shadow-[0_15px_40px_rgba(0,0,0,0.85)] max-w-2xl mx-auto">
              <WishMediaGallery mediaUrl={wish.media_url} mediaType={wish.media_type} />
            </div>
          )}

          <div className="pt-8 border-t border-[#3d332a]/80 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="font-mono text-xs text-[#bfae9c] uppercase">
              SEALED BY: <span className="text-[#dca766] font-bold">{wish.from_name}</span>
            </div>

            <WishLikeButton wishId={wish.id} initialLikes={wish.likes_count} showText />
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-2.5 px-8 py-3.5 border border-[#423528] hover:border-[#dca766] text-[#ede3d2] hover:text-[#f7f3ea] font-mono font-bold text-xs uppercase tracking-widest transition-colors w-full sm:w-auto justify-center bg-[#161310] rounded-full"
        >
          <Share2 className="w-4 h-4 text-[#dca766]" />
          <span>{copied ? 'LINK COPIED ✦' : 'SHARE ARCHIVE LINK'}</span>
        </button>

        <Link
          href="/#darkroom-studio"
          className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[#dca766] hover:bg-[#e8bc82] text-[#120e0a] font-mono font-bold text-xs uppercase tracking-widest hover:opacity-95 transition-all w-full sm:w-auto shadow-[0_10px_25px_rgba(220,167,102,0.35)] rounded-full active:scale-[0.98]"
        >
          <span>DEVELOP YOUR OWN</span>
          <ArrowRight className="w-4 h-4 text-[#120e0a]" />
        </Link>
      </div>
    </div>
  );
}
