export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data: T | null;
  errors: Record<string, string[]> | null;
  timestamp: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role?: string;
}

export interface Profile {
  id: string;
  userId: string;
  currentStage: string;
  assessmentStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface GetMeResponse {
  user: User;
  profile: Profile;
}
