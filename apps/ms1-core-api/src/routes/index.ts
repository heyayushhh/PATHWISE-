import { Router } from "express";

import { authenticate } from "../features/authentication/middlewares";
import { authRoutes } from "../features/authentication/routes";

import assessmentRoutes from "../features/assessment/assessment.routes";


const router = Router();



// Authentication routes
router.use(
  "/auth",
  authRoutes
);



// Protected assessment routes
router.use(
  "/assessment",
  authenticate,
  assessmentRoutes
);



export default router;