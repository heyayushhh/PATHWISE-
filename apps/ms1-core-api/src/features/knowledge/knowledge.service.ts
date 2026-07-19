import { db } from "../../db";
import { careers, courses, academicDirections } from "../../db/schemas";
import { eq } from "drizzle-orm";

export class KnowledgeService {
  async getCareerBySlug(slug: string) {
    const result = await db.select().from(careers).where(eq(careers.slug, slug)).limit(1);
    return result[0] || null;
  }

  async getCourseBySlug(slug: string) {
    const result = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1);
    return result[0] || null;
  }

  async getAcademicDirectionBySlug(slug: string) {
    const result = await db.select().from(academicDirections).where(eq(academicDirections.slug, slug)).limit(1);
    return result[0] || null;
  }
}

export const knowledgeService = new KnowledgeService();