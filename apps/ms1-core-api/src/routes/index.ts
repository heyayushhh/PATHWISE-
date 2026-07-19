import { Router } from "express";

import { authenticate } from "../features/authentication/middlewares";
import { authRoutes } from "../features/authentication/routes";

import assessmentRoutes from "../features/assessment/assessment.routes";
import { knowledgeRouter } from "../features/knowledge/knowledge.routes";

const router = Router();

// Authentication routes
router.use("/auth", authRoutes);

// Public knowledge routes
router.use("/knowledge", knowledgeRouter);

// Protected assessment routes
router.use("/assessment", authenticate, assessmentRoutes);

export default router;