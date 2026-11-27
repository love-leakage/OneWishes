'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Menu, X, LogOut, Volume2, VolumeX, Stamp, Compass } from 'lucide-react';
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
    sounds.playWaxSealBreak();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      }
    });
  };

  const handleLogout = async () => {
    sounds.playTypewriterStrike();
    try {
      setUser(null);
      setProfile(null);

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
    { label: 'Archive', href: '/' },
    { label: 'Golden Roll', href: '/goldenwish' },
    { label: 'Monument', href: '/onewish' },
    { label: 'Vault Gallery', href: '/gallery' },
    { label: 'Colophon', href: '/about' },
    { label: 'Telegraph', href: '/contact' },
  ];

  return (
    <div className="sticky top-4 z-50 w-full px-3 sm:px-6 pointer-events-none">
      <header className="pointer-events-auto max-w-6xl mx-auto rounded-full bg-[#120f0d]/95 backdrop-blur-2xl border border-[#423326] shadow-[0_12px_45px_rgba(0,0,0,0.95)] transition-all px-4 sm:px-6 py-2.5 relative">
        {/* Subtle brass border highlight */}
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#c5a059]/40 to-transparent pointer-events-none" />

        <div className="flex items-center justify-between">
        
          {/* Logo with vintage carmine wax seal emblem & spinning brass reel */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="relative">
              <img 
                src="/logo-tight.png" 
                alt="OneWishes Emblem" 
                className="h-8 sm:h-9 w-auto object-contain drop-shadow-[0_0_12px_rgba(197,160,89,0.45)] transition-transform group-hover:scale-105" 
              />
              <div className="absolute -inset-1 rounded-full border border-dashed border-[#c5a059]/30 animate-reel-spin pointer-events-none" />
            </div>
            <div className="flex flex-col">
              <span className="font-garamond font-black text-base sm:text-xl tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#ffffff] via-[#f7ecd5] to-[#c5a059]">
                ONEWISHES
              </span>
              <span className="text-[7px] font-courier text-[#8c6228] tracking-[0.25em] uppercase -mt-1 hidden sm:block">
                EST. 1890 ARCHIVE
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => sounds.playTypewriterStrike()}
                  className={`text-xs font-courier tracking-widest uppercase transition-colors relative py-1 ${
                    isActive ? 'text-[#c5a059] font-bold' : 'text-[#a89684] hover:text-[#f7f2e7]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#7d1d23] via-[#c5a059] to-[#8c6228] rounded-full shadow-[0_0_8px_#c5a059]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Auth & Sound */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Sound Synthesizer Toggle */}
            <button
              onClick={() => sounds.toggle()}
              title={soundOn ? 'Analog Audio Enabled' : 'Muted'}
              className="p-2 border border-[#423326] rounded-full text-[#a89684] hover:text-[#f7f2e7] hover:border-[#c5a059]/60 bg-[#16120f] transition-all"
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-[#c5a059]" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <Link 
                  href={profile?.username ? `/${profile.username}` : '/profile'} 
                  onClick={() => sounds.playTypewriterStrike()}
                  className="flex items-center gap-2 border border-[#423326] py-1.5 px-3 rounded-full hover:border-[#c5a059] bg-[#16120f] transition-all group shadow-sm"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-6 h-6 rounded-full border border-[#c5a059]/50" />
                  ) : (
                    <div className="w-6 h-6 rounded-full wax-seal-emboss text-[#ffdcd9] flex items-center justify-center font-bold text-[9px] uppercase">
                      {(profile?.username || user.email?.charAt(0))?.substring(0, 1)}
                    </div>
                  )}
                  {profile?.username ? (
                    <span className="text-xs font-courier font-bold tracking-wider uppercase text-[#f7f2e7] group-hover:text-[#c5a059] transition-colors">
                      @{profile.username}
                    </span>
                  ) : (
                    <span className="text-[10px] font-courier font-bold tracking-wider uppercase text-[#c5a059]">
                      Set Handle
                    </span>
                  )}
                </Link>
                <button onClick={handleLogout} className="text-[#8c735d] hover:text-[#ff8d8c] p-1.5 transition-colors" title="Seal & Exit">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                className="px-5 py-2 rounded-full wax-seal-emboss text-white font-courier font-bold uppercase text-xs tracking-wider hover:scale-105 active:scale-95 shadow-md transition-all flex items-center gap-1.5"
              >
                <Stamp className="w-3.5 h-3.5 text-[#ffdcd9]" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile Nav Trigger & Sound */}
          <div className="lg:hidden flex items-center gap-1.5 sm:gap-2">
            {user && (
              <Link 
                href={profile?.username ? `/${profile.username}` : '/profile'} 
                className="flex items-center gap-1 border border-[#423326] py-1 px-2.5 rounded-full bg-[#16120f] text-[11px] font-courier font-bold uppercase tracking-wider text-[#c5a059] max-w-[120px] truncate"
              >
                <span className="truncate">@{profile?.username || 'Profile'}</span>
              </Link>
            )}

            <button
              onClick={() => sounds.toggle()}
              title={soundOn ? 'Sound On' : 'Sound Muted'}
              className="p-2 border border-[#423326] rounded-full text-[#a89684] hover:text-[#f7f2e7] bg-[#16120f]"
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-[#c5a059]" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                sounds.playTypewriterStrike();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="text-[#f7f2e7] p-2 border border-[#423326] rounded-lg bg-[#16120f] hover:border-[#c5a059]/60"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu (Styled as an Antique Folded Missive) */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-[#423326] flex flex-col gap-2 pb-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    sounds.playTypewriterStrike();
                    setMobileMenuOpen(false);
                  }}
                  className={`text-xs font-courier tracking-widest uppercase py-2 px-3 rounded ${
                    isActive ? 'bg-[#2a2018] text-[#c5a059] font-bold' : 'text-[#a89684] hover:text-[#f7f2e7]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {!user && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleGoogleLogin();
                }}
                className="mt-2 w-full py-2.5 rounded-full wax-seal-emboss text-white font-courier text-xs font-bold uppercase tracking-wider text-center"
              >
                Sign In to Archive
              </button>
            )}

            {user && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="mt-2 w-full py-2 border border-[#7d1d23]/40 text-[#ff8d8c] font-courier text-xs uppercase tracking-wider rounded text-center"
              >
                Log Out
              </button>
            )}
          </div>
        )}
      </header>
    </div>
  );
};
