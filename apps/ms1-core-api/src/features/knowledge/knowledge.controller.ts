import { Request, Response } from "express";
import { knowledgeService } from "./knowledge.service";
import { logger } from "../../utils/logger";

export const getCareerController = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const career = await knowledgeService.getCareerBySlug(slug);
    if (!career) {
      return res.status(404).json({ error: "Career not found" });
    }
    return res.status(200).json(career);
  } catch (error: any) {
    logger.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getCourseController = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const course = await knowledgeService.getCourseBySlug(slug);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    return res.status(200).json(course);
  } catch (error: any) {
    logger.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};