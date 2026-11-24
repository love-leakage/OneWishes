import { NextRequest, NextResponse } from 'next/server';
import { AwsClient } from 'aws4fetch';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const dynamic = 'force-dynamic';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '345d185c9fe7e00e3d8a0a134d5e2cd0';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || 'bcef4664319f027b53bd0b7888c4318b';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '9ec76d7157aaab298f97f006e0b2d7ed6906508223e591ef658a1f9d049ad88e';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'onewishes-media';
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-0352e4f2bd9f47b09ea1e45720a8a004.r2.dev';

/**
 * GET: Fast Presigned URL generator (< 1ms Worker CPU)
 * Allows client browser to upload directly to Cloudflare R2 storage without hitting Worker CPU limits.
 */
export async function GET(req: NextRequest) {
  try {
    const filename = req.nextUrl.searchParams.get('filename') || 'upload.webp';
    const contentType = req.nextUrl.searchParams.get('type') || 'image/webp';
    const ext = filename.split('.').pop() || 'webp';
    const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, '');
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${cleanExt}`;

    const aws = new AwsClient({
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
      service: 's3',
    });

    const targetUrl = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${fileName}`;
    const signedReq = await aws.sign(targetUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      aws: { signQuery: true },
    });

    const publicUrl = `${R2_PUBLIC_URL}/${fileName}`;

    return NextResponse.json({
      uploadUrl: signedReq.url,
      publicUrl,
      filename: fileName,
    });
  } catch (error: any) {
    console.error('Presign URL Error:', error);
    return NextResponse.json({ error: error.message || 'Presign failed' }, { status: 500 });
  }
}

/**
 * POST: Server-side upload supporting both multipart/form-data and direct binary
 */
export async function POST(req: NextRequest) {
  try {
    let arrayBuffer: ArrayBuffer;
    let fileName: string;
    let contentType = 'image/jpeg';

    const reqContentType = req.headers.get('content-type') || '';

    if (reqContentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No file provided in form data' }, { status: 400 });
      }
      arrayBuffer = await file.arrayBuffer();
      contentType = file.type || 'image/jpeg';
      const origName = file.name || 'image.jpg';
      const ext = origName.split('.').pop() || (contentType.includes('webp') ? 'webp' : 'jpg');
      const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, '');
      fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${cleanExt}`;
    } else {
      const filenameParam = req.nextUrl.searchParams.get('filename') || 'upload.jpg';
      contentType = req.nextUrl.searchParams.get('type') || reqContentType || 'application/octet-stream';
      arrayBuffer = await req.arrayBuffer();
      const ext = filenameParam.split('.').pop() || 'jpg';
      const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, '');
      fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${cleanExt}`;
    }

    if (arrayBuffer.byteLength === 0) {
      return NextResponse.json({ error: 'Uploaded file is empty' }, { status: 400 });
    }
    
    // 1. Try Native Cloudflare R2 Binding first (instant edge write)
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

/**
 * DELETE: Immediate purge of media from R2 storage
 */
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
