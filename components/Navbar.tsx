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
    await supabase.auth.signOut();
    window.location.href = '/';
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
    <header className="sticky top-0 z-50 w-full bg-[#050505]/95 backdrop-blur-md border-b border-[#211624] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <img 
            src="/logo-tight.png" 
            alt="OneWishes Logo" 
            className="h-9 sm:h-10 w-auto object-contain drop-shadow-[0_0_14px_rgba(248,79,156,0.6)] transition-transform group-hover:scale-105" 
          />
          <span className="font-serif font-bold text-lg sm:text-xl tracking-widest uppercase text-[#fbf8f5] group-hover:text-[#ff758c] transition-colors">
            Onewishes
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
                  isActive ? 'text-[#ff4d8d] font-bold' : 'text-[#b5a5b5] hover:text-[#fbf8f5]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#ff6b8b] via-[#f84f9c] to-[#ff2a85] rounded-full shadow-[0_0_8px_#ff4d8d]" />
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
            className="p-2 border border-[#241727] rounded-full text-[#b5a5b5] hover:text-[#fbf8f5] hover:border-[#ff4d8d]/50 bg-[#0d0910] transition-all"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-[#ff4d8d]" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <Link 
                href={profile?.username ? `/${profile.username}` : '/profile'} 
                className="flex items-center gap-2 border border-[#241727] py-1.5 px-3 rounded-full hover:border-[#ff4d8d]/60 bg-[#0d0910] transition-all group shadow-sm"
              >
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Profile" className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#ff5376] to-[#f84f9c] text-white flex items-center justify-center font-bold text-[10px] uppercase">
                    {(profile?.username || user.email?.charAt(0))?.substring(0, 1)}
                  </div>
                )}
                {profile?.username ? (
                  <span className="text-xs font-bold tracking-wider uppercase text-[#fbf8f5] group-hover:text-[#ff4d8d] transition-colors">
                    @{profile.username}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#ff4d8d]">
                    Set Handle
                  </span>
                )}
              </Link>
              <button onClick={handleLogout} className="text-[#b5a5b5] hover:text-[#fbf8f5] p-1.5 transition-colors" title="Log Out">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="px-5 py-2 bg-gradient-to-r from-[#ff5376] to-[#f84f9c] text-white font-bold uppercase text-xs tracking-wider hover:opacity-95 shadow-[0_0_18px_rgba(248,79,156,0.35)] transition-all"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Nav Trigger & Sound */}
        <div className="lg:hidden flex items-center gap-2">
          {user && (
            <Link 
              href={profile?.username ? `/${profile.username}` : '/profile'} 
              className="flex items-center gap-1.5 border border-[#241727] py-1 px-2.5 rounded-full bg-[#0d0910] text-xs font-bold uppercase tracking-wider text-[#ff4d8d]"
            >
              <span>@{profile?.username || 'Profile'}</span>
            </Link>
          )}

          <button
            onClick={() => sounds.toggle()}
            title={soundOn ? 'Sound On' : 'Sound Muted'}
            className="p-2 border border-[#241727] rounded-full text-[#b5a5b5] hover:text-[#fbf8f5] bg-[#0d0910]"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-[#ff4d8d]" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-[#fbf8f5] p-2 border border-[#241727] rounded-lg bg-[#0d0910] hover:border-[#ff4d8d]/50"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#ff4d8d]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#211624] bg-[#070608] px-5 py-6 space-y-4 shadow-2xl">
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
                      ? 'bg-[#150d18] text-[#ff4d8d] border-l-2 border-[#ff4d8d]' 
                      : 'text-[#b5a5b5] hover:text-[#fbf8f5] hover:bg-[#0d0910]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#211624] space-y-3">
            {user ? (
              <div className="flex items-center justify-between pt-2">
                <Link 
                  href={profile?.username ? `/${profile.username}` : '/profile'} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 border border-[#241727] py-2 px-4 rounded-full bg-[#0d0910] text-xs font-bold uppercase tracking-wider text-[#fbf8f5]"
                >
                  {user.user_metadata?.avatar_url && (
                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-6 h-6 rounded-full" />
                  )}
                  <span>@{profile?.username || 'My Profile'}</span>
                </Link>

                <button 
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }} 
                  className="inline-flex items-center gap-1.5 text-xs text-[#b5a5b5] hover:text-[#fbf8f5] p-2 font-mono uppercase"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => { handleGoogleLogin(); setMobileMenuOpen(false); }}
                className="w-full py-3.5 bg-gradient-to-r from-[#ff5376] to-[#f84f9c] text-white font-bold uppercase tracking-wider text-xs shadow-lg"
              >
                Sign In with Google
              </button>
            )}

            <div className="pt-2 text-center">
              <a 
                href="mailto:admin@onewishes.com" 
                className="text-[11px] font-mono text-[#7a6a7a] hover:text-[#ff4d8d] transition-colors"
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
