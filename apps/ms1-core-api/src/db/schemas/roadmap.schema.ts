import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  integer,
  unique,
} from "drizzle-orm/pg-core";

import { users } from "./user.schema";
import { assessmentSessions } from "./assessment.schema";
import { userRecommendations } from "./recommendation.schema";

export const roadmaps = pgTable("roadmaps", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  assessmentSessionId: uuid("assessment_session_id").references(() => assessmentSessions.id).notNull(),
  recommendationId: uuid("recommendation_id").references(() => userRecommendations.id, { onDelete: 'cascade' }).notNull(),
  targetEntityType: varchar("target_entity_type", { length: 50 }).notNull(), // ACADEMIC_DIRECTION, COURSE, CAREER
  targetEntityId: uuid("target_entity_id").notNull(),
  roadmapVersion: integer("roadmap_version").notNull().default(1),
  promptVersion: integer("prompt_version").notNull().default(1),
  generationStatus: varchar("generation_status", { length: 50 }).notNull(), // GENERATING, AVAILABLE, FAILED
  roadmapJson: jsonb("roadmap_json"),
  model: varchar("model", { length: 50 }),
  failureReason: text("failure_reason"),
  generatedAt: timestamp("generated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  uniqueGeneration: unique().on(t.assessmentSessionId, t.recommendationId, t.roadmapVersion, t.promptVersion),
}));
