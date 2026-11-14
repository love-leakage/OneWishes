'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Maximize2, X, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

export function parseWishMedia(mediaUrl?: string | null, mediaType?: string | null): MediaItem[] {
  if (!mediaUrl) return [];

  // If stored as JSON array string
  const trimmed = mediaUrl.trim();
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any) => ({
          url: typeof item === 'string' ? item : item.url,
          type: (typeof item === 'object' && item.type)
            ? item.type
            : (item.url?.match(/\.(mp4|webm|mov|ogg)$/i) ? 'video' : 'image'),
        }));
      }
    } catch (e) {}
  }

  // Single URL backward compatibility
  const isVideo = mediaType === 'video' || !!mediaUrl.match(/\.(mp4|webm|mov|ogg)$/i);
  return [{ url: mediaUrl, type: isVideo ? 'video' : 'image' }];
}

interface WishMediaGalleryProps {
  mediaUrl?: string | null;
  mediaType?: string | null;
  className?: string;
  maxHeight?: string;
  autoPlayInterval?: number; // ms, default 4000
}

export function WishMediaGallery({
  mediaUrl,
  mediaType,
  className = '',
  maxHeight = 'max-h-[500px]',
  autoPlayInterval = 4200,
}: WishMediaGalleryProps) {
  const items = parseWishMedia(mediaUrl, mediaType);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  if (items.length === 0) return null;

  const current = items[activeIndex] || items[0];
  const slideDuration = current?.type === 'video' ? 7000 : autoPlayInterval;

  // Auto-advance loop when multiple items and playing and not hovered
  useEffect(() => {
    if (items.length <= 1 || !isPlaying || isHovered) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, slideDuration);

    return () => clearInterval(timer);
  }, [items.length, isPlaying, isHovered, activeIndex, slideDuration]);

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsPlaying((prev) => !prev);
  };

  return (
    <>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative border border-[#ff4d8d]/30 bg-[#08050a] overflow-hidden group select-none shadow-[0_0_35px_rgba(248,79,156,0.18)] ${className}`}
      >
        {/* ===== EFX MONTAGE AMBIENT CORNER FLARES ===== */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-[#ff4d8d]/20 to-transparent pointer-events-none z-10 blur-xl" />
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-[#ff2a85]/20 to-transparent pointer-events-none z-10 blur-xl" />

        {/* Story-style Progress Bars on top if multiple items */}
        {items.length > 1 && (
          <div className="absolute top-3 left-3 right-3 flex items-center gap-1.5 z-20 pointer-events-none">
            {items.map((_, idx) => (
              <div key={idx} className="flex-1 h-1 bg-black/60 backdrop-blur-sm overflow-hidden rounded-full border border-white/10">
                {idx === activeIndex && isPlaying && !isHovered ? (
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#ff5376] via-[#f84f9c] to-[#ffa07a] shadow-[0_0_8px_#ff4d8d]"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: slideDuration / 1000, ease: 'linear' }}
                  />
                ) : (
                  <div
                    className={`h-full transition-all ${
                      idx < activeIndex
                        ? 'bg-[#ff4d8d] w-full'
                        : idx === activeIndex
                        ? 'bg-[#ff4d8d] w-full'
                        : 'w-0'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* EFX Montage HUD Badges */}
        <div className="absolute top-6 left-3.5 right-3.5 flex items-center justify-between z-20 pointer-events-none">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/75 backdrop-blur-md border border-[#ff4d8d]/30 rounded-full text-[9px] font-mono tracking-widest text-[#fbf8f5] uppercase shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d8d] animate-ping" />
            <span className="text-[#ff6b8b] font-bold">MONTAGE</span>
            <span className="text-[#b5a5b5]">
              {String(activeIndex + 1).padStart(2, '0')}/{String(items.length).padStart(2, '0')}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setLightboxOpen(true);
            }}
            className="p-1.5 bg-black/75 hover:bg-black backdrop-blur-md border border-white/20 hover:border-[#ff4d8d] rounded-full text-white/80 hover:text-white transition-all pointer-events-auto opacity-0 group-hover:opacity-100 shadow-lg"
            title="Open EFX Cinema Lightbox"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Media Canvas with Cinematic Ken Burns Montage Pan & Zoom */}
        <div className={`relative w-full flex items-center justify-center bg-black ${maxHeight} overflow-hidden min-h-[280px]`}>
          {/* Filmic Vignette & Scanline Overlay */}
          <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_70px_rgba(0,0,0,0.85)]" />
          <div
            className="absolute inset-0 pointer-events-none z-10 opacity-[0.15]"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)',
            }}
          />

          <AnimatePresence mode="wait">
            {current.type === 'video' ? (
              <motion.div
                key={`video-${current.url}-${activeIndex}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full flex items-center justify-center"
              >
                <video
                  ref={videoRef}
                  src={current.url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  onEnded={() => {
                    if (items.length > 1) {
                      setActiveIndex((prev) => (prev + 1) % items.length);
                    }
                  }}
                  className={`w-full ${maxHeight} object-contain`}
                />
              </motion.div>
            ) : (
              <motion.div
                key={`img-${current.url}-${activeIndex}`}
                initial={{ opacity: 0, scale: activeIndex % 2 === 0 ? 1 : 1.08 }}
                animate={{
                  opacity: 1,
                  scale: activeIndex % 2 === 0 ? 1.08 : 1,
                }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{
                  opacity: { duration: 0.45 },
                  scale: { duration: slideDuration / 1000 + 0.5, ease: 'easeOut' },
                }}
                className="w-full h-full flex items-center justify-center overflow-hidden"
              >
                <img
                  src={current.url}
                  alt="Wish keepsake montage"
                  className={`w-full ${maxHeight} object-contain filter contrast-[1.06] saturate-[1.12] brightness-[1.02] drop-shadow-2xl`}
                  loading="lazy"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls Overlay */}
        {items.length > 1 && (
          <>
            {/* Previous / Next buttons */}
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/80 hover:bg-[#ff4d8d] text-[#fbf8f5] hover:text-white border border-[#26182a] hover:border-[#ff4d8d] rounded-full transition-all opacity-0 group-hover:opacity-100 sm:opacity-75 hover:opacity-100 z-20 shadow-xl"
              aria-label="Previous media"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/80 hover:bg-[#ff4d8d] text-[#fbf8f5] hover:text-white border border-[#26182a] hover:border-[#ff4d8d] rounded-full transition-all opacity-0 group-hover:opacity-100 sm:opacity-75 hover:opacity-100 z-20 shadow-xl"
              aria-label="Next media"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Bottom Indicators & Play/Pause Dock */}
            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-between px-4 z-20 pointer-events-none">
              <button
                onClick={togglePlay}
                className="p-1.5 bg-black/80 backdrop-blur-md border border-[#26182a] rounded-full text-[#b5a5b5] hover:text-[#ff4d8d] transition-colors pointer-events-auto shadow-md"
                title={isPlaying ? 'Pause montage' : 'Play montage'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              </button>

              <div className="flex items-center gap-1.5 px-3 py-1 bg-black/80 backdrop-blur-md border border-[#26182a] rounded-full pointer-events-auto shadow-md">
                {items.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setActiveIndex(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === activeIndex
                        ? 'bg-gradient-to-r from-[#ff5376] to-[#f84f9c] w-5 shadow-[0_0_8px_#ff4d8d]'
                        : 'bg-white/40 hover:bg-white/70 w-1.5'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ===== EFX CINEMA FULLSCREEN LIGHTBOX ===== */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-between p-4 sm:p-8 select-none"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Top Lightbox Header */}
            <div className="w-full max-w-5xl flex items-center justify-between z-10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ff4d8d] animate-pulse" />
                <span className="font-serif font-black tracking-widest uppercase text-sm sm:text-base text-transparent bg-clip-text bg-gradient-to-r from-[#fbf8f5] via-[#ff6b8b] to-[#f84f9c]">
                  ONEWISHES EFX CINEMA
                </span>
                <span className="text-xs font-mono text-[#b5a5b5] ml-2">
                  {activeIndex + 1} of {items.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="p-2 bg-white/10 hover:bg-red-600 text-white rounded-full transition-colors"
                title="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Centered Media Content */}
            <div className="relative w-full max-w-5xl flex-1 flex items-center justify-center p-2" onClick={(e) => e.stopPropagation()}>
              {current.type === 'video' ? (
                <video
                  src={current.url}
                  autoPlay
                  loop
                  controls
                  className="max-h-[82vh] max-w-full rounded-sm shadow-2xl border border-white/10"
                />
              ) : (
                <img
                  src={current.url}
                  alt="Wish media fullscreen"
                  className="max-h-[82vh] max-w-full object-contain rounded-sm shadow-[0_0_60px_rgba(248,79,156,0.3)] filter contrast-[1.08] saturate-[1.12]"
                />
              )}

              {/* Prev / Next Arrows */}
              {items.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-black/80 hover:bg-[#ff4d8d] text-white border border-white/20 rounded-full transition-all shadow-2xl"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-black/80 hover:bg-[#ff4d8d] text-white border border-white/20 rounded-full transition-all shadow-2xl"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Lightbox Film Strip Thumbnails */}
            {items.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto py-2 px-4 z-10 bg-black/60 border border-white/10 rounded-full max-w-md mx-auto" onClick={(e) => e.stopPropagation()}>
                {items.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`relative w-12 h-12 rounded-sm overflow-hidden shrink-0 border-2 transition-all ${
                      idx === activeIndex
                        ? 'border-[#ff4d8d] scale-105 shadow-[0_0_12px_#ff4d8d]'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    {item.type === 'video' ? (
                      <div className="w-full h-full bg-[#1a141d] flex items-center justify-center text-[#ff4d8d] text-[8px] font-bold">
                        VID
                      </div>
                    ) : (
                      <img src={item.url} alt="thumbnail" className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
