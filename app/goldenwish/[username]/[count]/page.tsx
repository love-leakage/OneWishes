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
    <div className="max-w-4xl mx-auto px-4 py-20 space-y-12">
      <div className="text-center space-y-3">
        <div className="stamp-seal font-mono text-xs">
          ★ SACRED LIFETIME COVENANT ★
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold uppercase tracking-tight text-[#f7f3ea]">
          THE GOLDEN WISH
        </h1>
        <p className="text-[#bfae9c] font-mono tracking-widest uppercase text-xs">
          Exposure {countIndex + 1} of 3 • Permanent Archival Keepsake
        </p>
      </div>
      
      {/* Museum-Grade Double-Bezel Keepsake Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-2 sm:p-3 rounded-[2.5rem] bg-gradient-to-b from-[#3a2f26]/60 via-[#1c1612]/70 to-[#0e0c0a] border border-[#dca766]/35 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.95)] relative group"
      >
        {/* Brass Corner Accents */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[#dca766]/70 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[#dca766]/70 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[#dca766]/70 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[#dca766]/70 rounded-br-sm pointer-events-none" />

        <div className="rounded-[calc(2.5rem-0.75rem)] bg-[#120f0c] p-6 sm:p-12 md:p-16 border border-[#dca766]/20 space-y-8 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#3d332a]/80 pb-6">
            <Link href={`/${wish.to_username}`} className="text-base sm:text-xl font-serif font-bold tracking-wide text-[#f7f3ea] uppercase hover:text-[#dca766] transition-colors">
              FOR: {wish.to_name.toUpperCase()} (@{wish.to_username})
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full wax-seal-badge flex items-center justify-center text-[#120e0a] font-serif font-black text-xs shadow">
                ✦
              </div>
              <span className="px-3 py-1 bg-[#1e1713] border border-[#dca766]/40 text-[#dca766] text-[10px] font-mono font-bold uppercase tracking-widest rounded-full">
                GOLDEN ROLL
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
            <Link href={`/${wish.sender_username}`} className="font-mono text-xs text-[#bfae9c] uppercase hover:text-[#dca766] transition-colors">
              SEALED BY: <strong className="text-[#dca766]">@{wish.sender_username}</strong>
            </Link>
            <WishLikeButton wishId={wish.id} initialLikes={wish.likes_count} showText />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
