import React from 'react';
import Link from 'next/link';
import { OWLogo } from './OWLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#020617] py-12 px-4 sm:px-6 lg:px-8 mt-24">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex items-center gap-3">
          <OWLogo size={28} />
          <span className="text-xs text-slate-500">| Artificial Scarcity Wish Platform</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-400">
          <Link href="/spark" className="hover:text-amber-400 transition-colors">Spark Wish</Link>
          <Link href="/golden" className="hover:text-indigo-400 transition-colors">Golden Wish</Link>
          <Link href="/neverfade" className="hover:text-rose-400 transition-colors">Neverfade Spotlight</Link>
          <Link href="/gallery" className="hover:text-white transition-colors">Gallery</Link>
        </div>

        <div className="text-xs text-slate-500">
          © {new Date().getFullYear()} onewishes.com. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
