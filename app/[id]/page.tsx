'use client';

import React, { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Heart, Instagram } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DynamicRootPage() {
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [isDate, setIsDate] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [onewish, setOnewish] = useState<any>(null);
  const [wishes, setWishes] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      setLoading(true);

      // Check if ID is a date YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      
      if (dateRegex.test(id)) {
        setIsDate(true);
        // Load the Onewish for this date
        const { data: booking } = await supabase
          .from('onewish_bookings')
          .select('wish_id')
          .eq('booking_date', id)
          .single();

        if (booking) {
          const { data: wish } = await supabase
            .from('wishes')
            .select('*')
            .eq('id', booking.wish_id)
            .single();
          
          setOnewish(wish);
        }
      } else {
        // It's a username, load profile
        setIsDate(false);
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', id)
          .single();

        if (prof) {
          setProfile(prof);
          
          // Load wishes received by this user
          const { data: received } = await supabase
            .from('wishes')
            .select('*')
            .eq('to_username', id)
            .order('created_at', { ascending: false });

          setWishes(received || []);
        }
      }

      setLoading(false);
    }

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-32 text-center text-gray-500 font-bold uppercase tracking-widest text-sm">
        Loading...
      </div>
    );
  }

  if (isDate) {
    if (!onewish) {
      return (
        <div className="max-w-md mx-auto px-4 py-32 text-center space-y-6">
          <h2 className="font-serif text-4xl font-bold text-[#f3eee3] uppercase tracking-tighter">No Onewish Found</h2>
          <p className="text-[#a6b6ad] text-sm uppercase tracking-widest">There is no Onewish booked for {id}.</p>
          <Link href="/onewish" className="inline-block px-8 py-4 bg-[#f3eee3] text-[#141f1b] font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors">
            Book this date
          </Link>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto px-4 py-24 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="font-serif text-5xl font-bold uppercase tracking-tighter text-[#f3eee3]">THE ONEWISH</h1>
          <p className="text-[#72897e] font-bold tracking-widest uppercase text-sm">{id}</p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-10 sm:p-16 border border-[#72897e]/40 bg-[#1a2621] shadow-[8px_8px_0px_0px_rgba(114,137,126,0.2)] space-y-10 relative overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-[#2a3d35] pb-6">
            <Link href={`/${onewish.to_username}`} className="text-sm font-bold tracking-widest text-[#a6b6ad] uppercase hover:text-[#f3eee3] transition-colors">
              TO: {onewish.to_name.toUpperCase()} {onewish.to_username ? `(@${onewish.to_username})` : ''}
            </Link>
            <span className="px-4 py-1.5 bg-[#72897e] text-white text-[10px] font-bold uppercase tracking-widest">
              ONEWISH
            </span>
          </div>

          <p className="font-serif text-2xl sm:text-4xl text-[#f3eee3] leading-loose uppercase italic tracking-wide">
            "{onewish.message}"
          </p>

          {onewish.media_url && (
            <div className="border border-[#2a3d35] p-2 bg-[#121b18]">
              <img src={onewish.media_url} alt="Wish Media" className="w-full h-auto max-h-[500px] object-cover" />
            </div>
          )}

          <div className="pt-8 mt-8 border-t border-[#2a3d35] flex flex-col sm:flex-row items-center justify-between gap-6">
            <Link href={`/${onewish.sender_username}`} className="text-sm text-[#f3eee3] font-bold uppercase tracking-widest hover:text-[#72897e] transition-colors">
              FROM: @{onewish.sender_username}
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center space-y-6">
        <h2 className="font-serif text-4xl font-bold text-[#f3eee3] uppercase tracking-tighter">Profile Not Found</h2>
        <p className="text-[#a6b6ad] text-sm uppercase tracking-widest">The user @{id} does not exist.</p>
        <Link href="/" className="inline-block px-8 py-4 bg-[#f3eee3] text-[#141f1b] font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors shadow-[4px_4px_0px_0px_rgba(114,137,126,0.3)]">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-24 space-y-24">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="w-32 h-32 rounded-full border-4 border-[#72897e] p-1 overflow-hidden bg-[#1a2621]">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
          ) : (
            <div className="w-full h-full bg-[#f3eee3] text-[#141f1b] flex items-center justify-center font-serif text-5xl font-bold uppercase">
              {profile.username.charAt(0)}
            </div>
          )}
        </div>
        
        <h1 className="font-serif text-4xl font-bold uppercase tracking-tighter text-[#f3eee3]">@{profile.username}</h1>
        
        {profile.instagram_handle && (
          <a
            href={`https://instagram.com/${profile.instagram_handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#a6b6ad] hover:text-[#f3eee3] transition-colors"
          >
            <Instagram className="w-4 h-4" />
            Instagram
          </a>
        )}
      </div>

      {/* Received Wishes */}
      <div className="space-y-12">
        <h2 className="font-serif text-2xl font-bold uppercase tracking-tighter text-center border-b border-[#2a3d35] pb-4 text-[#f3eee3]">
          RECEIVED WISHES
        </h2>

        {wishes.length === 0 ? (
          <div className="text-center text-[#a6b6ad] font-bold uppercase tracking-widest text-xs">
            No wishes received yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {wishes.map((w) => (
              <div
                key={w.id}
                className="p-8 bg-[#1a2621] border border-[#2a3d35] hover:border-[#72897e] transition-all flex flex-col justify-between group shadow-[4px_4px_0px_0px_rgba(114,137,126,0.15)] hover:shadow-[6px_6px_0px_0px_rgba(114,137,126,0.3)] min-h-[300px] relative"
              >
                <div 
                  className="space-y-6 cursor-pointer" 
                  onClick={() => {
                    if (w.tier === 'onewish') {
                      const d = w.created_at ? w.created_at.split('T')[0] : '';
                      window.location.href = d ? `/${d}` : '/onewish';
                    } else {
                      window.location.href = `/goldenwish/${w.to_username || id}/1`;
                    }
                  }}
                >
                  <div className="flex items-center justify-between border-b border-[#2a3d35] pb-4">
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                      w.tier === 'golden' ? 'bg-[#e4c067] text-[#141f1b]' : 'bg-[#72897e] text-white'
                    }`}>
                      {w.tier}
                    </span>
                  </div>

                  <p className="text-sm text-[#f3eee3] leading-relaxed line-clamp-4 font-serif italic uppercase">
                    "{w.message}"
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#2a3d35] flex justify-between items-center text-xs font-bold uppercase tracking-widest z-10">
                  <span className="text-[#f3eee3]">FROM: @{w.sender_username}</span>
                  <button 
                    onClick={async (e) => {
                      e.preventDefault();
                      setWishes(wishes.map(wish => wish.id === w.id ? { ...wish, likes_count: wish.likes_count + 1 } : wish));
                      await supabase.from('wishes').update({ likes_count: w.likes_count + 1 }).eq('id', w.id);
                    }}
                    className="flex items-center gap-2 text-[#c67d63] hover:scale-110 transition-transform"
                  >
                    <Heart className="w-4 h-4 fill-current" /> {w.likes_count}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
