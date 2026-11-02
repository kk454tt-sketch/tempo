import { EventWebsite, EventData, WebsiteStatus, SavedDraft } from '@/types';
import { apiService } from './apiService';
import { supabase, isSupabaseConfigured } from './supabase';

class EventService {
  private hubCache: Map<string, Record<string, unknown>> = new Map();
  private studyGroupsCache: Map<string, Array<Record<string, unknown>>> = new Map();

  /**
   * Get all websites owned by the authenticated user from the database
   */
  public async getUserWebsites(_userId?: string): Promise<EventWebsite[]> {
    try {
      const websites = await apiService.getUserWebsites();
      if (websites && websites.length > 0) {
        return websites;
      }
    } catch (err) {
      console.warn('[EventService] Database API fetch warning:', err);
    }

    // Secondary cloud check if Supabase is active
    if (isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('event_websites')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

          if (!error && data) {
            return data.map(this.mapDbToModel);
          }
        }
      } catch (err) {
        console.warn('[EventService] Supabase fallback fetch error:', err);
      }
    }

    return [];
  }

  /**
   * Get a single website by ID from the database
   */
  public async getWebsiteById(id: string, _userId?: string): Promise<EventWebsite | null> {
    try {
      const site = await apiService.getWebsiteById(id);
      if (site) return site;
    } catch (err) {
      console.warn('[EventService] API getWebsiteById error:', err);
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('event_websites')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          return this.mapDbToModel(data);
        }
      } catch {
        // ignore
      }
    }

    return null;
  }

  /**
   * Get a public published website by slug for guests visiting /e/:slug
   */
  public async getWebsiteBySlug(slug: string): Promise<EventWebsite | null> {
    const cleanSlug = slug.toLowerCase().trim();

    try {
      const site = await apiService.getWebsiteBySlug(cleanSlug);
      if (site && site.status === 'published') {
        return site;
      }
    } catch (err) {
      console.warn('[EventService] API getWebsiteBySlug error:', err);
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('event_websites')
          .select('*')
          .eq('slug', cleanSlug)
          .eq('status', 'published')
          .single();

        if (!error && data) {
          return this.mapDbToModel(data);
        }
      } catch {
        // ignore
      }
    }

    return null;
  }

  /**
   * Create a new website in the database
   */
  public async createWebsite(payload: {
    userId?: string;
    templateId: string;
    title: string;
    eventType: string;
    slug: string;
    eventData: EventData;
    status?: string;
  }): Promise<EventWebsite> {
    const site = await apiService.createWebsite({
      templateId: payload.templateId,
      title: payload.title,
      eventType: payload.eventType,
      slug: payload.slug,
      eventData: payload.eventData,
      status: payload.status || 'draft',
    });

    // Optionally sync to Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('event_websites').upsert({
            id: site.id,
            user_id: user.id,
            template_id: site.templateId,
            event_type: site.eventType,
            title: site.title,
            slug: site.slug,
            status: site.status,
            event_data: site.eventData,
            is_lifetime: site.isLifetime,
          });
        }
      } catch (err) {
        console.debug('Supabase sync note:', err);
      }
    }

    return site;
  }

  /**
   * Update website in the database
   */
  public async updateWebsite(
    id: string,
    updates: Partial<EventWebsite> & { eventData?: Partial<EventData> }
  ): Promise<EventWebsite> {
    const site = await apiService.updateWebsite(id, updates);

    if (isSupabaseConfigured) {
      try {
        const updatePayload: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };
        if (updates.title) updatePayload.title = updates.title;
        if (updates.status) updatePayload.status = updates.status;
        if (updates.eventType) updatePayload.event_type = updates.eventType;
        if (updates.eventData) updatePayload.event_data = updates.eventData;

        await supabase.from('event_websites').update(updatePayload).eq('id', id);
      } catch (err) {
        console.debug('Supabase update note:', err);
      }
    }

    return site;
  }

  /**
   * Delete website in the database
   */
  public async deleteWebsite(id: string, _userId?: string): Promise<boolean> {
    const success = await apiService.deleteWebsite(id);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('event_websites').delete().eq('id', id);
      } catch {
        // ignore
      }
    }

    return success;
  }

  /**
   * Duplicate website in the database
   */
  public async duplicateWebsite(id: string, _userId?: string): Promise<EventWebsite | null> {
    const original = await this.getWebsiteById(id);
    if (!original) return null;

    const copyTitle = `${original.title} (Copy)`;
    const copySlug = `${original.slug}-copy-${Math.random().toString(36).substring(2, 6)}`;

    return this.createWebsite({
      templateId: original.templateId,
      title: copyTitle,
      eventType: original.eventType,
      slug: copySlug,
      eventData: {
        ...original.eventData,
        title: copyTitle,
      },
      status: 'draft',
    });
  }

  /* ================= SAVED DRAFTS (PHASE 5) ================= */
  public async saveDraft(payload: {
    id?: string;
    siteId?: string | null;
    templateId: string;
    title: string;
    slug?: string | null;
    eventType?: string;
    eventData: Record<string, unknown>;
  }): Promise<SavedDraft> {
    return apiService.saveDraft(payload);
  }

  public async getUserDrafts(): Promise<SavedDraft[]> {
    return apiService.getUserDrafts();
  }

  public async getDraftById(id: string): Promise<SavedDraft | null> {
    return apiService.getDraftById(id);
  }

  public async deleteDraft(id: string): Promise<boolean> {
    return apiService.deleteDraft(id);
  }

  /* ================= RSVPS (DATABASE PERSISTENCE) ================= */
  public async recordRsvp(slug: string, payload: Record<string, unknown>): Promise<boolean> {
    return apiService.recordRsvp(slug, payload);
  }

  public async getRsvps(slug: string): Promise<Array<Record<string, unknown>>> {
    return apiService.getRsvps(slug);
  }

  /* ================= PORTAL HUBS ================= */
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
    supabase
      .from('portal_hubs')
      .upsert({ slug: cleanSlug, study_groups: groups }, { onConflict: 'slug' })
      .then(() => {});
  }

  public getPersistentHubData(
    siteIdOrSlug: string,
    fallbackHub: Record<string, unknown>
  ): Record<string, unknown> {
    const cleanSlug = siteIdOrSlug.toLowerCase().trim();
    const cached = this.hubCache.get(cleanSlug);
    if (cached) return cached;
    return fallbackHub;
  }

  public savePersistentHubData(
    siteIdOrSlug: string,
    hubData: Record<string, unknown>
  ): void {
    const cleanSlug = siteIdOrSlug.toLowerCase().trim();
    this.hubCache.set(cleanSlug, hubData);
    fetch(`/api/hubs/${encodeURIComponent(cleanSlug)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hubData }),
    }).catch(() => {});
  }

  public async fetchHubDataAsync(
    siteIdOrSlug: string
  ): Promise<Record<string, unknown> | null> {
    const cleanSlug = siteIdOrSlug.toLowerCase().trim();
    try {
      const res = await fetch(`/api/hubs/${encodeURIComponent(cleanSlug)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.hubData) {
          this.hubCache.set(cleanSlug, data.hubData);
          return data.hubData;
        }
      }
    } catch {
      // ignore
    }
    return this.hubCache.get(cleanSlug) || null;
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
