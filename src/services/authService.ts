import { User, LoginCredentials, SignUpCredentials } from '@/types';
import { mockCurrentUser } from './mockData';

const AUTH_STORAGE_KEY = 'tempo_auth_user_v1';

class AuthService {
  private currentUser: User | null = null;

  constructor() {
    this.init();
  }

  private init() {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        this.currentUser = JSON.parse(saved);
      } else {
        // Default authenticated demo user for seamless preview
        this.currentUser = { ...mockCurrentUser };
        this.save();
      }
    } catch {
      this.currentUser = { ...mockCurrentUser };
    }
  }

  private save() {
    try {
      if (this.currentUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Auth save failed:', e);
    }
  }

  public getCurrentUser(): User | null {
    return this.currentUser ? { ...this.currentUser } : null;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public async login(credentials: LoginCredentials): Promise<User> {
    // Stage 1 mockup provider - ready for Auth integration in Stage 2
    this.currentUser = {
      id: `usr_${Date.now()}`,
      name: credentials.email.split('@')[0] || 'Tempo Creator',
      email: credentials.email,
      createdAt: new Date().toISOString(),
    };
    this.save();
    return { ...this.currentUser };
  }

  public async loginWithGoogle(): Promise<User> {
    this.currentUser = {
      id: `usr_google_${Date.now()}`,
      name: 'Google User',
      email: 'user@gmail.com',
      avatarUrl: '',
      createdAt: new Date().toISOString(),
    };
    this.save();
    return { ...this.currentUser };
  }

  public async signUp(credentials: SignUpCredentials): Promise<User> {
    this.currentUser = {
      id: `usr_${Date.now()}`,
      name: credentials.name,
      email: credentials.email,
      createdAt: new Date().toISOString(),
    };
    this.save();
    return { ...this.currentUser };
  }

  public async logout(): Promise<void> {
    this.currentUser = null;
    this.save();
  }
}

export const authService = new AuthService();
