import { db } from "../../db";
import { roadmaps } from "../../db/schemas";
import { eq, and } from "drizzle-orm";
import { buildRoadmapContext } from "./roadmap.context";

const MS2_URL = process.env.MS2_INTERNAL_URL || "http://127.0.0.1:3002";
export const ROADMAP_VERSION = 1;
export const PROMPT_VERSION = 1;

export class RoadmapService {
  /**
   * Retrieves or generates a personalized roadmap.
   * Uses an atomic database insertion to prevent concurrent generation.
   */
  static async getOrGenerateRoadmap(sessionStr: string, userId: string, forceRetry = false) {
    // 1. Build canonical context
    const context = await buildRoadmapContext(sessionStr, userId);
    const recommendationId = context.selectedTarget.id;

    // 2. Check Cache
    const existingRoadmap = await db.query.roadmaps.findFirst({
      where: and(
        eq(roadmaps.assessmentSessionId, sessionStr),
        eq(roadmaps.recommendationId, recommendationId),
        eq(roadmaps.roadmapVersion, ROADMAP_VERSION),
        eq(roadmaps.promptVersion, PROMPT_VERSION)
      ),
    });

    if (existingRoadmap) {
      if (existingRoadmap.generationStatus === "AVAILABLE" || existingRoadmap.generationStatus === "GENERATING") {
        return existingRoadmap;
      }
      
      if (existingRoadmap.generationStatus === "FAILED" && !forceRetry) {
        return existingRoadmap;
      }
      
      // If FAILED and forceRetry, we will delete the old FAILED row and attempt generation again
      if (existingRoadmap.generationStatus === "FAILED" && forceRetry) {
         await db.delete(roadmaps).where(eq(roadmaps.id, existingRoadmap.id));
      }
    }

    // 3. Atomic Cache Miss - Insert GENERATING
    let roadmapId: string;
    try {
      const inserted = await db
        .insert(roadmaps)
        .values({
          userId,
          assessmentSessionId: sessionStr,
          recommendationId,
          targetEntityType: context.selectedTarget.recommendationType,
          targetEntityId: context.selectedTarget.entityId,
          generationStatus: "GENERATING",
          roadmapVersion: ROADMAP_VERSION,
          promptVersion: PROMPT_VERSION,
        })
        .returning({ id: roadmaps.id });
      
      roadmapId = inserted[0].id;
    } catch (e: any) {
      // If insertion fails due to unique constraint, another request won the race.
      if (e.code === "23505") {
        return await db.query.roadmaps.findFirst({
          where: and(
            eq(roadmaps.assessmentSessionId, sessionStr),
            eq(roadmaps.recommendationId, recommendationId),
            eq(roadmaps.roadmapVersion, ROADMAP_VERSION),
            eq(roadmaps.promptVersion, PROMPT_VERSION)
          ),
        });
      }
      throw e;
    }

    // 4. Generate (Async, but we await it here for the initiating request)
    // To avoid keeping the client waiting too long, we might do this synchronously 
    // or trigger it and let the client poll. Since the instruction says:
    // "After Gemini success: Validate response. Persist roadmapJson. Set status AVAILABLE."
    // and "Concurrent requests must receive GENERATING. ... Return AVAILABLE roadmap immediately if cached. If missing, acquire generation lock. Call MS2. Validate MS2 response. Persist. Return roadmap."
    // We will await MS2 here.
    try {
      const ms2Response = await fetch(`${MS2_URL}/api/roadmap/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(context),
      });

      if (!ms2Response.ok) {
        throw new Error(`MS2 responded with ${ms2Response.status}`);
      }

      const roadmapData = await ms2Response.json() as any;

      // Final MS1 validation
      if (!roadmapData || !roadmapData.title || !Array.isArray(roadmapData.milestones)) {
        throw new Error("MS2 returned a structurally invalid roadmap contract");
      }

      const updated = await db
        .update(roadmaps)
        .set({
          generationStatus: "AVAILABLE",
          roadmapJson: roadmapData,
          model: roadmapData.model || "gemini-2.5-pro",
          generatedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(roadmaps.id, roadmapId))
        .returning();

      return updated[0];

    } catch (error: any) {
      console.error(`[RoadmapService] Generation failed:`, error.message);
      const failed = await db
        .update(roadmaps)
        .set({
          generationStatus: "FAILED",
          failureReason: error.message || "Unknown error during roadmap generation",
          updatedAt: new Date(),
        })
        .where(eq(roadmaps.id, roadmapId))
        .returning();
      
      return failed[0];
    }
  }
}
