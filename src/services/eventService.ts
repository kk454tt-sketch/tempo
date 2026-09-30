import { EventWebsite, EventData, WebsiteStatus } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';
import { apiService } from './apiService';
import { mockWebsites } from './mockData';

class EventService {
  private memoryCache: Map<string, EventWebsite> = new Map();
  private hubCache: Map<string, Record<string, unknown>> = new Map();
  private studyGroupsCache: Map<string, Array<Record<string, unknown>>> = new Map();

  constructor() {
    // Populate memory cache with default templates/websites for initial instant display
    for (const site of mockWebsites) {
      this.memoryCache.set(site.id, site);
      this.memoryCache.set(site.slug.toLowerCase(), site);
    }
  }

  /**
   * Get all websites owned by the authenticated user from the database
   */
  public async getUserWebsites(userId: string): Promise<EventWebsite[]> {
    if (!userId) return [];
    if (import.meta.env.PROD && !isSupabaseConfigured) {
      throw new Error('Website storage is not configured. Set the Supabase browser URL and anon key before using the live site.');
    }

    // 1. Try Supabase PostgreSQL first if configured
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('event_websites')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });

        if (!error && data) {
          const list = data.map(this.mapDbToModel);
          for (const site of list) {
            this.memoryCache.set(site.id, site);
            this.memoryCache.set(site.slug.toLowerCase(), site);
          }
          return list;
        }
        if (import.meta.env.PROD && error) throw error;
      } catch (err) {
        if (import.meta.env.PROD) throw new Error('Could not load your websites from Supabase. Check the database connection and access policies.');
        console.warn('[EventService] Supabase fetch error, trying backend API:', err);
      }
    }

    if (import.meta.env.PROD) return [];

    // 2. Query our persistent SQLite database backend via /api/websites
    try {
      const websites = await apiService.getUserWebsites(userId);
      if (websites && websites.length > 0) {
        for (const site of websites) {
          this.memoryCache.set(site.id, site);
          this.memoryCache.set(site.slug.toLowerCase(), site);
        }
        return websites;
      }
    } catch (err) {
      console.warn('[EventService] Database API fetch error:', err);
    }

    // 3. Fallback to user-scoped in-memory cache
    return Array.from(this.memoryCache.values()).filter(
      (w) => w.userId === userId || (!w.userId && userId === 'usr_tempo_demo_01')
    );
  }

  /**
   * Get a single website by ID from the database
   */
  public async getWebsiteById(id: string, userId?: string): Promise<EventWebsite | null> {
    if (import.meta.env.PROD && !isSupabaseConfigured) {
      throw new Error('Website storage is not configured. Set the Supabase browser URL and anon key before using the live site.');
    }
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('event_websites').select('*').eq('id', id);
        if (userId) query = query.eq('user_id', userId);
        const { data, error } = await query.single();
        if (!error && data) return this.mapDbToModel(data);
        if (import.meta.env.PROD && error?.code === 'PGRST116') return null;
        if (import.meta.env.PROD && error) throw error;
      } catch {
        if (import.meta.env.PROD) throw new Error('Could not load this website from Supabase. Check the database connection and access policies.');
      }
    }

    if (import.meta.env.PROD) return null;

    try {
      const site = await apiService.getWebsiteById(id);
      if (site) {
        this.memoryCache.set(site.id, site);
        this.memoryCache.set(site.slug.toLowerCase(), site);
        return site;
      }
    } catch {
      // continue
    }

    return this.memoryCache.get(id) || null;
  }

  /**
   * Get a public website by slug for guests visiting /e/:slug
   */
  public async getWebsiteBySlug(slug: string): Promise<EventWebsite | null> {
    const cleanSlug = slug.toLowerCase().trim();
    if (import.meta.env.PROD && !isSupabaseConfigured) {
      throw new Error('Website storage is not configured. Set the Supabase browser URL and anon key before using the live site.');
    }

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
        if (import.meta.env.PROD && error?.code === 'PGRST116') return null;
        if (import.meta.env.PROD && error) throw error;
      } catch {
        if (import.meta.env.PROD) throw new Error('Could not load this website from Supabase. Check the database connection and access policies.');
      }
    }

    if (import.meta.env.PROD) return null;

    // Query database backend
    try {
      const site = await apiService.getWebsiteBySlug(cleanSlug);
      if (site) {
        this.memoryCache.set(site.id, site);
        this.memoryCache.set(cleanSlug, site);
        return site;
      }
    } catch {
      // continue
    }

    // Check memory cache
    const cached = this.memoryCache.get(cleanSlug);
    if (cached) return cached;

    // Auto-create live instance in database if not found
    return this.ensureWebsiteExists({
      slug: cleanSlug,
      templateId: 'enrolldesk-01',
      title: cleanSlug,
    });
  }

  /**
   * Guarantees a website exists and persists into the database
   */
  public ensureWebsiteExists(payload: {
    slug: string;
    templateId?: string;
    title?: string;
    eventType?: string;
    eventData?: EventData;
  }): EventWebsite {
    const cleanSlug = payload.slug.toLowerCase().trim();
    let site = this.memoryCache.get(cleanSlug);

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

      this.memoryCache.set(site.id, site);
      this.memoryCache.set(cleanSlug, site);

      // Async write to backend database
      apiService
        .createWebsite({
          userId: site.userId,
          templateId: site.templateId,
          title: site.title,
          eventType: site.eventType,
          slug: cleanSlug,
          eventData: site.eventData,
          status: 'published',
        })
        .catch((e) => console.warn('Database background creation error:', e));
    }
    return site;
  }

  /**
   * Create a new website in the database
   */
  public async createWebsite(payload: {
    userId: string;
    templateId: string;
    title: string;
    eventType: string;
    slug: string;
    eventData: EventData;
  }): Promise<EventWebsite> {
    if (import.meta.env.PROD && !isSupabaseConfigured) {
      throw new Error('Website storage is not configured. Set the Supabase browser URL and anon key before creating a live website.');
    }
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
          return site;
        }
      } catch (err) {
        if (import.meta.env.PROD) throw new Error('Could not save this website to Supabase. Check the database connection and access policies.');
        console.warn('Supabase create error, saving to SQLite backend:', err);
      }
    }

    if (import.meta.env.PROD) throw new Error('Could not save this website to Supabase. Check the database connection and access policies.');

    // Save to SQLite database backend
    try {
      const site = await apiService.createWebsite(payload);
      this.memoryCache.set(site.id, site);
      this.memoryCache.set(site.slug.toLowerCase(), site);
      return site;
    } catch (e) {
      console.error('API createWebsite failed:', e);
      throw e;
    }
  }

  /**
   * Update website in the database
   */
  public async updateWebsite(
    id: string,
    updates: Partial<EventWebsite> & { eventData?: Partial<EventData> }
  ): Promise<EventWebsite> {
    if (import.meta.env.PROD && !isSupabaseConfigured) {
      throw new Error('Website storage is not configured. Set the Supabase browser URL and anon key before editing a live website.');
    }
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
          return site;
        }
      } catch (err) {
        if (import.meta.env.PROD) throw new Error('Could not update this website in Supabase. Check the database connection and access policies.');
        console.warn('Supabase update error, saving to backend API:', err);
      }
    }

    if (import.meta.env.PROD) throw new Error('Could not update this website in Supabase. Check the database connection and access policies.');

    const site = await apiService.updateWebsite(id, updates);
    this.memoryCache.set(site.id, site);
    this.memoryCache.set(site.slug.toLowerCase(), site);
    return site;
  }

  public async updateEventData(id: string, eventData: EventData): Promise<EventWebsite> {
    return this.updateWebsite(id, { eventData });
  }

  public async deleteWebsite(id: string, userId?: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('event_websites').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete error:', err);
      }
    }

    try {
      await apiService.deleteWebsite(id, userId);
    } catch {
      // ignore
    }

    this.memoryCache.delete(id);
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

  /* ================= RSVPS (DATABASE STORED) ================= */
  public async recordRsvp(
    slug: string,
    rsvpData: Record<string, unknown>
  ): Promise<{ success: boolean; message: string }> {
    const site = await this.getWebsiteBySlug(slug);

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('rsvps').insert({
          website_id: site?.id || null,
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
        if (error) {
          console.warn('Supabase RSVP insert error:', error.message);
        }
      } catch (e) {
        console.warn('Supabase RSVP insert warning:', e);
      }
    }

    // Also persist into SQLite backend database
    return await apiService.recordRsvp(slug, {
      ...rsvpData,
      websiteId: site?.id,
    });
  }

  public async getRsvps(slugOrId: string): Promise<Array<Record<string, unknown>>> {
    return await apiService.getRsvps(slugOrId);
  }

  /* ================= STUDENT HUB & PORTAL DATABASE PERSISTENCE ================= */
  public getPersistentHubData(siteIdOrSlug: string, fallbackData: Record<string, unknown>): Record<string, unknown> {
    const cleanSlug = siteIdOrSlug.toLowerCase().trim();
    const cached = this.hubCache.get(cleanSlug);
    if (cached) {
      return { ...fallbackData, ...cached };
    }

    // Initiate async database load in background
    apiService
      .getHubData(cleanSlug)
      .then((res) => {
        if (res.hubData) {
          this.hubCache.set(cleanSlug, res.hubData);
        }
      })
      .catch((e) => console.warn('Background hub fetch warning:', e));

    return fallbackData;
  }

  public async fetchHubDataAsync(siteIdOrSlug: string): Promise<Record<string, unknown> | null> {
    const cleanSlug = siteIdOrSlug.toLowerCase().trim();
    try {
      const res = await apiService.getHubData(cleanSlug);
      if (res.hubData) {
        this.hubCache.set(cleanSlug, res.hubData);
        return res.hubData;
      }
    } catch {
      // ignore
    }
    return null;
  }

  public savePersistentHubData(siteIdOrSlug: string, hubData: Record<string, unknown>): void {
    const cleanSlug = siteIdOrSlug.toLowerCase().trim();
    this.hubCache.set(cleanSlug, hubData);

    // Save directly to the database
    apiService.saveHubData(cleanSlug, hubData).catch((e) => {
      console.warn('[EventService] Database saveHubData warning:', e);
    });
  }

  public async castSuperlativeVote(siteIdOrSlug: string, superlativeKey: string): Promise<Record<string, number>> {
    const cleanSlug = siteIdOrSlug.toLowerCase().trim();
    return await apiService.castVote(cleanSlug, superlativeKey);
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

    apiService
      .getStudyGroups(cleanSlug)
      .then((groups) => {
        if (groups && groups.length > 0) {
          this.studyGroupsCache.set(cleanSlug, groups);
        }
      })
      .catch(() => {});

    return [
      {
        id: 'sg-1',
        title: 'LeetCode & Algorithm Sprint',
        host: 'Aarav Mehta',
        time: 'Tomorrow 4:00 PM',
        location: 'Library Room 302',
        membersCount: 4,
        members: ['Aarav', 'Chloe', 'Marcus'],
      },
      {
        id: 'sg-2',
        title: 'Figma UI/UX Portfolio Jam',
        host: 'Zara Al-Mansoor',
        time: 'Friday 5:30 PM',
        location: 'Blue Bottle Cafe Quad',
        membersCount: 3,
        members: ['Zara', 'Devon'],
      },
      {
        id: 'sg-3',
        title: 'Startup Pitch & Deck Practice',
        host: 'Marcus Vance',
        time: 'Saturday 2:00 PM',
        location: 'Innovation Hub Lounge',
        membersCount: 5,
        members: ['Marcus', 'Sam', 'Aarav'],
      },
    ];
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
    apiService.saveStudyGroups(cleanSlug, groups).catch(() => {});
  }

  public getStorageDebugInfo(): {
    totalWebsites: number;
    storageEngine: string;
    isCloudConnected: boolean;
    keysCount: number;
  } {
    return {
      totalWebsites: this.memoryCache.size,
      storageEngine: isSupabaseConfigured
        ? 'Supabase PostgreSQL + SQLite Backend Database'
        : 'SQLite Backend Database (Local & Server Persistent)',
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
