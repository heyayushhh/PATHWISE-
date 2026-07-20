import { Request, Response } from "express";
import { RoadmapService } from "./roadmap.service";

export class RoadmapController {
  static async getRoadmap(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const userId = (req as any).user.userId;

      const roadmap = await RoadmapService.getOrGenerateRoadmap(String(sessionId), userId, false);
      return res.json({ roadmap });
    } catch (error: any) {
      console.error("[Roadmap API]", error);
      if (error.message.includes("Forbidden") || error.message.includes("No target recommendation")) {
        return res.status(error.message.includes("Forbidden") ? 403 : 404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to fetch or generate roadmap" });
    }
  }

  static async retryRoadmap(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const userId = (req as any).user.userId;

      const roadmap = await RoadmapService.getOrGenerateRoadmap(String(sessionId), userId, true);
      return res.json({ roadmap });
    } catch (error: any) {
      console.error("[Roadmap API Retry]", error);
      if (error.message.includes("Forbidden") || error.message.includes("No target recommendation")) {
        return res.status(error.message.includes("Forbidden") ? 403 : 404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to retry roadmap generation" });
    }
  }
}
