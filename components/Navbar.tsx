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
  const [profile, setProfile] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(prof);
      } else {
        setProfile(null);
      }
    }
    
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(prof);
      } else {
        setProfile(null);
      }
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
    window.location.href = '/';
  };

  const navItems = [
    { label: 'Golden Wish', href: '/goldenwish' },
    { label: 'Onewish', href: '/onewish' },
    { label: 'Gallery', href: '/gallery' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#141f1b]/95 backdrop-blur-md border-b border-[#2a3d35] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Onewishes Logo" className="w-10 h-10 object-contain rounded-md" />
          <span className="font-serif font-bold text-xl tracking-widest uppercase text-[#f3eee3] hidden sm:block">
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
                  isActive ? 'text-[#f3eee3] border-b-2 border-[#72897e] pb-1' : 'text-[#a6b6ad] hover:text-[#f3eee3]'
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
              <Link href={`/${profile?.username || user.user_metadata?.username || user.email?.split('@')[0]}`} className="block border border-[#2a3d35] p-1 rounded-full hover:border-[#72897e] transition-all">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Profile" className="w-8 h-8 rounded-full grayscale hover:grayscale-0 transition-all" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#f3eee3] text-[#141f1b] flex items-center justify-center font-bold text-xs uppercase">
                    {(user.user_metadata?.username || user.email?.charAt(0))?.substring(0, 1)}
                  </div>
                )}
              </Link>
              <button onClick={handleLogout} className="text-[#a6b6ad] hover:text-[#f3eee3] transition-colors" title="Log Out">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="px-6 py-2 bg-[#f3eee3] text-[#141f1b] font-bold uppercase text-sm tracking-wider hover:bg-white transition-colors"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-[#f3eee3]"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#2a3d35] bg-[#141f1b] px-4 py-4 space-y-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-lg font-medium text-[#f3eee3] uppercase tracking-wide"
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <div className="pt-4 border-t border-[#2a3d35] flex items-center justify-between">
              <Link href={`/${profile?.username || user.user_metadata?.username || user.email?.split('@')[0]}`} className="block border border-[#2a3d35] p-1 rounded-full hover:border-[#72897e] transition-all">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Profile" className="w-10 h-10 rounded-full grayscale hover:grayscale-0 transition-all" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#f3eee3] text-[#141f1b] flex items-center justify-center font-bold text-xs uppercase">
                    {(user.user_metadata?.username || user.email?.charAt(0))?.substring(0, 1)}
                  </div>
                )}
              </Link>
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-[#a6b6ad] hover:text-[#f3eee3]">
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { handleGoogleLogin(); setMobileMenuOpen(false); }}
              className="w-full mt-4 py-3 bg-[#f3eee3] text-[#141f1b] font-bold uppercase tracking-wider text-sm"
            >
              Sign In with Google
            </button>
          )}
        </div>
      )}
    </header>
  );
};

