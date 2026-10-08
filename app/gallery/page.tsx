'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Search, Heart, Sparkles, Filter } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">Public Wishes Showcase</h1>
        <p className="text-slate-400 text-sm">Explore heartfelt keepsake wishes sent across the world.</p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by recipient or sender..."
            className="w-full pl-11 pr-4 py-3 bg-[#0f172a] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['all', 'spark', 'golden', 'neverfade'].map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                tierFilter === t
                  ? 'bg-indigo-500 text-white'
                  : 'bg-[#0f172a] border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-slate-400 text-center py-20 text-sm">Loading public wishes...</div>
      ) : filteredWishes.length === 0 ? (
        <div className="text-slate-500 text-center py-20 text-sm">
          No public wishes match your search. Be the first to create one!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWishes.map((w) => (
            <Link
              key={w.id}
              href={`/w/${w.slug}`}
              className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                    {w.tier}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
                    <span>{w.likes_count || 0}</span>
                  </span>
                </div>

                <h3 className="font-semibold text-lg text-white group-hover:text-indigo-300 transition-colors">
                  To {w.to_name}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 italic font-serif">
                  "{w.message}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-right text-xs text-slate-400">
                — {w.from_name}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
