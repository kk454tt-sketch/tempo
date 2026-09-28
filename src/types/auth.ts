export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface SignUpCredentials {
  name: string;
  email: string;
  password?: string;
}

export interface AuthState {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
