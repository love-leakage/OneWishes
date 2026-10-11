import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#2a3d35] bg-[#141f1b] py-12 px-4 sm:px-6 lg:px-8 mt-24">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
          <span className="text-xs text-[#a6b6ad] uppercase tracking-widest font-bold">Onewishes</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-[#a6b6ad] uppercase tracking-wider font-semibold">
          <Link href="/goldenwish" className="hover:text-[#f3eee3] transition-colors">Golden Wish</Link>
          <Link href="/onewish" className="hover:text-[#f3eee3] transition-colors">Onewish</Link>
          <Link href="/gallery" className="hover:text-[#f3eee3] transition-colors">Gallery</Link>
        </div>

        <div className="text-xs text-[#72897e]">
          © {new Date().getFullYear()} onewishes.com. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
