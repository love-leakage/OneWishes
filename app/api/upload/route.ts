import { NextRequest, NextResponse } from 'next/server';
import { AwsClient } from 'aws4fetch';

export const dynamic = 'force-dynamic';

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
    
    const aws = new AwsClient({
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      service: 's3',
    });

    const url = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}/${fileName}`;

    const r2Res = await aws.fetch(url, {
      method: 'PUT',
      body: arrayBuffer,
      headers: {
        'Content-Type': contentType
      }
    });

    if (!r2Res.ok) {
      const errorText = await r2Res.text();
      throw new Error(`R2 upload failed: ${r2Res.status} ${errorText}`);
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileName}`;

    return NextResponse.json({ url: publicUrl, filename: fileName });

  } catch (error: any) {
    console.error('R2 Upload Error:', error);
    return NextResponse.json({ error: error.stack || error.message || String(error) }, { status: 500 });
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

    const aws = new AwsClient({
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      service: 's3',
    });

    const url = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}/${cleanKey}`;

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
