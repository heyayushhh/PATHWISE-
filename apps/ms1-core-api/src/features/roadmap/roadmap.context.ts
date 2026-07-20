import { db } from "../../db";
import {
  assessmentSessions,
  studentAssessmentProfiles,
  userRecommendations,
  recommendationSets,
  academicDirections,
  courses,
  careers,
  personalizedInsights,
} from "../../db/schemas";
import { eq, and } from "drizzle-orm";
import { ExploreService } from "../explore/explore.service";

export async function buildRoadmapContext(sessionStr: string, userId: string) {
  // 1. Verify session
  const session = await db.query.assessmentSessions.findFirst({
    where: and(eq(assessmentSessions.id, sessionStr), eq(assessmentSessions.userId, userId)),
  });
  if (!session) throw new Error("Forbidden: Not your session");

  // 2. Fetch profile
  const profile = await db.query.studentAssessmentProfiles.findFirst({
    where: eq(studentAssessmentProfiles.assessmentSessionId, sessionStr),
  });

  // 3. Find the TARGET recommendation
  const recommendations = await db
    .select({
      id: userRecommendations.id,
      matchScore: userRecommendations.matchScore,
      isTarget: userRecommendations.isTarget,
      recommendationType: userRecommendations.recommendationType,
      academicDirectionId: userRecommendations.academicDirectionId,
      courseId: userRecommendations.courseId,
      careerId: userRecommendations.careerId,
    })
    .from(userRecommendations)
    .innerJoin(recommendationSets, eq(userRecommendations.recommendationSetId, recommendationSets.id))
    .where(and(eq(recommendationSets.assessmentSessionId, sessionStr), eq(userRecommendations.isTarget, true)));

  if (recommendations.length === 0) {
    throw new Error("No target recommendation selected yet");
  }

  const targetRec = recommendations[0];
  let canonicalTarget = null;
  let entityId = "";

  // We resolve the slug by querying canonical table
  if (targetRec.recommendationType === "ACADEMIC_DIRECTION" && targetRec.academicDirectionId) {
    const d = await db.query.academicDirections.findFirst({
      where: eq(academicDirections.id, targetRec.academicDirectionId),
    });
    if (d) {
      canonicalTarget = await ExploreService.getCanonicalAcademicDirection(d.slug);
      entityId = d.id;
    }
  } else if (targetRec.recommendationType === "COURSE" && targetRec.courseId) {
    const c = await db.query.courses.findFirst({
      where: eq(courses.id, targetRec.courseId),
    });
    if (c) {
      canonicalTarget = await ExploreService.getCanonicalCourse(c.slug);
      entityId = c.id;
    }
  } else if (targetRec.recommendationType === "CAREER" && targetRec.careerId) {
    const c = await db.query.careers.findFirst({
      where: eq(careers.id, targetRec.careerId),
    });
    if (c) {
      canonicalTarget = await ExploreService.getCanonicalCareer(c.slug);
      entityId = c.id;
    }
  }

  if (!canonicalTarget) {
    throw new Error("Canonical target data missing");
  }

  // Fetch the generated insight if it exists
  const existingInsight = await db.query.personalizedInsights.findFirst({
    where: and(
      eq(personalizedInsights.assessmentSessionId, sessionStr),
      eq(personalizedInsights.recommendationId, targetRec.id),
      eq(personalizedInsights.generationStatus, "AVAILABLE")
    ),
  });

  return {
    assessmentProfile: profile,
    selectedTarget: {
      id: targetRec.id,
      recommendationType: targetRec.recommendationType,
      isTarget: targetRec.isTarget,
      entityId: entityId,
    },
    canonicalTarget: canonicalTarget,
    matchScore: targetRec.matchScore,
    personalizedInsight: existingInsight ? existingInsight.contentJson : null,
  };
}
