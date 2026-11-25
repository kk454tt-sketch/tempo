import { EventWebsite, EventData, SavedDraft } from '@/types';
import { apiService } from './apiService';
import { getTemplateDefinition } from '@/templates/registry';
import { collection, query, where, getDocs, doc, setDoc, getDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';

class EventService {
  private hubCache: Map<string, Record<string, unknown>> = new Map();
  private studyGroupsCache: Map<string, Array<Record<string, unknown>>> = new Map();

  /**
   * Helper to cache a website in local storage scoped to the specific user
   */
  private cacheLocally(website: EventWebsite, userId?: string): void {
    if (!website || !website.id) return;
    const uid = userId || website.userId || auth.currentUser?.uid;

    try {
      // 1. Specific site cache
      localStorage.setItem(`tempo_site_${website.id}`, JSON.stringify(website));
      if (uid && uid !== 'anonymous') {
        localStorage.setItem(`tempo_site_${uid}_${website.id}`, JSON.stringify(website));
      }

      // 2. Published slug backup for instant preview
      if (website.slug) {
        localStorage.setItem(`tempo_published_${website.slug.toLowerCase().trim()}`, JSON.stringify(website));
      }

      // 3. User-scoped website list cache (never global across different users)
      if (uid && uid !== 'anonymous') {
        const userKey = `tempo_user_websites_${uid}`;
        const raw = localStorage.getItem(userKey);
        let sites: EventWebsite[] = [];
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) sites = parsed;
          } catch {
            sites = [];
          }
        }
        const idx = sites.findIndex((s) => s.id === website.id || s.slug === website.slug);
        if (idx !== -1) {
          sites[idx] = website;
        } else {
          sites.unshift(website);
        }
        localStorage.setItem(userKey, JSON.stringify(sites));
      }
    } catch (e) {
      console.debug('[EventService] Local cache warning:', e);
    }
  }

  /**
   * Clear local cache for a user upon signout
   */
  public clearUserCache(userId?: string): void {
    const uid = userId || auth.currentUser?.uid;
    try {
      if (uid) {
        localStorage.removeItem(`tempo_user_websites_${uid}`);
      }
      Object.keys(localStorage).forEach((k) => {
        if (
          k.startsWith('tempo_draft_guest_') ||
          k.startsWith('tempo_draft_') ||
          (uid && k.startsWith(`tempo_site_${uid}_`))
        ) {
          localStorage.removeItem(k);
        }
      });
    } catch (_) {}
  }

  /**
   * Get all websites owned by the authenticated user from Cloud Firestore
   * Strictly isolates per user account.
   */
  public async getUserWebsites(userId?: string): Promise<EventWebsite[]> {
    const effectiveUid = userId || auth.currentUser?.uid;
    if (!effectiveUid || effectiveUid === 'anonymous') {
      return [];
    }

    const resultsMap = new Map<string, EventWebsite>();

    // 1. Direct Cloud Firestore query for this specific user (PRIMARY)
    try {
      const q = query(
        collection(db, 'websites'),
        where('userId', '==', effectiveUid)
      );
      const snap = await getDocs(q);
      snap.forEach((d) => {
        const data = d.data();
        if (data) {
          resultsMap.set(d.id, { id: d.id, ...data } as EventWebsite);
        }
      });
    } catch (fsErr) {
      console.warn('[EventService] Direct Firestore getUserWebsites notice:', fsErr);
    }

    // 2. Fallback to user-scoped local storage cache ONLY
    try {
      const rawUserSites = localStorage.getItem(`tempo_user_websites_${effectiveUid}`);
      if (rawUserSites) {
        const parsed = JSON.parse(rawUserSites);
        if (Array.isArray(parsed)) {
          parsed.filter((w) => Boolean(w && w.id && w.userId === effectiveUid)).forEach((w) => {
            if (!resultsMap.has(w.id)) resultsMap.set(w.id, w);
          });
        }
      }
    } catch {
      // ignore
    }

    // 3. Optional backend API (if server router is active in local dev)
    try {
      const websites = await apiService.getUserWebsites();
      if (websites && Array.isArray(websites)) {
        websites
          .filter((w) => Boolean(w && w.id && (w.userId === effectiveUid || !w.userId)))
          .forEach((w) => {
            if (!resultsMap.has(w.id)) resultsMap.set(w.id, { ...w, userId: effectiveUid });
          });
      }
    } catch {
      // API may be unavailable in static hosting
    }

    const list = Array.from(resultsMap.values());
    list.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
    return list;
  }

  /**
   * Get a single website by ID from Cloud Firestore
   */
  public async getWebsiteById(id: string, userId?: string): Promise<EventWebsite | null> {
    if (!id) return null;
    const effectiveUid = userId || auth.currentUser?.uid;

    // 1. Direct Cloud Firestore check (PRIMARY)
    try {
      const docRef = doc(db, 'websites', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const site = {
          id: snap.id,
          ...snap.data(),
        } as EventWebsite;
        this.cacheLocally(site, site.userId);
        return site;
      }
    } catch (fsErr) {
      console.warn('[EventService] Direct Firestore getWebsiteById notice:', fsErr);
    }

    // 2. Check user-scoped or site local storage
    try {
      if (effectiveUid) {
        const userSiteRaw = localStorage.getItem(`tempo_site_${effectiveUid}_${id}`);
        if (userSiteRaw) {
          const parsed = JSON.parse(userSiteRaw);
          if (parsed && parsed.id) return parsed;
        }
      }
      const raw = localStorage.getItem(`tempo_site_${id}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.id) return parsed;
      }
    } catch {
      // ignore
    }

    // 3. Try backend API (dev fallback)
    try {
      const site = await apiService.getWebsiteById(id);
      if (site && site.id) {
        this.cacheLocally(site, site.userId);
        return site;
      }
    } catch {
      // ignore
    }

    return null;
  }

  /**
   * Get a public published website by slug for guests visiting /e/:slug
   */
  public async getWebsiteBySlug(slug: string): Promise<EventWebsite | null> {
    const cleanSlug = slug.toLowerCase().trim();

    // 1. Query Cloud Firestore directly as PRIMARY for live links
    try {
      const q = query(
        collection(db, 'websites'),
        where('slug', '==', cleanSlug)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        // If current user is logged in, prioritize their own published site with this slug
        const myUid = auth.currentUser?.uid;
        let chosenDoc = snap.docs[0];
        if (myUid) {
          const myMatch = snap.docs.find((d) => d.data()?.userId === myUid);
          if (myMatch) chosenDoc = myMatch;
        }
        const data = chosenDoc.data();
        if (data && (data.status === 'published' || data.status === 'draft')) {
          const site = {
            id: chosenDoc.id,
            ...data,
          } as EventWebsite;
          this.cacheLocally(site, site.userId);
          return site;
        }
      }
    } catch (fsErr) {
      console.warn('[EventService] Direct Firestore getWebsiteBySlug notice:', fsErr);
    }

    // Direct document ID fallback (allows visiting /e/{uniqueSiteId} directly)
    try {
      const docRef = doc(db, 'websites', cleanSlug);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && (data.status === 'published' || data.status === 'draft')) {
          const site = {
            id: docSnap.id,
            ...data,
          } as EventWebsite;
          this.cacheLocally(site, site.userId);
          return site;
        }
      }
    } catch (_) {}

    // 2. Check local storage published backup (instant for author testing)
    try {
      const rawPublished = localStorage.getItem(`tempo_published_${cleanSlug}`);
      if (rawPublished) {
        const parsed = JSON.parse(rawPublished);
        if (parsed && (parsed.slug || parsed.id)) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    // 3. Try backend API
    try {
      const site = await apiService.getWebsiteBySlug(cleanSlug);
      if (site && site.id) {
        this.cacheLocally(site, site.userId);
        return site;
      }
    } catch {
      // ignore
    }

    // 4. Graceful fallback for template-based preview URLs
    const t = getTemplateDefinition(cleanSlug);
    if (t) {
      let draftData: any = {};
      try {
        const raw = localStorage.getItem(`tempo_draft_${t.id}`);
        if (raw) draftData = JSON.parse(raw);
      } catch {
        // ignore
      }

      return {
        id: `site_tpl_${t.id}`,
        userId: 'anonymous',
        templateId: t.id,
        title: draftData.siteTitle || t.defaultData.title || t.name,
        eventType: t.categoryLabel,
        slug: cleanSlug,
        status: 'published',
        eventData: {
          ...t.defaultData,
          title: draftData.siteTitle || t.defaultData.title || t.name,
          tagline: draftData.siteTagline || t.defaultData.tagline,
          venue: draftData.venue || t.defaultData.venue,
          address: draftData.address || t.defaultData.address,
          date: draftData.eventDate || t.defaultData.date,
          time: draftData.eventTime || t.defaultData.time,
          note: draftData.welcomeNote || t.defaultData.note,
        },
        isLifetime: true,
        expiresAt: null,
        proInteractiveEnabled: true,
        metrics: {
          viewsCount: 1,
          rsvpsCount: 0,
          dietaryCount: 0,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return null;
  }

  /**
   * Create a new website with Cloud Firestore as PRIMARY method.
   * Strictly associates with the authenticated user.
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
    let cleanSlug = (payload.slug || `site-${Date.now()}`).toLowerCase().trim();
    const siteId = `site_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const effectiveUserId = payload.userId || auth.currentUser?.uid;

    if (!effectiveUserId || effectiveUserId === 'anonymous') {
      throw new Error('Please sign in to publish your website.');
    }

    // Ensure slug has a unique code attached to guarantee zero collision across users
    if (!cleanSlug.match(/-[a-z0-9]{4,8}$/)) {
      cleanSlug = `${cleanSlug}-${Math.random().toString(36).substring(2, 7)}`;
    }

    // Ensure slug uniqueness: if another user already published to this slug, avoid cross-user collision
    try {
      const slugQuery = query(
        collection(db, 'websites'),
        where('slug', '==', cleanSlug)
      );
      const slugSnap = await getDocs(slugQuery);
      if (!slugSnap.empty) {
        const conflict = slugSnap.docs[0].data();
        if (conflict.userId && conflict.userId !== effectiveUserId) {
          cleanSlug = `${cleanSlug}-${Math.random().toString(36).substring(2, 7)}`;
        }
      }
    } catch (_) {}

    const now = new Date().toISOString();

    const newWebsite: EventWebsite = {
      id: siteId,
      userId: effectiveUserId,
      templateId: payload.templateId,
      title: payload.title || 'My Website',
      eventType: payload.eventType || 'Celebration',
      slug: cleanSlug,
      status: (payload.status as any) || 'published',
      eventData: payload.eventData,
      isLifetime: true,
      expiresAt: null,
      proInteractiveEnabled: true,
      metrics: {
        viewsCount: 1,
        rsvpsCount: 0,
        dietaryCount: 0,
      },
      createdAt: now,
      updatedAt: now,
    };

    // Sanitize to remove any undefined fields that cause Firestore setDoc() to fail
    const cleanWebsite = JSON.parse(JSON.stringify(newWebsite)) as EventWebsite;

    // 1. Direct Cloud Firestore write (PRIMARY)
    // Note: Do not use { merge: true } for brand new documents so Firestore evaluates 'create' rules
    try {
      const siteDocRef = doc(db, 'websites', siteId);
      await setDoc(siteDocRef, cleanWebsite);
    } catch (fsErr: any) {
      console.error('[EventService] Direct Firestore createWebsite error:', fsErr);
      const detail = fsErr?.message ? ` (${fsErr.message})` : '';
      throw new Error(`Failed to save website to database${detail}. Please check permissions or connection.`);
    }

    // 2. Cache in user-scoped local storage for instant access
    this.cacheLocally(cleanWebsite, effectiveUserId);

    // 3. Also notify dev backend API if running
    try {
      await apiService.createWebsite({
        templateId: payload.templateId,
        title: payload.title,
        eventType: payload.eventType,
        slug: cleanSlug,
        eventData: payload.eventData,
        status: payload.status || 'draft',
      });
    } catch {
      // expected on static Firebase Hosting
    }

    return cleanWebsite;
  }

  /**
   * Update website with Cloud Firestore as PRIMARY method
   */
  public async updateWebsite(
    id: string,
    updates: Partial<EventWebsite> & { eventData?: Partial<EventData> }
  ): Promise<EventWebsite> {
    const now = new Date().toISOString();
    const existing = await this.getWebsiteById(id) || {} as Partial<EventWebsite>;
    const effectiveUserId = existing.userId || auth.currentUser?.uid;

    if (!effectiveUserId || effectiveUserId === 'anonymous') {
      throw new Error('Please sign in to update your website.');
    }

    let cleanSlug = updates.slug ? updates.slug.toLowerCase().trim() : (existing.slug || `site-${Date.now()}`);

    // If changing slug, make sure another user doesn't already own it
    if (updates.slug && updates.slug !== existing.slug) {
      try {
        const slugQuery = query(
          collection(db, 'websites'),
          where('slug', '==', cleanSlug)
        );
        const slugSnap = await getDocs(slugQuery);
        if (!slugSnap.empty) {
          const conflict = slugSnap.docs[0].data();
          if (conflict.userId && conflict.userId !== effectiveUserId) {
            cleanSlug = `${cleanSlug}-${effectiveUserId.substring(0, 5)}`;
          }
        }
      } catch (_) {}
    }

    const updatedWebsite: EventWebsite = {
      id: id,
      userId: effectiveUserId,
      templateId: updates.templateId || existing.templateId || 'keepsake-birthday-scrapbook',
      title: updates.title !== undefined ? updates.title : (existing.title || 'My Website'),
      eventType: updates.eventType || existing.eventType || 'Celebration',
      slug: cleanSlug,
      status: updates.status || existing.status || 'published',
      eventData: {
        ...(existing.eventData || {}),
        ...(updates.eventData || {}),
      } as EventData,
      isLifetime: existing.isLifetime ?? true,
      expiresAt: existing.expiresAt || null,
      proInteractiveEnabled: existing.proInteractiveEnabled ?? true,
      metrics: existing.metrics || { viewsCount: 1, rsvpsCount: 0, dietaryCount: 0 },
      createdAt: existing.createdAt || now,
      updatedAt: now,
    };

    const cleanUpdated = JSON.parse(JSON.stringify(updatedWebsite)) as EventWebsite;

    // 1. Direct Cloud Firestore write (PRIMARY)
    try {
      const siteDocRef = doc(db, 'websites', id);
      await setDoc(siteDocRef, cleanUpdated, { merge: true });
    } catch (fsErr: any) {
      console.error('[EventService] Direct Firestore updateWebsite error:', fsErr);
      const detail = fsErr?.message ? ` (${fsErr.message})` : '';
      throw new Error(`Failed to update website in database${detail}.`);
    }

    // 2. Update user-scoped local storage
    this.cacheLocally(cleanUpdated, effectiveUserId);

    // 3. Secondary dev API sync
    try {
      await apiService.updateWebsite(id, updates);
    } catch {
      // expected on static Firebase Hosting
    }

    return cleanUpdated;
  }

  /**
   * Delete website in Cloud Firestore
   */
  public async deleteWebsite(id: string, userId?: string): Promise<boolean> {
    const effectiveUid = userId || auth.currentUser?.uid;

    // 1. Remove from local caches
    try {
      localStorage.removeItem(`tempo_site_${id}`);
      if (effectiveUid) {
        localStorage.removeItem(`tempo_site_${effectiveUid}_${id}`);
        const userKey = `tempo_user_websites_${effectiveUid}`;
        const raw = localStorage.getItem(userKey);
        if (raw) {
          const sites = JSON.parse(raw);
          if (Array.isArray(sites)) {
            const filtered = sites.filter((s: EventWebsite) => s.id !== id);
            localStorage.setItem(userKey, JSON.stringify(filtered));
          }
        }
      }
    } catch (_) {}

    // 2. Direct Cloud Firestore delete
    try {
      if (auth.currentUser) {
        await deleteDoc(doc(db, 'websites', id));
      }
    } catch (fsErr) {
      console.warn('[EventService] Firestore deleteDoc notice:', fsErr);
    }

    // 3. Dev API fallback
    try {
      await apiService.deleteWebsite(id);
    } catch (_) {}

    return true;
  }

  /**
   * Duplicate an existing website under the current user's account
   */
  public async duplicateWebsite(id: string, userId?: string): Promise<EventWebsite | null> {
    const original = await this.getWebsiteById(id, userId);
    if (!original) return null;

    const copyTitle = `${original.title} (Copy)`;
    const copySlug = `${original.slug}-copy-${Date.now().toString(36).substring(2, 6)}`;

    return this.createWebsite({
      userId: userId || auth.currentUser?.uid,
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

  /* ================= SAVED DRAFTS ================= */
  public async saveDraft(payload: {
    id?: string;
    siteId?: string | null;
    templateId: string;
    title: string;
    slug?: string | null;
    eventType?: string;
    eventData: Record<string, unknown>;
  }): Promise<SavedDraft> {
    const draftId = payload.id || `draft_${Date.now()}`;
    const now = new Date().toISOString();
    const uid = auth.currentUser?.uid || 'guest';
    const draftRecord: SavedDraft = {
      id: draftId,
      siteId: payload.siteId || null,
      userId: uid,
      templateId: payload.templateId,
      title: payload.title || 'Untitled Draft',
      slug: payload.slug || null,
      eventType: payload.eventType || 'Celebration',
      eventData: payload.eventData,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };

    try {
      localStorage.setItem(`tempo_draft_${payload.templateId}`, JSON.stringify(payload.eventData));
      if (payload.siteId) {
        localStorage.setItem(`tempo_draft_${payload.siteId}`, JSON.stringify(draftRecord));
      }
    } catch (_) {}

    try {
      if (auth.currentUser) {
        const cleanDraft = JSON.parse(JSON.stringify(draftRecord)) as SavedDraft;
        await setDoc(doc(db, 'drafts', draftId), cleanDraft, { merge: true });
      }
    } catch (_) {}

    try {
      await apiService.saveDraft(payload);
    } catch (_) {}

    return draftRecord;
  }

  public async getUserDrafts(): Promise<SavedDraft[]> {
    if (auth.currentUser) {
      try {
        const q = query(collection(db, 'drafts'), where('userId', '==', auth.currentUser.uid));
        const snap = await getDocs(q);
        const list: SavedDraft[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as SavedDraft));
        if (list.length > 0) return list;
      } catch (_) {}
    }
    try {
      const list = await apiService.getUserDrafts();
      if (list && Array.isArray(list)) return list;
    } catch (_) {}
    return [];
  }

  public async getDraftById(id: string): Promise<SavedDraft | null> {
    try {
      const raw = localStorage.getItem(`tempo_draft_${id}`);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    if (auth.currentUser) {
      try {
        const snap = await getDoc(doc(db, 'drafts', id));
        if (snap.exists()) return { id: snap.id, ...snap.data() } as SavedDraft;
      } catch (_) {}
    }
    return apiService.getDraftById(id);
  }

  public async deleteDraft(id: string): Promise<boolean> {
    try {
      localStorage.removeItem(`tempo_draft_${id}`);
    } catch (_) {}
    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'drafts', id));
      } catch (_) {}
    }
    return apiService.deleteDraft(id);
  }

  /* ================= RSVPS (DIRECT FIRESTORE + API) ================= */
  public async recordRsvp(slug: string, payload: Record<string, unknown>): Promise<boolean> {
    const cleanSlug = slug.toLowerCase().trim();
    try {
      await addDoc(collection(db, 'rsvps'), {
        slug: cleanSlug,
        ...payload,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('[EventService] Direct Firestore recordRsvp notice:', err);
    }
    try {
      return await apiService.recordRsvp(cleanSlug, payload);
    } catch {
      return true;
    }
  }

  public async getRsvps(slug: string): Promise<Array<Record<string, unknown>>> {
    const cleanSlug = slug.toLowerCase().trim();
    const results: Array<Record<string, unknown>> = [];
    try {
      const q = query(collection(db, 'rsvps'), where('slug', '==', cleanSlug));
      const snap = await getDocs(q);
      snap.forEach((d) => results.push({ id: d.id, ...d.data() }));
      if (results.length > 0) return results;
    } catch (_) {}

    try {
      return await apiService.getRsvps(cleanSlug);
    } catch {
      return results;
    }
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
    fetch(`/api/hubs/${encodeURIComponent(cleanSlug)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studyGroups: groups }),
    }).catch(() => {});
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
}

export const eventService = new EventService();
