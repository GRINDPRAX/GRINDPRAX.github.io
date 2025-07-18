export interface User {
  id: string;
  email: string;
  nickname: string;
  password: string; // В реальном проекте должен быть хэширован
  avatar?: string;
  banner?: string;
  telegramId?: string; // Telegram user ID
  rating: number;
  kills: number; // Total kills
  deaths: number; // Total deaths
  kd: number; // Kill/Death ratio (calculated from kills/deaths)
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
  banner?: string;
  telegramId?: string;
  rating: number;
  kills: number;
  deaths: number;
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
  banner?: string;
}
