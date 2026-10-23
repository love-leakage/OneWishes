'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { sounds } from '@/lib/sounds';

interface WishLikeButtonProps {
  wishId: string;
  initialLikes?: number;
  className?: string;
  showText?: boolean;
}

export function WishLikeButton({
  wishId,
  initialLikes = 0,
  className = '',
  showText = false,
}: WishLikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);

  useEffect(() => {
    setLikes(initialLikes);
  }, [initialLikes]);

  useEffect(() => {
    async function checkLikedStatus() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && typeof window !== 'undefined') {
        const likedWishes = JSON.parse(localStorage.getItem(`onewishes_liked_${session.user.id}`) || '[]');
        if (likedWishes.includes(wishId)) {
          setHasLiked(true);
        }
      }
    }
    checkLikedStatus();
  }, [wishId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    // 1. Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setShowSignInPrompt(true);
      return;
    }

    // 2. Check if already liked by this user
    const storageKey = `onewishes_liked_${session.user.id}`;
    const likedWishes: string[] = JSON.parse(localStorage.getItem(storageKey) || '[]');

    if (likedWishes.includes(wishId)) {
      // Already liked
      sounds.playHeart();
      return;
    }

    // 3. User is logged in & hasn't liked yet -> increment!
    setLoading(true);
    sounds.playHeart();
    setLikes((prev) => prev + 1);
    setHasLiked(true);

    try {
      // Save locally so the user cannot spam
      likedWishes.push(wishId);
      localStorage.setItem(storageKey, JSON.stringify(likedWishes));

      // Call Supabase atomic RPC
      const { data, error } = await supabase.rpc('increment_wish_likes', { target_wish_id: wishId });
      if (!error && typeof data === 'number') {
        setLikes(data);
      }
    } catch (err) {
      console.error('Error updating like count:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href },
    });
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleLike}
        disabled={loading}
        title={hasLiked ? 'You loved this wish' : 'Sign in to love this wish'}
        className={`flex items-center gap-1.5 transition-all group ${
          hasLiked ? 'text-[#c67d63] scale-105' : 'text-[#a6b6ad] hover:text-[#c67d63]'
        } ${className}`}
      >
        <Heart
          className={`w-4 h-4 transition-transform group-hover:scale-125 ${
            hasLiked ? 'fill-current text-[#c67d63]' : 'fill-none'
          }`}
        />
        <span className="font-mono text-xs font-bold">{likes}</span>
        {showText && <span className="text-[10px] uppercase tracking-wider ml-0.5">{hasLiked ? 'Loved' : 'Love'}</span>}
      </button>

      {/* Sign In Prompt Overlay Modal if not logged in */}
      {showSignInPrompt && (
        <div 
          onClick={(e) => { e.stopPropagation(); setShowSignInPrompt(false); }}
          className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="max-w-sm w-full bg-[#1a2621] border border-[#2a3d35] p-6 text-center space-y-4 shadow-[8px_8px_0px_0px_rgba(114,137,126,0.3)] animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-[#c67d63]/20 flex items-center justify-center text-[#c67d63]">
              <Heart className="w-6 h-6 fill-current" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-[#f3eee3] uppercase tracking-wide">
                Sign In to Love Wishes
              </h3>
              <p className="text-xs text-[#a6b6ad] leading-relaxed">
                Every wish is rare and personal. Sign in with Google to seal your love on this wish.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleSignIn}
                className="w-full py-3 bg-[#f3eee3] hover:bg-white text-[#141f1b] font-bold text-xs uppercase tracking-widest transition-all shadow-[2px_2px_0px_0px_rgba(114,137,126,0.3)]"
              >
                Sign In with Google
              </button>
              <button
                onClick={() => setShowSignInPrompt(false)}
                className="w-full py-2 text-[11px] text-[#72897e] hover:text-[#f3eee3] font-bold uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
