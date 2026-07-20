import { db } from "../../db";
import { 
  academicDirections, careers, courses, 
  academicDirectionCourses, academicDirectionCareers,
  careerCourses, careerSkills, courseEligibility, skills,
  personalizedInsights, userRecommendations
} from "../../db/schemas";
import { eq, inArray, and } from "drizzle-orm";

const MS2_URL = process.env.MS2_INTERNAL_URL || "http://127.0.0.1:3002";

export class ExploreService {
  /**
   * Fetch canonical academic direction + relations
   */
  static async getCanonicalAcademicDirection(slug: string) {
    const dir = await db.query.academicDirections.findFirst({
      where: eq(academicDirections.slug, slug)
    });
    if (!dir) return null;

    // Fetch related courses
    const relCourses = await db.select({
      id: courses.id, title: courses.title, slug: courses.slug, durationYears: courses.durationYears
    }).from(academicDirectionCourses)
      .innerJoin(courses, eq(academicDirectionCourses.courseId, courses.id))
      .where(eq(academicDirectionCourses.academicDirectionId, dir.id));

    // Fetch related careers
    const relCareers = await db.select({
      id: careers.id, title: careers.title, slug: careers.slug, careerFamily: careers.careerFamily
    }).from(academicDirectionCareers)
      .innerJoin(careers, eq(academicDirectionCareers.careerId, careers.id))
      .where(eq(academicDirectionCareers.academicDirectionId, dir.id));

    return { ...dir, relatedCourses: relCourses, relatedCareers: relCareers };
  }

  /**
   * Fetch canonical course + relations
   */
  static async getCanonicalCourse(slug: string) {
    const crs = await db.query.courses.findFirst({
      where: eq(courses.slug, slug)
    });
    if (!crs) return null;

    const relCareers = await db.select({
      id: careers.id, title: careers.title, slug: careers.slug
    }).from(careerCourses)
      .innerJoin(careers, eq(careerCourses.careerId, careers.id))
      .where(eq(careerCourses.courseId, crs.id));

    return { ...crs, relatedCareers: relCareers };
  }

  /**
   * Fetch canonical career + relations
   */
  static async getCanonicalCareer(slug: string) {
    const car = await db.query.careers.findFirst({
      where: eq(careers.slug, slug)
    });
    if (!car) return null;

    const relCourses = await db.select({
      id: courses.id, title: courses.title, slug: courses.slug
    }).from(careerCourses)
      .innerJoin(courses, eq(careerCourses.courseId, courses.id))
      .where(eq(careerCourses.careerId, car.id));

    const relSkills = await db.select({
      id: skills.id, name: skills.name, category: skills.category
    }).from(careerSkills)
      .innerJoin(skills, eq(careerSkills.skillId, skills.id))
      .where(eq(careerSkills.careerId, car.id));

    return { ...car, relatedCourses: relCourses, relatedSkills: relSkills };
  }

  /**
   * Call MS2 to generate personalized insight
   */
  private static async requestInsightFromMS2(payload: any): Promise<any> {
    try {
      const resp = await fetch(`${MS2_URL}/api/explore/personalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) {
        throw new Error(`MS2 responded with ${resp.status}`);
      }
      return await resp.json();
    } catch (error) {
      console.error("Error communicating with MS2 for personalization:", error);
      return null;
    }
  }

  /**
   * Fetch or generate personalized insight
   */
  static async getPersonalizedInsight(params: {
    userId: string;
    sessionId: string;
    recommendationId: string;
    entityType: "ACADEMIC_DIRECTION" | "COURSE" | "CAREER";
    entityId: string;
    canonicalData: any;
    studentProfile: any;
    matchScore: number;
  }) {
    // 1. Check cache
    const existing = await db.query.personalizedInsights.findFirst({
      where: and(
        eq(personalizedInsights.assessmentSessionId, params.sessionId),
        eq(personalizedInsights.recommendationId, params.recommendationId),
        eq(personalizedInsights.insightType, "WHY_IT_FITS"),
        eq(personalizedInsights.promptVersion, 1)
      )
    });

    if (existing && existing.generationStatus === "AVAILABLE") {
      return { status: "AVAILABLE", insight: existing.contentJson };
    }
    
    // In-flight locking / concurrent requests guard
    if (existing && existing.generationStatus === "GENERATING") {
      return { status: "GENERATING", insight: null };
    }

    // 2. Insert as GENERATING (ON CONFLICT DO NOTHING relies on unique constraint)
    const [inserted] = await db.insert(personalizedInsights).values({
      userId: params.userId,
      assessmentSessionId: params.sessionId,
      recommendationId: params.recommendationId,
      entityType: params.entityType,
      entityId: params.entityId,
      insightType: "WHY_IT_FITS",
      promptVersion: 1,
      generationStatus: "GENERATING",
      model: "gemini-flash" // default placeholder until MS2 confirms
    }).onConflictDoNothing().returning();

    // If it didn't insert, it means another request just inserted it.
    if (!inserted) {
      return { status: "GENERATING", insight: null };
    }

    // 3. Call MS2
    const ms2Payload = {
      entityType: params.entityType,
      entitySummary: params.canonicalData.overview || params.canonicalData.description || params.canonicalData.title,
      matchScore: params.matchScore,
      studentProfile: params.studentProfile,
      allowedSlugs: [] as string[]
    };

    if (params.entityType === "ACADEMIC_DIRECTION") {
      ms2Payload.allowedSlugs = [
        ...(params.canonicalData.relatedCourses?.map((c: any) => c.slug) || []),
        ...(params.canonicalData.relatedCareers?.map((c: any) => c.slug) || [])
      ];
    } else {
       if (params.canonicalData.relatedCareers) {
           ms2Payload.allowedSlugs.push(...params.canonicalData.relatedCareers.map((c: any) => c.slug));
       }
       if (params.canonicalData.relatedCourses) {
           ms2Payload.allowedSlugs.push(...params.canonicalData.relatedCourses.map((c: any) => c.slug));
       }
    }

    const start = Date.now();
    const result = await this.requestInsightFromMS2(ms2Payload);
    const durationMs = Date.now() - start;

    console.log(`[ExploreService] MS2 Insight generation took ${durationMs}ms for ${params.entityId}`);

    if (!result || !result.insight) {
      await db.update(personalizedInsights)
        .set({ generationStatus: "FAILED", failureReason: result?.error || "MS2 Timeout or API error" })
        .where(eq(personalizedInsights.id, inserted.id));
      return { status: "FAILED", insight: null };
    }

    await db.update(personalizedInsights)
      .set({ 
        generationStatus: "AVAILABLE", 
        contentJson: result.insight,
        generatedAt: new Date()
      })
      .where(eq(personalizedInsights.id, inserted.id));

    return { status: "AVAILABLE", insight: result.insight };
  }
}
