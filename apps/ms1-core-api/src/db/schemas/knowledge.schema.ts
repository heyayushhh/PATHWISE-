import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
} from "drizzle-orm/pg-core";

export const academicDirections = pgTable("academic_directions", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const careers = pgTable("careers", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  shortDescription: text("short_description"),
  fullDescription: text("full_description"),
  careerFamily: varchar("career_family", { length: 100 }),
  industry: varchar("industry", { length: 100 }),
  educationLevel: varchar("education_level", { length: 100 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  courseType: varchar("course_type", { length: 50 }),
  description: text("description"),
  durationYears: numeric("duration_years", { precision: 3, scale: 1 }),
  educationLevel: varchar("education_level", { length: 100 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const skills = pgTable("skills", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }),
});

export const careerCourses = pgTable("career_courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  careerId: uuid("career_id").references(() => careers.id).notNull(),
  courseId: uuid("course_id").references(() => courses.id).notNull(),
  isPrimary: boolean("is_primary").default(true),
});

export const careerSkills = pgTable("career_skills", {
  id: uuid("id").defaultRandom().primaryKey(),
  careerId: uuid("career_id").references(() => careers.id).notNull(),
  skillId: uuid("skill_id").references(() => skills.id).notNull(),
  importanceWeight: numeric("importance_weight", { precision: 3, scale: 2 }), // e.g. 0.90
});

export const courseEligibility = pgTable("course_eligibility", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id").references(() => courses.id).notNull(),
  academicStage: varchar("academic_stage", { length: 50 }).notNull(), // e.g. Class 12
  allowedStreams: text("allowed_streams"), // JSON array of allowed streams e.g. ["PCM", "PCMB"]
  mathematicsRequired: boolean("mathematics_required").default(false),
  biologyRequired: boolean("biology_required").default(false),
  minimumPercentage: integer("minimum_percentage"),
  notes: text("notes"),
});

export const careerSalaryRanges = pgTable("career_salary_ranges", {
  id: uuid("id").defaultRandom().primaryKey(),
  careerId: uuid("career_id").references(() => careers.id).notNull(),
  country: varchar("country", { length: 50 }),
  currency: varchar("currency", { length: 10 }),
  experienceLevel: varchar("experience_level", { length: 50 }), // ENTRY, MID, SENIOR
  minSalary: integer("min_salary"),
  maxSalary: integer("max_salary"),
  source: varchar("source", { length: 255 }),
  lastVerifiedAt: timestamp("last_verified_at"),
});
