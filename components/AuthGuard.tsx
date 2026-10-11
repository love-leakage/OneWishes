'use client';

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [username, setUsername] = useState('');
  const [instagram, setInstagram] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Availability checking state
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const checkTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          if (mounted) setLoading(false);
          return;
        }

        if (mounted) setUser(session.user);

        // Fetch profile using maybeSingle() so missing rows don't throw 406 errors
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (mounted) {
          setProfile(prof || null);
          setLoading(false);
        }
      } catch (err) {
        console.error('AuthGuard check error:', err);
        if (mounted) setLoading(false);
      }
    }

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (!session?.user) {
          if (mounted) {
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        if (mounted) setUser(session.user);
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (mounted) {
          setProfile(prof || null);
          setLoading(false);
        }
      } catch (err) {
        console.error('AuthGuard onAuthStateChange error:', err);
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Debounced real-time username availability check
  const handleUsernameChange = (val: string) => {
    // Only lowercase alphanumeric and underscores
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(clean);
    setError('');

    if (checkTimerRef.current) {
      clearTimeout(checkTimerRef.current);
    }

    if (clean.length < 3) {
      setIsAvailable(null);
      setCheckingAvailability(false);
      return;
    }

    setCheckingAvailability(true);
    checkTimerRef.current = setTimeout(async () => {
      try {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', clean)
          .maybeSingle();

        if (existing && existing.id !== user?.id) {
          setIsAvailable(false);
        } else {
          setIsAvailable(true);
        }
      } catch (err) {
        setIsAvailable(null);
      } finally {
        setCheckingAvailability(false);
      }
    }, 350);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    if (!cleanUsername) {
      setError('Username is required.');
      return;
    }

    if (cleanUsername.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    if (cleanUsername.length > 20) {
      setError('Username must be 20 characters or less.');
      return;
    }

    setSaving(true);
    setError('');

    // Strict uniqueness check before saving
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', cleanUsername)
      .maybeSingle();

    if (existing && existing.id !== user.id) {
      setError('This username is already taken. Please choose another.');
      setIsAvailable(false);
      setSaving(false);
      return;
    }

    // Upsert profile record so first-time users always have a valid profile created
    const { data: updatedProf, error: upsertErr } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id,
        email: user.email,
        username: cleanUsername,
        instagram_handle: instagram.trim() ? instagram.trim().replace(/^@/, '') : null,
        avatar_url: user.user_metadata?.avatar_url || null,
        golden_used: profile?.golden_used || 0
      }, { onConflict: 'id' })
      .select()
      .single();

    if (upsertErr) {
      if (upsertErr.code === '23505' || upsertErr.message?.toLowerCase().includes('unique')) {
        setError('This username is already taken. Please choose another.');
      } else {
        setError('Failed to save username. Please try again.');
      }
      setSaving(false);
      return;
    }

    // Success! Update local profile state to close the modal
    const finalProfile = updatedProf || { ...profile, id: user.id, username: cleanUsername };
    setProfile(finalProfile);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('onewishes:profile-updated', { detail: finalProfile }));
    }
    setSaving(false);
  };

  // Show modal ONLY when user is logged in for the first time without a username
  const needsUsername = user && (!profile || !profile.username);

  return (
    <>
      {children}

      {!loading && needsUsername && (
        <div className="fixed inset-0 z-[100] bg-[#141f1b]/95 backdrop-blur-md text-[#f3eee3] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#1a2621] border border-[#2a3d35] p-8 sm:p-10 shadow-[8px_8px_0px_0px_rgba(114,137,126,0.25)] space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#e4c067]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>First Time Sign In</span>
              </div>
              <h2 className="font-serif text-3xl font-bold uppercase tracking-tighter text-[#f3eee3]">
                Claim Your Username
              </h2>
              <p className="text-xs text-[#a6b6ad] uppercase tracking-wider leading-relaxed">
                One username per user. This is your permanent, unique handle on OneWishes.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#f3eee3] mb-2">
                  Unique Username *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-4 text-[#72897e] font-bold text-sm">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="your_handle"
                    maxLength={20}
                    autoFocus
                    required
                    className="w-full pl-9 pr-4 py-3.5 bg-[#121b18] border border-[#2a3d35] text-[#f3eee3] placeholder-[#425e52] focus:outline-none focus:border-[#72897e] transition-colors font-bold tracking-wider text-sm"
                  />
                </div>

                {/* Real-time availability indicator */}
                <div className="mt-2 text-[11px] font-bold tracking-wide">
                  {checkingAvailability && (
                    <span className="text-[#a6b6ad] uppercase">Checking availability...</span>
                  )}
                  {!checkingAvailability && isAvailable === true && username.length >= 3 && (
                    <span className="text-[#72897e] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      @{username} is available!
                    </span>
                  )}
                  {!checkingAvailability && isAvailable === false && (
                    <span className="text-[#c67d63] flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      @{username} is already taken. Please choose another.
                    </span>
                  )}
                  {!checkingAvailability && isAvailable === null && (
                    <span className="text-[#72897e] text-[10px] uppercase tracking-wider">
                      3–20 characters. Lowercase letters, numbers & underscores only.
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#f3eee3] mb-2">
                  Instagram Handle <span className="text-[#72897e] font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-4 text-[#72897e] font-bold text-sm">@</span>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="instagram_handle"
                    maxLength={30}
                    className="w-full pl-9 pr-4 py-3.5 bg-[#121b18] border border-[#2a3d35] text-[#f3eee3] placeholder-[#425e52] focus:outline-none focus:border-[#72897e] transition-colors font-medium tracking-wider text-sm"
                  />
                </div>
                <p className="text-[10px] text-[#72897e] mt-1.5 uppercase tracking-wider">
                  Optional: Link your Instagram so friends can find and verify you.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-[#c67d63]/10 border border-[#c67d63]/40 text-[#c67d63] text-xs font-bold uppercase tracking-wider">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={saving || checkingAvailability || isAvailable === false || username.length < 3}
                className="w-full py-4 bg-[#f3eee3] text-[#141f1b] font-bold uppercase tracking-widest text-xs hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(114,137,126,0.3)]"
              >
                {saving ? 'CONFIRMING IDENTITY...' : 'CONFIRM USERNAME'}
              </button>

              <p className="text-[10px] text-center text-[#72897e] uppercase tracking-widest">
                Rule: 1 User = 1 Permanent Username
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
