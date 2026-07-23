import { Router } from "express";

import { authenticate } from "../features/authentication/middlewares";
import { authRoutes } from "../features/authentication/routes";
import { authLimiter, assessmentLimiter } from "../middlewares/rateLimiter";

import assessmentRoutes from "../features/assessment/assessment.routes";
import { knowledgeRouter } from "../features/knowledge/knowledge.routes";
import exploreRoutes from "../features/explore/explore.routes";
import roadmapRoutes from "../features/roadmap/roadmap.routes";

const router = Router();

// Authentication routes
// authLimiter (20/15m) sits inside the generalLimiter (200/15m) — intentionally
// cumulative. The stricter authLimiter is the effective ceiling for /auth.
router.use("/auth", authLimiter, authRoutes);

// Public knowledge routes
router.use("/knowledge", knowledgeRouter);

// Protected assessment routes
// assessmentLimiter (150/15m) sits inside the generalLimiter (200/15m) —
// intentionally cumulative. Assessment is multi-turn so 150/15m gives ample
// headroom for legitimate sessions while blocking scripted abuse.
router.use("/assessment", assessmentLimiter, authenticate, assessmentRoutes);

// Protected explore routes (authentication is inside the router)
router.use("/explore", exploreRoutes);

// Protected roadmap routes (authentication is inside the router)
router.use("/roadmap", roadmapRoutes);

export default router;