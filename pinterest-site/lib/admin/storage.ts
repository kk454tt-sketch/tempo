// Shared by the browser (pre-checks) and the server (real checks).

export const STORAGE_BUCKET = 'product-images';
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_PICKER_BYTES = 10 * 1024 * 1024;
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_GALLERY = 4;
export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;
export const IMAGE_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

export function validateImageFile(
  file: { type: string; size: number },
  maxBytes = MAX_IMAGE_BYTES,
): string | null {
  if (!(IMAGE_TYPES as readonly string[]).includes(file.type)) return 'Use a PNG, JPG or WEBP image.';
  if (file.size <= 0) return 'This file is empty.';
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    return `Image must be ${mb}MB or smaller.`;
  }
  return null;
}

/** Returns the object path inside the bucket, or null if the URL is not one of our Storage URLs. */
export function storagePathFromUrl(url: string): string | null {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '');
  const prefix = `${base}/storage/v1/object/public/${STORAGE_BUCKET}/`;
  if (!base || !url.startsWith(prefix)) return null;
  try {
    return decodeURIComponent(url.slice(prefix.length).split('?')[0]);
  } catch {
    return null;
  }
}
