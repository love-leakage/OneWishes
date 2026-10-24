'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { JarLoader } from '@/components/JarLoader';

export default function ProfileRedirectPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Opening your profile...');

  useEffect(() => {
    // 1. Instant cache redirect without waiting for network calls
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

    async function resolveProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.replace('/');
        return;
      }

      const { data: prof } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .maybeSingle();

      if (prof?.username) {
        localStorage.setItem('onewishes_cached_profile', JSON.stringify(prof));
        router.replace(`/${prof.username}`);
      } else {
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
