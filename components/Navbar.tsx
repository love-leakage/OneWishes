'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { OWLogo } from './OWLogo';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Sparkles, Compass, Shield, Calendar, History, User as UserIcon, Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navItems = [
    { label: 'Spark', href: '/spark', icon: Sparkles, color: 'text-amber-400' },
    { label: 'Golden', href: '/golden', icon: Shield, color: 'text-indigo-400' },
    { label: 'Neverfade', href: '/neverfade', icon: Calendar, color: 'text-rose-400' },
    { label: 'Gallery', href: '/gallery', icon: Compass, color: 'text-slate-300' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#020617]/80 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Monogram Logo */}
        <Link href="/" className="flex items-center">
          <OWLogo size={36} />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800/80 text-white shadow-sm border border-slate-700/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.color}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {user && (
            <Link
              href="/history"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                pathname === '/history'
                  ? 'bg-slate-800/80 text-white border border-slate-700/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <History className="w-4 h-4 text-purple-400" />
              <span>My History</span>
            </Link>
          )}
        </nav>

        {/* Auth Button */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link
              href="/history"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider bg-slate-900 border border-slate-700 text-slate-200 hover:border-amber-400/50 transition-all"
            >
              <UserIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>@{user.email?.split('@')[0]}</span>
            </Link>
          ) : (
            <button
              onClick={onOpenAuth}
              className="relative group overflow-hidden rounded-xl p-[1px] font-semibold text-xs uppercase tracking-wider"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 rounded-xl group-hover:opacity-90 transition-opacity" />
              <span className="relative block px-5 py-2.5 bg-[#020617] rounded-[11px] text-white group-hover:bg-transparent transition-colors">
                Sign In
              </span>
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#020617] px-4 pt-2 pb-6 space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-900"
              >
                <Icon className={`w-5 h-5 ${item.color}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          {user ? (
            <Link
              href="/history"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-900"
            >
              <History className="w-5 h-5 text-purple-400" />
              <span>My History</span>
            </Link>
          ) : (
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenAuth?.(); }}
              className="w-full text-center py-3 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-xl text-white font-semibold text-sm"
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </header>
  );
};
