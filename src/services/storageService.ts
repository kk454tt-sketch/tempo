import { EventPhoto } from '@/types';
import { validateImageUpload } from '@/utils/validation';

export interface StorageBucketStatus {
  hasBucket: boolean;
  bucketName: string | null;
  message: string;
}

class StorageService {
  /**
   * Status check for cloud storage.
   * Direct image URLs, curated presets, and local previews are fully supported.
   */
  public async checkStorageBucket(): Promise<StorageBucketStatus> {
    return {
      hasBucket: false,
      bucketName: null,
      message: 'Direct image URLs, curated presets, and local photo previews are enabled.',
    };
  }

  /**
   * Upload an image file. If cloud storage is not configured, signals noBucket
   * so the caller seamlessly loads the image as a local preview.
   */
  public async uploadImage(file: File): Promise<{ success: boolean; photo?: EventPhoto; noBucket?: boolean; error?: string }> {
    const validation = validateImageUpload(file);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // Cloud storage is intentionally omitted (no Blaze billing required).
    // Signal noBucket to trigger instant high-quality local file preview.
    return {
      success: false,
      noBucket: true,
      error: 'Direct image URLs, photography presets, or instant local previews are enabled.',
    };
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

  public async deleteImage(_photoId: string): Promise<boolean> {
    return false;
  }
}

export const storageService = new StorageService();
