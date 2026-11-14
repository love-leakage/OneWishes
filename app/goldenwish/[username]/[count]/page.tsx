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
        <JarLoader text="GOLDEN WISH" subtext={`Retrieving keepsake for @${username}...`} />
      </div>
    );
  }

  if (!wish) {
    return (
      <div className="py-32 text-center space-y-6">
        <h1 className="font-serif text-3xl font-bold uppercase text-[#f5f2eb]">No Golden Wish Found</h1>
        <p className="text-[#b5afa6]">The user @{username} hasn't received a Golden Wish yet.</p>
        <Link href="/" className="inline-block px-8 py-4 bg-gradient-to-r from-[#d4af37] via-[#e5c07b] to-[#b38728] text-[#050505] font-bold uppercase tracking-widest text-xs hover:opacity-95 transition-all shadow-lg rounded-sm">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-24 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="font-serif text-4xl sm:text-5xl font-bold uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#ffffff] via-[#f3e5ab] to-[#d4af37]">
          THE GOLDEN WISH
        </h1>
        <p className="text-[#b5afa6] font-bold tracking-widest uppercase text-xs font-mono">
          3 Per Lifetime • Archival Keepsake
        </p>
      </div>
      
      {/* Archival Keepsake Letter Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="archival-letter p-1 border border-[#d4af37]/35 bg-[#09090b] shadow-[0_0_45px_rgba(212,175,55,0.12)] space-y-10 relative overflow-hidden rounded-sm"
      >
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#d4af37]/70" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#d4af37]/70" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#d4af37]/70" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#d4af37]/70" />

        <div className="bg-[#050507] p-8 sm:p-14 border border-[#d4af37]/20 space-y-8 relative">
          <div className="flex items-center justify-between border-b border-[#d4af37]/25 pb-6">
            <Link href={`/${wish.to_username}`} className="text-sm font-bold tracking-[0.2em] text-[#e5c07b] uppercase hover:text-[#f5f2eb] transition-colors">
              FOR: {wish.to_name.toUpperCase()} (@{wish.to_username})
            </Link>
            <span className="px-3.5 py-1 bg-gradient-to-r from-[#d4af37] via-[#e5c07b] to-[#b38728] text-[#050505] text-[10px] font-bold uppercase tracking-widest shadow-[0_0_12px_rgba(212,175,55,0.35)] rounded-sm">
              GOLDEN KEEPSAKE
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
            <Link href={`/${wish.sender_username}`} className="text-sm text-[#f5f2eb] font-bold uppercase tracking-widest hover:text-[#e5c07b] transition-colors">
              SEALED BY: @{wish.sender_username}
            </Link>
            <WishLikeButton wishId={wish.id} initialLikes={wish.likes_count} showText />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
