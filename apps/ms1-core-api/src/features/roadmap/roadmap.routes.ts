import { Router } from "express";
import { RoadmapController } from "./roadmap.controller";
import { authenticate } from "../authentication/middlewares";

const router = Router();

router.use(authenticate);

router.get("/:sessionId", RoadmapController.getRoadmap);
router.post("/:sessionId/retry", RoadmapController.retryRoadmap);

export default router;
