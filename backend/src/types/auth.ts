export interface User {
  id: string;
  username: string;
  email: string;
  agency: 'NIS' | 'DCI' | 'KDF' | 'ACA' | 'KRA' | 'KEBS' | 'KPS' | 'FRC';
  clearance_level: 'UNCLASSIFIED' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  role: 'ANALYST' | 'OPERATOR' | 'SUPERVISOR' | 'DIRECTOR' | 'ADMIN';
  is_active: boolean;
  created_at: Date;
  last_login?: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
  agency: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    access_token: string;
    refresh_token: string;
    user: Omit<User, 'password'>;
    expires_in: number;
  };
  message: string;
  timestamp: string;
}
