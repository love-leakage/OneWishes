'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { JarLoader } from '@/components/JarLoader';

export default function ProfileRedirectPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Opening your profile...');

  useEffect(() => {
    async function resolveProfile() {
      // 1. Check local cache first for instant navigation
      try {
        const cached = localStorage.getItem('onewishes_cached_profile');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.username) {
            router.replace(`/${parsed.username}`);
            return;
          }
        }
      } catch (e) {}

      // 2. Fetch Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setStatus('Please sign in to view your profile...');
        setTimeout(() => {
          router.replace('/');
        }, 1200);
        return;
      }

      // 3. Fetch profile record
      const { data: prof } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .maybeSingle();

      if (prof?.username) {
        localStorage.setItem('onewishes_cached_profile', JSON.stringify(prof));
        router.replace(`/${prof.username}`);
      } else {
        // User logged in but hasn't set username yet -> return home so AuthGuard opens handle modal
        setStatus('Setting up your profile...');
        router.replace('/');
      }
    }

    resolveProfile();
  }, [router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <JarLoader text="ONEWISHES" subtext={status} size="lg" />
    </div>
  );
}
