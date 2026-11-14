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
  text = 'ONEWISHES',
  subtext = 'Aligning memories across infinity...',
  fullScreen = false,
  size = 'md',
}: JarLoaderProps) {
  const sizeMap = {
    sm: { emblemW: 110, svgW: 160, svgH: 90, container: 'py-6', textClass: 'text-sm' },
    md: { emblemW: 160, svgW: 220, svgH: 120, container: 'py-12', textClass: 'text-lg sm:text-xl' },
    lg: { emblemW: 210, svgW: 280, svgH: 155, container: 'py-16', textClass: 'text-xl sm:text-2xl' },
  };

  const { emblemW, svgW, svgH, container: containerPadding, textClass } = sizeMap[size];

  const content = (
    <div className={`flex flex-col items-center justify-center text-center select-none ${containerPadding}`}>
      {/* ===== MOTION GRAPHICS INFINITY EMBLEM STAGE ===== */}
      <div className="relative flex items-center justify-center">
        {/* 1. Deep Volumetric Ambient Glows */}
        <motion.div
          animate={{
            scale: [0.92, 1.3, 0.92],
            opacity: [0.35, 0.7, 0.35],
          }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-[#ff5376] via-[#f84f9c] to-[#ff2a85] blur-3xl pointer-events-none"
        />

        {/* 2. Secondary High-Frequency Core Glow */}
        <motion.div
          animate={{
            scale: [1, 1.22, 1],
            opacity: [0.4, 0.85, 0.4],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute w-36 h-36 rounded-full bg-[#f84f9c] blur-2xl pointer-events-none"
        />

        {/* 3. Orbiting Infinity Stardust Tracers */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'linear' }}
          className="absolute w-52 h-52 rounded-full pointer-events-none"
        >
          <motion.span
            animate={{ scale: [0.8, 1.5, 0.8], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#ffa07a] to-[#ff4d8d] shadow-[0_0_14px_#ff4d8d]"
          />
          <motion.span
            animate={{ scale: [1.3, 0.7, 1.3], opacity: [0.9, 0.4, 0.9] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            className="absolute bottom-2 right-4 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#ffffff]"
          />
        </motion.div>

        {/* 4. Counter-Orbiting Laser Comet */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute w-60 h-60 rounded-full pointer-events-none"
        >
          <span className="absolute top-6 right-8 w-2 h-2 rounded-full bg-[#f84f9c] shadow-[0_0_18px_#f84f9c]" />
          <span className="absolute bottom-6 left-8 w-1.5 h-1.5 rounded-full bg-[#ffa07a] shadow-[0_0_10px_#ffa07a]" />
        </motion.div>

        {/* 5. Animated Vector Infinity Laser Loop & Core */}
        <div className="relative z-10 flex items-center justify-center">
          {/* Kinetic Master Infinity Logo Emblem */}
          <motion.div
            animate={{
              y: [-5, 5, -5],
              scale: [0.98, 1.03, 0.98],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative"
          >
            {/* SVG Laser Flow around the figure-8 curve */}
            <svg
              viewBox="0 0 240 130"
              width={svgW}
              height={svgH}
              className="absolute -top-3 -left-3 pointer-events-none overflow-visible"
            >
              <defs>
                <linearGradient id="neonLaserGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff4d8d" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#f84f9c" stopOpacity="1" />
                  <stop offset="100%" stopColor="#ffa07a" stopOpacity="0.8" />
                </linearGradient>
                <filter id="laserGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Glowing Infinity Track */}
              <motion.path
                d="M 120,65 C 90,15 30,15 30,65 C 30,115 90,115 120,65 C 150,15 210,15 210,65 C 210,115 150,115 120,65 Z"
                fill="none"
                stroke="url(#neonLaserGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                filter="url(#laserGlow)"
                strokeDasharray="40 180"
                animate={{
                  strokeDashoffset: [0, -440],
                }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />

              {/* Secondary Reverse Counter-Laser */}
              <motion.path
                d="M 120,65 C 90,15 30,15 30,65 C 30,115 90,115 120,65 C 150,15 210,15 210,65 C 210,115 150,115 120,65 Z"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeDasharray="15 205"
                animate={{
                  strokeDashoffset: [220, -220],
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            </svg>

            {/* High-Resolution Transparent Infinity Logo */}
            <img
              src="/logo-tight.png"
              alt="OneWishes Infinity"
              style={{ width: emblemW, height: 'auto' }}
              className="relative z-10 object-contain drop-shadow-[0_0_28px_rgba(248,79,156,0.75)] select-none pointer-events-none"
            />

            {/* Holographic Vertical Sweep Beam */}
            <motion.div
              animate={{
                top: ['-40%', '140%'],
                opacity: [0, 0.9, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                repeatDelay: 0.5,
              }}
              className="absolute left-0 right-0 h-6 bg-gradient-to-b from-transparent via-white/35 to-transparent pointer-events-none blur-[1px] z-20"
            />
          </motion.div>
        </div>
      </div>

      {/* ===== KINETIC TYPOGRAPHY & LASER PROGRESS ===== */}
      <div className="mt-8 space-y-3">
        {/* Kinetic Title with Letter-Spacing Motion */}
        <motion.div
          animate={{
            letterSpacing: ['0.28em', '0.42em', '0.28em'],
            opacity: [0.9, 1, 0.9],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`font-serif font-black tracking-[0.32em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#fbf8f5] via-[#ff6b8b] to-[#f84f9c] ${textClass} drop-shadow-[0_0_18px_rgba(248,79,156,0.45)]`}
        >
          {text}
        </motion.div>

        {/* Subtext */}
        {subtext && (
          <motion.p
            animate={{ opacity: [0.65, 1, 0.65] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="text-[11px] sm:text-xs font-mono tracking-widest uppercase text-[#b5a5b5] max-w-xs mx-auto"
          >
            {subtext}
          </motion.p>
        )}

        {/* Laser Scanner Progress Bar */}
        <div className="w-40 sm:w-48 h-[2px] bg-[#1a141d] mx-auto overflow-hidden relative mt-4 rounded-full border border-[#2d1f2e]">
          <motion.div
            className="absolute top-0 bottom-0 w-16 bg-gradient-to-r from-transparent via-[#ff4d8d] to-transparent shadow-[0_0_12px_#ff4d8d]"
            animate={{
              x: [-64, 192],
            }}
            transition={{
              duration: 1.3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[999] bg-[#050505]/95 backdrop-blur-xl flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return content;
}
