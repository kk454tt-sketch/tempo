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
