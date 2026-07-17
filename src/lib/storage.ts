import { supabase } from './supabase';
import { ApiError } from './api';

const AVATAR_BUCKET = 'avatars';
const COURSE_BUCKET = 'courses';

/**
 * Resolves an avatar path to a public URL.
 * Returns `null` for null/undefined paths; passes through absolute URLs.
 */
export function getAvatarUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Uploads a file to the `avatars` Supabase Storage bucket and updates
 * the user's `photo_url` in the database. Returns the storage path.
 */
function resizeImage(img: HTMLImageElement, maxDim: number): { width: number; height: number } {
  let { width, height } = img;
  if (width <= maxDim && height <= maxDim) return { width, height };
  const ratio = Math.min(maxDim / width, maxDim / height);
  return { width: Math.round(width * ratio), height: Math.round(height * ratio) };
}

function convertToWebP(file: File, maxDim = 256): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { width, height } = resizeImage(img, maxDim);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not available')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('WebP conversion failed'));
        },
        'image/webp',
        0.8,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
}

export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File too large. Avatar images must be under 5MB.');
  }

  let uploadFile = file;
  let uploadPath: string;
  let uploadContentType: string;

  try {
    const webpBlob = await convertToWebP(file);
    uploadPath = `${userId}/${Date.now()}.webp`;
    uploadFile = new File([webpBlob], `${Date.now()}.webp`, { type: 'image/webp' });
    uploadContentType = 'image/webp';
  } catch {
    const ext = file.name.split('.').pop() || 'jpg';
    uploadPath = `${userId}/${Date.now()}.${ext}`;
    uploadContentType = file.type || 'image/jpeg';
  }

  const { error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(uploadPath, uploadFile, {
    cacheControl: '3600',
    upsert: true,
    contentType: uploadContentType,
  });
  if (uploadError) throw ApiError.fromPostgrest({ message: uploadError.message, code: String(uploadError.cause ?? ''), details: uploadError });

  const { error: dbError } = await supabase.from('users').update({ photo_url: uploadPath }).eq('id', userId);
  if (dbError) throw ApiError.fromPostgrest({ message: dbError.message, code: dbError.code, details: dbError.details });

  return uploadPath;
}

/**
 * Resolves a course image path to a public URL.
 * Returns `null` for null/undefined paths; passes through absolute URLs.
 */
export function getCourseImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const { data } = supabase.storage.from(COURSE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Uploads a course image to the `courses` bucket. Converts to WebP automatically. Returns the storage path.
 */
export async function uploadCourseImage(courseId: number, file: File): Promise<string> {
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File too large. Course images must be under 5MB.');
  }

  const webpBlob = await convertToWebP(file, 1200);
  const path = `${courseId}/${Date.now()}.webp`;
  const webpFile = new File([webpBlob], `${Date.now()}.webp`, { type: 'image/webp' });

  const { error: uploadError } = await supabase.storage.from(COURSE_BUCKET).upload(path, webpFile, {
    cacheControl: '3600',
    upsert: true,
    contentType: 'image/webp',
  });
  if (uploadError) throw ApiError.fromPostgrest({ message: uploadError.message, code: String(uploadError.cause ?? ''), details: uploadError });

  return path;
}


