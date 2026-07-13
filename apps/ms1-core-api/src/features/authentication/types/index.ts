import { Request } from "express";

export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data: T | null;
  errors: Record<string, string[]> | null;
  timestamp: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}
