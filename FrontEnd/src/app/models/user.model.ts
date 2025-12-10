export interface User {
  _id?: string;
  id?: string; // For backward compatibility
  name: string;
  email?: string;
  password?: string; // Not included in responses
  role: 'user' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    role: 'user' | 'admin';
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}
