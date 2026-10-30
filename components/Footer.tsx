import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#1a1d1b] bg-[#050505] py-12 px-4 sm:px-6 lg:px-8 mt-24">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Logo" className="w-7 h-7 object-contain drop-shadow-[0_0_8px_rgba(228,192,103,0.3)]" />
          <span className="text-xs text-[#f5f2eb] uppercase tracking-widest font-bold">Onewishes</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-[#a1b0a8] uppercase tracking-wider font-semibold">
          <Link href="/goldenwish" className="hover:text-[#e4c067] transition-colors">Golden Wish</Link>
          <Link href="/onewish" className="hover:text-[#e4c067] transition-colors">Onewish</Link>
          <Link href="/gallery" className="hover:text-[#e4c067] transition-colors">Gallery</Link>
        </div>

        <div className="text-xs text-[#6e7d75] font-mono">
          © {new Date().getFullYear()} onewishes.com. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
