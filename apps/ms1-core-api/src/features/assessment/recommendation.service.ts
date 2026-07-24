import { db } from "../../db";
import { 
  studentAssessmentProfiles, 
  recommendationSets, 
  userRecommendations,
  academicDirections,
  careers,
  courses
} from "../../db/schemas";
import { eq, and } from "drizzle-orm";

export class RecommendationService {
  async saveStudentProfile(profileData: any) {
    return await db.insert(studentAssessmentProfiles).values({
      userId: profileData.userId,
      assessmentSessionId: profileData.assessmentSessionId,
      academicStage: profileData.academicStage,
      currentStream: profileData.currentStream,
      subjectInterests: profileData.subjectInterests || [],
      careerInterests: profileData.careerInterests || [],
      strengths: profileData.strengths || [],
      workStyle: profileData.workStyle || [],
      careerValues: profileData.careerValues || [],
      mathComfort: profileData.mathComfort,
      biologyInterest: profileData.biologyInterest,
      technologyInterest: profileData.technologyInterest,
      creativeInterest: profileData.creativeInterest,
      businessInterest: profileData.businessInterest,
    }).onConflictDoUpdate({
      target: studentAssessmentProfiles.assessmentSessionId,
      set: {
        academicStage: profileData.academicStage,
        currentStream: profileData.currentStream,
        subjectInterests: profileData.subjectInterests,
        careerInterests: profileData.careerInterests,
        strengths: profileData.strengths,
        workStyle: profileData.workStyle,
        careerValues: profileData.careerValues,
      }
    }).returning();
  }

  async saveRecommendations(userId: string, sessionId: string, academicStage: string, scoredRecommendations: any[]) {
    // Final Safety Boundary Validation
    if (academicStage === "Class 10") {
      const hasInvalid = scoredRecommendations.some(r => r.recommendation_type !== "ACADEMIC_DIRECTION" && r.recommendation_type !== "CAREER");
      if (hasInvalid) throw new Error("Invariant Violation: Class 10 assessment must only contain ACADEMIC_DIRECTION or CAREER recommendations.");
    } else if (academicStage === "Class 12") {
      const hasInvalid = scoredRecommendations.some(r => r.recommendation_type !== "COURSE" && r.recommendation_type !== "CAREER");
      if (hasInvalid) throw new Error("Invariant Violation: Class 12 assessment must only contain COURSE or CAREER recommendations.");
    }

    return await db.transaction(async (tx) => {
      // 1. Idempotency Check: if set exists, return it
      const existingSets = await tx.select().from(recommendationSets).where(eq(recommendationSets.assessmentSessionId, sessionId));
      if (existingSets.length > 0) {
        return existingSets[0];
      }

      // 2. Create recommendation set
      const [recSet] = await tx.insert(recommendationSets).values({
        userId,
        assessmentSessionId: sessionId,
        academicStage,
        algorithmVersion: "deterministic-v2",
        generationSource: "DETERMINISTIC",
      }).returning();

      // 3. Insert items
      const recItems = scoredRecommendations.map(rec => {
        const isAcademic = rec.recommendation_type === "ACADEMIC_DIRECTION";
        const isCourse = rec.recommendation_type === "COURSE";
        return {
          recommendationSetId: recSet.id,
          recommendationType: rec.recommendation_type,
          academicDirectionId: isAcademic ? rec.candidate_id : null,
          careerId: (!isAcademic && !isCourse) ? rec.candidate_id : null,
          courseId: isCourse ? rec.candidate_id : null,
          matchScore: rec.match_score,
          personalizedReason: rec.personalized_reason,
          scoreBreakdown: rec.score_breakdown,
          isPrimary: rec.is_primary || false,
          isTarget: false,
        };
      });

      if (recItems.length > 0) {
        await tx.insert(userRecommendations).values(recItems);
      }
      
      return recSet;
    });
  }
  
  async getRecommendationSetBySessionId(sessionId: string) {
    const recSets = await db.select().from(recommendationSets).where(eq(recommendationSets.assessmentSessionId, sessionId)).limit(1);
    if (recSets.length === 0) return null;
    
    const set = recSets[0];
    
    // Fetch raw recommendations
    const rawItems = await db.select().from(userRecommendations).where(eq(userRecommendations.recommendationSetId, set.id));
    
    // Hydrate canonical data
    const items = await Promise.all(rawItems.map(async (item) => {
      let canonicalData: any = {};
      
      if (item.recommendationType === "ACADEMIC_DIRECTION" && item.academicDirectionId) {
        const [dir] = await db.select().from(academicDirections).where(eq(academicDirections.id, item.academicDirectionId));
        if (dir) {
          canonicalData = { title: dir.title, slug: dir.slug, description: dir.description };
        }
      } else if (item.recommendationType === "CAREER" && item.careerId) {
        const [career] = await db.select().from(careers).where(eq(careers.id, item.careerId));
        if (career) {
          canonicalData = { title: career.title, slug: career.slug, description: career.shortDescription, careerFamily: career.careerFamily };
        }
      } else if (item.recommendationType === "COURSE" && item.courseId) {
        const [course] = await db.select().from(courses).where(eq(courses.id, item.courseId));
        if (course) {
          canonicalData = { title: course.title, slug: course.slug, description: course.description, educationLevel: course.educationLevel };
        }
      }

      return {
        id: item.id,
        recommendation_type: item.recommendationType,
        candidate_id: item.academicDirectionId || item.careerId || item.courseId,
        match_score: item.matchScore,
        personalized_reason: item.personalizedReason,
        score_breakdown: item.scoreBreakdown,
        is_primary: item.isPrimary,
        is_target: item.isTarget,
        ...canonicalData
      };
    }));
    
    // Order by score descending
    items.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

    // Detect legacy broken state from PostgreSQL
    if (set.academicStage === "Class 10" && set.algorithmVersion === "deterministic-v1") {
      const hasInvalid = items.some(item => 
        item.recommendation_type === "CAREER" || 
        item.recommendation_type === "COURSE" || 
        !item.recommendation_type
      );
      if (hasInvalid) {
        throw new Error("LEGACY_RECOMMENDATION_SET_DETECTED");
      }
    }

    return { ...set, items };
  }

  async setTargetRecommendation(sessionId: string, recommendationId: string, userId: string) {
    return await db.transaction(async (tx) => {
      const existingSets = await tx.select().from(recommendationSets).where(
        and(
          eq(recommendationSets.assessmentSessionId, sessionId),
          eq(recommendationSets.userId, userId)
        )
      ).limit(1);

      if (existingSets.length === 0) {
        throw new Error("Assessment session not found or does not belong to user");
      }
      
      const recSetId = existingSets[0].id;

      // Verify recommendation belongs to this set
      const recToUpdate = await tx.select().from(userRecommendations).where(
        and(
          eq(userRecommendations.id, recommendationId),
          eq(userRecommendations.recommendationSetId, recSetId)
        )
      ).limit(1);

      if (recToUpdate.length === 0) {
        throw new Error("Recommendation not found in this assessment session");
      }

      // Unset all targets in the set
      await tx.update(userRecommendations)
        .set({ isTarget: false })
        .where(eq(userRecommendations.recommendationSetId, recSetId));

      // Set the target
      await tx.update(userRecommendations)
        .set({ isTarget: true })
        .where(eq(userRecommendations.id, recommendationId));

      return true;
    });
  }
}

export const recommendationService = new RecommendationService();