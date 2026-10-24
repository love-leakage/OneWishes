'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

export function parseWishMedia(mediaUrl?: string | null, mediaType?: string | null): MediaItem[] {
  if (!mediaUrl) return [];

  // If stored as JSON array string
  if (mediaUrl.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(mediaUrl);
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
  autoPlayInterval?: number; // ms, default 3800
}

export function WishMediaGallery({
  mediaUrl,
  mediaType,
  className = '',
  maxHeight = 'max-h-[480px]',
  autoPlayInterval = 3800,
}: WishMediaGalleryProps) {
  const items = parseWishMedia(mediaUrl, mediaType);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  if (items.length === 0) return null;

  const current = items[activeIndex] || items[0];
  const slideDuration = current?.type === 'video' ? 6500 : autoPlayInterval;

  // Auto-advance loop when multiple items and playing and not hovered
  useEffect(() => {
    if (items.length <= 1 || !isPlaying || isHovered) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, slideDuration);

    return () => clearInterval(timer);
  }, [items.length, isPlaying, isHovered, activeIndex, slideDuration]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsPlaying((prev) => !prev);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative border border-[#2a3d35] bg-[#121b18] overflow-hidden group select-none ${className}`}
    >
      {/* Story-style Progress Bars on top if multiple items */}
      {items.length > 1 && (
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center gap-1.5 z-20 pointer-events-none">
          {items.map((_, idx) => (
            <div
              key={idx}
              className="flex-1 h-1 bg-black/60 backdrop-blur-sm rounded-full overflow-hidden"
            >
              {idx < activeIndex ? (
                <div className="h-full w-full bg-[#e4c067]" />
              ) : idx === activeIndex ? (
                <motion.div
                  key={`progress-${activeIndex}-${isPlaying}-${isHovered}`}
                  initial={{ width: '0%' }}
                  animate={{ width: isPlaying && !isHovered ? '100%' : '0%' }}
                  transition={{
                    duration: slideDuration / 1000,
                    ease: 'linear',
                  }}
                  className="h-full bg-gradient-to-r from-[#e4c067] to-[#f3eee3]"
                />
              ) : (
                <div className="h-full w-0 bg-transparent" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Media Canvas with Animated Transitions & Ken Burns Motion */}
      <div className={`relative w-full flex items-center justify-center bg-black/40 ${maxHeight} overflow-hidden min-h-[260px]`}>
        <AnimatePresence mode="wait">
          {current.type === 'video' ? (
            <motion.div
              key={`video-${current.url}-${activeIndex}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.5 }}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full flex items-center justify-center overflow-hidden"
            >
              <img
                src={current.url}
                alt="Wish media"
                className={`w-full ${maxHeight} object-contain animate-kenburns`}
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
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-[#141f1b]/80 hover:bg-[#141f1b] text-[#f3eee3] border border-[#2a3d35] rounded-full transition-all opacity-0 group-hover:opacity-100 sm:opacity-70 hover:opacity-100 z-20 shadow-lg"
            aria-label="Previous media"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[#141f1b]/80 hover:bg-[#141f1b] text-[#f3eee3] border border-[#2a3d35] rounded-full transition-all opacity-0 group-hover:opacity-100 sm:opacity-70 hover:opacity-100 z-20 shadow-lg"
            aria-label="Next media"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Bottom Indicators & Play/Pause */}
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-between px-4 z-20 pointer-events-none">
            <button
              onClick={togglePlay}
              className="p-1.5 bg-[#141f1b]/85 backdrop-blur-sm border border-[#2a3d35] rounded-full text-[#a6b6ad] hover:text-[#e4c067] transition-colors pointer-events-auto shadow-md"
              title={isPlaying ? 'Pause auto-slide' : 'Play auto-slide'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#141f1b]/85 backdrop-blur-sm border border-[#2a3d35] rounded-full pointer-events-auto shadow-md">
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
                      ? 'bg-[#e4c067] w-5'
                      : 'bg-white/40 hover:bg-white/70 w-1.5'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
              <span className="text-[10px] text-[#a6b6ad] font-mono ml-1.5 font-bold">
                {activeIndex + 1}/{items.length}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
