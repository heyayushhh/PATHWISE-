import rateLimit from "express-rate-limit";
import { createApiResponse } from "../features/authentication/utils";
import type { Request, Response } from "express";

// ---------------------------------------------------------------------------
// RATE LIMITER STORE NOTE
// ---------------------------------------------------------------------------
// All three limiters below use the default MemoryStore (in-process, no external
// dependency). This is intentional: PathWise currently runs a single MS1
// instance, so a shared store is not required.
//
// ⚠️  IMPORTANT — BEFORE HORIZONTAL SCALING:
// If MS1 is ever scaled to more than one replica (e.g. Docker Swarm replicas,
// ECS tasks, or Kubernetes pods), each process will maintain its own independent
// counter. An attacker could exceed the true limit by round-robining across
// instances. Before scaling MS1, migrate the store to the provisioned Redis
// instance using the `rate-limit-redis` package:
//
//   import RedisStore from "rate-limit-redis";
//   import { redisClient } from "../db/redis";
//   store: new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) })
//
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// CUMULATIVE LIMITS — INTENTIONAL DESIGN
// ---------------------------------------------------------------------------
// The auth and assessment limiters are applied *inside* the /api router, which
// already has the general limiter applied upstream. This means requests to auth
// and assessment endpoints are subject to TWO limits simultaneously:
//
//   - Auth requests    → generalLimiter (200/15m)  AND  authLimiter (20/15m)
//   - Assessment reqs  → generalLimiter (200/15m)  AND  assessmentLimiter (150/15m)
//
// The stricter per-route limiter is the effective ceiling for that route group.
// This is intentional: the general limiter provides a coarse overall backstop
// while the specialised limiters enforce tighter per-feature policies.
// ---------------------------------------------------------------------------

/** Shared handler that returns a consistent JSON 429 response. */
function rateLimitHandler(req: Request, res: Response): void {
  res.status(429).json(
    createApiResponse(
      false,
      "Too many requests. Please slow down and try again later.",
    ),
  );
}

// ---------------------------------------------------------------------------
// A. GENERAL API LIMITER
// ---------------------------------------------------------------------------
// Applied to all /api/* routes.
// /health is at the root path and is NOT under /api, so it is excluded
// automatically — infrastructure health checks are never affected.
//
// 200 requests per IP per 15-minute window.
// ---------------------------------------------------------------------------
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,  // Emit RateLimit-* headers (RFC draft 7)
  legacyHeaders: false,   // Suppress X-RateLimit-* headers
  handler: rateLimitHandler,
});

// ---------------------------------------------------------------------------
// B. AUTHENTICATION LIMITER
// ---------------------------------------------------------------------------
// Applied to the entire /api/auth router.
// Covers: POST /register, POST /login, POST /google, GET /me,
//         POST /logout, PATCH /update-stage
//
// The tighter limit (20/15m) is the effective ceiling for auth endpoints
// because this limiter fires before the handler and after the generalLimiter
// in the middleware chain.
//
// 20 requests per IP per 15-minute window.
// ---------------------------------------------------------------------------
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// ---------------------------------------------------------------------------
// C. ASSESSMENT LIMITER
// ---------------------------------------------------------------------------
// Applied to the entire /api/assessment router.
// Assessment is a multi-turn session: one user session naturally generates
// several requests (start → multiple answer submissions → complete/result).
// A conservative value of 150/15m protects against scripted abuse while
// giving ample headroom for legitimate multi-turn interactions.
//
// 150 requests per IP per 15-minute window.
// ---------------------------------------------------------------------------
export const assessmentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});
