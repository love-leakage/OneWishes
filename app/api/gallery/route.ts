import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Mark dynamic so it executes cleanly on edge / serverless
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('wishes')
      .select('id, sender_username, tier, from_name, to_name, to_username, message, media_url, media_type, privacy, slug, likes_count, created_at')
      .eq('privacy', 'public')
      .order('created_at', { ascending: false })
      .limit(60);

    if (error) {
      console.error('[API /api/gallery] Supabase query error:', error);
      return NextResponse.json(
        { wishes: [], error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { wishes: data || [] },
      {
        headers: {
          // Cache in Cloudflare CDN edge for 60s, stale-while-revalidate for 300s
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (err: any) {
    console.error('[API /api/gallery] Server error:', err);
    return NextResponse.json(
      { wishes: [], error: err.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
