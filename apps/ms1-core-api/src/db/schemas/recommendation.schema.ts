import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

import { users } from "./user.schema";
import { assessmentSessions } from "./assessment.schema";
import { academicDirections, careers, courses } from "./knowledge.schema";

export const studentAssessmentProfiles = pgTable("student_assessment_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  assessmentSessionId: uuid("assessment_session_id").references(() => assessmentSessions.id).unique().notNull(),
  academicStage: varchar("academic_stage", { length: 50 }).notNull(),
  currentStream: varchar("current_stream", { length: 100 }),
  subjectInterests: jsonb("subject_interests"),
  careerInterests: jsonb("career_interests"),
  strengths: jsonb("strengths"),
  workStyle: jsonb("work_style"),
  careerValues: jsonb("career_values"),
  mathComfort: varchar("math_comfort", { length: 50 }),
  biologyInterest: varchar("biology_interest", { length: 50 }),
  technologyInterest: varchar("technology_interest", { length: 50 }),
  creativeInterest: varchar("creative_interest", { length: 50 }),
  businessInterest: varchar("business_interest", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const recommendationSets = pgTable("recommendation_sets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  assessmentSessionId: uuid("assessment_session_id").references(() => assessmentSessions.id).unique().notNull(),
  academicStage: varchar("academic_stage", { length: 50 }).notNull(),
  algorithmVersion: varchar("algorithm_version", { length: 50 }).notNull(), // e.g. "deterministic-v1"
  generationSource: varchar("generation_source", { length: 50 }).notNull(), // e.g. "DETERMINISTIC"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userRecommendations = pgTable("user_recommendations", {
  id: uuid("id").defaultRandom().primaryKey(),
  recommendationSetId: uuid("recommendation_set_id").references(() => recommendationSets.id, { onDelete: 'cascade' }).notNull(),
  recommendationType: varchar("recommendation_type", { length: 50 }).notNull(), // ACADEMIC_DIRECTION, CAREER, COURSE
  
  // Nullable FKs - exact one should be non-null based on recommendationType
  academicDirectionId: uuid("academic_direction_id").references(() => academicDirections.id),
  careerId: uuid("career_id").references(() => careers.id),
  courseId: uuid("course_id").references(() => courses.id),
  
  matchScore: integer("match_score").notNull(),
  personalizedReason: text("personalized_reason"), // deterministic explanation
  scoreBreakdown: jsonb("score_breakdown"), // structured metadata of how score was calculated
  
  isPrimary: boolean("is_primary").default(false), // true if this is a primary recommendation vs secondary exploration
  isTarget: boolean("is_target").default(false), // true if this is the user's selected/starred target
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
