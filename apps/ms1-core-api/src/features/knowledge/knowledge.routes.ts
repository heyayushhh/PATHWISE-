import { Router } from "express";
import { getCareerController, getCourseController } from "./knowledge.controller";

export const knowledgeRouter = Router();

knowledgeRouter.get("/careers/:slug", getCareerController);
knowledgeRouter.get("/courses/:slug", getCourseController);
