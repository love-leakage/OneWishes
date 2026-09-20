/**
 * Cloudflare R2 Upload Helper & Presigned URL Generator
 * Works with Next.js (API Routes / Server Actions) and Node.js environments.
 * 
 * Required NPM packages:
 * npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'onewishes-media';
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';

// Initialize S3Client pointing to Cloudflare R2 endpoint
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || '',
    secretAccessKey: R2_SECRET_ACCESS_KEY || '',
  },
});

/**
 * Uploads a file buffer directly to Cloudflare R2
 * @param {Buffer | ArrayBuffer} fileBuffer File data buffer
 * @param {string} filename Destination filename (e.g. wishes/wish-123.jpg)
 * @param {string} mimeType File content type (e.g. image/jpeg)
 * @returns {Promise<string>} Public URL of the uploaded object
 */
export async function uploadToR2(fileBuffer, filename, mimeType = 'image/jpeg') {
  const key = `uploads/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await r2Client.send(command);

  // Return public URL or R2 endpoint path
  return R2_PUBLIC_URL 
    ? `${R2_PUBLIC_URL}/${key}`
    : `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${key}`;
}

/**
 * Generates a presigned upload URL for direct browser-to-R2 upload
 * @param {string} filename Destination filename
 * @param {string} mimeType File content type
 * @returns {Promise<{ uploadUrl: string, publicUrl: string, key: string }>}
 */
export async function createPresignedUploadUrl(filename, mimeType = 'image/jpeg') {
  const key = `uploads/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: mimeType,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
  const publicUrl = R2_PUBLIC_URL 
    ? `${R2_PUBLIC_URL}/${key}`
    : `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${key}`;

  return { uploadUrl, publicUrl, key };
}
