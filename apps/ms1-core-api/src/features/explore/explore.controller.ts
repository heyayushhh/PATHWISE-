import { Request, Response } from "express";
import { ExploreService } from "./explore.service";
import { db } from "../../db";
import { userRecommendations, assessmentSessions, studentAssessmentProfiles, recommendationSets, academicDirections, courses, careers, personalizedInsights } from "../../db/schemas";
import { eq, and } from "drizzle-orm";

export class ExploreController {
  
  private static async validateContext(userId: string, sessionId: string, slug: string, entityType: "ACADEMIC_DIRECTION" | "COURSE" | "CAREER") {
    // 1. Validate session ownership
    const session = await db.query.assessmentSessions.findFirst({
      where: and(
        eq(assessmentSessions.id, sessionId),
        eq(assessmentSessions.userId, userId)
      )
    });

    if (!session) {
      throw new Error("SESSION_NOT_FOUND");
    }

    // 2. Fetch student profile
    const profile = await db.query.studentAssessmentProfiles.findFirst({
      where: eq(studentAssessmentProfiles.assessmentSessionId, sessionId)
    });

    if (!profile) {
      throw new Error("PROFILE_NOT_FOUND");
    }

    // 3. Find the exact recommendation matching the slug and entity type
    // We must join the canonical table to match the slug.
    // For MVP, we can just fetch all recommendations for this session and find the match in memory
    // since the recommendation set is small (~3-5 items).
    
    // Better: We rely on the Canonical fetches from Service to get the ID, then check if it's in the recommendation set.
    let canonicalData: any = null;
    let entityId: string = "";
    
    if (entityType === "ACADEMIC_DIRECTION") {
      canonicalData = await ExploreService.getCanonicalAcademicDirection(slug);
      if (canonicalData) entityId = canonicalData.id;
    } else if (entityType === "COURSE") {
      canonicalData = await ExploreService.getCanonicalCourse(slug);
      if (canonicalData) entityId = canonicalData.id;
    } else if (entityType === "CAREER") {
      canonicalData = await ExploreService.getCanonicalCareer(slug);
      if (canonicalData) entityId = canonicalData.id;
    }

    if (!canonicalData || !entityId) {
      throw new Error("ENTITY_NOT_FOUND");
    }

    // Check if recommendation exists for this session and entity
    // We have to find the recommendationSetId for this session first
    const recommendationSet = await db.query.recommendationSets.findFirst({
      where: eq(recommendationSets.assessmentSessionId, sessionId)
    });
    
    // Quick fix: userRecommendations has no direct session ID, we need to join or find the set
    // Let's do it cleanly:
    const recommendations = await db.select({
      id: userRecommendations.id,
      matchScore: userRecommendations.matchScore,
      isTarget: userRecommendations.isTarget,
      academicDirectionId: userRecommendations.academicDirectionId,
      courseId: userRecommendations.courseId,
      careerId: userRecommendations.careerId
    })
    .from(userRecommendations)
    .innerJoin(recommendationSets, eq(userRecommendations.recommendationSetId, recommendationSets.id))
    .where(eq(recommendationSets.assessmentSessionId, sessionId));

    let matchedRec = recommendations.find(r => 
      (entityType === "ACADEMIC_DIRECTION" && r.academicDirectionId === entityId) ||
      (entityType === "COURSE" && r.courseId === entityId) ||
      (entityType === "CAREER" && r.careerId === entityId)
    );

    if (!matchedRec) {
      throw new Error("RECOMMENDATION_NOT_FOUND");
    }

    // 4. Validate Class 10/12 rules
    if (session.academicStage === "Class 10" && entityType !== "ACADEMIC_DIRECTION") {
      throw new Error("INVALID_STAGE_ENTITY");
    }
    if (session.academicStage === "Class 12" && entityType === "ACADEMIC_DIRECTION") {
      throw new Error("INVALID_STAGE_ENTITY");
    }

    return { session, profile, canonicalData, entityId, matchedRec };
  }

  static async explorePath(req: Request, res: Response) {
    try {
      const slug = String(req.params.slug);
      const sessionId = String(req.query.sessionId);
      const userId = (req as any).user.userId;

      if (!sessionId || typeof sessionId !== "string") {
        return res.status(400).json({ error: "sessionId query parameter is required" });
      }

      let context;
      try {
        context = await ExploreController.validateContext(userId, sessionId, slug, "ACADEMIC_DIRECTION");
      } catch (e: any) {
        if (e.message === "SESSION_NOT_FOUND") return res.status(403).json({ error: "Forbidden: Not your session" });
        if (e.message === "ENTITY_NOT_FOUND") return res.status(404).json({ error: "Path not found" });
        if (e.message === "RECOMMENDATION_NOT_FOUND") return res.status(403).json({ error: "Forbidden: Not in your recommendations" });
        if (e.message === "INVALID_STAGE_ENTITY") return res.status(400).json({ error: "Bad Request: Invalid entity for academic stage" });
        return res.status(400).json({ error: e.message });
      }

      const insightResp = await ExploreService.getPersonalizedInsight({
        userId,
        sessionId,
        recommendationId: context.matchedRec.id,
        entityType: "ACADEMIC_DIRECTION",
        entityId: context.entityId,
        canonicalData: context.canonicalData,
        studentProfile: context.profile,
        matchScore: context.matchedRec.matchScore
      });

      return res.json({
        entity: context.canonicalData,
        recommendation: {
          id: context.matchedRec.id,
          matchScore: context.matchedRec.matchScore,
          isTarget: context.matchedRec.isTarget
        },
        personalizedInsight: insightResp.insight,
        personalizationStatus: insightResp.status
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async exploreCourse(req: Request, res: Response) {
    try {
      const slug = String(req.params.slug);
      const sessionId = String(req.query.sessionId);
      const userId = (req as any).user.userId;

      if (!sessionId || typeof sessionId !== "string") {
        return res.status(400).json({ error: "sessionId query parameter is required" });
      }

      let context;
      try {
        context = await ExploreController.validateContext(userId, sessionId, slug, "COURSE");
      } catch (e: any) {
        if (e.message === "SESSION_NOT_FOUND") return res.status(403).json({ error: "Forbidden: Not your session" });
        if (e.message === "ENTITY_NOT_FOUND") return res.status(404).json({ error: "Course not found" });
        if (e.message === "RECOMMENDATION_NOT_FOUND") return res.status(403).json({ error: "Forbidden: Not in your recommendations" });
        if (e.message === "INVALID_STAGE_ENTITY") return res.status(400).json({ error: "Bad Request: Invalid entity for academic stage" });
        return res.status(400).json({ error: e.message });
      }

      const insightResp = await ExploreService.getPersonalizedInsight({
        userId,
        sessionId,
        recommendationId: context.matchedRec.id,
        entityType: "COURSE",
        entityId: context.entityId,
        canonicalData: context.canonicalData,
        studentProfile: context.profile,
        matchScore: context.matchedRec.matchScore
      });

      const finalPayload = {
        entity: context.canonicalData,
        recommendation: {
          id: context.matchedRec.id,
          matchScore: context.matchedRec.matchScore,
          isTarget: context.matchedRec.isTarget
        },
        personalizedInsight: insightResp.insight,
        personalizationStatus: insightResp.status
      };
      console.log("FINAL PAYLOAD FOR CAREER:", JSON.stringify(finalPayload.entity.typicalResponsibilities));
      return res.json(finalPayload);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async exploreCareer(req: Request, res: Response) {
    try {
      const slug = String(req.params.slug);
      const sessionId = String(req.query.sessionId);
      const userId = (req as any).user.userId;

      if (!sessionId || typeof sessionId !== "string") {
        return res.status(400).json({ error: "sessionId query parameter is required" });
      }

      let context;
      try {
        context = await ExploreController.validateContext(userId, sessionId, slug, "CAREER");
      } catch (e: any) {
        if (e.message === "SESSION_NOT_FOUND") return res.status(403).json({ error: "Forbidden: Not your session" });
        if (e.message === "ENTITY_NOT_FOUND") return res.status(404).json({ error: "Career not found" });
        if (e.message === "RECOMMENDATION_NOT_FOUND") return res.status(403).json({ error: "Forbidden: Not in your recommendations" });
        if (e.message === "INVALID_STAGE_ENTITY") return res.status(400).json({ error: "Bad Request: Invalid entity for academic stage" });
        return res.status(400).json({ error: e.message });
      }

      const insightResp = await ExploreService.getPersonalizedInsight({
        userId,
        sessionId,
        recommendationId: context.matchedRec.id,
        entityType: "CAREER",
        entityId: context.entityId,
        canonicalData: context.canonicalData,
        studentProfile: context.profile,
        matchScore: context.matchedRec.matchScore
      });

      return res.json({
        entity: context.canonicalData,
        recommendation: {
          id: context.matchedRec.id,
          matchScore: context.matchedRec.matchScore,
          isTarget: context.matchedRec.isTarget
        },
        personalizedInsight: insightResp.insight,
        personalizationStatus: insightResp.status
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async comparePaths(req: Request, res: Response) {
    try {
      const slugs = (req.query.slugs as string)?.split(",") || [];
      if (slugs.length < 2) return res.status(400).json({ error: "Need at least two slugs" });
      const data = await Promise.all(slugs.map(s => ExploreService.getCanonicalAcademicDirection(s)));
      return res.json({ data: data.filter(d => d !== null) });
    } catch (error) {
      return res.status(500).json({ error: "Error comparing paths" });
    }
  }

  static async compareCourses(req: Request, res: Response) {
    try {
      const slugs = (req.query.slugs as string)?.split(",") || [];
      if (slugs.length < 2) return res.status(400).json({ error: "Need at least two slugs" });
      const data = await Promise.all(slugs.map(s => ExploreService.getCanonicalCourse(s)));
      return res.json({ data: data.filter(d => d !== null) });
    } catch (error) {
      return res.status(500).json({ error: "Error comparing courses" });
    }
  }

  static async compareCareers(req: Request, res: Response) {
    try {
      const slugs = (req.query.slugs as string)?.split(",") || [];
      if (slugs.length < 2) return res.status(400).json({ error: "Need at least two slugs" });
      const data = await Promise.all(slugs.map(s => ExploreService.getCanonicalCareer(s)));
      return res.json({ data: data.filter(d => d !== null) });
    } catch (error) {
      return res.status(500).json({ error: "Error comparing careers" });
    }
  }

  static async getRoadmapContext(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const sessionStr = String(sessionId);
      const userId = (req as any).user.userId;

      // 1. Verify session
      const session = await db.query.assessmentSessions.findFirst({
        where: and(eq(assessmentSessions.id, sessionStr), eq(assessmentSessions.userId, userId))
      });
      if (!session) return res.status(403).json({ error: "Forbidden: Not your session" });

      // 2. Fetch profile
      const profile = await db.query.studentAssessmentProfiles.findFirst({
        where: eq(studentAssessmentProfiles.assessmentSessionId, sessionStr)
      });

      // 3. Find the TARGET recommendation
      const recommendations = await db.select({
        id: userRecommendations.id,
        matchScore: userRecommendations.matchScore,
        isTarget: userRecommendations.isTarget,
        recommendationType: userRecommendations.recommendationType,
        academicDirectionId: userRecommendations.academicDirectionId,
        courseId: userRecommendations.courseId,
        careerId: userRecommendations.careerId
      })
      .from(userRecommendations)
      .innerJoin(recommendationSets, eq(userRecommendations.recommendationSetId, recommendationSets.id))
      .where(and(eq(recommendationSets.assessmentSessionId, sessionStr), eq(userRecommendations.isTarget, true)));

      if (recommendations.length === 0) {
        return res.status(404).json({ error: "No target recommendation selected yet" });
      }

      const targetRec = recommendations[0];
      let canonicalTarget = null;
      let entityId = "";

      // We resolve the slug by querying canonical table
      if (targetRec.recommendationType === "ACADEMIC_DIRECTION" && targetRec.academicDirectionId) {
        const d = await db.query.academicDirections.findFirst({ where: eq(academicDirections.id, targetRec.academicDirectionId) });
        if (d) { canonicalTarget = await ExploreService.getCanonicalAcademicDirection(d.slug); entityId = d.id; }
      } else if (targetRec.recommendationType === "COURSE" && targetRec.courseId) {
        const c = await db.query.courses.findFirst({ where: eq(courses.id, targetRec.courseId) });
        if (c) { canonicalTarget = await ExploreService.getCanonicalCourse(c.slug); entityId = c.id; }
      } else if (targetRec.recommendationType === "CAREER" && targetRec.careerId) {
        const c = await db.query.careers.findFirst({ where: eq(careers.id, targetRec.careerId) });
        if (c) { canonicalTarget = await ExploreService.getCanonicalCareer(c.slug); entityId = c.id; }
      }

      if (!canonicalTarget) {
        return res.status(500).json({ error: "Canonical target data missing" });
      }

      // Fetch the generated insight if it exists
      const existingInsight = await db.query.personalizedInsights.findFirst({
        where: and(
          eq(personalizedInsights.assessmentSessionId, sessionStr),
          eq(personalizedInsights.recommendationId, targetRec.id),
          eq(personalizedInsights.generationStatus, "AVAILABLE")
        )
      });

      return res.json({
        assessmentProfile: profile,
        selectedTarget: {
          id: targetRec.id,
          recommendationType: targetRec.recommendationType,
          isTarget: targetRec.isTarget,
        },
        canonicalTarget: canonicalTarget,
        matchScore: targetRec.matchScore,
        personalizedInsight: existingInsight ? existingInsight.contentJson : null
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error fetching roadmap context" });
    }
  }
}
