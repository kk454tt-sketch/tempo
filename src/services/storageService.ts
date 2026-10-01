import { EventPhoto } from '@/types';
import { validateImageUpload } from '@/utils/validation';
import { isSupabaseConfigured, supabase } from '@/services/supabase';

class StorageService {
  /**
   * Upload and process an image file.
   * Uploads creator media to Supabase Storage and stores only its public URL.
   */
  public async uploadImage(file: File): Promise<{ success: boolean; photo?: EventPhoto; error?: string }> {
    const validation = validateImageUpload(file);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    try {
      if (!isSupabaseConfigured) return { success: false, error: 'Connect Supabase before uploading photos.' };
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Sign in before uploading photos.' };
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const objectPath = `${user.id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from('tempo-event-media').upload(objectPath, file, {
        cacheControl: '31536000', upsert: false, contentType: file.type,
      });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('tempo-event-media').getPublicUrl(objectPath);
      const photo: EventPhoto = {
        id: objectPath,
        url: publicUrl,
        caption: file.name.replace(/\.[^/.]+$/, ''),
        isCover: false,
        altText: file.name,
      };

      return { success: true, photo };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Image upload failed' };
    }
  }

  /**
   * Helper to create a photo object from a direct URL (e.g. Unsplash, CDN).
   */
  public createPhotoFromUrl(url: string, caption = 'Event Photo'): EventPhoto {
    return {
      id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      url: url.trim(),
      caption: caption.trim(),
      isCover: false,
      altText: caption.trim(),
    };
  }

  public async deleteImage(photoId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !photoId.includes('/')) return false;
    const { error } = await supabase.storage.from('tempo-event-media').remove([photoId]);
    return !error;
  }

}

export const storageService = new StorageService();
