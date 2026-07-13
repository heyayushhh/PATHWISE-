import { Request, Response } from "express";
import { registerUser, loginUser, getCurrentUser } from "../services";
import { registerSchema, loginSchema } from "../validators";
import { createApiResponse } from "../utils";
import type { AuthenticatedRequest } from "../types";

export async function register(req: Request, res: Response) {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      const errors: Record<string, string[]> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        errors[path] = errors[path] ? [...errors[path], issue.message] : [issue.message];
      });
      return res.status(400).json(createApiResponse(false, "Validation failed", null, errors));
    }

    const { user, accessToken, refreshToken } = await registerUser(validation.data);
    return res.status(201).json(
      createApiResponse(true, "User registered successfully", {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
        },
        accessToken,
        refreshToken,
      }),
    );
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json(createApiResponse(false, err.message));
    }
    return res.status(500).json(createApiResponse(false, "Internal server error"));
  }
}

export async function login(req: Request, res: Response) {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      const errors: Record<string, string[]> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        errors[path] = errors[path] ? [...errors[path], issue.message] : [issue.message];
      });
      return res.status(400).json(createApiResponse(false, "Validation failed", null, errors));
    }

    const { user, accessToken, refreshToken } = await loginUser(validation.data);
    return res.status(200).json(
      createApiResponse(true, "Login successful", {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        accessToken,
        refreshToken,
      }),
    );
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json(createApiResponse(false, err.message));
    }
    return res.status(500).json(createApiResponse(false, "Internal server error"));
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json(createApiResponse(false, "Not authenticated"));
    }
    const { user, profile } = await getCurrentUser(req.user.userId);
    return res.status(200).json(
      createApiResponse(true, "User retrieved successfully", {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
        },
        profile,
      }),
    );
  } catch (err) {
    if (err instanceof Error) {
      return res.status(404).json(createApiResponse(false, err.message));
    }
    return res.status(500).json(createApiResponse(false, "Internal server error"));
  }
}

export async function logout(req: Request, res: Response) {
  try {
    return res.status(200).json(createApiResponse(true, "Logged out successfully"));
  } catch (err) {
    return res.status(500).json(createApiResponse(false, "Internal server error"));
  }
}
