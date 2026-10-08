'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Heart, Share2, Sparkles, ArrowRight } from 'lucide-react';
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
      <div className="max-w-xl mx-auto px-4 py-32 text-center text-slate-400 text-sm">
        Unsealing wish letter...
      </div>
    );
  }

  if (!wish) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center space-y-6">
        <h2 className="font-serif text-3xl font-bold text-white">This letter never arrived</h2>
        <p className="text-slate-400 text-sm">The wish link may have expired or was typed incorrectly.</p>
        <Link href="/" className="inline-block px-6 py-3 rounded-xl bg-amber-400 text-black font-bold text-xs">
          Return to Home →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 space-y-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="p-8 sm:p-12 rounded-3xl bg-[#0f172a] border border-amber-500/30 shadow-2xl space-y-8 relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold tracking-widest text-amber-400 uppercase">
            TO: {wish.to_name.toUpperCase()}
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
            {wish.tier} Wish
          </span>
        </div>

        <p className="font-serif text-2xl sm:text-3xl text-white leading-relaxed italic">
          "{wish.message}"
        </p>

        {wish.media_url && (
          <div className="rounded-2xl overflow-hidden border border-slate-800">
            <img src={wish.media_url} alt="Wish Media" className="w-full h-auto max-h-[400px] object-cover" />
          </div>
        )}

        <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
          <div className="text-sm text-slate-300 italic">— With love, {wish.from_name}</div>

          <button
            onClick={handleLike}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 text-rose-400 text-xs font-semibold transition-all"
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>{likes}</span>
          </button>
        </div>
      </motion.div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-semibold text-xs hover:border-slate-700 transition-colors"
        >
          <Share2 className="w-4 h-4 text-amber-400" />
          <span>{copied ? 'Link Copied!' : 'Copy Wish Link'}</span>
        </button>

        <Link
          href="/#create-section"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-xs hover:scale-105 transition-transform"
        >
          <span>Write Your Own Wish</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
