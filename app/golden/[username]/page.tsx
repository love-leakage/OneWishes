'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function GoldenWishPage() {
  const params = useParams();
  const username = params?.username as string;

  const [loading, setLoading] = useState(true);
  const [wish, setWish] = useState<any>(null);

  useEffect(() => {
    if (!username) return;

    async function loadData() {
      // Find the golden wish sent TO this username
      const { data } = await supabase
        .from('wishes')
        .select('*')
        .or(`to_username.eq.${username},slug.eq.${username}`)
        .eq('tier', 'golden')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (data) {
        setWish(data);
      }
      setLoading(false);
    }
    loadData();
  }, [username]);

  if (loading) {
    return <div className="py-32 text-center text-gray-500 uppercase tracking-widest text-xs font-bold">Loading Golden Wish...</div>;
  }

  if (!wish) {
    return (
      <div className="py-32 text-center space-y-6">
        <h1 className="font-serif text-3xl font-bold uppercase">No Golden Wish Found</h1>
        <p className="text-gray-400">The user @{username} hasn't received a Golden Wish yet.</p>
        <Link href="/" className="inline-block px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-24 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="font-serif text-4xl sm:text-5xl font-bold uppercase tracking-tighter text-[#e4c067]">THE GOLDEN WISH</h1>
        <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">3 Per Lifetime. Never fades.</p>
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-10 sm:p-16 border border-[#e4c067]/50 bg-black shadow-[8px_8px_0px_0px_rgba(228,192,103,0.3)] space-y-10 relative overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-white/20 pb-6">
          <Link href={`/${wish.to_username}`} className="text-sm font-bold tracking-widest text-gray-400 uppercase hover:text-white transition-colors">
            TO: {wish.to_name.toUpperCase()} (@{wish.to_username})
          </Link>
          <span className="px-4 py-1.5 bg-[#e4c067] text-black text-[10px] font-bold uppercase tracking-widest">
            GOLDEN
          </span>
        </div>

        <p className="font-serif text-2xl sm:text-4xl text-white leading-loose uppercase italic tracking-wide">
          "{wish.message}"
        </p>

        {wish.media_url && (
          <div className="border border-[#e4c067]/30 p-2">
            {wish.media_type === 'video' ? (
              <video src={wish.media_url} autoPlay loop muted playsInline className="w-full h-auto max-h-[500px] object-cover grayscale sepia-[.3]" />
            ) : (
              <img src={wish.media_url} alt="Wish Media" className="w-full h-auto max-h-[500px] object-cover grayscale sepia-[.3]" />
            )}
          </div>
        )}

        <div className="pt-8 mt-8 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link href={`/${wish.sender_username}`} className="text-sm text-white font-bold uppercase tracking-widest hover:text-[#e4c067] transition-colors">
            FROM: @{wish.sender_username}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
