import { supabase } from './supabase';

const BUCKET = 'avatars';

/**
 * Resolves an avatar path to a public URL.
 * Returns `null` for null/undefined paths; passes through absolute URLs.
 */
export function getAvatarUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Uploads a file to the `avatars` Supabase Storage bucket and updates
 * the user's `photo_url` in the database. Returns the storage path.
 */
export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type,
  });
  if (uploadError) throw uploadError;

  const { error: dbError } = await supabase.from('users').update({ photo_url: path }).eq('id', userId);
  if (dbError) throw dbError;

  return path;
}


