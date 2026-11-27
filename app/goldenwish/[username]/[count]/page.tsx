'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { JarLoader } from '@/components/JarLoader';
import { WishLikeButton } from '@/components/WishLikeButton';
import { WishMediaGallery } from '@/components/WishMediaGallery';
import { sounds } from '@/lib/sounds';
import { Sparkles, ArrowRight, Stamp } from 'lucide-react';

export default function GoldenWishPage() {
  const params = useParams();
  const username = params?.username as string;
  const countStr = params?.count as string;
  const countIndex = parseInt(countStr || '1', 10) - 1;

  const [loading, setLoading] = useState(true);
  const [wish, setWish] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const cleanUser = username?.toLowerCase().replace(/^@/, '') || '';
        if (!cleanUser) return;
        
        // Find golden wishes sent TO this username or matching slug
        const { data, error } = await supabase
          .from('wishes')
          .select('*')
          .or(`to_username.ilike.${cleanUser},slug.eq.${cleanUser}`)
          .eq('tier', 'golden')
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error('Error fetching golden wish:', error);
        }

        if (data && data.length > 0) {
          const selected = data[countIndex] || data[0];
          setWish(selected);
          sounds.playChime();
        }
      } catch (err) {
        console.error('Failed to load golden wish:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [username, countIndex]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <JarLoader text="GOLDEN VAULT" subtext={`Unsealing 35mm Gold Roll for @${username}...`} size="md" />
      </div>
    );
  }

  if (!wish) {
    return (
      <div className="py-32 text-center space-y-6 max-w-md mx-auto px-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#181310] border border-[#3a2c20] flex items-center justify-center text-[#c5a059] text-2xl font-garamond shadow-lg">
          ✦
        </div>
        <h1 className="font-garamond text-3xl sm:text-4xl italic text-[#f7f2e7]">Virgin Gold Roll</h1>
        <p className="font-courier text-xs text-[#a89684] uppercase tracking-widest leading-relaxed">
          The scribe @{username} has not yet had this 35mm Gold Roll exposed and inscribed.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3.5 bg-[#c5a059] hover:bg-[#d4b069] text-[#0b0908] font-courier font-bold uppercase tracking-widest text-xs transition-all shadow-md rounded"
        >
          Return to Chronicle
        </Link>
      </div>
    );
  }

  const formattedDate = wish.created_at
    ? new Date(wish.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'HISTORIC ARCHIVE';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#16120e] border border-[#3a2c20] text-[10px] font-courier text-[#c5a059] uppercase tracking-[0.25em]">
          <Sparkles className="w-3 h-3 text-[#c5a059]" />
          <span>SACRED 35mm GOLD ROLL • EXPOSURE {countIndex + 1} OF 3</span>
        </div>
        <h1 className="font-garamond text-4xl sm:text-6xl italic text-[#f7f2e7]">
          The Golden Keepsake
        </h1>
        <p className="text-[#a89684] font-courier tracking-widest uppercase text-xs">
          Permanent Archival Keepsake • Lifetime Covenant
        </p>
      </div>
      
      {/* Museum-Grade Parchment Container */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="vintage-parchment rounded-sm p-6 sm:p-12 md:p-16 border border-[#c4a882] shadow-2xl relative space-y-8"
      >
        {/* Brass Corner Accents */}
        <div className="absolute top-3 left-3 w-4 h-4 vintage-brass-bracket-tl pointer-events-none" />
        <div className="absolute top-3 right-3 w-4 h-4 vintage-brass-bracket-tr pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-4 h-4 vintage-brass-bracket-bl pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-4 h-4 vintage-brass-bracket-br pointer-events-none" />

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#d8c3a3] pb-6 gap-4">
          <div>
            <span className="font-courier text-[10px] uppercase tracking-[0.25em] text-[#7d1d23] font-bold block">
              35mm GOLD EMULSION • ARCHIVE CANISTER
            </span>
            <Link href={`/${wish.to_username}`} className="font-garamond text-2xl sm:text-3xl italic font-bold text-[#231916] hover:text-[#7d1d23] transition-colors">
              FOR: {wish.to_name.toUpperCase()} (@{wish.to_username})
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="vintage-postmark text-[9px] hidden sm:block">
              {formattedDate} • SACRED
            </div>
            <div className="w-12 h-12 rounded-full wax-seal-emboss flex items-center justify-center text-[#f7f2e7] font-garamond text-xl font-bold shadow-lg shrink-0">
              ✦
            </div>
          </div>
        </div>

        {/* Wish Quote */}
        <div className="relative py-6 px-4 sm:px-8 my-4 bg-white/30 rounded border border-[#d8c3a3]/60 shadow-inner">
          <span className="text-[#c5a059]/40 font-garamond text-8xl leading-none absolute -top-6 left-2 select-none">“</span>
          <p className="font-garamond text-2xl sm:text-4xl text-[#231916] leading-[1.4] italic text-center font-normal relative z-10">
            {wish.message}
          </p>
          <span className="text-[#c5a059]/40 font-garamond text-8xl leading-none absolute -bottom-14 right-2 select-none">”</span>
        </div>

        {/* Polaroid Media Gallery */}
        {wish.media_url && (
          <div className="polaroid-frame p-3 sm:p-5 rounded-sm max-w-xl mx-auto shadow-xl space-y-3">
            <div className="overflow-hidden rounded-sm border border-[#d6c7b2]">
              <WishMediaGallery mediaUrl={wish.media_url} mediaType={wish.media_type} />
            </div>
            <div className="text-center font-courier text-[10px] text-[#7a6453] tracking-widest uppercase">
              ✦ 35mm GOLD FILM SPECIMEN • PERMANENT EMULSION ✦
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-6 border-t border-[#d8c3a3] flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href={`/${wish.sender_username}`} className="font-courier text-xs text-[#523d2f] uppercase hover:text-[#7d1d23] transition-colors">
            INSCRIBED & SEALED BY: <strong className="text-[#7d1d23]">@{wish.sender_username}</strong>
          </Link>
          <WishLikeButton wishId={wish.id} initialLikes={wish.likes_count} showText />
        </div>
      </motion.div>

      {/* Return & Inscribe CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          href={`/${wish.to_username}`}
          className="inline-flex items-center gap-2 px-8 py-3.5 border border-[#3a2c20] hover:border-[#c5a059] text-[#f7f2e7] font-courier font-bold text-xs uppercase tracking-widest transition-colors w-full sm:w-auto justify-center bg-[#14100d] rounded"
        >
          <span>VIEW @{wish.to_username}'S FULL FOLIO</span>
          <ArrowRight className="w-4 h-4 text-[#c5a059]" />
        </Link>
      </div>
    </div>
  );
}
