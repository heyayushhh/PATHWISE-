import { Response, NextFunction } from "express";
import { verifyToken } from "../utils";
import { createApiResponse } from "../utils";
import type { AuthenticatedRequest } from "../types";

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json(
      createApiResponse(false, "Authorization header missing or invalid", null, {
        auth: ["Missing or invalid Authorization header"],
      }),
    );
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json(
      createApiResponse(false, "Invalid or expired token", null, {
        auth: ["Invalid or expired token"],
      }),
    );
  }
}
