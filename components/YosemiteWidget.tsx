'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Play } from 'lucide-react';

export const YosemiteWidget: React.FC<{ onStartClick?: () => void }> = ({ onStartClick }) => {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['14deg', '-14deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-14deg', '14deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="perspective-1000 flex justify-center w-full select-none">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onStartClick}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale: 1.03 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="relative w-full max-w-[360px] h-[500px] bg-black border border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] cursor-pointer group overflow-hidden"
      >
        {/* Floating Particles */}
        <div className="absolute top-[30%] left-[20%] w-1 h-1 bg-white animate-ping opacity-75" />
        <div className="absolute top-[45%] left-[75%] w-1.5 h-1.5 bg-gray-400 animate-pulse" />
        <div className="absolute top-[25%] left-[65%] w-1 h-1 bg-white animate-bounce" />

        {/* Content Header */}
        <div className="relative z-10 pt-10 px-7 text-center translate-z-10">
          <span className="block text-[11px] font-bold tracking-widest text-gray-500 uppercase mb-4">
            DISCOVER ONEWISHES
          </span>
          <h2 className="font-serif text-4xl font-bold text-white leading-tight mb-4 tracking-tighter uppercase">
            Yosemite
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed mb-8 px-2 uppercase tracking-widest">
            Embark on an immersive hike through the breathtaking hills of Yosemite.
          </p>

          <button className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all group-hover:scale-105">
            <Play className="w-4 h-4 fill-current" />
            <span>Start Experience</span>
          </button>
        </div>

        {/* Vector Mountain & Tree Scene */}
        <div className="absolute bottom-0 left-0 w-full h-[60%] pointer-events-none grayscale opacity-80">
          {/* Radial Sun Aura */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-52 h-52 bg-white/10 rounded-full blur-2xl animate-pulse" />

          {/* SVG Vector Layer */}
          <svg className="w-full h-full absolute bottom-0 block grayscale" viewBox="0 0 360 300" preserveAspectRatio="none">
            {/* Distant Mountain Ranges */}
            <path d="M0 300 L0 180 C50 140 100 160 150 120 C200 150 260 110 320 170 L360 150 L360 300 Z" fill="#222222" />
            <path d="M0 300 L0 210 C80 170 140 220 220 160 C280 180 330 160 360 200 L360 300 Z" fill="#111111" />

            {/* Pine Forest Midground */}
            <g className="origin-bottom animate-pulse">
              <polygon points="20,300 0,160 40,300" fill="#333333" />
              <polygon points="45,300 25,180 65,300" fill="#444444" />
              <polygon points="70,300 50,195 90,300" fill="#333333" />

              <polygon points="340,300 360,150 320,300" fill="#333333" />
              <polygon points="315,300 335,170 295,300" fill="#444444" />
              <polygon points="290,300 310,190 270,300" fill="#333333" />
            </g>

            {/* Ground */}
            <path d="M0 300 L0 260 Q 180 230 360 260 L360 300 Z" fill="#ffffff" fillOpacity="0.1" />
            <path d="M0 300 L0 275 Q 180 250 360 275 L360 300 Z" fill="#ffffff" fillOpacity="0.2" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
};
