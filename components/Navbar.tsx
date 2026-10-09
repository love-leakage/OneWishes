'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Menu, X, LogOut, Shield } from 'lucide-react';

export const Navbar = () => {
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

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { label: 'Golden Wish', href: '/golden' },
    { label: 'Onewish', href: '/onewish' },
    { label: 'Gallery', href: '/gallery' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Onewishes Logo" className="w-10 h-10 object-contain rounded-md" />
          <span className="font-serif font-bold text-xl tracking-widest uppercase text-white hidden sm:block">
            Onewishes
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium tracking-wide uppercase transition-colors ${
                  isActive ? 'text-white border-b-2 border-white pb-1' : 'text-gray-400 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/5">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Profile" className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-white">{user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
              </div>
              <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors" title="Log Out">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="px-6 py-2 bg-white text-black font-bold uppercase text-sm tracking-wider hover:bg-gray-200 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-black px-4 py-4 space-y-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-lg font-medium text-white uppercase tracking-wide"
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {user.user_metadata?.avatar_url && (
                  <img src={user.user_metadata.avatar_url} alt="Profile" className="w-8 h-8 rounded-full" />
                )}
                <span className="text-white font-medium">{user.user_metadata?.full_name || user.email}</span>
              </div>
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-gray-400 hover:text-white">
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { handleGoogleLogin(); setMobileMenuOpen(false); }}
              className="w-full mt-4 py-3 bg-white text-black font-bold uppercase tracking-wider text-sm"
            >
              Sign In with Google
            </button>
          )}
        </div>
      )}
    </header>
  );
};

