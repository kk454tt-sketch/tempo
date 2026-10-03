import { EventPhoto } from '@/types';
import { validateImageUpload } from '@/utils/validation';

class StorageService {
  /**
   * Upload and process an image file.
   * Compresses to high-quality base64 Data URL so images persist across
   * page reloads, tab switches, and live publishing without expiring.
   */
  public async uploadImage(file: File): Promise<{ success: boolean; photo?: EventPhoto; error?: string }> {
    const validation = validateImageUpload(file);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    try {
      const dataUrl = await this.fileToOptimizedDataUrl(file);
      const photo: EventPhoto = {
        id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        url: dataUrl,
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

  public async deleteImage(_photoId: string): Promise<boolean> {
    return true;
  }

  /**
   * Reads a file and optionally downscales to 1200px max dimension via canvas,
   * returning an optimized JPEG/PNG base64 Data URL.
   */
  private fileToOptimizedDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawResult = e.target?.result as string;
        if (!rawResult) {
          reject(new Error('Failed to read image file'));
          return;
        }

        // If file is SVG or small GIF, keep as is
        if (file.type === 'image/svg+xml' || file.type === 'image/gif' || file.size < 200 * 1024) {
          resolve(rawResult);
          return;
        }

        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawResult);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          resolve(compressed);
        };
        img.onerror = () => resolve(rawResult);
        img.src = rawResult;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }
}

export const storageService = new StorageService();
