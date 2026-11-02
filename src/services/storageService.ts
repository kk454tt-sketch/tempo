import { EventPhoto } from '@/types';
import { validateImageUpload } from '@/utils/validation';
import { isSupabaseConfigured, supabase } from '@/services/supabase';

export interface StorageBucketStatus {
  hasBucket: boolean;
  bucketName: string | null;
  message: string;
}

class StorageService {
  private cachedBucketStatus: StorageBucketStatus | null = null;
  private lastBucketCheck = 0;

  /**
   * Proactively discover if any Supabase storage bucket exists and is accessible.
   */
  public async checkStorageBucket(): Promise<StorageBucketStatus> {
    const now = Date.now();
    // Cache result for 30 seconds to avoid excessive network requests
    if (this.cachedBucketStatus && now - this.lastBucketCheck < 30000) {
      return this.cachedBucketStatus;
    }

    if (!isSupabaseConfigured) {
      const status: StorageBucketStatus = {
        hasBucket: false,
        bucketName: null,
        message: 'Supabase credentials not configured.',
      };
      this.cachedBucketStatus = status;
      this.lastBucketCheck = now;
      return status;
    }

    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (error || !data || data.length === 0) {
        const status: StorageBucketStatus = {
          hasBucket: false,
          bucketName: null,
          message: 'No storage bucket found in Supabase. Direct image URLs, curated presets, and local photo previews are enabled.',
        };
        this.cachedBucketStatus = status;
        this.lastBucketCheck = now;
        return status;
      }

      // Prioritize tempo-event-media, images, or first accessible bucket
      const preferred = data.find((b) => b.name === 'tempo-event-media') ||
                        data.find((b) => b.name === 'images') ||
                        data.find((b) => b.name === 'public') ||
                        data[0];

      const status: StorageBucketStatus = {
        hasBucket: true,
        bucketName: preferred.name,
        message: `Connected to Supabase storage bucket: "${preferred.name}"`,
      };
      this.cachedBucketStatus = status;
      this.lastBucketCheck = now;
      return status;
    } catch {
      const status: StorageBucketStatus = {
        hasBucket: false,
        bucketName: null,
        message: 'No storage bucket accessible. Direct image URLs & curated presets are enabled.',
      };
      this.cachedBucketStatus = status;
      this.lastBucketCheck = now;
      return status;
    }
  }

  /**
   * Upload an image file. If no bucket exists in Supabase, returns a clear error
   * instructing the user or allowing direct URL / preset selection.
   */
  public async uploadImage(file: File): Promise<{ success: boolean; photo?: EventPhoto; noBucket?: boolean; error?: string }> {
    const validation = validateImageUpload(file);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // Step 1: Detect available storage bucket
    const bucketStatus = await this.checkStorageBucket();
    if (!bucketStatus.hasBucket || !bucketStatus.bucketName) {
      return {
        success: false,
        noBucket: true,
        error: 'No Supabase storage bucket found. Without a storage bucket in Supabase, files cannot be stored in the cloud. Please enter a direct image URL, choose a photography preset, or create a public bucket in your Supabase dashboard.',
      };
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'public-creator';
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const objectPath = `${userId}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage.from(bucketStatus.bucketName).upload(objectPath, file, {
        cacheControl: '31536000',
        upsert: false,
        contentType: file.type,
      });

      if (uploadError) {
        return {
          success: false,
          error: `Upload to bucket "${bucketStatus.bucketName}" failed: ${uploadError.message}`,
        };
      }

      const { data: { publicUrl } } = supabase.storage.from(bucketStatus.bucketName).getPublicUrl(objectPath);
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
   * Helper to create a photo object from a direct URL (e.g. Unsplash, CDN, web link).
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

  /**
   * Helper to convert a local file to Base64 Data URL for instant preview without requiring a bucket.
   */
  public async createPhotoFromFilePreview(file: File): Promise<EventPhoto> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          url: reader.result as string,
          caption: file.name.replace(/\.[^/.]+$/, ''),
          isCover: false,
          altText: file.name,
        });
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Curated category presets with 100% reliable, aesthetic Unsplash photography.
   */
  public getCategoryPresets(category: string): Array<{ title: string; url: string; preview: string }> {
    const cat = (category || '').toLowerCase();

    if (cat.includes('birthday')) {
      return [
        {
          title: 'Golden Celebration Toast',
          url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200&auto=format&fit=crop&q=80',
          preview: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=200&auto=format&fit=crop&q=60',
        },
        {
          title: 'Candlelight Birthday Cake',
          url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&auto=format&fit=crop&q=80',
          preview: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=200&auto=format&fit=crop&q=60',
        },
        {
          title: 'Rooftop Confetti & Neon',
          url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80',
          preview: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&auto=format&fit=crop&q=60',
        },
        {
          title: 'Vintage Film Polaroid',
          url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=1200&auto=format&fit=crop&q=80',
          preview: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=200&auto=format&fit=crop&q=60',
        },
      ];
    }

    if (cat.includes('wedding')) {
      return [
        {
          title: 'Tuscan Villa Sunset',
          url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80',
          preview: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=200&auto=format&fit=crop&q=60',
        },
        {
          title: 'Romantic Couple Under Cypress',
          url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&auto=format&fit=crop&q=80',
          preview: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=200&auto=format&fit=crop&q=60',
        },
        {
          title: 'Botanical Courtyard Banquet',
          url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&auto=format&fit=crop&q=80',
          preview: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=200&auto=format&fit=crop&q=60',
        },
        {
          title: 'Elegance & Rings Monograph',
          url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&auto=format&fit=crop&q=80',
          preview: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=200&auto=format&fit=crop&q=60',
        },
      ];
    }

    if (cat.includes('portfolio') || cat.includes('architecture')) {
      return [
        {
          title: 'Nordic Timber & Concrete Villa',
          url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
          preview: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&auto=format&fit=crop&q=60',
        },
        {
          title: 'Minimalist Architecture Studio',
          url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
          preview: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&auto=format&fit=crop&q=60',
        },
        {
          title: 'Geometric Concrete & Shadow',
          url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
          preview: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200&auto=format&fit=crop&q=60',
        },
        {
          title: 'Editorial Noir High Fashion',
          url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=80',
          preview: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=60',
        },
      ];
    }

    if (cat.includes('restaurant') || cat.includes('dining')) {
      return [
        {
          title: 'Modern Omakase & Ceramic Ware',
          url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200&auto=format&fit=crop&q=80',
          preview: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200&auto=format&fit=crop&q=60',
        },
        {
          title: 'Intimate Parisian Bistro & Wine',
          url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1200&auto=format&fit=crop&q=80',
          preview: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=200&auto=format&fit=crop&q=60',
        },
        {
          title: 'Wood-fired Hearth & Dining',
          url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80',
          preview: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&auto=format&fit=crop&q=60',
        },
        {
          title: 'Signature Cocktail Glassware',
          url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&auto=format&fit=crop&q=80',
          preview: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=200&auto=format&fit=crop&q=60',
        },
      ];
    }

    // Default / SaaS / Business
    return [
      {
        title: 'Cloud Infrastructure Analytics',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
        preview: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&auto=format&fit=crop&q=60',
      },
      {
        title: 'Dark Mode Engineering Workspace',
        url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
        preview: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&auto=format&fit=crop&q=60',
      },
      {
        title: 'Minimalist Product Design',
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
        preview: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&auto=format&fit=crop&q=60',
      },
      {
        title: 'Artisanal Ceramic Goods',
        url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&auto=format&fit=crop&q=80',
        preview: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200&auto=format&fit=crop&q=60',
      },
    ];
  }

  public async deleteImage(photoId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !photoId.includes('/')) return false;
    const bucketStatus = await this.checkStorageBucket();
    if (!bucketStatus.hasBucket || !bucketStatus.bucketName) return false;
    const { error } = await supabase.storage.from(bucketStatus.bucketName).remove([photoId]);
    return !error;
  }
}

export const storageService = new StorageService();
