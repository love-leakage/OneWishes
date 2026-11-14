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
      // Fast, immune to client-side ad-blockers, edge-cached by Cloudflare
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
        // Fall through to Strategy 2
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
      console.error('Failed to load gallery wishes:', err);
      // Only show error if we have no cached wishes to display
      setWishes((prev) => {
        if (prev.length === 0) {
          setLoadError('Unable to load public wishes. Please check your internet connection and try again.');
        }
        return prev;
      });
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Step 1: Immediate hydration from sessionStorage for instant 0ms load
    try {
      const cached = sessionStorage.getItem('onewishes_gallery_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWishes(parsed);
          setLoading(false);
        }
      }
    } catch (e) {}

    // Step 2: Fresh background fetch
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
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ff4d8d]/10 border border-[#ff4d8d]/30 text-[#ff4d8d] text-[10px] font-bold uppercase tracking-widest rounded-full">
          <Sparkles className="w-3 h-3" />
          <span>Public Keepsake Showcase</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#fbf8f5] uppercase tracking-tighter">
          Public Showcase
        </h1>
        <p className="text-[#b5a5b5] text-sm uppercase tracking-widest">
          Explore heartfelt keepsake wishes sent across infinity.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between border-t border-b border-[#211624] py-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-4 w-4 h-4 text-[#ff4d8d]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH BY RECIPIENT OR SENDER..."
            className="w-full pl-12 pr-4 py-3 bg-[#08050a] border border-[#241727] text-xs text-[#fbf8f5] placeholder-[#5a485e] focus:outline-none focus:border-[#ff4d8d] transition-colors uppercase tracking-widest"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            {['all', 'golden', 'onewish'].map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-5 py-2.5 border text-xs font-bold uppercase tracking-widest transition-all ${
                  tierFilter === t
                    ? 'bg-gradient-to-r from-[#ff5376] to-[#f84f9c] text-white border-transparent shadow-[0_0_16px_rgba(248,79,156,0.35)]'
                    : 'bg-[#0d0910] text-[#b5a5b5] border-[#241727] hover:text-[#fbf8f5] hover:border-[#ff4d8d]/50'
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
            className="p-2.5 bg-[#0d0910] border border-[#241727] text-[#b5a5b5] hover:text-[#ff4d8d] hover:border-[#ff4d8d]/50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#ff4d8d]' : ''}`} />
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
          <div className="w-12 h-12 mx-auto rounded-full bg-[#ff4d8d]/10 border border-[#ff4d8d]/30 flex items-center justify-center text-[#ff4d8d]">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold uppercase tracking-wider text-[#fbf8f5]">Could Not Load Gallery</h3>
            <p className="text-xs text-[#b5a5b5] uppercase tracking-widest leading-relaxed">
              {loadError}
            </p>
          </div>
          <button
            onClick={() => loadGallery(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#ff5376] to-[#f84f9c] text-white font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(248,79,156,0.35)] hover:brightness-110 transition-all"
          >
            Try Again
          </button>
        </div>
      ) : filteredWishes.length === 0 ? (
        <div className="text-[#b5a5b5] text-center py-20 text-sm uppercase tracking-widest font-bold border border-dashed border-[#241727] p-12">
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
                className="p-6 sm:p-8 bg-[#0d0910] border border-[#26182a] hover:border-[#ff4d8d]/50 transition-all flex flex-col justify-between group shadow-xl hover:shadow-[0_0_30px_rgba(248,79,156,0.18)] min-h-[320px]"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-[#211624] pb-4">
                    <span
                      className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                        w.tier === 'golden'
                          ? 'bg-gradient-to-r from-[#ff5376] to-[#f84f9c] text-white'
                          : 'bg-[#ff6b8b] text-[#050505]'
                      }`}
                    >
                      {w.tier}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-[#ff4d8d]">
                      <Heart className="w-4 h-4 fill-current" />
                      <span className="font-bold">{w.likes_count || 0}</span>
                    </span>
                  </div>

                  {mediaPreview && (
                    <div className="relative w-full h-44 overflow-hidden bg-[#08050a] border border-[#ff4d8d]/30 rounded-sm shadow-[0_0_20px_rgba(248,79,156,0.15)] group-hover:border-[#ff4d8d] transition-all">
                      <img
                        src={mediaPreview}
                        alt={`Keepsake to ${w.to_name}`}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 filter contrast-[1.05] saturate-[1.12]"
                      />
                      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.85)]" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/75 backdrop-blur-sm border border-[#ff4d8d]/30 text-[8px] font-mono text-[#ff4d8d] uppercase tracking-widest rounded-full">
                        ✦ EFX MONTAGE
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0910] via-transparent to-transparent pointer-events-none" />
                    </div>
                  )}

                  <h3 className="font-bold text-xl text-[#fbf8f5] uppercase tracking-wider group-hover:text-[#ff758c] transition-colors">
                    TO: {w.to_name}
                  </h3>
                  <p className="text-sm text-[#b5a5b5] leading-relaxed line-clamp-4 font-serif italic uppercase">
                    &ldquo;{w.message}&rdquo;
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#211624] text-right text-xs text-[#ff4d8d] font-bold uppercase tracking-widest">
                  FROM: {w.from_name}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
