export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface UserSession {
  user: User | null;
  isAuthenticated: boolean;
  token?: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  profileData?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface UserSubscription {
  hasSubscription: boolean;
  isPremiumActive: boolean;
  plan: string;
  startedAt?: string | null;
  expiresAt?: string | null;
  paymentStatus?: string;
  daysRemaining?: number;
  message?: string;
}

export interface SavedDraft {
  id: string;
  siteId?: string | null;
  userId: string;
  templateId: string;
  title: string;
  slug?: string | null;
  eventType: string;
  eventData: Record<string, unknown>;
  status: string;
  createdAt: string;
  updatedAt: string;
}
