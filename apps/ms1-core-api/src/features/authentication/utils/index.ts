import jwt from "jsonwebtoken";
import { config } from "../../../config";
import type { JwtPayload, ApiResponse } from "../types";

const jwtSecret = config.jwt.secret as string;

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
  return jwt.sign(payload as object, jwtSecret as any, {
    expiresIn: config.jwt.accessExpiresIn as any,
  } as any);
}

export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload as object, jwtSecret as any, {
    expiresIn: config.jwt.refreshExpiresIn as any,
  } as any);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, jwtSecret) as JwtPayload;
}
