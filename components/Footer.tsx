import React from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#1a1d1b] bg-[#050505] py-16 px-4 sm:px-6 lg:px-8 mt-24">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.svg" alt="Logo" className="w-8 h-8 object-contain drop-shadow-[0_0_10px_rgba(228,192,103,0.3)] transition-transform group-hover:scale-105" />
            <span className="font-serif text-sm text-[#f5f2eb] uppercase tracking-widest font-bold">OneWishes</span>
          </Link>

          {/* Nav Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-[#a1b0a8] uppercase tracking-wider font-semibold">
            <Link href="/" className="hover:text-[#f5f2eb] transition-colors">Home</Link>
            <Link href="/goldenwish" className="hover:text-[#e4c067] transition-colors">Golden Wish</Link>
            <Link href="/onewish" className="hover:text-[#e4c067] transition-colors">Onewish</Link>
            <Link href="/gallery" className="hover:text-[#e4c067] transition-colors">Gallery</Link>
            <Link href="/about" className="hover:text-[#e4c067] transition-colors">About</Link>
            <Link href="/contact" className="hover:text-[#e4c067] transition-colors">Contact</Link>
          </div>

          {/* Contact Direct Link */}
          <a
            href="mailto:admin@onewishes.com"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-[#1a1d1b] hover:border-[#e4c067]/60 rounded-full text-xs font-mono text-[#a1b0a8] hover:text-[#f5f2eb] bg-[#0c0d0d] transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-[#e4c067]" />
            <span>admin@onewishes.com</span>
          </a>
        </div>

        {/* Sub-footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-[#1a1d1b] text-xs text-[#6e7d75]">
          <div className="font-mono">
            © {new Date().getFullYear()} onewishes.com • Artificial Scarcity Keepsakes
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-wider">
            <Link href="/privacy" className="hover:text-[#a1b0a8] transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[#a1b0a8] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
