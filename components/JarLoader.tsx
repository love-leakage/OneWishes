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
  subtext = 'Gathering wishes...',
  fullScreen = false,
  size = 'md',
}: JarLoaderProps) {
  const sizeMap = {
    sm: { jar: 64, container: 'py-8' },
    md: { jar: 96, container: 'py-16' },
    lg: { jar: 130, container: 'py-24' },
  };

  const { jar: jarSize, container: containerPadding } = sizeMap[size];

  const content = (
    <div className={`flex flex-col items-center justify-center text-center select-none ${containerPadding}`}>
      {/* Animated Monochrome Wish Jar */}
      <div className="relative flex items-center justify-center">
        {/* Ambient Glow */}
        <motion.div
          animate={{
            scale: [0.95, 1.15, 0.95],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full bg-white blur-2xl pointer-events-none"
        />

        {/* Orbiting Sparkles */}
        <motion.span
          animate={{
            scale: [0.6, 1.3, 0.6],
            opacity: [0.2, 1, 0.2],
            rotate: [0, 45, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-3 -right-2 text-white font-serif text-base select-none pointer-events-none"
        >
          ✦
        </motion.span>

        <motion.span
          animate={{
            scale: [1.2, 0.6, 1.2],
            opacity: [0.8, 0.2, 0.8],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
          className="absolute top-1/2 -left-4 text-white/80 font-serif text-xs select-none pointer-events-none"
        >
          ✦
        </motion.span>

        <motion.span
          animate={{
            scale: [0.7, 1.2, 0.7],
            opacity: [0.3, 0.9, 0.3],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.8,
          }}
          className="absolute -bottom-1 -right-3 text-white/60 font-serif text-xs select-none pointer-events-none"
        >
          ✦
        </motion.span>

        {/* Wish Jar SVG Illustration */}
        <svg
          width={jarSize}
          height={jarSize}
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
        >
          {/* Jar Base Shadow */}
          <ellipse cx="60" cy="110" rx="36" ry="5" fill="#000000" fillOpacity="0.5" />

          {/* Jar Outer Glass Body */}
          <rect
            x="32"
            y="38"
            width="56"
            height="64"
            rx="16"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Jar Neck and Rim */}
          <path
            d="M 40 38 L 40 28 Q 40 25 43 25 L 77 25 Q 80 25 80 28 L 80 38"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <rect
            x="36"
            y="21"
            width="48"
            height="7"
            rx="3.5"
            fill="#FFFFFF"
          />

          {/* Glass Highlight Reflection Line */}
          <path
            d="M 83 48 C 84 55 84 75 83 82"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.6"
          />

          {/* Wish Liquid Base */}
          <path
            d="M 34 76 Q 48 70 60 76 T 86 76 L 86 88 Q 86 100 74 100 L 46 100 Q 34 100 34 88 Z"
            fill="#FFFFFF"
            fillOpacity="0.2"
          />
          <motion.path
            d="M 34 84 Q 48 80 60 84 T 86 84 L 86 90 Q 86 100 74 100 L 46 100 Q 34 100 34 90 Z"
            fill="#FFFFFF"
            fillOpacity="0.95"
            animate={{
              d: [
                'M 34 84 Q 48 80 60 84 T 86 84 L 86 90 Q 86 100 74 100 L 46 100 Q 34 100 34 90 Z',
                'M 34 82 Q 48 86 60 82 T 86 82 L 86 90 Q 86 100 74 100 L 46 100 Q 34 100 34 90 Z',
                'M 34 84 Q 48 80 60 84 T 86 84 L 86 90 Q 86 100 74 100 L 46 100 Q 34 100 34 90 Z',
              ],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Floating Wish Paper Inside Jar */}
          <motion.g
            animate={{
              y: [-3.5, 3.5, -3.5],
              rotate: [-1.5, 1.5, -1.5],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ transformOrigin: '60px 48px' }}
          >
            {/* Paper card protruding from neck */}
            <rect
              x="45"
              y="11"
              width="30"
              height="38"
              rx="2.5"
              fill="#0d1411"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
            {/* Star Sparkle on Letter */}
            <path
              d="M 60 21 Q 60 27 66 27 Q 60 27 60 33 Q 60 27 54 27 Q 60 27 60 21 Z"
              fill="#FFFFFF"
            />
            {/* Letter Fold Line */}
            <line x1="49" y1="36" x2="71" y2="36" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.7" />
          </motion.g>

          {/* Center Liquid Sparkle */}
          <motion.path
            d="M 60 76 Q 60 82 66 82 Q 60 82 60 88 Q 60 82 54 82 Q 60 82 60 76 Z"
            fill="#0d1411"
            animate={{
              scale: [0.85, 1.15, 0.85],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ transformOrigin: '60px 82px' }}
          />
        </svg>
      </div>

      {/* Typography: Black & White Monospace Header */}
      <div className="mt-8 space-y-2">
        <motion.div
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="font-serif text-lg sm:text-xl font-bold tracking-[0.3em] uppercase text-white"
        >
          {text}
        </motion.div>

        {subtext && (
          <p className="text-[11px] font-mono tracking-widest uppercase text-[#9eaaa3]">
            {subtext}
          </p>
        )}

        {/* Minimalist Scanning Progress Bar */}
        <div className="w-32 h-[2px] bg-white/15 mx-auto overflow-hidden relative mt-4">
          <motion.div
            className="absolute top-0 bottom-0 w-12 bg-white"
            animate={{
              x: [-48, 128],
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
      <div className="fixed inset-0 z-[999] bg-[#0c120f]/95 backdrop-blur-md flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return content;
}
