export type UserRole = 'farmer' | 'agronomist' | 'researcher' | 'student';

export interface User {
  id: string;
  email: string;
  fullName: string;
  farmName?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
  farmName?: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}
