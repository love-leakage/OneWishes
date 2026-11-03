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
    sm: { emblemW: 96, container: 'py-6', textClass: 'text-sm' },
    md: { emblemW: 140, container: 'py-12', textClass: 'text-lg sm:text-xl' },
    lg: { emblemW: 180, container: 'py-16', textClass: 'text-xl sm:text-2xl' },
  };

  const { emblemW, container: containerPadding, textClass } = sizeMap[size];

  const content = (
    <div className={`flex flex-col items-center justify-center text-center select-none ${containerPadding}`}>
      {/* ===== MOTION GRAPHICS INFINITY EMBLEM STAGE ===== */}
      <div className="relative flex items-center justify-center">
        {/* 1. Deep Volumetric Ambient Glows */}
        <motion.div
          animate={{
            scale: [0.9, 1.25, 0.9],
            opacity: [0.25, 0.55, 0.25],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-[#ff5376] via-[#f84f9c] to-[#ff2a85] blur-3xl pointer-events-none"
        />

        {/* 2. Secondary High-Frequency Core Glow */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute w-32 h-32 rounded-full bg-[#f84f9c] blur-2xl pointer-events-none"
        />

        {/* 3. Orbiting Infinity Stardust Tracers */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="absolute w-44 h-44 rounded-full pointer-events-none"
        >
          <motion.span
            animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gradient-to-r from-[#ffa07a] to-[#ff4d8d] shadow-[0_0_12px_#ff4d8d]"
          />
          <motion.span
            animate={{ scale: [1.2, 0.6, 1.2], opacity: [0.8, 0.3, 0.8] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute bottom-2 right-4 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]"
          />
        </motion.div>

        {/* 4. Counter-Orbiting Laser Comet */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
          className="absolute w-52 h-52 rounded-full pointer-events-none"
        >
          <span className="absolute top-6 right-8 w-2 h-2 rounded-full bg-[#f84f9c] shadow-[0_0_16px_#f84f9c]" />
          <span className="absolute bottom-6 left-8 w-1 h-1 rounded-full bg-[#ffa07a] shadow-[0_0_8px_#ffa07a]" />
        </motion.div>

        {/* 5. The Master Logo Emblem with Kinetic Floating & Pulse */}
        <div className="relative z-10 flex items-center justify-center">
          <motion.div
            animate={{
              y: [-4, 4, -4],
              scale: [0.98, 1.02, 0.98],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative"
          >
            <img
              src="/logo-tight.png"
              alt="OneWishes Infinity"
              style={{ width: emblemW, height: 'auto' }}
              className="object-contain drop-shadow-[0_0_24px_rgba(248,79,156,0.65)] select-none pointer-events-none"
            />

            {/* Holographic Vertical Sweep Beam */}
            <motion.div
              animate={{
                top: ['-40%', '140%'],
                opacity: [0, 0.85, 0],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeInOut',
                repeatDelay: 0.6,
              }}
              className="absolute left-0 right-0 h-6 bg-gradient-to-b from-transparent via-white/30 to-transparent pointer-events-none blur-[1px]"
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
          className={`font-serif font-black tracking-[0.32em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#fbf8f5] via-[#ff6b8b] to-[#f84f9c] ${textClass} drop-shadow-[0_0_16px_rgba(248,79,156,0.4)]`}
        >
          {text}
        </motion.div>

        {/* Subtext */}
        {subtext && (
          <motion.p
            animate={{ opacity: [0.6, 0.95, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-[11px] sm:text-xs font-mono tracking-widest uppercase text-[#b5a5b5] max-w-xs mx-auto"
          >
            {subtext}
          </motion.p>
        )}

        {/* Laser Scanner Progress Bar */}
        <div className="w-40 sm:w-48 h-[2px] bg-[#1a141d] mx-auto overflow-hidden relative mt-4 rounded-full border border-[#2d1f2e]">
          <motion.div
            className="absolute top-0 bottom-0 w-16 bg-gradient-to-r from-transparent via-[#ff4d8d] to-transparent shadow-[0_0_10px_#ff4d8d]"
            animate={{
              x: [-64, 192],
            }}
            transition={{
              duration: 1.4,
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
