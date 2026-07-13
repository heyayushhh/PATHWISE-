import { Router } from "express";
import * as controllers from "../controllers";
import { authenticate } from "../middlewares";

const router = Router();

router.post("/register", controllers.register);
router.post("/login", controllers.login);
router.get("/me", authenticate, controllers.getMe);
router.post("/logout", authenticate, controllers.logout);

export const authRoutes = router;
