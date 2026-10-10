import { NextRequest, NextResponse } from 'next/server';
import { AwsClient } from 'aws4fetch';

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

    return NextResponse.json({ url: publicUrl });

  } catch (error: any) {
    console.error('R2 Upload Error:', error);
    return NextResponse.json({ error: error.stack || error.message || String(error) }, { status: 500 });
  }
}
