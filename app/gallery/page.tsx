'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Search, Heart } from 'lucide-react';

interface Wish {
  id: string;
  sender_username: string;
  tier: string;
  from_name: string;
  to_name: string;
  message: string;
  slug: string;
  likes_count: number;
  created_at: string;
}

export default function GalleryPage() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGallery() {
      setLoading(true);
      const { data } = await supabase
        .from('wishes')
        .select('*')
        .eq('privacy', 'public')
        .order('created_at', { ascending: false });

      setWishes(data || []);
      setLoading(false);
    }
    loadGallery();
  }, []);

  const filteredWishes = wishes.filter((w) => {
    const matchesSearch =
      w.to_name.toLowerCase().includes(search.toLowerCase()) ||
      w.from_name.toLowerCase().includes(search.toLowerCase()) ||
      w.message.toLowerCase().includes(search.toLowerCase());

    const matchesTier = tierFilter === 'all' || w.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="space-y-4 text-center">
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white uppercase tracking-tighter">Public Showcase</h1>
        <p className="text-gray-400 text-sm uppercase tracking-widest">Explore heartfelt keepsake wishes sent across the world.</p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between border-t border-b border-white/20 py-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-4 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH BY RECIPIENT OR SENDER..."
            className="w-full pl-12 pr-4 py-3 bg-black border border-white/20 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-white transition-colors uppercase tracking-widest"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          {['all', 'golden', 'onewish'].map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`px-6 py-3 border text-xs font-bold uppercase tracking-widest transition-all ${
                tierFilter === t
                  ? 'bg-white text-black border-white'
                  : 'bg-black text-gray-400 border-white/20 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-gray-500 text-center py-20 text-sm uppercase tracking-widest font-bold">Loading public wishes...</div>
      ) : filteredWishes.length === 0 ? (
        <div className="text-gray-500 text-center py-20 text-sm uppercase tracking-widest font-bold">
          No public wishes match your search. Be the first to create one!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredWishes.map((w) => (
            <Link
              key={w.id}
              href={`/w/${w.slug}`}
              className="p-8 bg-black border border-white/20 hover:border-white transition-all flex flex-col justify-between group shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] min-h-[300px]"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/20 pb-4">
                  <span className="px-3 py-1 bg-white text-black text-[10px] font-bold uppercase tracking-widest">
                    {w.tier}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-white">
                    <Heart className="w-4 h-4 text-white fill-current" />
                    <span className="font-bold">{w.likes_count || 0}</span>
                  </span>
                </div>

                <h3 className="font-bold text-xl text-white uppercase tracking-wider">
                  TO: {w.to_name}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed line-clamp-4 font-serif italic uppercase">
                  "{w.message}"
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-white/20 text-right text-xs text-white font-bold uppercase tracking-widest">
                FROM: {w.from_name}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
