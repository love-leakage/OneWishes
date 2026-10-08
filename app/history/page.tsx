'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { History, Trash2, ExternalLink, Shield } from 'lucide-react';

interface Wish {
  id: string;
  tier: string;
  to_name: string;
  message: string;
  slug: string;
  privacy: string;
  created_at: string;
}

export default function HistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      if (session?.user) {
        const { data } = await supabase
          .from('wishes')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        setWishes(data || []);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this wish permanently?')) return;
    await supabase.from('wishes').delete().eq('id', id);
    setWishes(wishes.filter((w) => w.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase">
          <History className="w-3.5 h-3.5" />
          <span>User Identity Dashboard</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">My Wish History</h1>
        <p className="text-slate-400 text-sm">All wishes created under your verified account.</p>
      </div>

      {!user ? (
        <div className="text-center py-20 p-8 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-4">
          <p className="text-slate-400 text-sm">Please sign in to view your history dashboard.</p>
        </div>
      ) : loading ? (
        <div className="text-slate-400 text-center py-20 text-sm">Loading your wish history...</div>
      ) : wishes.length === 0 ? (
        <div className="text-center py-20 p-8 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-4">
          <p className="text-slate-400 text-sm">You haven't created any wishes yet.</p>
          <Link
            href="/#create-section"
            className="inline-block px-6 py-3 rounded-xl bg-amber-400 text-black font-bold text-xs"
          >
            Create Your First Wish →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishes.map((w) => (
            <div
              key={w.id}
              className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                    {w.tier}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">{w.privacy}</span>
                </div>

                <h3 className="font-semibold text-lg text-white">To {w.to_name}</h3>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 italic font-serif">
                  "{w.message}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <Link
                  href={`/w/${w.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  <span>View Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => handleDelete(w.id)}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
