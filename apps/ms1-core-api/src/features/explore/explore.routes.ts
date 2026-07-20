import { Router } from "express";
import { ExploreController } from "./explore.controller";
import { authenticate } from "../authentication/middlewares";

const router = Router();

router.use(authenticate);

router.get("/path/:slug", ExploreController.explorePath);
router.get("/course/:slug", ExploreController.exploreCourse);
router.get("/career/:slug", ExploreController.exploreCareer);

router.get("/compare/path", ExploreController.comparePaths);
router.get("/compare/course", ExploreController.compareCourses);
router.get("/compare/career", ExploreController.compareCareers);

router.get("/roadmap-context/:sessionId", ExploreController.getRoadmapContext);

export default router;
