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
      const cleanUser = username.toLowerCase().replace(/^@/, '');
      // Find golden wishes sent TO this username or matching slug
      const { data } = await supabase
        .from('wishes')
        .select('*')
        .or(`to_username.ilike.${cleanUser},slug.eq.${cleanUser}`)
        .eq('tier', 'golden')
        .order('created_at', { ascending: true });
      
      if (data && data.length > 0) {
        // Select the wish based on index, or default to the first/latest
        const selected = data[countIndex] || data[0];
        setWish(selected);
        sounds.playChime();
      }
      setLoading(false);
    }
    loadData();
  }, [username, countIndex]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <JarLoader text="GOLDEN WISH" subtext={`Retrieving wish for @${username}...`} />
      </div>
    );
  }

  if (!wish) {
    return (
      <div className="py-32 text-center space-y-6">
        <h1 className="font-serif text-3xl font-bold uppercase text-[#f3eee3]">No Golden Wish Found</h1>
        <p className="text-[#a6b6ad]">The user @{username} hasn't received a Golden Wish yet.</p>
        <Link href="/" className="inline-block px-8 py-4 bg-[#e4c067] text-[#141f1b] font-bold uppercase tracking-widest text-xs hover:bg-[#edd48d] transition-colors shadow-[4px_4px_0px_0px_rgba(228,192,103,0.3)]">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-24 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="font-serif text-4xl sm:text-5xl font-bold uppercase tracking-tighter text-[#e4c067]">THE GOLDEN WISH</h1>
        <p className="text-[#a6b6ad] font-bold tracking-widest uppercase text-xs">3 Per Lifetime. Never fades.</p>
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-10 sm:p-16 border border-[#e4c067]/40 bg-[#1a2621] shadow-[8px_8px_0px_0px_rgba(228,192,103,0.2)] space-y-10 relative overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-[#2a3d35] pb-6">
          <Link href={`/${wish.to_username}`} className="text-sm font-bold tracking-widest text-[#a6b6ad] uppercase hover:text-[#f3eee3] transition-colors">
            TO: {wish.to_name.toUpperCase()} (@{wish.to_username})
          </Link>
          <span className="px-4 py-1.5 bg-[#e4c067] text-[#141f1b] text-[10px] font-bold uppercase tracking-widest">
            GOLDEN
          </span>
        </div>

        <p className="font-serif text-2xl sm:text-4xl text-[#f3eee3] leading-loose uppercase italic tracking-wide">
          "{wish.message}"
        </p>

        {wish.media_url && (
          <WishMediaGallery mediaUrl={wish.media_url} mediaType={wish.media_type} />
        )}

        <div className="pt-8 mt-8 border-t border-[#2a3d35] flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link href={`/${wish.sender_username}`} className="text-sm text-[#f3eee3] font-bold uppercase tracking-widest hover:text-[#e4c067] transition-colors">
            FROM: @{wish.sender_username}
          </Link>
          <WishLikeButton wishId={wish.id} initialLikes={wish.likes_count} showText />
        </div>
      </motion.div>
    </div>
  );
}
