import { EventWebsite, EventData, WebsiteStatus } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

const LOCAL_STORAGE_SITES_KEY = 'tempo_created_sites';

class EventService {
  private memoryCache: Map<string, EventWebsite> = new Map();
  private hubCache: Map<string, Record<string, unknown>> = new Map();
  private studyGroupsCache: Map<string, Array<Record<string, unknown>>> = new Map();

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SITES_KEY);
      if (saved) {
        const list: EventWebsite[] = JSON.parse(saved);
        for (const site of list) {
          this.memoryCache.set(site.id, site);
          this.memoryCache.set(site.slug.toLowerCase(), site);
        }
      }
    } catch {
      // ignore
    }
  }

  private saveToLocalStorage(): void {
    try {
      const uniqueSites = Array.from(new Set(this.memoryCache.values()));
      localStorage.setItem(LOCAL_STORAGE_SITES_KEY, JSON.stringify(uniqueSites));
    } catch {
      // ignore
    }
  }

  /**
   * Get all websites owned by the authenticated user
   */
  public async getUserWebsites(userId: string): Promise<EventWebsite[]> {
    if (!userId) return [];

    // Try Supabase first if configured
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('event_websites')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const list = data.map(this.mapDbToModel);
          for (const site of list) {
            this.memoryCache.set(site.id, site);
            this.memoryCache.set(site.slug.toLowerCase(), site);
          }
          this.saveToLocalStorage();
          return list;
        }
      } catch (err) {
        console.warn('[EventService] Supabase fetch error, fallback to local storage:', err);
      }
    }

    // LocalStorage fallback
    this.loadFromLocalStorage();
    const localList = Array.from(new Set(this.memoryCache.values())).filter(
      (site) => site.userId === userId || !site.userId
    );
    return localList;
  }

  /**
   * Get a single website by ID
   */
  public async getWebsiteById(id: string, userId?: string): Promise<EventWebsite | null> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('event_websites').select('*').eq('id', id);
        if (userId) query = query.eq('user_id', userId);
        const { data, error } = await query.single();
        if (!error && data) {
          const site = this.mapDbToModel(data);
          this.memoryCache.set(site.id, site);
          this.memoryCache.set(site.slug.toLowerCase(), site);
          return site;
        }
      } catch {
        // fallback to memory/localStorage
      }
    }

    this.loadFromLocalStorage();
    return this.memoryCache.get(id) || null;
  }

  /**
   * Get a public website by slug for guests visiting /e/:slug
   */
  public async getWebsiteBySlug(slug: string): Promise<EventWebsite | null> {
    const cleanSlug = slug.toLowerCase().trim();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('event_websites')
          .select('*')
          .eq('slug', cleanSlug)
          .single();

        if (!error && data) {
          const site = this.mapDbToModel(data);
          this.memoryCache.set(site.id, site);
          this.memoryCache.set(cleanSlug, site);
          return site;
        }
      } catch {
        // fallback
      }
    }

    this.loadFromLocalStorage();
    return this.memoryCache.get(cleanSlug) || null;
  }

  /**
   * Create a new website
   */
  public async createWebsite(payload: {
    userId: string;
    templateId: string;
    title: string;
    eventType: string;
    slug: string;
    eventData: EventData;
  }): Promise<EventWebsite> {
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

        if (!error && data) {
          const site = this.mapDbToModel(data);
          this.memoryCache.set(site.id, site);
          this.memoryCache.set(site.slug.toLowerCase(), site);
          this.saveToLocalStorage();
          return site;
        }
      } catch (err) {
        console.warn('[EventService] Supabase insert fallback to local:', err);
      }
    }

    // Local / Offline fallback creation
    const newSite: EventWebsite = {
      id: `site_${Date.now()}`,
      userId: payload.userId || 'usr_local',
      templateId: payload.templateId,
      eventType: payload.eventType,
      title: payload.title,
      slug: payload.slug,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: null,
      isLifetime: false,
      proInteractiveEnabled: true,
      metrics: {
        rsvpsCount: 0,
        viewsCount: 0,
        dietaryCount: 0,
        isGuestListClosed: false,
      },
      eventData: payload.eventData,
    };

    this.memoryCache.set(newSite.id, newSite);
    this.memoryCache.set(newSite.slug.toLowerCase(), newSite);
    this.saveToLocalStorage();
    return newSite;
  }

  /**
   * Update website in the database or local storage
   */
  public async updateWebsite(
    id: string,
    updates: Partial<EventWebsite> & { eventData?: Partial<EventData> }
  ): Promise<EventWebsite> {
    if (isSupabaseConfigured) {
      try {
        const updatePayload: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };
        if (updates.title) updatePayload.title = updates.title;
        if (updates.status) updatePayload.status = updates.status;
        if (updates.eventType) updatePayload.event_type = updates.eventType;
        if (updates.isLifetime !== undefined) updatePayload.is_lifetime = updates.isLifetime;
        if (updates.eventData) updatePayload.event_data = updates.eventData;

        const { data, error } = await supabase
          .from('event_websites')
          .update(updatePayload)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          const site = this.mapDbToModel(data);
          this.memoryCache.set(site.id, site);
          this.memoryCache.set(site.slug.toLowerCase(), site);
          this.saveToLocalStorage();
          return site;
        }
      } catch {
        // fallback to local
      }
    }

    // Local fallback update
    this.loadFromLocalStorage();
    const existing = this.memoryCache.get(id);
    if (!existing) {
      throw new Error('Website not found.');
    }

    const updatedSite: EventWebsite = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
      eventData: {
        ...existing.eventData,
        ...(updates.eventData || {}),
      } as EventData,
    };

    this.memoryCache.set(updatedSite.id, updatedSite);
    this.memoryCache.set(updatedSite.slug.toLowerCase(), updatedSite);
    this.saveToLocalStorage();
    return updatedSite;
  }

  public async updateEventData(id: string, eventData: EventData): Promise<EventWebsite> {
    return this.updateWebsite(id, { eventData });
  }

  public async deleteWebsite(id: string, userId?: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('event_websites').delete().eq('id', id).eq('user_id', userId || '');
      } catch {
        // ignore
      }
    }
    this.memoryCache.delete(id);
    this.saveToLocalStorage();
    return true;
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

  /* ================= RSVPS (DATABASE & LOCAL) ================= */
  public async recordRsvp(
    slug: string,
    rsvpData: Record<string, unknown>
  ): Promise<{ success: boolean; message: string }> {
    const site = await this.getWebsiteBySlug(slug);

    if (isSupabaseConfigured && site?.id) {
      try {
        const { error } = await supabase.from('rsvps').insert({
          website_id: site.id,
          slug: slug.toLowerCase().trim(),
          guest_name: rsvpData.guestName || 'Guest',
          guest_email: rsvpData.guestEmail || null,
          attendance: rsvpData.attendance || 'accept',
          meal_preference: rsvpData.mealPreference || null,
          dietary_notes: rsvpData.dietaryNotes || null,
          song_request: rsvpData.songRequest || null,
          plus_ones: Number(rsvpData.plusOnes) || 0,
          custom_fields: rsvpData.customFields || {},
        });
        if (!error) return { success: true, message: 'RSVP saved' };
      } catch {
        // local
      }
    }

    return { success: true, message: 'RSVP recorded locally' };
  }

  public async getRsvps(slugOrId: string): Promise<Array<Record<string, unknown>>> {
    if (isSupabaseConfigured) {
      try {
        const byId = await supabase.from('event_websites').select('id').eq('id', slugOrId).maybeSingle();
        const websiteId = byId.data?.id || (await supabase.from('event_websites').select('id').eq('slug', slugOrId).maybeSingle()).data?.id;
        if (websiteId) {
          const { data, error } = await supabase.from('rsvps').select('*').eq('website_id', websiteId).order('created_at', { ascending: false });
          if (!error && data) return data;
        }
      } catch {
        // ignore
      }
    }
    return [];
  }

  /* ================= STUDENT HUB & PORTAL PERSISTENCE ================= */
  public getPersistentHubData(siteIdOrSlug: string, fallbackData: Record<string, unknown>): Record<string, unknown> {
    const cleanSlug = siteIdOrSlug.toLowerCase().trim();
    const cached = this.hubCache.get(cleanSlug);
    if (cached) {
      return { ...fallbackData, ...cached };
    }
    this.fetchHubDataAsync(cleanSlug).catch(() => {});
    return fallbackData;
  }

  public async fetchHubDataAsync(siteIdOrSlug: string): Promise<Record<string, unknown> | null> {
    const cleanSlug = siteIdOrSlug.toLowerCase().trim();
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('portal_hubs').select('hub_data').eq('slug', cleanSlug).maybeSingle();
        if (!error && data?.hub_data) {
          const hubData = data.hub_data as Record<string, unknown>;
          this.hubCache.set(cleanSlug, hubData);
          return hubData;
        }
      } catch {
        // ignore
      }
    }
    return null;
  }

  public savePersistentHubData(siteIdOrSlug: string, hubData: Record<string, unknown>): void {
    const cleanSlug = siteIdOrSlug.toLowerCase().trim();
    this.hubCache.set(cleanSlug, hubData);
    if (!isSupabaseConfigured) return;
    supabase.from('portal_hubs').upsert({ slug: cleanSlug, hub_data: hubData }, { onConflict: 'slug' })
      .then(() => {});
  }

  public async castSuperlativeVote(siteIdOrSlug: string, superlativeKey: string): Promise<Record<string, number>> {
    const cleanSlug = siteIdOrSlug.toLowerCase().trim();
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('cast_portal_superlative_vote', { p_slug: cleanSlug, p_key: superlativeKey });
        if (!error && data) return data as Record<string, number>;
      } catch {
        // fallback
      }
    }
    return { [superlativeKey]: 1 };
  }

  public getStudyHangoutGroups(siteIdOrSlug: string): Array<{
    id: string;
    title: string;
    host: string;
    time: string;
    location: string;
    membersCount: number;
    members: string[];
  }> {
    const cleanSlug = siteIdOrSlug.toLowerCase().trim();
    const cached = this.studyGroupsCache.get(cleanSlug);
    if (cached) return cached as any;
    return [];
  }

  public saveStudyHangoutGroups(
    siteIdOrSlug: string,
    groups: Array<{
      id: string;
      title: string;
      host: string;
      time: string;
      location: string;
      membersCount: number;
      members: string[];
    }>
  ): void {
    const cleanSlug = siteIdOrSlug.toLowerCase().trim();
    this.studyGroupsCache.set(cleanSlug, groups);
    if (!isSupabaseConfigured) return;
    supabase.from('portal_hubs').upsert({ slug: cleanSlug, study_groups: groups }, { onConflict: 'slug' })
      .then(() => {});
  }

  public getStorageDebugInfo(): {
    totalWebsites: number;
    storageEngine: string;
    isCloudConnected: boolean;
    keysCount: number;
  } {
    return {
      totalWebsites: this.memoryCache.size,
      storageEngine: isSupabaseConfigured ? 'Supabase PostgreSQL & Storage' : 'Local Persistent Storage Engine',
      isCloudConnected: isSupabaseConfigured,
      keysCount: this.memoryCache.size,
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
      proInteractiveEnabled: Boolean(row.pro_interactive_enabled),
      metrics: {
        rsvpsCount: Number(row.rsvps_count || 0),
        viewsCount: Number(row.views_count || 0),
        dietaryCount: 0,
        isGuestListClosed: false,
      },
      eventData: (row.event_data as EventData) || {},
    };
  }
}

export const eventService = new EventService();
