import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const S3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(req: NextRequest) {
  try {
    const filename = req.nextUrl.searchParams.get('filename') || 'upload.png';
    const contentType = req.nextUrl.searchParams.get('type') || 'application/octet-stream';
    
    // Read raw body to avoid OpenNext formData fs.readFile error
    const buffer = Buffer.from(await req.arrayBuffer());

    if (buffer.length === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    const ext = filename.split('.').pop() || 'png';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    
    await S3.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
    }));

    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileName}`;

    return NextResponse.json({ url: publicUrl });

  } catch (error: any) {
    console.error('R2 Upload Error:', error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
