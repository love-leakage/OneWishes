import React from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#d4af37]/20 bg-[#050505] py-16 px-4 sm:px-6 lg:px-8 mt-24">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src="/logo-tight.png" 
              alt="OneWishes Logo" 
              className="h-8 w-auto object-contain drop-shadow-[0_0_12px_rgba(212,175,55,0.45)] transition-transform group-hover:scale-105" 
            />
            <span className="font-serif font-black text-sm tracking-[0.25em] text-[#f5f2eb] uppercase group-hover:text-[#e5c07b] transition-colors">
              ONEWISHES
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-[#b5afa6] uppercase tracking-wider font-semibold">
            <Link href="/" className="hover:text-[#e5c07b] transition-colors">Home</Link>
            <Link href="/goldenwish" className="hover:text-[#e5c07b] transition-colors">Golden Wish</Link>
            <Link href="/onewish" className="hover:text-[#e5c07b] transition-colors">Onewish</Link>
            <Link href="/gallery" className="hover:text-[#e5c07b] transition-colors">Gallery</Link>
            <Link href="/about" className="hover:text-[#e5c07b] transition-colors">About</Link>
            <Link href="/contact" className="hover:text-[#e5c07b] transition-colors">Contact</Link>
          </div>

          {/* Contact Direct Link */}
          <a
            href="mailto:admin@onewishes.com"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-[#d4af37]/25 hover:border-[#e5c07b] rounded-full text-xs font-mono text-[#b5afa6] hover:text-[#f5f2eb] bg-[#0d0d10] transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-[#e5c07b]" />
            <span>admin@onewishes.com</span>
          </a>
        </div>

        {/* Sub-footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-[#d4af37]/15 text-xs text-[#7a756f]">
          <div className="font-mono">
            © {new Date().getFullYear()} onewishes.com • Infinite Artificial Scarcity Keepsakes
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-wider">
            <Link href="/privacy" className="hover:text-[#b5afa6] transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[#b5afa6] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
