export interface User {
  id: string;
  email: string;
  nickname: string;
  password: string; // В реальном проекте должен быть хэширован
  avatar?: string;
  rating: number;
  kd: number; // Kill/Death ratio
  registrationDate: string;
  status: string;
  level: number;
  wins: number;
  losses: number;
  totalMatches: number;
  lastLogin?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  avatar?: string;
  rating: number;
  kd: number;
  registrationDate: string;
  status: string;
  level: number;
  wins: number;
  losses: number;
  totalMatches: number;
  lastLogin?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  nickname: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: UserProfile;
  token?: string;
  message?: string;
}

export interface UpdateProfileRequest {
  nickname?: string;
  status?: string;
  avatar?: string;
}
