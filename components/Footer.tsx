import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-black py-12 px-4 sm:px-6 lg:px-8 mt-24">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-6 h-6 grayscale" />
          <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Onewishes</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-gray-400 uppercase tracking-wider font-semibold">
          <Link href="/golden" className="hover:text-white transition-colors">Golden Wish</Link>
          <Link href="/onewish" className="hover:text-white transition-colors">Onewish</Link>
          <Link href="/gallery" className="hover:text-white transition-colors">Gallery</Link>
        </div>

        <div className="text-xs text-gray-500">
          © {new Date().getFullYear()} onewishes.com. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
