import { EventWebsite, EventData, User } from '@/types';

class ApiService {
  private baseUrl = '/api';

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP error! Status: ${res.status}`);
    }
    return data as T;
  }

  /* ================= AUTHENTICATION ================= */
  public async register(payload: { name?: string; email: string; password?: string }): Promise<User> {
    const data = await this.request<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data.user;
  }

  public async login(payload: { email: string; password?: string }): Promise<User> {
    const data = await this.request<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data.user;
  }

  public async googleLogin(payload: { email?: string; name?: string; avatarUrl?: string }): Promise<User> {
    const data = await this.request<{ user: User }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data.user;
  }

  public async getMe(userId: string): Promise<User | null> {
    try {
      const data = await this.request<{ user: User }>(`/auth/me?userId=${encodeURIComponent(userId)}`);
      return data.user;
    } catch {
      return null;
    }
  }

  /* ================= EVENT WEBSITES ================= */
  public async getUserWebsites(userId: string): Promise<EventWebsite[]> {
    const data = await this.request<{ websites: EventWebsite[] }>(
      `/websites?userId=${encodeURIComponent(userId)}`
    );
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
    userId: string;
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

  public async deleteWebsite(id: string, userId?: string): Promise<boolean> {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    await this.request<{ success: boolean }>(`/websites/${encodeURIComponent(id)}${query}`, {
      method: 'DELETE',
    });
    return true;
  }

  /* ================= RSVPS ================= */
  public async recordRsvp(
    slug: string,
    rsvpData: Record<string, unknown>
  ): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/rsvps', {
      method: 'POST',
      body: JSON.stringify({ slug, ...rsvpData }),
    });
  }

  public async getRsvps(slug: string): Promise<Array<Record<string, unknown>>> {
    try {
      const data = await this.request<{ rsvps: Array<Record<string, unknown>> }>(
        `/rsvps/${encodeURIComponent(slug.toLowerCase().trim())}`
      );
      return data.rsvps || [];
    } catch {
      return [];
    }
  }

  /* ================= STUDENT PORTAL & HUBS ================= */
  public async getHubData(
    slug: string
  ): Promise<{
    hubData: Record<string, unknown> | null;
    superlativeVotes: Record<string, number>;
    studyGroups: Array<Record<string, unknown>>;
  }> {
    try {
      return await this.request<{
        hubData: Record<string, unknown> | null;
        superlativeVotes: Record<string, number>;
        studyGroups: Array<Record<string, unknown>>;
      }>(`/hubs/${encodeURIComponent(slug.toLowerCase().trim())}`);
    } catch {
      return { hubData: null, superlativeVotes: {}, studyGroups: [] };
    }
  }

  public async saveHubData(slug: string, hubData: Record<string, unknown>, websiteId?: string): Promise<void> {
    await this.request<{ success: boolean }>(`/hubs/${encodeURIComponent(slug.toLowerCase().trim())}`, {
      method: 'PUT',
      body: JSON.stringify({ hubData, websiteId }),
    });
  }

  public async castVote(slug: string, superlativeKey: string): Promise<Record<string, number>> {
    const data = await this.request<{ success: boolean; votes: Record<string, number> }>(
      `/hubs/${encodeURIComponent(slug.toLowerCase().trim())}/vote`,
      {
        method: 'POST',
        body: JSON.stringify({ superlativeKey }),
      }
    );
    return data.votes || {};
  }

  public async getStudyGroups(slug: string): Promise<Array<Record<string, unknown>>> {
    try {
      const data = await this.request<{ groups: Array<Record<string, unknown>> }>(
        `/hubs/${encodeURIComponent(slug.toLowerCase().trim())}/groups`
      );
      return data.groups || [];
    } catch {
      return [];
    }
  }

  public async saveStudyGroups(slug: string, groups: Array<Record<string, unknown>>): Promise<void> {
    await this.request<{ success: boolean }>(
      `/hubs/${encodeURIComponent(slug.toLowerCase().trim())}/groups`,
      {
        method: 'POST',
        body: JSON.stringify({ groups }),
      }
    );
  }
}

export const apiService = new ApiService();
