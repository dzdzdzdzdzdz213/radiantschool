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

/**
 * Uploads a course image to the `courses` bucket. Returns the storage path.
 */
export async function uploadCourseImage(courseId: number, file: File): Promise<string> {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed for course images.');
  }
  if (file.size > maxSize) {
    throw new Error('File too large. Course images must be under 5MB.');
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${courseId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(COURSE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type,
  });
  if (uploadError) throw ApiError.fromPostgrest({ message: uploadError.message, code: String(uploadError.cause ?? ''), details: uploadError });

  return path;
}


