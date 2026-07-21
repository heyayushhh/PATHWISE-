import { Router } from "express";
import * as controllers from "../controllers";
import { authenticate } from "../middlewares";

const router = Router();

router.post("/register", controllers.register);
router.post("/login", controllers.login);
router.post("/google", controllers.googleAuth);
router.get("/me", authenticate, controllers.getMe);
router.post("/logout", authenticate, controllers.logout);
router.patch("/update-stage", authenticate, controllers.updateStageController);

export const authRoutes = router;
