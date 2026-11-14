'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { sounds } from '@/lib/sounds';

interface WishLikeButtonProps {
  wishId: string;
  initialLikes?: number;
  showText?: boolean;
  className?: string;
}

export const WishLikeButton: React.FC<WishLikeButtonProps> = ({
  wishId,
  initialLikes = 0,
  showText = false,
  className = '',
}) => {
  const [likes, setLikes] = useState<number>(initialLikes);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState<boolean>(false);

  useEffect(() => {
    setLikes(initialLikes);
  }, [initialLikes]);

  // Check if current user has already liked this wish
  useEffect(() => {
    let isMounted = true;
    async function checkLikeStatus() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          // If not logged in, check local storage for guest like history
          if (typeof window !== 'undefined') {
            const guestLikes = JSON.parse(localStorage.getItem('onewishes_liked_wishes') || '[]');
            if (isMounted && guestLikes.includes(wishId)) {
              setHasLiked(true);
            }
          }
          return;
        }

        const { data, error } = await supabase
          .from('wish_likes')
          .select('id')
          .eq('wish_id', wishId)
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (!error && data && isMounted) {
          setHasLiked(true);
        }
      } catch (err) {
        // Silently catch network or schema errors
      }
    }

    checkLikeStatus();
    return () => { isMounted = false; };
  }, [wishId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading || hasLiked) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setShowSignInPrompt(true);
      return;
    }

    // Optimistic UI update
    setHasLiked(true);
    setLikes((prev) => prev + 1);
    sounds.playHeart();

    // Cache locally
    try {
      const guestLikes = JSON.parse(localStorage.getItem('onewishes_liked_wishes') || '[]');
      if (!guestLikes.includes(wishId)) {
        guestLikes.push(wishId);
        localStorage.setItem('onewishes_liked_wishes', JSON.stringify(guestLikes));
      }
    } catch (e) {}

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('increment_wish_likes', {
        target_wish_id: wishId,
      });

      if (error) {
        console.warn('RPC like increment failed, falling back to direct table insert:', error);
        await supabase.from('wish_likes').insert([
          { wish_id: wishId, user_id: session.user.id }
        ]);
      } else if (typeof data === 'number') {
        setLikes(data);
      }
    } catch (err) {
      console.error('Failed to register like:', err);
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
          hasLiked ? 'text-[#e5c07b] scale-105 drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]' : 'text-[#b5afa6] hover:text-[#f5f2eb]'
        } ${className}`}
      >
        <Heart
          className={`w-4 h-4 transition-transform group-hover:scale-125 ${
            hasLiked ? 'fill-current text-[#d4af37]' : 'fill-none'
          }`}
        />
        <span className="font-mono text-xs font-bold">{likes}</span>
        {showText && <span className="text-[10px] uppercase tracking-wider ml-0.5">{hasLiked ? 'Loved' : 'Love'}</span>}
      </button>

      {/* Sign In Prompt Overlay Modal if not logged in */}
      {showSignInPrompt && (
        <div 
          onClick={(e) => { e.stopPropagation(); setShowSignInPrompt(false); }}
          className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="max-w-sm w-full bg-[#09090c] border border-[#d4af37]/30 p-6 text-center space-y-4 shadow-[0_0_40px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 duration-200 rounded-sm"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-[#14120e] border border-[#d4af37]/40 flex items-center justify-center text-[#e5c07b] shadow-[0_0_16px_rgba(212,175,55,0.3)]">
              <Heart className="w-6 h-6 fill-current text-[#d4af37]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-[#f5f2eb] uppercase tracking-wide">
                Sign In to Love Wishes
              </h3>
              <p className="text-xs text-[#b5afa6] leading-relaxed">
                Every wish is rare and personal. Sign in with Google to seal your love on this wish.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleSignIn}
                className="w-full py-3 bg-gradient-to-r from-[#d4af37] via-[#e5c07b] to-[#b38728] text-[#050505] font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_16px_rgba(212,175,55,0.3)] hover:opacity-95 rounded-sm"
              >
                Sign In with Google
              </button>
              <button
                onClick={() => setShowSignInPrompt(false)}
                className="w-full py-2 text-[11px] text-[#7a756f] hover:text-[#f5f2eb] font-bold uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
