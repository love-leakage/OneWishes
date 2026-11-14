/**
 * Smart Client-Side Media Compressor for OneWishes
 * Compresses heavy photos without visible quality loss (max 2048px, 0.88 webp/jpeg),
 * while preserving animated GIFs and videos completely intact.
 */

export interface CompressedMediaResult {
  file: File;
  previewUrl: string;
  type: 'image' | 'video';
  originalSize: number;
  compressedSize: number;
  compressionRatioPercent: number;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export async function compressMedia(file: File): Promise<CompressedMediaResult> {
  const originalSize = file.size;
  const isVideo = file.type.startsWith('video/');
  const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');

  // 1. If video or animated GIF, keep original file so animation frames & audio are never lost
  if (isVideo || isGif) {
    return {
      file,
      previewUrl: URL.createObjectURL(file),
      type: isVideo ? 'video' : 'image',
      originalSize,
      compressedSize: originalSize,
      compressionRatioPercent: 0,
    };
  }

  // 2. High-quality image compression using modern Canvas API
  try {
    const bitmap = await createImageBitmap(file);
    const origW = bitmap.width;
    const origH = bitmap.height;

    // Max bounds: 2048px (Ultra HD 2K). Keeps typography and faces razor-sharp.
    const MAX_DIM = 2048;
    let targetW = origW;
    let targetH = origH;

    if (origW > MAX_DIM || origH > MAX_DIM) {
      if (origW > origH) {
        targetW = MAX_DIM;
        targetH = Math.round((origH * MAX_DIM) / origW);
      } else {
        targetH = MAX_DIM;
        targetW = Math.round((origW * MAX_DIM) / origH);
      }
    }

    // Render using OffscreenCanvas (if available) or standard canvas
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas 2D context not available');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    bitmap.close();

    // Determine best output format: WebP offers 30-50% smaller size than JPEG at identical quality
    const outputFormat = 'image/webp';
    const quality = 0.88; // Sweet spot: perceptually lossless to human eye

    const blob: Blob | null = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), outputFormat, quality);
    });

    if (!blob) {
      throw new Error('Canvas toBlob failed');
    }

    // If compressed blob is somehow larger than original, keep original file
    if (blob.size >= originalSize) {
      return {
        file,
        previewUrl: URL.createObjectURL(file),
        type: 'image',
        originalSize,
        compressedSize: originalSize,
        compressionRatioPercent: 0,
      };
    }

    const newExt = outputFormat === 'image/webp' ? 'webp' : 'jpg';
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const compressedFile = new File([blob], `${baseName}.${newExt}`, {
      type: outputFormat,
      lastModified: Date.now(),
    });

    const ratio = Math.round(((originalSize - blob.size) / originalSize) * 100);

    return {
      file: compressedFile,
      previewUrl: URL.createObjectURL(blob),
      type: 'image',
      originalSize,
      compressedSize: blob.size,
      compressionRatioPercent: ratio,
    };
  } catch (err) {
    console.warn('Client-side compression fallback to original file:', err);
    return {
      file,
      previewUrl: URL.createObjectURL(file),
      type: 'image',
      originalSize,
      compressedSize: originalSize,
      compressionRatioPercent: 0,
    };
  }
}

