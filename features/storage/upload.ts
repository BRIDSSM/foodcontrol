import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';

import { supabase } from '@/lib/supabase';

const BUCKET = 'product-images';
const AVATAR_BUCKET = 'avatars';

export function isLocalUri(uri: string): boolean {
  return uri.startsWith('file://') || uri.startsWith('content://') || !uri.startsWith('http');
}

export function isSupabaseStorageUrl(uri: string): boolean {
  const base = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  return uri.startsWith(base);
}

function extFromUrl(url: string): string {
  const clean = url.split('?')[0].split('#')[0];
  const ext = clean.split('.').pop()?.toLowerCase() ?? '';
  return ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg';
}

export async function uploadProductImage(localUri: string, userId: string): Promise<string> {
  const ext = localUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg';
  const path = `${userId}/${Date.now()}.${safeExt}`;

  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const { data, error } = await supabase.storage.from(BUCKET).upload(path, decode(base64), {
    contentType: `image/${safeExt === 'jpg' ? 'jpeg' : safeExt}`,
    upsert: false,
  });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(data.path);

  return publicUrl;
}

export async function downloadAndUploadImage(remoteUrl: string, userId: string): Promise<string> {
  const ext = extFromUrl(remoteUrl);
  const localPath = `${FileSystem.cacheDirectory}tmp_${Date.now()}.${ext}`;
  const { uri } = await FileSystem.downloadAsync(remoteUrl, localPath);
  try {
    return await uploadProductImage(uri, userId);
  } finally {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  }
}

export async function uploadAvatarImage(localUri: string, userId: string): Promise<string> {
  const ext = localUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg';
  const path = `${userId}/${Date.now()}.${safeExt}`;

  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const { data, error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, decode(base64), {
    contentType: `image/${safeExt === 'jpg' ? 'jpeg' : safeExt}`,
    upsert: false,
  });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(data.path);

  return publicUrl;
}

export async function deleteProductImage(publicUrl: string): Promise<void> {
  const marker = `/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const path = publicUrl.slice(idx + marker.length);
  await supabase.storage.from(BUCKET).remove([path]);
}

export async function deleteAvatarImage(publicUrl: string): Promise<void> {
  const marker = `/${AVATAR_BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const path = publicUrl.slice(idx + marker.length);
  await supabase.storage.from(AVATAR_BUCKET).remove([path]);
}
