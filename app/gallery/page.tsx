'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Search, Heart, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { JarLoader } from '@/components/JarLoader';

interface Wish {
  id: string;
  sender_username: string;
  tier: string;
  from_name: string;
  to_name: string;
  to_username?: string;
  message: string;
  media_url?: string;
  media_type?: string;
  slug: string;
  likes_count: number;
  created_at: string;
}

function extractFirstMedia(raw?: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0]?.url || null;
      }
    } catch (e) {
      return null;
    }
  }
  return trimmed.startsWith('http') ? trimmed : null;
}

export default function GalleryPage() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadGallery = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    try {
      setLoadError(null);
      let fetchedWishes: Wish[] | null = null;

      // Strategy 1: First-party edge API route (/api/gallery)
      // Fast, edge-cached by Cloudflare to preserve Worker CPU
      try {
        const res = await fetch('/api/gallery', {
          signal: controller.signal,
          headers: { 'Cache-Control': isManualRefresh ? 'no-cache' : 'default' },
        });

        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json?.wishes)) {
            fetchedWishes = json.wishes;
          }
        }
      } catch (apiErr) {
        console.warn('First-party API /api/gallery failed, trying direct Supabase fallback:', apiErr);
      }

      // Strategy 2: Direct Supabase client fallback
      if (!fetchedWishes) {
        const { data, error } = await supabase
          .from('wishes')
          .select('id, sender_username, tier, from_name, to_name, to_username, message, media_url, media_type, privacy, slug, likes_count, created_at')
          .eq('privacy', 'public')
          .order('created_at', { ascending: false })
          .limit(60);

        if (error) throw error;
        if (data) {
          fetchedWishes = data as Wish[];
        }
      }

      if (fetchedWishes) {
        setWishes(fetchedWishes);
        try {
          sessionStorage.setItem('onewishes_gallery_cache', JSON.stringify(fetchedWishes));
        } catch (e) {}
      }
    } catch (err: any) {
      console.error('Gallery fetch error:', err);
      // Fallback to sessionStorage if network fails
      try {
        const cached = sessionStorage.getItem('onewishes_gallery_cache');
        if (cached) {
          setWishes(JSON.parse(cached));
          return;
        }
      } catch (e) {}
      setLoadError(err.name === 'AbortError' ? 'Gallery request timed out' : (err.message || 'Error loading gallery'));
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Instant hydration from cache
    try {
      const cached = sessionStorage.getItem('onewishes_gallery_cache');
      if (cached) {
        setWishes(JSON.parse(cached));
        setLoading(false);
      }
    } catch (e) {}

    loadGallery(false);
  }, [loadGallery]);

  const filteredWishes = wishes.filter((w) => {
    const matchesSearch =
      (w.to_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (w.from_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (w.message || '').toLowerCase().includes(search.toLowerCase());

    const matchesTier = tierFilter === 'all' || w.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#14120e] border border-[#d4af37]/35 text-[#e5c07b] text-[10px] font-bold uppercase tracking-widest rounded-full">
          <Sparkles className="w-3 h-3 text-[#d4af37]" />
          <span>Public Keepsake Showcase</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#f5f2eb] uppercase tracking-tighter">
          Public Showcase
        </h1>
        <p className="text-[#b5afa6] text-sm uppercase tracking-widest">
          Explore heartfelt keepsake wishes sealed across infinity.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between border-t border-b border-[#d4af37]/20 py-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#e5c07b]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH BY RECIPIENT OR SENDER..."
            className="w-full pl-12 pr-4 py-3 bg-[#070709] border border-[#d4af37]/20 text-xs text-[#f5f2eb] placeholder-[#605a54] focus:outline-none focus:border-[#d4af37] transition-colors uppercase tracking-widest rounded-sm"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            {['all', 'golden', 'onewish'].map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-5 py-2.5 border text-xs font-bold uppercase tracking-widest transition-all rounded-sm ${
                  tierFilter === t
                    ? 'bg-gradient-to-r from-[#d4af37] via-[#e5c07b] to-[#b38728] text-[#050505] border-transparent shadow-[0_0_16px_rgba(212,175,55,0.35)]'
                    : 'bg-[#09090c] text-[#b5afa6] border-[#d4af37]/20 hover:text-[#f5f2eb] hover:border-[#d4af37]/50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadGallery(true)}
            disabled={isRefreshing}
            title="Refresh showcase"
            className="p-2.5 bg-[#09090c] border border-[#d4af37]/20 text-[#b5afa6] hover:text-[#e5c07b] hover:border-[#d4af37]/50 transition-colors disabled:opacity-50 rounded-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#e5c07b]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="py-24 flex items-center justify-center">
          <JarLoader text="GALLERY" subtext="Unsealing public keepsakes across infinity..." size="lg" />
        </div>
      ) : loadError && wishes.length === 0 ? (
        <div className="py-20 text-center space-y-6 max-w-md mx-auto">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#14120e] border border-[#d4af37]/35 flex items-center justify-center text-[#e5c07b]">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold uppercase tracking-wider text-[#f5f2eb]">Could Not Load Gallery</h3>
            <p className="text-xs text-[#b5afa6] uppercase tracking-widest leading-relaxed">
              {loadError}
            </p>
          </div>
          <button
            onClick={() => loadGallery(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#d4af37] via-[#e5c07b] to-[#b38728] text-[#050505] font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(212,175,55,0.35)] hover:brightness-110 transition-all rounded-sm"
          >
            Try Again
          </button>
        </div>
      ) : filteredWishes.length === 0 ? (
        <div className="text-[#b5afa6] text-center py-20 text-sm uppercase tracking-widest font-bold border border-dashed border-[#d4af37]/25 p-12 rounded-sm">
          No public wishes match your search. Be the first to create one!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredWishes.map((w) => {
            const wishHref = w.slug
              ? `/w/${w.slug}`
              : (w.tier === 'onewish'
                ? (w.created_at ? `/${w.created_at.split('T')[0]}` : '/onewish')
                : `/goldenwish/${w.to_username || w.slug}/1`);

            const mediaPreview = extractFirstMedia(w.media_url);

            return (
              <Link
                key={w.id}
                href={wishHref}
                className="p-1 rounded-2xl bg-gradient-to-b from-[#3a2f26]/40 via-[#1c1612]/60 to-[#0e0c0a] border border-[#423528] hover:border-[#dca766] transition-all flex flex-col justify-between group shadow-xl hover:shadow-[0_15px_40px_rgba(220,167,102,0.15)] min-h-[340px]"
              >
                <div className="p-6 sm:p-7 rounded-[calc(1rem-2px)] bg-[#14110e] flex flex-col justify-between h-full space-y-5">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[#3d332a]/60 pb-3">
                      <span className="px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest rounded-full bg-[#1e1713] border border-[#dca766]/30 text-[#dca766]">
                        {w.tier === 'golden' ? 'GOLDEN ROLL' : 'MASTER NEGATIVE'}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-[#dca766] font-mono">
                        <Heart className="w-3.5 h-3.5 fill-current text-[#dca766]" />
                        <span className="font-bold">{w.likes_count || 0}</span>
                      </span>
                    </div>

                    {mediaPreview && (
                      <div className="relative w-full h-44 overflow-hidden bg-[#090807] border border-[#423528] rounded-xl shadow-md group-hover:border-[#dca766] transition-all">
                        <img
                          src={mediaPreview}
                          alt={`Keepsake to ${w.to_name}`}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 vintage-film-filter"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm border border-[#dca766]/35 text-[8px] font-mono text-[#dca766] uppercase tracking-widest rounded-full">
                          ✦ 35MM ARCHIVE
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5 text-left">
                      <div className="text-[10px] font-mono text-[#a8713a] uppercase tracking-wider">
                        DEDICATION
                      </div>
                      <h3 className="font-serif font-bold text-xl text-[#f7f3ea] uppercase tracking-wide group-hover:text-[#dca766] transition-colors">
                        FOR: {w.to_name}
                      </h3>
                      <p className="text-sm text-[#bfae9c] leading-relaxed line-clamp-3 font-serif italic">
                        &ldquo;{w.message}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#3d332a]/60 flex items-center justify-between text-xs font-mono">
                    <span className="text-[#7a6a5d] text-[10px] uppercase">SEALED BY:</span>
                    <span className="text-[#dca766] font-bold uppercase">{w.from_name}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
