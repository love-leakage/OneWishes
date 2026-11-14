'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Menu, X, LogOut, Volume2, VolumeX } from 'lucide-react';
import { sounds } from '@/lib/sounds';

export const Navbar = () => {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem('onewishes_cached_profile');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    setSoundOn(sounds.isEnabled());
    const handleSoundToggle = (e: any) => {
      setSoundOn(e.detail);
    };
    window.addEventListener('onewishes:sound-toggle', handleSoundToggle);
    return () => window.removeEventListener('onewishes:sound-toggle', handleSoundToggle);
  }, []);

  useEffect(() => {
    // Immediate hydration from cache so avatar and username display instantly
    try {
      const cached = localStorage.getItem('onewishes_cached_profile');
      if (cached) {
        setProfile(JSON.parse(cached));
      }
    } catch (e) {}

    async function loadUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        if (session?.user) {
          const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
          setProfile(prof || null);
          if (prof) {
            localStorage.setItem('onewishes_cached_profile', JSON.stringify(prof));
          }
        } else {
          setProfile(null);
          localStorage.removeItem('onewishes_cached_profile');
        }
      } catch (err) {
        console.error('Navbar loadUser error:', err);
      }
    }
    
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
        setProfile(prof || null);
        if (prof) {
          localStorage.setItem('onewishes_cached_profile', JSON.stringify(prof));
        }
      } else {
        setProfile(null);
        localStorage.removeItem('onewishes_cached_profile');
      }
    });

    const handleProfileUpdate = (e: any) => {
      if (e.detail) {
        setProfile(e.detail);
        localStorage.setItem('onewishes_cached_profile', JSON.stringify(e.detail));
      }
    };

    window.addEventListener('onewishes:profile-updated', handleProfileUpdate);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('onewishes:profile-updated', handleProfileUpdate);
    };
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
    try {
      // 1. Immediately wipe component state so UI updates instantly
      setUser(null);
      setProfile(null);

      // 2. Clear all cached storage keys immediately
      if (typeof window !== 'undefined') {
        localStorage.removeItem('onewishes_cached_profile');
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('sb-') || key.startsWith('onewishes_')) {
            localStorage.removeItem(key);
          }
        });
        sessionStorage.clear();
        window.dispatchEvent(new CustomEvent('onewishes:profile-updated', { detail: null }));
      }

      // 3. Perform Supabase sign out with 800ms safety timeout to prevent hanging
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((resolve) => setTimeout(resolve, 800)),
      ]);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      if (typeof window !== 'undefined') {
        window.location.replace('/');
      }
    }
  };

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Golden Wish', href: '/goldenwish' },
    { label: 'Onewish', href: '/onewish' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#050505]/95 backdrop-blur-md border-b border-[#d4af37]/20 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <img 
            src="/logo-tight.png" 
            alt="OneWishes Logo" 
            className="h-8 sm:h-10 w-auto object-contain drop-shadow-[0_0_14px_rgba(212,175,55,0.45)] transition-transform group-hover:scale-105" 
          />
          <span className="font-serif font-black text-base sm:text-xl tracking-[0.2em] sm:tracking-[0.25em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#ffffff] via-[#f3e5ab] to-[#d4af37] transition-opacity">
            ONEWISHES
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs font-semibold tracking-widest uppercase transition-colors relative py-1 ${
                  isActive ? 'text-[#e5c07b] font-bold' : 'text-[#b5afa6] hover:text-[#f5f2eb]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#d4af37] via-[#e5c07b] to-[#b38728] rounded-full shadow-[0_0_8px_#d4af37]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth & Sound */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Sound Toggle */}
          <button
            onClick={() => sounds.toggle()}
            title={soundOn ? 'Sound On' : 'Sound Muted'}
            className="p-2 border border-[#d4af37]/20 rounded-full text-[#b5afa6] hover:text-[#f5f2eb] hover:border-[#d4af37]/50 bg-[#0d0d10] transition-all"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-[#e5c07b]" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <Link 
                href={profile?.username ? `/${profile.username}` : '/profile'} 
                className="flex items-center gap-2 border border-[#d4af37]/30 py-1.5 px-3 rounded-full hover:border-[#e5c07b] bg-[#0d0d10] transition-all group shadow-sm"
              >
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Profile" className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#d4af37] to-[#e5c07b] text-[#050505] flex items-center justify-center font-bold text-[10px] uppercase">
                    {(profile?.username || user.email?.charAt(0))?.substring(0, 1)}
                  </div>
                )}
                {profile?.username ? (
                  <span className="text-xs font-bold tracking-wider uppercase text-[#f5f2eb] group-hover:text-[#e5c07b] transition-colors">
                    @{profile.username}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#e5c07b]">
                    Set Handle
                  </span>
                )}
              </Link>
              <button onClick={handleLogout} className="text-[#b5afa6] hover:text-[#f5f2eb] p-1.5 transition-colors" title="Log Out">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="px-5 py-2 bg-gradient-to-r from-[#d4af37] via-[#e5c07b] to-[#b38728] text-[#050505] font-bold uppercase text-xs tracking-wider hover:opacity-95 shadow-[0_0_18px_rgba(212,175,55,0.35)] transition-all"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Nav Trigger & Sound */}
        <div className="lg:hidden flex items-center gap-1.5 sm:gap-2">
          {user && (
            <Link 
              href={profile?.username ? `/${profile.username}` : '/profile'} 
              className="flex items-center gap-1 border border-[#d4af37]/30 py-1 px-2 rounded-full bg-[#0d0d10] text-[11px] font-bold uppercase tracking-wider text-[#e5c07b] max-w-[120px] truncate"
            >
              <span className="truncate">@{profile?.username || 'Profile'}</span>
            </Link>
          )}

          <button
            onClick={() => sounds.toggle()}
            title={soundOn ? 'Sound On' : 'Sound Muted'}
            className="p-2 border border-[#d4af37]/20 rounded-full text-[#b5afa6] hover:text-[#f5f2eb] bg-[#0d0d10]"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-[#e5c07b]" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-[#f5f2eb] p-2 border border-[#d4af37]/20 rounded-lg bg-[#0d0d10] hover:border-[#d4af37]/50"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#e5c07b]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#d4af37]/20 bg-[#070709] px-5 py-6 space-y-4 shadow-2xl">
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2.5 px-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
                    isActive 
                      ? 'bg-[#14120e] text-[#e5c07b] border-l-2 border-[#d4af37]' 
                      : 'text-[#b5afa6] hover:text-[#f5f2eb] hover:bg-[#0d0d10]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#d4af37]/20 space-y-3">
            {user ? (
              <div className="flex items-center justify-between pt-2">
                <Link 
                  href={profile?.username ? `/${profile.username}` : '/profile'} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 border border-[#d4af37]/30 py-2 px-4 rounded-full bg-[#0d0d10] text-xs font-bold uppercase tracking-wider text-[#f5f2eb]"
                >
                  {user.user_metadata?.avatar_url && (
                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-6 h-6 rounded-full" />
                  )}
                  <span>@{profile?.username || 'My Profile'}</span>
                </Link>

                <button 
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }} 
                  className="inline-flex items-center gap-1.5 text-xs text-[#b5afa6] hover:text-[#f5f2eb] p-2 font-mono uppercase"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => { handleGoogleLogin(); setMobileMenuOpen(false); }}
                className="w-full py-3.5 bg-gradient-to-r from-[#d4af37] via-[#e5c07b] to-[#b38728] text-[#050505] font-bold uppercase tracking-wider text-xs shadow-lg"
              >
                Sign In with Google
              </button>
            )}

            <div className="pt-2 text-center">
              <a 
                href="mailto:admin@onewishes.com" 
                className="text-[11px] font-mono text-[#7a756f] hover:text-[#e5c07b] transition-colors"
              >
                admin@onewishes.com
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
