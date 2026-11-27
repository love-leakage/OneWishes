'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Share2, ArrowRight, Stamp, Feather, Sparkles } from 'lucide-react';
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
  created_at?: string;
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
        <JarLoader text="CHRONICLE VAULT" subtext="Unsealing historic keepsake missive..." size="md" />
      </div>
    );
  }

  if (!wish) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#181310] border border-[#3a2c20] flex items-center justify-center text-[#c5a059] text-2xl font-garamond shadow-lg">
          ✦
        </div>
        <h2 className="font-garamond text-3xl sm:text-4xl italic text-[#f7f2e7]">This Missive Never Arrived</h2>
        <p className="font-courier text-xs text-[#a89684] uppercase tracking-widest leading-relaxed">
          The archival entry may have been retracted or the dispatch identifier is invalid.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3.5 bg-[#c5a059] hover:bg-[#d4b069] text-[#0b0908] font-courier font-bold text-xs uppercase tracking-widest transition-all rounded shadow-md"
        >
          Return to Registry
        </Link>
      </div>
    );
  }

  const formattedDate = wish.created_at
    ? new Date(wish.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'HISTORIC ARCHIVE';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-12">
      
      {/* Top Header Label */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#16120e] border border-[#3a2c20] text-[10px] font-courier uppercase tracking-[0.25em] text-[#c5a059]">
          <Feather className="w-3 h-3 text-[#c5a059]" />
          <span>OFFICIAL SACRED MISSIVE • ARCHIVAL FOLIO</span>
        </div>
        <h1 className="font-garamond text-3xl sm:text-5xl italic text-[#f7f2e7]">
          Keepsake Letter for {wish.to_name}
        </h1>
      </div>

      {/* Main Vintage Parchment Letter Container */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="vintage-parchment rounded-sm p-6 sm:p-12 md:p-16 relative shadow-2xl border border-[#c4a882] space-y-8"
      >
        {/* Brass Corner Brackets */}
        <div className="absolute top-3 left-3 w-4 h-4 vintage-brass-bracket-tl pointer-events-none" />
        <div className="absolute top-3 right-3 w-4 h-4 vintage-brass-bracket-tr pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-4 h-4 vintage-brass-bracket-bl pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-4 h-4 vintage-brass-bracket-br pointer-events-none" />

        {/* Letter Top Heading & Postal Cancellation Mark */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#d8c3a3] pb-6 gap-4">
          <div className="space-y-1">
            <span className="font-courier text-[10px] uppercase tracking-[0.25em] text-[#7d1d23] font-bold block">
              POSTAL DESPATCH NO. {wish.id.slice(0, 8).toUpperCase()}
            </span>
            <div className="text-2xl sm:text-3xl font-garamond italic font-bold text-[#231916]">
              DEDICATED TO: {wish.to_name.toUpperCase()}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Postal Stamp Mark */}
            <div className="vintage-postmark text-[9px] hidden sm:block">
              {formattedDate} • CERTIFIED
            </div>

            {/* Carmine Sealing Wax Seal */}
            <div className="w-12 h-12 rounded-full wax-seal-emboss flex items-center justify-center text-[#f7f2e7] font-garamond text-xl font-bold shadow-lg shrink-0">
              ✦
            </div>
          </div>
        </div>

        {/* Wish Quotation Body */}
        <div className="relative py-6 px-4 sm:px-8 my-4 bg-white/30 rounded border border-[#d8c3a3]/60 shadow-inner">
          <span className="text-[#c5a059]/40 font-garamond text-8xl leading-none absolute -top-6 left-2 select-none">“</span>
          <p className="font-garamond text-2xl sm:text-4xl text-[#231916] leading-[1.4] italic text-center font-normal relative z-10">
            {wish.message}
          </p>
          <span className="text-[#c5a059]/40 font-garamond text-8xl leading-none absolute -bottom-14 right-2 select-none">”</span>
        </div>

        {/* Media Frame (Polaroid Chemical Print) */}
        {wish.media_url && (
          <div className="polaroid-frame p-3 sm:p-5 rounded-sm max-w-xl mx-auto shadow-xl space-y-3">
            <div className="overflow-hidden rounded-sm border border-[#d6c7b2]">
              <WishMediaGallery mediaUrl={wish.media_url} mediaType={wish.media_type} />
            </div>
            <div className="text-center font-courier text-[10px] text-[#7a6453] tracking-widest uppercase">
              ✦ CHEMICAL EMULSION PHOTOGRAPH • CHRONICLE PRINT ✦
            </div>
          </div>
        )}

        {/* Letter Footer Metadata & Interactions */}
        <div className="pt-6 border-t border-[#d8c3a3] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-courier text-xs text-[#523d2f] uppercase">
            SCRIBED & SEALED BY: <span className="text-[#7d1d23] font-bold">@{wish.sender_username || wish.from_name}</span>
          </div>

          <div className="flex items-center gap-4">
            <WishLikeButton wishId={wish.id} initialLikes={wish.likes_count} showText />
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-2.5 px-8 py-3.5 border border-[#3a2c20] hover:border-[#c5a059] text-[#f7f2e7] font-courier font-bold text-xs uppercase tracking-widest transition-colors w-full sm:w-auto justify-center bg-[#14100d] rounded shadow-md"
        >
          <Share2 className="w-4 h-4 text-[#c5a059]" />
          <span>{copied ? 'FOLIO LINK COPIED ✦' : 'SHARE ARCHIVAL MISSIVE'}</span>
        </button>

        <Link
          href="/#darkroom-studio"
          className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[#c5a059] hover:bg-[#d4b069] text-[#0b0908] font-courier font-bold text-xs uppercase tracking-widest transition-all w-full sm:w-auto shadow-lg rounded"
        >
          <Stamp className="w-4 h-4 text-[#0b0908]" />
          <span>INSCRIBE YOUR MISSIVE</span>
          <ArrowRight className="w-4 h-4 text-[#0b0908]" />
        </Link>
      </div>
    </div>
  );
}
