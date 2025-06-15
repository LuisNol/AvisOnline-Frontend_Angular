export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  location?: string;
  memberSince: string;
  isVerified: boolean;
  roles?: string[];
  permissions?: string[];
  statistics?: UserStatistics;
  preferences?: UserPreferences;
  created_at: string;
  updated_at?: string;
}

export interface UserStatistics {
  totalAnnouncements: number;
  activeAnnouncements: number;
  soldAnnouncements: number;
  totalViews: number;
  averageRating?: number;
  totalRatings?: number;
}

export interface UserPreferences {
  language: 'es' | 'en';
  currency: 'USD' | 'PEN';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  privacy: {
    showPhone: boolean;
    showEmail: boolean;
    allowContact: boolean;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  location?: string;
  acceptTerms: boolean;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  location?: string;
  avatar?: File;
  preferences?: Partial<UserPreferences>;
} 