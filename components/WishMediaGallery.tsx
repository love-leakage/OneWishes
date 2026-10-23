'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Maximize2 } from 'lucide-react';

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
          type: (typeof item === 'object' && item.type) ? item.type : (item.url?.match(/\.(mp4|webm|mov|ogg)$/i) ? 'video' : 'image'),
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
}

export function WishMediaGallery({
  mediaUrl,
  mediaType,
  className = '',
  maxHeight = 'max-h-[480px]',
}: WishMediaGalleryProps) {
  const items = parseWishMedia(mediaUrl, mediaType);
  const [activeIndex, setActiveIndex] = useState(0);

  if (items.length === 0) return null;

  const current = items[activeIndex] || items[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className={`relative border border-[#2a3d35] bg-[#121b18] overflow-hidden group select-none ${className}`}>
      {/* Current Media Element */}
      <div className={`w-full flex items-center justify-center bg-black/40 ${maxHeight} overflow-hidden min-h-[240px]`}>
        {current.type === 'video' ? (
          <video
            key={current.url}
            src={current.url}
            autoPlay
            loop
            muted
            playsInline
            controls
            className={`w-full ${maxHeight} object-contain`}
          />
        ) : (
          <img
            key={current.url}
            src={current.url}
            alt="Wish media"
            className={`w-full ${maxHeight} object-contain`}
          />
        )}
      </div>

      {/* Navigation Arrows if more than 1 item */}
      {items.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-[#141f1b]/80 hover:bg-[#141f1b] text-[#f3eee3] border border-[#2a3d35] rounded-full transition-all opacity-80 hover:opacity-100 z-10 shadow-lg"
            aria-label="Previous media"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[#141f1b]/80 hover:bg-[#141f1b] text-[#f3eee3] border border-[#2a3d35] rounded-full transition-all opacity-80 hover:opacity-100 z-10 shadow-lg"
            aria-label="Next media"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator & Counter */}
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2 z-10 pointer-events-none">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#141f1b]/80 backdrop-blur-sm border border-[#2a3d35] rounded-full pointer-events-auto">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setActiveIndex(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === activeIndex
                      ? 'bg-[#e4c067] w-4'
                      : 'bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
              <span className="text-[10px] text-[#a6b6ad] font-mono ml-1 font-bold">
                {activeIndex + 1}/{items.length}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
