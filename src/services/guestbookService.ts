import { isSupabaseConfigured, supabase } from '@/services/supabase';

export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  timestamp: string;
}

class GuestbookService {
  private async websiteId(slug: string): Promise<string> {
    if (!isSupabaseConfigured) throw new Error('Guestbook is unavailable until Supabase is configured.');
    const { data, error } = await supabase.from('event_websites').select('id').eq('slug', slug).eq('status', 'published').single();
    if (error || !data) throw new Error('This event guestbook could not be loaded.');
    return data.id;
  }

  async list(slug: string): Promise<GuestbookEntry[]> {
    const websiteId = await this.websiteId(slug);
    const { data, error } = await supabase.from('guestbook_entries')
      .select('id, guest_name, message, created_at').eq('website_id', websiteId).order('created_at', { ascending: false });
    if (error) throw new Error('Could not load guestbook messages.');
    return (data || []).map((row) => ({
      id: row.id,
      name: row.guest_name,
      message: row.message,
      timestamp: new Date(row.created_at).toLocaleString(),
    }));
  }

  async add(slug: string, name: string, message: string): Promise<GuestbookEntry> {
    const websiteId = await this.websiteId(slug);
    const { data, error } = await supabase.from('guestbook_entries')
      .insert({ website_id: websiteId, guest_name: name.trim(), message: message.trim() })
      .select('id, guest_name, message, created_at').single();
    if (error || !data) throw new Error('Could not publish your message. Please try again.');
    return {
      id: data.id,
      name: data.guest_name,
      message: data.message,
      timestamp: new Date(data.created_at).toLocaleString(),
    };
  }
}

export const guestbookService = new GuestbookService();
