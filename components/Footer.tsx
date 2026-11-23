import React from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#3d332a]/80 bg-[#0b0908] py-16 px-4 sm:px-6 lg:px-8 mt-24">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src="/logo-tight.png" 
              alt="OneWishes Logo" 
              className="h-8 w-auto object-contain drop-shadow-[0_0_12px_rgba(220,167,102,0.45)] transition-transform group-hover:scale-105" 
            />
            <span className="font-serif font-black text-sm tracking-[0.25em] text-[#f7f3ea] uppercase group-hover:text-[#dca766] transition-colors">
              ONEWISHES
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-[#bfae9c] uppercase tracking-wider font-mono">
            <Link href="/" className="hover:text-[#dca766] transition-colors">Home</Link>
            <Link href="/goldenwish" className="hover:text-[#dca766] transition-colors">Golden Wish</Link>
            <Link href="/onewish" className="hover:text-[#dca766] transition-colors">Onewish</Link>
            <Link href="/gallery" className="hover:text-[#dca766] transition-colors">Gallery</Link>
            <Link href="/about" className="hover:text-[#dca766] transition-colors">About</Link>
            <Link href="/contact" className="hover:text-[#dca766] transition-colors">Contact</Link>
          </div>

          {/* Contact Direct Link */}
          <a
            href="mailto:admin@onewishes.com"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-[#423528]/80 hover:border-[#dca766] rounded-full text-xs font-mono text-[#bfae9c] hover:text-[#f7f3ea] bg-[#161310] transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-[#dca766]" />
            <span>admin@onewishes.com</span>
          </a>
        </div>

        {/* Sub-footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-[#3d332a]/40 text-xs text-[#7a6a5d]">
          <div className="flex items-center gap-3">
            <div className="vintage-postmark text-[8px] py-0.5 px-2.5">
              ARCHIVE EST. 2026
            </div>
            <div className="font-mono">
              © {new Date().getFullYear()} onewishes.com • The 35mm Analog Keepsake Archive
            </div>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-wider">
            <Link href="/privacy" className="hover:text-[#bfae9c] transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[#bfae9c] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
