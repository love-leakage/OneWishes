'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Search, Heart, RefreshCw, AlertCircle, Stamp, Radio, Send, Camera, Sparkles } from 'lucide-react';
import { JarLoader } from '@/components/JarLoader';
import { sounds } from '@/lib/sounds';

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
      sounds.playTypewriterStrike();
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    try {
      setLoadError(null);
      let fetchedWishes: Wish[] | null = null;

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
        console.warn('API /api/gallery fallback to Supabase:', apiErr);
      }

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
      try {
        const cached = sessionStorage.getItem('onewishes_gallery_cache');
        if (cached) {
          setWishes(JSON.parse(cached));
        } else {
          setLoadError(err.name === 'AbortError' ? 'Connecting to historical archive timed out.' : err.message);
        }
      } catch (e) {
        setLoadError(err.message || 'Error opening vault.');
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('onewishes_gallery_cache');
      if (cached) {
        setWishes(JSON.parse(cached));
        setLoading(false);
      }
    } catch (e) {}

    loadGallery();
  }, [loadGallery]);

  const filteredWishes = wishes.filter((w) => {
    const matchesTier = tierFilter === 'all' || w.tier === tierFilter;
    const matchesSearch =
      search === '' ||
      w.to_name?.toLowerCase().includes(search.toLowerCase()) ||
      w.from_name?.toLowerCase().includes(search.toLowerCase()) ||
      w.message?.toLowerCase().includes(search.toLowerCase());
    return matchesTier && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-[#0b0908] text-[#f7f2e7] selection:bg-[#c5a059] selection:text-[#0b0908] px-4 sm:px-6 py-12 max-w-7xl mx-auto space-y-12">
      
      {/* Museum Title & Colophon */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-courier tracking-[0.25em] uppercase text-[#c5a059] font-bold block">
          THE HISTORICAL ARCHIVE VAULT
        </span>
        <h1 className="font-garamond text-4xl sm:text-6xl italic text-[#f7f2e7] font-normal">
          Public Keepsake Missives
        </h1>
        <p className="font-courier text-xs text-[#a89684] uppercase tracking-widest leading-relaxed">
          Explore timeless wishes preserved across human history • EST. 1890 - 2026
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-t border-b border-[#3a2c20] py-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#c5a059]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH MISSIVES OR RECIPIENTS..."
            className="w-full pl-10 pr-4 py-2 bg-[#14100d] border border-[#3a2c20] text-xs font-courier text-[#f7f2e7] placeholder-[#6e5849] focus:outline-none focus:border-[#c5a059] rounded"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: 'All Keepsakes' },
              { id: 'golden', label: 'Golden Canisters' },
              { id: 'onewish', label: 'Worldwide Monuments' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  sounds.playTypewriterStrike();
                  setTierFilter(t.id);
                }}
                className={`px-3.5 py-1.5 rounded text-xs font-courier tracking-wider transition-all ${
                  tierFilter === t.id
                    ? 'bg-[#c5a059] text-[#0b0908] font-bold shadow-md'
                    : 'bg-[#181310] border border-[#3a2c20] text-[#a89684] hover:text-[#f7f2e7]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadGallery(true)}
            disabled={isRefreshing}
            title="Refresh Ledger"
            className="p-2 rounded bg-[#181310] border border-[#3a2c20] text-[#a89684] hover:text-[#c5a059] disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#c5a059]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="py-24 flex items-center justify-center">
          <JarLoader text="ARCHIVE" subtext="Unsealing historic missives..." size="lg" />
        </div>
      ) : loadError && wishes.length === 0 ? (
        <div className="py-20 text-center space-y-4 max-w-md mx-auto">
          <AlertCircle className="w-8 h-8 text-[#c5a059] mx-auto" />
          <h3 className="font-garamond text-xl italic text-[#f7f2e7]">Could Not Access Ledger</h3>
          <p className="font-courier text-xs text-[#a89684]">{loadError}</p>
          <button
            onClick={() => loadGallery(true)}
            className="px-6 py-2 rounded bg-[#c5a059] text-[#0b0908] font-courier text-xs font-bold uppercase tracking-wider"
          >
            Reconnect to Vault
          </button>
        </div>
      ) : filteredWishes.length === 0 ? (
        <div className="text-center py-20 font-courier text-xs text-[#a89684] border border-dashed border-[#3a2c20] p-12 rounded">
          No archived missives match your query. Inscribe the first historic keepsake!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWishes.map((w, idx) => {
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
                className="vintage-parchment rounded-sm p-6 flex flex-col justify-between hover:scale-[1.01] transition-all group shadow-lg border border-[#c4a882]/70 relative overflow-hidden min-h-[300px]"
              >
                {/* Corner Brass Brackets */}
                <div className="absolute top-2 left-2 w-3 h-3 vintage-brass-bracket-tl" />
                <div className="absolute top-2 right-2 w-3 h-3 vintage-brass-bracket-tr" />
                <div className="absolute bottom-2 left-2 w-3 h-3 vintage-brass-bracket-bl" />
                <div className="absolute bottom-2 right-2 w-3 h-3 vintage-brass-bracket-br" />

                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-[#d8c3a3] pb-3">
                    <span className="text-[10px] font-courier font-bold tracking-widest uppercase text-[#7d1d23]">
                      {w.tier === 'golden' ? '📜 35MM GOLD ROLL' : '🏛️ WORLDWIDE MASTER'}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-[#7d1d23] font-courier font-bold">
                      <Heart className="w-3.5 h-3.5 fill-current text-[#7d1d23]" />
                      <span>{w.likes_count || 0}</span>
                    </span>
                  </div>

                  {/* Recipient */}
                  <div>
                    <span className="text-[10px] font-courier text-[#6e5849] uppercase tracking-wider block">
                      Addressed To:
                    </span>
                    <h3 className="font-garamond text-xl text-[#231916] font-bold italic line-clamp-1 group-hover:text-[#7d1d23] transition-colors">
                      {w.to_name || 'Kindred Spirit'}
                    </h3>
                  </div>

                  {/* Message Quote */}
                  <p className="font-garamond text-sm text-[#382b24] italic line-clamp-3 leading-relaxed">
                    "{w.message}"
                  </p>

                  {/* Attached Media Thumbnail */}
                  {mediaPreview && (
                    <div className="w-full h-32 rounded overflow-hidden border border-[#d8c3a3] shadow-inner">
                      <img src={mediaPreview} alt="Artifact thumbnail" className="w-full h-full object-cover sepia-[0.3]" />
                    </div>
                  )}
                </div>

                {/* Footer Metadata */}
                <div className="pt-4 border-t border-[#d8c3a3] flex items-center justify-between text-[10px] font-courier text-[#5a4336] mt-4">
                  <span>INSCRIBER: <strong>{w.from_name || `@${w.sender_username}`}</strong></span>
                  <span className="text-[#7d1d23] font-bold group-hover:underline">OPEN MISSIVE →</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

    </main>
  );
}
