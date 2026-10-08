import React from 'react';

interface OWLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const OWLogo: React.FC<OWLogoProps> = ({ size = 32, className = '', showText = true }) => {
  return (
    <div className={`inline-flex items-center gap-3 cursor-pointer select-none group ${className}`}>
      <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="owRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>

            <linearGradient id="owWGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f3e8ff" />
            </linearGradient>

            <linearGradient id="owGoldSpark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#e4c067" />
            </linearGradient>
          </defs>

          {/* Outer Monogram 'O' Ring */}
          <circle 
            cx="50" 
            cy="50" 
            r="44" 
            stroke="url(#owRingGradient)" 
            strokeWidth="7" 
            fill="#020617" 
          />

          {/* Intertwined Monogram 'W' */}
          <path 
            d="M 28 34 L 38 68 L 50 44 L 62 68 L 72 34" 
            stroke="url(#owWGradient)" 
            strokeWidth="7.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Gold Spark Star Accent on Top Right of O */}
          <path 
            d="M 72 18 C 72 23 76 27 81 27 C 76 27 72 31 72 36 C 72 31 68 27 63 27 C 68 27 72 23 72 18 Z" 
            fill="url(#owGoldSpark)" 
          />
        </svg>
      </div>

      {showText && (
        <span className="font-bold tracking-widest text-lg md:text-xl text-white font-sans group-hover:text-indigo-300 transition-colors">
          ONE<span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">WISHES</span>
        </span>
      )}
    </div>
  );
};
