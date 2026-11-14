import React from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#211624] bg-[#050505] py-16 px-4 sm:px-6 lg:px-8 mt-24">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src="/logo-tight.png" 
              alt="OneWishes Logo" 
              className="h-8 w-auto object-contain drop-shadow-[0_0_12px_rgba(248,79,156,0.5)] transition-transform group-hover:scale-105" 
            />
            <span className="font-serif font-black text-sm tracking-[0.25em] text-[#fbf8f5] uppercase group-hover:text-[#ff4d8d] transition-colors">
              ONEWISHES
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-[#b5a5b5] uppercase tracking-wider font-semibold">
            <Link href="/" className="hover:text-[#ff4d8d] transition-colors">Home</Link>
            <Link href="/goldenwish" className="hover:text-[#ff4d8d] transition-colors">Golden Wish</Link>
            <Link href="/onewish" className="hover:text-[#ff4d8d] transition-colors">Onewish</Link>
            <Link href="/gallery" className="hover:text-[#ff4d8d] transition-colors">Gallery</Link>
            <Link href="/about" className="hover:text-[#ff4d8d] transition-colors">About</Link>
            <Link href="/contact" className="hover:text-[#ff4d8d] transition-colors">Contact</Link>
          </div>

          {/* Contact Direct Link */}
          <a
            href="mailto:admin@onewishes.com"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-[#241727] hover:border-[#ff4d8d]/60 rounded-full text-xs font-mono text-[#b5a5b5] hover:text-[#fbf8f5] bg-[#0d0910] transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-[#ff4d8d]" />
            <span>admin@onewishes.com</span>
          </a>
        </div>

        {/* Sub-footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-[#211624] text-xs text-[#7a6a7a]">
          <div className="font-mono">
            © {new Date().getFullYear()} onewishes.com • Infinite Artificial Scarcity Keepsakes
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-wider">
            <Link href="/privacy" className="hover:text-[#b5a5b5] transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[#b5a5b5] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
