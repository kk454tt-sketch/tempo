export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  timestamp: string;
}

class GuestbookService {
  /**
   * List all guestbook entries for a published event website by slug.
   */
  async list(slug: string): Promise<GuestbookEntry[]> {
    const cleanSlug = slug.toLowerCase().trim();
    const res = await fetch(`/api/guestbook/${encodeURIComponent(cleanSlug)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Could not load guestbook messages.');
    }
    const data = await res.json();
    return data.entries || [];
  }

  /**
   * Add a guestbook message for a published event website by slug.
   */
  async add(slug: string, name: string, message: string): Promise<GuestbookEntry> {
    const cleanSlug = slug.toLowerCase().trim();
    const res = await fetch('/api/guestbook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slug: cleanSlug,
        name: name.trim(),
        message: message.trim(),
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Could not publish your message. Please try again.');
    }

    const data = await res.json();
    return data.entry;
  }
}

export const guestbookService = new GuestbookService();
