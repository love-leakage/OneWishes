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
  subtext = 'Sealing wish into the keepsake jar...',
  fullScreen = false,
  size = 'md',
}: JarLoaderProps) {
  const sizeMap = {
    sm: { width: 110, height: 130, container: 'py-6' },
    md: { width: 140, height: 165, container: 'py-12' },
    lg: { width: 175, height: 205, container: 'py-16' },
  };

  const { width: jarW, height: jarH, container: containerPadding } = sizeMap[size];

  const content = (
    <div className={`flex flex-col items-center justify-center text-center select-none ${containerPadding}`}>
      {/* Keepsake Glass Jar with Dropping Wish Letter */}
      <div className="relative flex items-center justify-center">
        {/* Ambient Warm Golden Glow behind the Jar */}
        <motion.div
          animate={{
            scale: [0.9, 1.2, 0.9],
            opacity: [0.18, 0.4, 0.18],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full bg-[#e4c067] blur-3xl pointer-events-none"
        />

        {/* Floating Celestial Stars around Jar */}
        <motion.span
          animate={{
            y: [-4, 4, -4],
            scale: [0.7, 1.2, 0.7],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-3 -right-3 text-[#e4c067] font-serif text-sm select-none pointer-events-none drop-shadow-[0_0_8px_rgba(228,192,103,0.8)]"
        >
          ✦
        </motion.span>

        <motion.span
          animate={{
            y: [3, -3, 3],
            scale: [1, 0.6, 1],
            opacity: [0.7, 0.2, 0.7],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.4,
          }}
          className="absolute top-1/2 -left-4 text-[#e4c067]/80 font-serif text-xs select-none pointer-events-none"
        >
          ✦
        </motion.span>

        <motion.span
          animate={{
            scale: [0.6, 1.1, 0.6],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 2.1,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.9,
          }}
          className="absolute -bottom-2 -right-2 text-[#e4c067]/60 font-serif text-[10px] select-none pointer-events-none"
        >
          ✦
        </motion.span>

        {/* SVG Canvas: Jar + Wish Letter descending inside */}
        <svg
          width={jarW}
          height={jarH}
          viewBox="0 0 140 165"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)] overflow-visible"
        >
          <defs>
            {/* Golden Glass Gradient */}
            <linearGradient id="jarGlassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e4c067" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#f5f2eb" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#e4c067" stopOpacity="0.35" />
            </linearGradient>

            {/* Letter Parchment Gradient */}
            <linearGradient id="parchmentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbf9f4" />
              <stop offset="100%" stopColor="#e8dfce" />
            </linearGradient>

            {/* Gold Wax Seal Gradient */}
            <linearGradient id="waxSealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f7d984" />
              <stop offset="100%" stopColor="#cfa138" />
            </linearGradient>

            {/* Jar Base Radial Light */}
            <radialGradient id="jarBaseGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e4c067" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#e4c067" stopOpacity="0" />
            </radialGradient>

            {/* Mask for inside of the jar */}
            <clipPath id="jarInsideClip">
              <rect x="36" y="50" width="68" height="92" rx="18" />
            </clipPath>
          </defs>

          {/* Jar Base Ground Shadow */}
          <ellipse cx="70" cy="154" rx="42" ry="6" fill="#000000" fillOpacity="0.7" />

          {/* Inside the Jar: Radiant Golden Ambient Layer */}
          <g clipPath="url(#jarInsideClip)">
            {/* Glowing bottom sediment / stardust layer */}
            <motion.ellipse
              cx="70"
              cy="134"
              rx="28"
              ry="10"
              fill="url(#jarBaseGlow)"
              animate={{
                scale: [0.9, 1.2, 0.9],
                opacity: [0.4, 0.85, 0.4],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ transformOrigin: '70px 134px' }}
            />

            {/* Ambient Sparkle Dots resting inside the jar */}
            <motion.circle
              cx="58"
              cy="130"
              r="2"
              fill="#e4c067"
              animate={{
                y: [0, -6, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.circle
              cx="82"
              cy="128"
              r="1.5"
              fill="#f5f2eb"
              animate={{
                y: [0, -8, 0],
                opacity: [0.3, 0.9, 0.3],
              }}
              transition={{
                duration: 2.7,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
            />
          </g>

          {/* ======================================================== */}
          {/* THE WISH LETTER: ANIMATED DESCENDING INTO THE JAR MOUTH */}
          {/* ======================================================== */}
          <motion.g
            animate={{
              y: [-38, 0, 48, 86, 92, 92],
              x: [0, -1, 1, 0, 0, 0],
              rotate: [-7, 5, -3, 2, 0, 0],
              scale: [0.85, 0.92, 0.9, 0.86, 0.84, 0],
              opacity: [0, 1, 1, 1, 0.9, 0],
            }}
            transition={{
              duration: 3.4,
              repeat: Infinity,
              ease: [0.4, 0, 0.2, 1],
              times: [0, 0.18, 0.48, 0.74, 0.88, 1],
            }}
            style={{ transformOrigin: '70px 30px' }}
          >
            {/* Letter Envelope Body */}
            <rect
              x="52"
              y="12"
              width="36"
              height="26"
              rx="3"
              fill="url(#parchmentGrad)"
              stroke="#cfa138"
              strokeWidth="1.2"
              className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
            />

            {/* Envelope Back Flap Folds (Classic letter crease lines) */}
            <path
              d="M 53 13 L 70 25 L 87 13"
              stroke="#cfa138"
              strokeWidth="1.2"
              strokeLinejoin="round"
              fill="none"
              opacity="0.85"
            />
            <path
              d="M 53 37 L 64 26"
              stroke="#cfa138"
              strokeWidth="1"
              strokeOpacity="0.4"
            />
            <path
              d="M 87 37 L 76 26"
              stroke="#cfa138"
              strokeWidth="1"
              strokeOpacity="0.4"
            />

            {/* Golden Wax Seal with Celestial Star ✦ in center */}
            <circle
              cx="70"
              cy="25"
              r="4.5"
              fill="url(#waxSealGrad)"
              stroke="#96721d"
              strokeWidth="0.8"
              className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
            />
            <path
              d="M 70 22.5 Q 70 25 72.5 25 Q 70 25 70 27.5 Q 70 25 67.5 25 Q 70 25 70 22.5 Z"
              fill="#ffffff"
            />
          </motion.g>

          {/* Moment of Landing Pulse: Golden stardust burst at the bottom */}
          <motion.g
            animate={{
              scale: [0, 0, 1.4, 1.8, 0],
              opacity: [0, 0, 0.9, 0.4, 0],
            }}
            transition={{
              duration: 3.4,
              repeat: Infinity,
              ease: 'easeOut',
              times: [0, 0.72, 0.78, 0.88, 1],
            }}
            style={{ transformOrigin: '70px 126px' }}
          >
            <circle cx="70" cy="126" r="14" fill="none" stroke="#e4c067" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="70" cy="126" r="22" fill="none" stroke="#f5f2eb" strokeWidth="0.8" opacity="0.6" />
          </motion.g>

          {/* ======================================================== */}
          {/* GLASS JAR BODY & ANATOMY (Crisp Luxury Hairline SVG) */}
          {/* ======================================================== */}

          {/* Jar Outer Glass Wall */}
          <rect
            x="36"
            y="50"
            width="68"
            height="92"
            rx="18"
            stroke="url(#jarGlassGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Secondary Hairline Inner Reflection */}
          <rect
            x="39"
            y="53"
            width="62"
            height="86"
            rx="15"
            stroke="#ffffff"
            strokeWidth="0.8"
            strokeOpacity="0.12"
            fill="none"
          />

          {/* Jar Neck / Shoulders */}
          <path
            d="M 46 50 L 46 36 Q 46 32 50 32 L 90 32 Q 94 32 94 36 L 94 50"
            stroke="url(#jarGlassGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Jar Cork / Collar Lip */}
          <rect
            x="42"
            y="25"
            width="56"
            height="8"
            rx="4"
            fill="#e4c067"
            stroke="#cfa138"
            strokeWidth="1"
          />

          {/* Elegant Cork Collar Highlight */}
          <rect
            x="45"
            y="27"
            width="50"
            height="2"
            rx="1"
            fill="#ffffff"
            fillOpacity="0.4"
          />

          {/* Curved Glass Highlight Reflections */}
          <path
            d="M 97 64 C 99 74 99 106 97 122"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.45"
          />
          <path
            d="M 43 64 C 41 74 41 106 43 122"
            stroke="#e4c067"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeOpacity="0.3"
          />
          <path
            d="M 52 136 C 60 139 80 139 88 136"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeOpacity="0.25"
          />
        </svg>
      </div>

      {/* Typography & Golden Progress Indicator */}
      <div className="mt-8 space-y-2.5">
        <motion.div
          animate={{ opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="font-serif text-lg sm:text-xl font-bold tracking-[0.28em] uppercase text-[#f5f2eb]"
        >
          {text}
        </motion.div>

        {subtext && (
          <p className="text-xs font-mono tracking-widest uppercase text-[#a1b0a8] max-w-xs mx-auto">
            {subtext}
          </p>
        )}

        {/* Minimalist Champagne Gold Scanning Hairline */}
        <div className="w-36 h-[2px] bg-[#1a1d1b] mx-auto overflow-hidden relative mt-4 rounded-full">
          <motion.div
            className="absolute top-0 bottom-0 w-14 bg-gradient-to-r from-transparent via-[#e4c067] to-transparent"
            animate={{
              x: [-56, 144],
            }}
            transition={{
              duration: 1.6,
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
      <div className="fixed inset-0 z-[999] bg-[#050505]/95 backdrop-blur-md flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return content;
}
