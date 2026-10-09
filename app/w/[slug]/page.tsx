'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Heart, Share2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Wish {
  id: string;
  sender_username: string;
  tier: string;
  from_name: string;
  to_name: string;
  message: string;
  media_url?: string;
  slug: string;
  likes_count: number;
}

export default function ViewWishPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [wish, setWish] = useState<Wish | null>(null);
  const [likes, setLikes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;

    async function fetchWish() {
      setLoading(true);
      const { data } = await supabase.from('wishes').select('*').eq('slug', slug).single();

      if (data) {
        setWish(data);
        setLikes(data.likes_count || 0);
        supabase.rpc('increment_wish_views', { target_wish_id: data.id });
      }
      setLoading(false);
    }
    fetchWish();
  }, [slug]);

  const handleLike = async () => {
    if (!wish) return;
    const newLikes = likes + 1;
    setLikes(newLikes);
    await supabase.from('wishes').update({ likes_count: newLikes }).eq('id', wish.id);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-32 text-center text-gray-500 font-bold uppercase tracking-widest text-sm">
        Unsealing wish letter...
      </div>
    );
  }

  if (!wish) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center space-y-6">
        <h2 className="font-serif text-4xl font-bold text-white uppercase tracking-tighter">This letter never arrived</h2>
        <p className="text-gray-400 text-sm uppercase tracking-widest">The wish link may have expired or was typed incorrectly.</p>
        <Link href="/" className="inline-block px-8 py-4 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors">
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
        className="p-10 sm:p-16 border border-white bg-black shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] space-y-10 relative overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-white/20 pb-6">
          <div className="text-sm font-bold tracking-widest text-gray-400 uppercase">
            TO: {wish.to_name.toUpperCase()}
          </div>
          <span className="px-4 py-1.5 bg-white text-black text-[10px] font-bold uppercase tracking-widest">
            {wish.tier}
          </span>
        </div>

        <p className="font-serif text-2xl sm:text-4xl text-white leading-loose uppercase italic tracking-wide">
          "{wish.message}"
        </p>

        {wish.media_url && (
          <div className="border border-white/20 p-2">
            <img src={wish.media_url} alt="Wish Media" className="w-full h-auto max-h-[500px] object-cover grayscale" />
          </div>
        )}

        <div className="pt-8 mt-8 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-sm text-white font-bold uppercase tracking-widest">FROM: {wish.from_name}</div>

          <button
            onClick={handleLike}
            className="flex items-center gap-3 px-6 py-3 border border-white/20 hover:border-white hover:bg-white hover:text-black text-white text-xs font-bold uppercase tracking-widest transition-all"
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>{likes} LIKES</span>
          </button>
        </div>
      </motion.div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12">
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-3 px-8 py-4 border border-white/20 hover:border-white text-white font-bold text-xs uppercase tracking-widest transition-colors w-full sm:w-auto justify-center"
        >
          <Share2 className="w-4 h-4 text-white" />
          <span>{copied ? 'LINK COPIED' : 'COPY LINK'}</span>
        </button>

        <Link
          href="/#create-section"
          className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors w-full sm:w-auto"
        >
          <span>Write Your Own</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
