import { NextRequest, NextResponse } from 'next/server';
import { AwsClient } from 'aws4fetch';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const dynamic = 'force-dynamic';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '345d185c9fe7e00e3d8a0a134d5e2cd0';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || 'bcef4664319f027b53bd0b7888c4318b';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '9ec76d7157aaab298f97f006e0b2d7ed6906508223e591ef658a1f9d049ad88e';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'onewishes-media';
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-0352e4f2bd9f47b09ea1e45720a8a004.r2.dev';

export async function POST(req: NextRequest) {
  try {
    const filename = req.nextUrl.searchParams.get('filename') || 'upload.png';
    const contentType = req.nextUrl.searchParams.get('type') || 'application/octet-stream';
    
    // Read raw body
    const arrayBuffer = await req.arrayBuffer();

    if (arrayBuffer.byteLength === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    const ext = filename.split('.').pop() || 'png';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    
    // 1. Try Native Cloudflare R2 Binding first (0ms CPU, instant edge write)
    try {
      const { env } = getCloudflareContext();
      if (env && (env as any).R2_BUCKET) {
        await (env as any).R2_BUCKET.put(fileName, arrayBuffer, {
          httpMetadata: { contentType },
        });
        const publicUrl = `${R2_PUBLIC_URL}/${fileName}`;
        return NextResponse.json({ url: publicUrl, filename: fileName });
      }
    } catch (cfErr) {
      console.warn('Native R2 binding not available, using S3 API fallback:', cfErr);
    }

    // 2. S3 API Fallback via aws4fetch
    const aws = new AwsClient({
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
      service: 's3',
    });

    const url = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${fileName}`;

    const r2Res = await aws.fetch(url, {
      method: 'PUT',
      body: arrayBuffer,
      headers: {
        'Content-Type': contentType,
      },
    });

    if (!r2Res.ok) {
      const errorText = await r2Res.text();
      throw new Error(`R2 upload failed: ${r2Res.status} ${errorText}`);
    }

    const publicUrl = `${R2_PUBLIC_URL}/${fileName}`;

    return NextResponse.json({ url: publicUrl, filename: fileName });

  } catch (error: any) {
    console.error('R2 Upload Error:', error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const rawUrl = req.nextUrl.searchParams.get('url');
    const filenameParam = req.nextUrl.searchParams.get('filename');

    let key: string | null = filenameParam;
    if (!key && rawUrl) {
      try {
        const u = new URL(rawUrl);
        key = u.pathname.replace(/^\/+/, '');
      } catch (e) {
        key = rawUrl.split('/').pop() || null;
      }
    }

    if (!key) {
      return NextResponse.json({ error: 'No filename or url provided' }, { status: 400 });
    }

    // Security check: only allow alphanumeric, dots, dashes, underscores
    const cleanKey = key.replace(/[^a-zA-Z0-9.\-_]/g, '');

    // 1. Try Native Cloudflare R2 Binding first
    try {
      const { env } = getCloudflareContext();
      if (env && (env as any).R2_BUCKET) {
        await (env as any).R2_BUCKET.delete(cleanKey);
        return NextResponse.json({ success: true, deleted: cleanKey });
      }
    } catch (cfErr) {
      console.warn('Native R2 delete binding not available, using S3 fallback:', cfErr);
    }

    // 2. S3 API Fallback via aws4fetch
    const aws = new AwsClient({
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
      service: 's3',
    });

    const url = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${cleanKey}`;

    const r2Res = await aws.fetch(url, {
      method: 'DELETE',
    });

    if (!r2Res.ok && r2Res.status !== 204 && r2Res.status !== 404) {
      const errorText = await r2Res.text();
      throw new Error(`R2 delete failed: ${r2Res.status} ${errorText}`);
    }

    return NextResponse.json({ success: true, deleted: cleanKey });
  } catch (error: any) {
    console.error('R2 Delete Error:', error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
