'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface JarLoaderProps {
  text?: string;
  subtext?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function JarLoader({
  text = 'ONEWISHES ARCHIVE',
  subtext = 'Developing archival missive in amber developer bath...',
  fullScreen = false,
  size = 'md',
}: JarLoaderProps) {
  const sizeMap = {
    sm: { sealSize: 64, reelSize: 96, textClass: 'text-xs', subClass: 'text-[10px]' },
    md: { sealSize: 84, reelSize: 130, textClass: 'text-sm sm:text-base', subClass: 'text-xs' },
    lg: { sealSize: 108, reelSize: 168, textClass: 'text-base sm:text-lg', subClass: 'text-xs sm:text-sm' },
  };

  const { sealSize, reelSize, textClass, subClass } = sizeMap[size];

  const content = (
    <div className="flex flex-col items-center justify-center text-center select-none py-8 px-4">
      {/* ===== VINTAGE WAX SEAL & 35MM REEL STAGE ===== */}
      <div className="relative flex items-center justify-center mb-6">
        
        {/* 1. Amber Darkroom Glow */}
        <motion.div
          animate={{
            scale: [0.92, 1.18, 0.92],
            opacity: [0.2, 0.45, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-[#7d1d23] via-[#c5a059] to-[#8c6228] blur-2xl pointer-events-none"
        />

        {/* 2. Rotating 35mm Brass Film Spool */}
        <div 
          style={{ width: reelSize, height: reelSize }}
          className="rounded-full border-2 border-dashed border-[#c5a059]/40 animate-reel-spin flex items-center justify-center p-2 shadow-[0_0_25px_rgba(197,160,89,0.15)]"
        >
          <div className="w-full h-full rounded-full border border-[#8c6228]/50 animate-reel-spin-reverse flex items-center justify-center">
            {/* Reel Spoke Lines */}
            <div className="absolute w-full h-[1px] bg-[#c5a059]/25" />
            <div className="absolute w-[1px] h-full bg-[#c5a059]/25" />
            <div className="absolute w-full h-[1px] bg-[#c5a059]/25 rotate-45" />
            <div className="absolute w-full h-[1px] bg-[#c5a059]/25 -rotate-45" />
          </div>
        </div>

        {/* 3. Stamping Carmine Wax Seal in Center */}
        <motion.div
          animate={{
            scale: [0.96, 1.04, 0.96],
            filter: ['brightness(0.95)', 'brightness(1.15)', 'brightness(0.95)'],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ width: sealSize, height: sealSize }}
          className="absolute rounded-full wax-seal-emboss flex flex-col items-center justify-center p-2 shadow-2xl z-10 border border-[#a8272f]/60"
        >
          <div className="w-full h-full rounded-full border border-dashed border-[#faecc8]/40 flex flex-col items-center justify-center text-center">
            <span className="text-[#faecc8] font-garamond font-black text-xl sm:text-2xl italic leading-none drop-shadow">
              W
            </span>
            <span className="text-[7px] font-courier text-[#faecc8]/90 tracking-widest uppercase mt-0.5">
              1890
            </span>
          </div>
        </motion.div>
      </div>

      {/* ===== VINTAGE TYPEWRITER STATUS PLACARD ===== */}
      <div className="vintage-telegram-paper rounded px-6 py-3.5 max-w-sm border border-[#b08a44]/60 shadow-lg relative overflow-hidden">
        {/* Subtle corner notches */}
        <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#8c6228]" />
        <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-[#8c6228]" />
        <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-[#8c6228]" />
        <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[#8c6228]" />

        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7d1d23] animate-pulse" />
          <h4 className={`font-courier font-bold tracking-[0.2em] uppercase text-[#231916] ${textClass}`}>
            {text}
          </h4>
        </div>

        <p className={`font-garamond italic text-[#4a3525] leading-relaxed ${subClass}`}>
          {subtext}
          <span className="inline-block w-1.5 h-3 ml-1 bg-[#7d1d23] animate-typewriter-caret align-middle" />
        </p>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0b0908]/95 backdrop-blur-md flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return content;
}
