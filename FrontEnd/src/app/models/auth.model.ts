export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

