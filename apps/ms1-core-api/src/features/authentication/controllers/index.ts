import { Request, Response } from "express";
import { registerUser, loginUser, googleAuthUser, getCurrentUser, updateStage } from "../services";
import { registerSchema, loginSchema } from "../validators";
import { createApiResponse } from "../utils";
import type { AuthenticatedRequest } from "../types";

function resolveAuthErrorMessage(err: unknown, fallback: string) {
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof err.code === "string" &&
    err.code.toUpperCase() === "ECONNREFUSED"
  ) {
    return "Database is unavailable. Start PostgreSQL and try again.";
  }

  if (err instanceof Error) {
    const normalizedMessage = err.message.trim();
    const lowerMessage = normalizedMessage.toLowerCase();

    if (
      lowerMessage.includes("econnrefused") ||
      lowerMessage.includes("database") ||
      lowerMessage.includes("connect") ||
      lowerMessage.includes("postgres")
    ) {
      return "Database is unavailable. Start PostgreSQL and try again.";
    }

    return normalizedMessage || fallback;
  }

  return fallback;
}

function resolveAuthStatusCode(err: unknown, fallback = 400) {
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof err.code === "string" &&
    err.code.toUpperCase() === "ECONNREFUSED"
  ) {
    return 503;
  }

  if (
    typeof err === "object" &&
    err !== null &&
    "errors" in err &&
    Array.isArray(err.errors) &&
    err.errors.some(
      (nestedError) =>
        typeof nestedError === "object" &&
        nestedError !== null &&
        "code" in nestedError &&
        typeof nestedError.code === "string" &&
        nestedError.code.toUpperCase() === "ECONNREFUSED",
    )
  ) {
    return 503;
  }

  if (err instanceof Error) {
    const lowerMessage = err.message.toLowerCase();

    if (
      lowerMessage.includes("econnrefused") ||
      lowerMessage.includes("database") ||
      lowerMessage.includes("connect") ||
      lowerMessage.includes("postgres")
    ) {
      return 503;
    }
  }

  return fallback;
}

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

    const { user, profile, accessToken, refreshToken } = await registerUser(validation.data);
    return res.status(201).json(
      createApiResponse(true, "User registered successfully", {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
        },
        profile,
        accessToken,
        refreshToken,
      }),
    );
  } catch (err) {
    console.error(err);

    if (err instanceof Error) {
      return res
        .status(resolveAuthStatusCode(err))
        .json(createApiResponse(false, resolveAuthErrorMessage(err, "Registration failed")));
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

    const { user, profile, accessToken, refreshToken } = await loginUser(validation.data);
    return res.status(200).json(
      createApiResponse(true, "Login successful", {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
        },
        profile,
        accessToken,
        refreshToken,
      }),
    );
  } catch (err) {
    console.error(err);

    if (err instanceof Error) {
      return res
        .status(resolveAuthStatusCode(err))
        .json(createApiResponse(false, resolveAuthErrorMessage(err, "Login failed")));
    }

    return res.status(500).json(createApiResponse(false, "Internal server error"));
  }
}

export async function googleAuth(req: Request, res: Response) {
  try {
    const { credential } = req.body;
    if (!credential || typeof credential !== "string") {
      return res.status(400).json(createApiResponse(false, "Google credential is required"));
    }

    const { user, profile, accessToken, refreshToken, isNewUser } =
      await googleAuthUser(credential);

    return res.status(200).json(
      createApiResponse(true, "Google authentication successful", {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
        },
        profile,
        accessToken,
        refreshToken,
        isNewUser,
      }),
    );
  } catch (err) {
    console.error(err);

    if (err instanceof Error) {
      return res
        .status(resolveAuthStatusCode(err, 401))
        .json(createApiResponse(false, resolveAuthErrorMessage(err, "Google authentication failed")));
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
    console.error(err);

    if (err instanceof Error) {
      return res
        .status(resolveAuthStatusCode(err, 404))
        .json(createApiResponse(false, resolveAuthErrorMessage(err, "User not found")));
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

export async function updateStageController(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json(createApiResponse(false, "Not authenticated"));
    }
    const { stage } = req.body;
    if (!stage || !["Class 10", "Class 12"].includes(stage)) {
      return res.status(400).json(createApiResponse(false, "Invalid stage selected"));
    }
    const profile = await updateStage(userId, stage);
    return res.status(200).json(createApiResponse(true, "Stage updated successfully", { profile }));
  } catch (err) {
    console.error(err);
    return res.status(500).json(createApiResponse(false, "Failed to update stage"));
  }
}
