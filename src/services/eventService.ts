import { EventWebsite, EventData, WebsiteStatus } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';
import { mockWebsites } from './mockData';

const LOCAL_STORAGE_KEY = 'tempo_event_websites_local_v2';

class EventService {
  private localWebsites: EventWebsite[] = [];

  constructor() {
    this.initLocal();
  }

  private initLocal() {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        this.localWebsites = JSON.parse(saved);
      } else {
        this.localWebsites = [...mockWebsites];
        this.saveLocal();
      }
    } catch {
      this.localWebsites = [...mockWebsites];
    }
  }

  private saveLocal() {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.localWebsites));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  /**
   * Get all websites owned by the authenticated user
   */
  public async getUserWebsites(userId: string): Promise<EventWebsite[]> {
    if (!userId) return [];

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('event_websites')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Supabase fetch websites error:', error);
          throw error;
        }

        return (data || []).map(this.mapDbToModel);
      } catch (err) {
        console.warn('Falling back to local cache on DB error:', err);
      }
    }

    // Local fallback with strict user isolation
    return this.localWebsites.filter((w) => w.userId === userId || (!w.userId && userId === 'usr_tempo_demo_01'));
  }

  /**
   * Get a single website by ID (with ownership check)
   */
  public async getWebsiteById(id: string, userId?: string): Promise<EventWebsite | null> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('event_websites').select('*').eq('id', id);
        if (userId) {
          query = query.eq('user_id', userId);
        }
        const { data, error } = await query.single();

        if (error || !data) return null;
        return this.mapDbToModel(data);
      } catch {
        // Fallback
      }
    }

    const site = this.localWebsites.find((w) => w.id === id && (!userId || w.userId === userId));
    return site ? { ...site } : null;
  }

  /**
   * Get a public website by slug (for guests visiting /e/:slug)
   */
  public async getWebsiteBySlug(slug: string): Promise<EventWebsite | null> {
    const cleanSlug = slug.toLowerCase().trim();

    // Always re-sync from localStorage to catch cross-tab saves
    this.initLocal();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('event_websites')
          .select('*')
          .eq('slug', cleanSlug)
          .single();

        if (!error && data) {
          return this.mapDbToModel(data);
        }
      } catch {
        // Fallback
      }
    }

    // Check in-memory / local storage
    const site = this.localWebsites.find((w) => w.slug.toLowerCase() === cleanSlug);
    if (site) {
      return { ...site };
    }

    // If not found, ensure and return a live responsive website instance for this slug
    return this.ensureWebsiteExists({
      slug: cleanSlug,
      templateId: 'enrolldesk-01',
      title: cleanSlug,
    });
  }

  /**
   * Guarantees a website exists and is ready for live rendering across tabs
   */
  public ensureWebsiteExists(payload: {
    slug: string;
    templateId?: string;
    title?: string;
    eventType?: string;
    eventData?: EventData;
  }): EventWebsite {
    const cleanSlug = payload.slug.toLowerCase().trim();
    this.initLocal();

    let site = this.localWebsites.find((w) => w.slug.toLowerCase() === cleanSlug);
    if (!site) {
      site = {
        id: `site_${Date.now()}_${cleanSlug}`,
        userId: 'usr_tempo_demo_01',
        templateId: payload.templateId || 'enrolldesk-01',
        eventType: payload.eventType || 'Student & Campus',
        title: payload.title || payload.eventData?.title || cleanSlug,
        slug: cleanSlug,
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: null,
        isLifetime: true,
        metrics: {
          rsvpsCount: 0,
          viewsCount: 1,
          dietaryCount: 0,
          isGuestListClosed: false,
        },
        eventData: payload.eventData || {
          title: payload.title || cleanSlug,
          tagline: 'Student Community & Classmate Directory',
          eventType: 'Student Portal',
          date: 'Academic Year 2026-2027',
          time: 'Always Active',
          venue: 'Class of 2027 Portal',
          address: 'Campus Quad',
          note: 'Welcome to our batch portal!',
          photos: [],
          appearance: {
            atmosphere: 'campus-academic',
            palette: 'navy-gold-coral',
            typography: 'space-inter',
          },
          activeSections: {
            hero: true,
            countdown: false,
            story: false,
            schedule: false,
            venue: false,
            gallery: false,
            rsvp: false,
            guestbook: false,
            classmatesDirectory: true,
            hobbyMatchmaker: true,
            studentEnrollment: true,
            noticesBoard: true,
            dynamicForms: true,
            memoryWall: true,
            adminDesk: true,
          },
          rsvpSettings: {
            enabled: false,
            allowMealSelection: false,
            allowDietaryNotes: false,
            allowSongRequests: false,
            allowPlusOnes: false,
          },
          slug: cleanSlug,
        },
      };
      this.localWebsites.unshift(site);
      this.saveLocal();
    } else {
      if (payload.eventData) {
        site.eventData = { ...site.eventData, ...payload.eventData, slug: cleanSlug };
      }
      if (payload.templateId) {
        site.templateId = payload.templateId;
      }
      site.status = 'published';
      this.saveLocal();
    }
    return site;
  }

  /**
   * Create a new website for the authenticated user
   */
  public async createWebsite(payload: {
    userId: string;
    templateId: string;
    title: string;
    eventType: string;
    slug: string;
    eventData: EventData;
  }): Promise<EventWebsite> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('event_websites')
          .insert({
            user_id: payload.userId,
            template_id: payload.templateId,
            event_type: payload.eventType,
            title: payload.title,
            slug: payload.slug,
            status: 'draft',
            event_data: payload.eventData,
            is_lifetime: false,
          })
          .select()
          .single();

        if (error) {
          console.error('Supabase create website error:', error);
          throw error;
        }

        return this.mapDbToModel(data);
      } catch (err) {
        console.warn('Falling back to local save on create error:', err);
      }
    }

    const newSite: EventWebsite = {
      id: `site_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: payload.userId,
      templateId: payload.templateId,
      eventType: payload.eventType,
      title: payload.title,
      slug: payload.slug,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      expiresAt: null,
      isLifetime: false,
      metrics: {
        rsvpsCount: 0,
        viewsCount: 0,
        dietaryCount: 0,
        isGuestListClosed: false,
      },
      eventData: payload.eventData,
    };

    this.localWebsites.unshift(newSite);
    this.saveLocal();
    return newSite;
  }

  /**
   * Update an existing website
   */
  public async updateWebsite(
    id: string,
    updates: Partial<Omit<EventWebsite, 'id' | 'createdAt'>>,
    userId?: string
  ): Promise<EventWebsite | null> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured) {
      try {
        const dbUpdates: Record<string, unknown> = {
          updated_at: now,
        };
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.eventType !== undefined) dbUpdates.event_type = updates.eventType;
        if (updates.eventData !== undefined) dbUpdates.event_data = updates.eventData;
        if (updates.isLifetime !== undefined) dbUpdates.is_lifetime = updates.isLifetime;
        if (updates.expiresAt !== undefined) dbUpdates.expires_at = updates.expiresAt;

        let query = supabase.from('event_websites').update(dbUpdates).eq('id', id);
        if (userId) {
          query = query.eq('user_id', userId);
        }

        const { data, error } = await query.select().single();
        if (error) throw error;
        return this.mapDbToModel(data);
      } catch (err) {
        console.warn('Falling back to local update on error:', err);
      }
    }

    const index = this.localWebsites.findIndex((w) => w.id === id && (!userId || w.userId === userId));
    if (index === -1) return null;

    this.localWebsites[index] = {
      ...this.localWebsites[index],
      ...updates,
      updatedAt: now,
    };
    this.saveLocal();
    return { ...this.localWebsites[index] };
  }

  public async updateEventData(id: string, eventData: EventData, userId?: string): Promise<EventWebsite | null> {
    return this.updateWebsite(id, { eventData }, userId);
  }

  public async updateStatus(id: string, status: WebsiteStatus, userId?: string): Promise<EventWebsite | null> {
    return this.updateWebsite(id, { status }, userId);
  }

  public async deleteWebsite(id: string, userId?: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('event_websites').delete().eq('id', id);
        if (userId) {
          query = query.eq('user_id', userId);
        }
        const { error } = await query;
        if (error) throw error;
        return true;
      } catch (err) {
        console.warn('Falling back to local delete on error:', err);
      }
    }

    const prevLen = this.localWebsites.length;
    this.localWebsites = this.localWebsites.filter((w) => !(w.id === id && (!userId || w.userId === userId)));
    this.saveLocal();
    return this.localWebsites.length < prevLen;
  }

  public async duplicateWebsite(id: string, userId: string): Promise<EventWebsite | null> {
    const original = await this.getWebsiteById(id, userId);
    if (!original) return null;

    return this.createWebsite({
      userId,
      templateId: original.templateId,
      title: `${original.title} (Copy)`,
      eventType: original.eventType,
      slug: `${original.slug}-copy-${Math.random().toString(36).substring(2, 6)}`,
      eventData: JSON.parse(JSON.stringify(original.eventData)),
    });
  }

  public async recordRsvp(
    slug: string,
    rsvpData: Record<string, unknown>
  ): Promise<{ success: boolean; message: string }> {
    const site = await this.getWebsiteBySlug(slug);
    if (!site) {
      return { success: false, message: 'Event website not found' };
    }

    if (isSupabaseConfigured) {
      try {
        await supabase.from('rsvps').insert({
          website_id: site.id,
          guest_name: rsvpData.guestName || 'Guest',
          guest_email: rsvpData.guestEmail || '',
          attendance: rsvpData.attendance || 'accept',
          meal_preference: rsvpData.mealPreference || null,
          dietary_notes: rsvpData.dietaryNotes || null,
          song_request: rsvpData.songRequest || null,
        });
      } catch (e) {
        console.warn('RSVP DB record failed:', e);
      }
    }

    // Update local metric count and save full RSVP entry to scoped storage
    const localSite = this.localWebsites.find((w) => w.id === site.id);
    if (localSite) {
      localSite.metrics.rsvpsCount += 1;
      if (rsvpData.dietaryNotes) localSite.metrics.dietaryCount += 1;
      this.saveLocal();
    }

    try {
      const rsvpKey = `tempo_rsvps_${site.slug.toLowerCase()}`;
      const existing = localStorage.getItem(rsvpKey);
      const list = existing ? JSON.parse(existing) : [];
      list.unshift({
        id: `rsvp_${Date.now()}`,
        ...rsvpData,
        submittedAt: new Date().toISOString(),
      });
      localStorage.setItem(rsvpKey, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to save RSVP to localStorage:', e);
    }

    return { success: true, message: 'RSVP recorded successfully' };
  }

  public getRsvps(slugOrId: string): Array<Record<string, unknown>> {
    try {
      const rsvpKey = `tempo_rsvps_${slugOrId.toLowerCase()}`;
      const saved = localStorage.getItem(rsvpKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  /* ================= STUDENT HUB & PRO INTERACTIVE PERSISTENCE ================= */

  public getScopedKey(key: string, siteIdOrSlug = 'enrolldesk-portal'): string {
    return `tempo_hub_${siteIdOrSlug}_${key}`;
  }

  public getPersistentHubData(siteIdOrSlug: string, fallbackData: Record<string, unknown>): Record<string, unknown> {
    try {
      const key = this.getScopedKey('main_hub', siteIdOrSlug);
      const saved = localStorage.getItem(key);
      if (saved) {
        return { ...fallbackData, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to read hub data from localStorage:', e);
    }
    return fallbackData;
  }

  public savePersistentHubData(siteIdOrSlug: string, hubData: Record<string, unknown>): void {
    try {
      const key = this.getScopedKey('main_hub', siteIdOrSlug);
      localStorage.setItem(key, JSON.stringify(hubData));

      // Also update the local website if present
      const cleanSlug = siteIdOrSlug.toLowerCase();
      const site = this.localWebsites.find((w) => w.slug.toLowerCase() === cleanSlug || w.id === siteIdOrSlug);
      if (site && site.eventData) {
        site.eventData.studentHub = {
          ...(site.eventData.studentHub || {}),
          ...(hubData as unknown as Record<string, unknown>),
        } as unknown as typeof site.eventData.studentHub;
        this.saveLocal();
      }
    } catch (e) {
      console.warn('Failed to save persistent hub data:', e);
    }
  }

  public getSuperlativeVotes(siteIdOrSlug: string): Record<string, number> {
    try {
      const key = this.getScopedKey('superlative_votes', siteIdOrSlug);
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  public castSuperlativeVote(siteIdOrSlug: string, superlativeKey: string): Record<string, number> {
    const votes = this.getSuperlativeVotes(siteIdOrSlug);
    votes[superlativeKey] = (votes[superlativeKey] || 0) + 1;
    try {
      const key = this.getScopedKey('superlative_votes', siteIdOrSlug);
      localStorage.setItem(key, JSON.stringify(votes));
    } catch (e) {
      console.warn('Failed to save vote:', e);
    }
    return votes;
  }

  public getStudyHangoutGroups(siteIdOrSlug: string): Array<{ id: string; title: string; host: string; time: string; location: string; membersCount: number; members: string[] }> {
    try {
      const key = this.getScopedKey('study_groups', siteIdOrSlug);
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback to defaults
    }
    return [
      { id: 'sg-1', title: 'LeetCode & Algorithm Sprint', host: 'Aarav Mehta', time: 'Tomorrow 4:00 PM', location: 'Library Room 302', membersCount: 4, members: ['Aarav', 'Chloe', 'Marcus'] },
      { id: 'sg-2', title: 'Figma UI/UX Portfolio Jam', host: 'Zara Al-Mansoor', time: 'Friday 5:30 PM', location: 'Blue Bottle Cafe Quad', membersCount: 3, members: ['Zara', 'Devon'] },
      { id: 'sg-3', title: 'Startup Pitch & Deck Practice', host: 'Marcus Vance', time: 'Saturday 2:00 PM', location: 'Innovation Hub Lounge', membersCount: 5, members: ['Marcus', 'Sam', 'Aarav'] },
    ];
  }

  public saveStudyHangoutGroups(siteIdOrSlug: string, groups: Array<{ id: string; title: string; host: string; time: string; location: string; membersCount: number; members: string[] }>): void {
    try {
      const key = this.getScopedKey('study_groups', siteIdOrSlug);
      localStorage.setItem(key, JSON.stringify(groups));
    } catch (e) {
      console.warn('Failed to save study groups:', e);
    }
  }

  public getStorageDebugInfo(): { totalWebsites: number; storageEngine: string; isCloudConnected: boolean; keysCount: number } {
    let keysCount = 0;
    try {
      keysCount = localStorage.length;
    } catch {
      keysCount = 0;
    }
    return {
      totalWebsites: this.localWebsites.length,
      storageEngine: isSupabaseConfigured ? 'Supabase PostgreSQL + Local Storage Cache' : 'Browser Persistent LocalStorage Engine',
      isCloudConnected: isSupabaseConfigured,
      keysCount,
    };
  }

  private mapDbToModel(row: Record<string, unknown>): EventWebsite {
    return {
      id: row.id as string,
      userId: row.user_id as string,
      templateId: row.template_id as string,
      eventType: row.event_type as string,
      title: row.title as string,
      slug: row.slug as string,
      status: (row.status as WebsiteStatus) || 'draft',
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
      expiresAt: (row.expires_at as string) || null,
      isLifetime: Boolean(row.is_lifetime),
      metrics: {
        rsvpsCount: 0,
        viewsCount: 0,
        dietaryCount: 0,
        isGuestListClosed: false,
      },
      eventData: (row.event_data as EventData) || {},
    };
  }
}

export const eventService = new EventService();
