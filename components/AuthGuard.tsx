'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [username, setUsername] = useState('');
  const [instagram, setInstagram] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        if (mounted) setLoading(false);
        return;
      }

      if (mounted) setUser(session.user);

      // Fetch profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (mounted) {
        setProfile(prof);
        setLoading(false);
      }
    }

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
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
        .single();

      if (mounted) {
        setProfile(prof);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    if (cleanUsername.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setSaving(true);
    setError('');

    // Check availability
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', cleanUsername)
      .single();

    if (existing && existing.id !== user?.id) {
      setError('Username is already taken');
      setSaving(false);
      return;
    }

    // Update
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ 
        username: cleanUsername,
        instagram_handle: instagram.trim() || null
      })
      .eq('id', user?.id);

    if (updateErr) {
      setError('Failed to save profile. Try again.');
      setSaving(false);
      return;
    }

    // Success! Update local state to dismiss modal
    setProfile({ ...profile, username: cleanUsername, instagram_handle: instagram.trim() });
    setSaving(false);
  };

  if (loading) return null;

  // If user is logged in but hasn't set a username yet, show forced modal
  if (user && profile && !profile.username) {
    return (
      <div className="fixed inset-0 z-[100] bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full border border-white p-8 bg-black shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
          <h2 className="font-serif text-3xl font-bold uppercase tracking-tighter mb-2">Claim Identity</h2>
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-8">
            Create a unique username to send and receive wishes.
          </p>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2">Username *</label>
              <div className="relative">
                <span className="absolute left-4 top-4 text-gray-500 font-bold">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_name"
                  className="w-full pl-8 pr-4 py-3 bg-black border border-white/20 text-white placeholder-gray-600 focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2">Instagram (Optional)</label>
              <div className="relative">
                <span className="absolute left-4 top-4 text-gray-500 font-bold">@</span>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="instagram_handle"
                  className="w-full pl-8 pr-4 py-3 bg-black border border-white/20 text-white placeholder-gray-600 focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest">
                Link your Instagram so receivers can find you.
              </p>
            </div>

            {error && <div className="text-red-500 text-xs font-bold uppercase tracking-widest">{error}</div>}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {saving ? 'SAVING...' : 'CONFIRM IDENTITY'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
