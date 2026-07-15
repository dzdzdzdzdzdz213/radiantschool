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
export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 2 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed for avatars.');
  }
  if (file.size > maxSize) {
    throw new Error('File too large. Avatar images must be under 2MB.');
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type,
  });
  if (uploadError) throw ApiError.fromPostgrest({ message: uploadError.message, code: String(uploadError.cause ?? ''), details: uploadError });

  const { error: dbError } = await supabase.from('users').update({ photo_url: path }).eq('id', userId);
  if (dbError) throw ApiError.fromPostgrest({ message: dbError.message, code: dbError.code, details: dbError.details });

  return path;
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

function convertToWebP(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not available')); return; }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('WebP conversion failed'));
        },
        'image/webp',
        0.85,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
}

/**
 * Uploads a course image to the `courses` bucket. Converts to WebP automatically. Returns the storage path.
 */
export async function uploadCourseImage(courseId: number, file: File): Promise<string> {
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File too large. Course images must be under 5MB.');
  }

  const webpBlob = await convertToWebP(file);
  const webpFile = new File([webpBlob], `${Date.now()}.webp`, { type: 'image/webp' });
  const path = `${courseId}/${Date.now()}.webp`;

  const { error: uploadError } = await supabase.storage.from(COURSE_BUCKET).upload(path, webpFile, {
    cacheControl: '3600',
    upsert: true,
    contentType: 'image/webp',
  });
  if (uploadError) throw ApiError.fromPostgrest({ message: uploadError.message, code: String(uploadError.cause ?? ''), details: uploadError });

  return path;
}


