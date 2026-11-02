import { EventWebsite, EventData, User, UserProfile, UserSubscription, SavedDraft } from '@/types';

const TOKEN_STORAGE_KEY = 'tempo_session_token';

class ApiService {
  private baseUrl = '/api';
  private token: string | null = null;

  constructor() {
    try {
      this.token = sessionStorage.getItem(TOKEN_STORAGE_KEY) || localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      this.token = null;
    }
  }

  public setAuthToken(token: string | null): void {
    this.token = token;
    try {
      if (token) {
        sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      } else {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch {
      // storage quota or private browsing fallback
    }
  }

  public getAuthToken(): string | null {
    return this.token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }
    return data as T;
  }

  /* ================= AUTHENTICATION (PHASE 2) ================= */
  public async register(payload: { name?: string; email: string; password?: string }): Promise<{ user: User; token: string }> {
    const data = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data.token) {
      this.setAuthToken(data.token);
    }
    return data;
  }

  public async login(payload: { email: string; password?: string }): Promise<{ user: User; token: string }> {
    const data = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data.token) {
      this.setAuthToken(data.token);
    }
    return data;
  }

  public async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch {
      // ignore network errors on logout
    } finally {
      this.setAuthToken(null);
    }
  }

  public async getMe(): Promise<User | null> {
    if (!this.token) return null;
    try {
      const data = await this.request<{ user: User }>('/auth/me');
      return data.user;
    } catch {
      this.setAuthToken(null);
      return null;
    }
  }

  /* ================= USER PROFILE (PHASE 3) ================= */
  public async getProfile(): Promise<UserProfile | null> {
    try {
      const data = await this.request<{ profile: UserProfile }>('/profiles/me');
      return data.profile;
    } catch {
      return null;
    }
  }

  public async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const data = await this.request<{ profile: UserProfile }>('/profiles/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.profile;
  }

  /* ================= SITE OWNERSHIP & CRUD (PHASE 4 & 12) ================= */
  public async getUserWebsites(): Promise<EventWebsite[]> {
    const data = await this.request<{ websites: EventWebsite[] }>('/websites');
    return data.websites || [];
  }

  public async getWebsiteById(id: string): Promise<EventWebsite | null> {
    try {
      const data = await this.request<{ website: EventWebsite }>(`/websites/${encodeURIComponent(id)}`);
      return data.website;
    } catch {
      return null;
    }
  }

  public async getWebsiteBySlug(slug: string): Promise<EventWebsite | null> {
    try {
      const data = await this.request<{ website: EventWebsite }>(
        `/websites/by-slug/${encodeURIComponent(slug.toLowerCase().trim())}`
      );
      return data.website;
    } catch {
      return null;
    }
  }

  public async createWebsite(payload: {
    templateId: string;
    title: string;
    eventType: string;
    slug: string;
    eventData: EventData;
    status?: string;
  }): Promise<EventWebsite> {
    const data = await this.request<{ website: EventWebsite }>('/websites', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data.website;
  }

  public async updateWebsite(
    id: string,
    updates: Partial<EventWebsite> & { eventData?: Partial<EventData> }
  ): Promise<EventWebsite> {
    const data = await this.request<{ website: EventWebsite }>(`/websites/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.website;
  }

  public async deleteWebsite(id: string): Promise<boolean> {
    const data = await this.request<{ success: boolean }>(`/websites/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return data.success;
  }

  /* ================= SAVED DRAFTS (PHASE 5) ================= */
  public async getUserDrafts(): Promise<SavedDraft[]> {
    const data = await this.request<{ drafts: SavedDraft[] }>('/drafts');
    return data.drafts || [];
  }

  public async getDraftById(id: string): Promise<SavedDraft | null> {
    try {
      const data = await this.request<{ draft: SavedDraft }>(`/drafts/${encodeURIComponent(id)}`);
      return data.draft;
    } catch {
      return null;
    }
  }

  public async saveDraft(payload: {
    id?: string;
    siteId?: string | null;
    templateId: string;
    title: string;
    slug?: string | null;
    eventType?: string;
    eventData: Record<string, unknown>;
  }): Promise<SavedDraft> {
    const data = await this.request<{ draft: SavedDraft }>('/drafts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data.draft;
  }

  public async deleteDraft(id: string): Promise<boolean> {
    const data = await this.request<{ success: boolean }>(`/drafts/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return data.success;
  }

  /* ================= SUBSCRIPTIONS & 1-MONTH PREMIUM (PHASES 7, 8, 9, 10, 11) ================= */
  public async getSubscription(): Promise<UserSubscription> {
    return this.request<UserSubscription>('/subscriptions/me');
  }

  public async verifyPayment(payload: {
    transactionReference: string;
    plan?: string;
    amount?: number;
    templateId?: string;
  }): Promise<{
    success: boolean;
    isPremiumActive: boolean;
    expiresAt: string;
    plan: string;
    message: string;
  }> {
    return this.request('/subscriptions/verify-payment', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /* ================= RSVPS (DATABASE PERSISTENCE) ================= */
  public async recordRsvp(slug: string, payload: Record<string, unknown>): Promise<boolean> {
    const data = await this.request<{ success: boolean }>('/rsvps', {
      method: 'POST',
      body: JSON.stringify({ slug, ...payload }),
    });
    return data.success;
  }

  public async getRsvps(slug: string): Promise<Array<Record<string, unknown>>> {
    const data = await this.request<{ rsvps: Array<Record<string, unknown>> }>(
      `/rsvps/${encodeURIComponent(slug.toLowerCase().trim())}`
    );
    return data.rsvps || [];
  }
}

export const apiService = new ApiService();
