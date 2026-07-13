import jwt from "jsonwebtoken";
import { config } from "../../../config";
import type { JwtPayload, ApiResponse } from "../types";

export function createApiResponse<T = null>(
  success: boolean,
  message: string,
  data: T | null = null,
  errors: Record<string, string[]> | null = null,
): ApiResponse<T> {
  return {
    success,
    message,
    data,
    errors,
    timestamp: new Date().toISOString(),
  };
}

export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiresIn,
  });
}

export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
}
