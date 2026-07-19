CREATE TABLE IF NOT EXISTS "assessment_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"selected_option_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "assessment_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"assessment_type" varchar(100) NOT NULL,
	"status" varchar(50) DEFAULT 'IN_PROGRESS' NOT NULL,
	"academic_stage" varchar(50),
	"current_question_id" varchar(255),
	"current_question_number" integer,
	"total_questions" integer,
	"answers" text,
	"progress" integer,
	"recommendation_status" varchar(50) DEFAULT 'NOT_STARTED' NOT NULL,
	"recommendations" text,
	"explanation" text,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "question_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"option_text" text NOT NULL,
	"option_value" integer NOT NULL,
	"order_no" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "question_pool_mapping" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pool_id" uuid NOT NULL,
	"question_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "question_pools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_text" text NOT NULL,
	"question_type" varchar(50) DEFAULT 'MCQ' NOT NULL,
	"order_no" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "academic_directions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "academic_directions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "career_courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"career_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "career_salary_ranges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"career_id" uuid NOT NULL,
	"country" varchar(50),
	"currency" varchar(10),
	"experience_level" varchar(50),
	"min_salary" integer,
	"max_salary" integer,
	"source" varchar(255),
	"last_verified_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "career_skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"career_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"importance_weight" numeric(3, 2)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "careers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"title" varchar(100) NOT NULL,
	"short_description" text,
	"full_description" text,
	"career_family" varchar(100),
	"industry" varchar(100),
	"education_level" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "careers_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "course_eligibility" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"academic_stage" varchar(50) NOT NULL,
	"allowed_streams" text,
	"mathematics_required" boolean DEFAULT false,
	"biology_required" boolean DEFAULT false,
	"minimum_percentage" integer,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"title" varchar(100) NOT NULL,
	"course_type" varchar(50),
	"description" text,
	"duration_years" numeric(3, 1),
	"education_level" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(100) NOT NULL,
	"category" varchar(50),
	CONSTRAINT "skills_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recommendation_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"assessment_session_id" uuid NOT NULL,
	"academic_stage" varchar(50) NOT NULL,
	"algorithm_version" varchar(50) NOT NULL,
	"generation_source" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "student_assessment_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"assessment_session_id" uuid NOT NULL,
	"academic_stage" varchar(50) NOT NULL,
	"current_stream" varchar(100),
	"subject_interests" jsonb,
	"career_interests" jsonb,
	"strengths" jsonb,
	"work_style" jsonb,
	"career_values" jsonb,
	"math_comfort" varchar(50),
	"biology_interest" varchar(50),
	"technology_interest" varchar(50),
	"creative_interest" varchar(50),
	"business_interest" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "student_assessment_profiles_assessment_session_id_unique" UNIQUE("assessment_session_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recommendation_set_id" uuid NOT NULL,
	"recommendation_type" varchar(50) NOT NULL,
	"academic_direction_id" uuid,
	"career_id" uuid,
	"course_id" uuid,
	"match_score" integer NOT NULL,
	"personalized_reason" text,
	"score_breakdown" jsonb,
	"is_primary" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "career_courses" ADD CONSTRAINT "career_courses_career_id_careers_id_fk" FOREIGN KEY ("career_id") REFERENCES "public"."careers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "career_courses" ADD CONSTRAINT "career_courses_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "career_salary_ranges" ADD CONSTRAINT "career_salary_ranges_career_id_careers_id_fk" FOREIGN KEY ("career_id") REFERENCES "public"."careers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "career_skills" ADD CONSTRAINT "career_skills_career_id_careers_id_fk" FOREIGN KEY ("career_id") REFERENCES "public"."careers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "career_skills" ADD CONSTRAINT "career_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_eligibility" ADD CONSTRAINT "course_eligibility_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recommendation_sets" ADD CONSTRAINT "recommendation_sets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recommendation_sets" ADD CONSTRAINT "recommendation_sets_assessment_session_id_assessment_sessions_id_fk" FOREIGN KEY ("assessment_session_id") REFERENCES "public"."assessment_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student_assessment_profiles" ADD CONSTRAINT "student_assessment_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student_assessment_profiles" ADD CONSTRAINT "student_assessment_profiles_assessment_session_id_assessment_sessions_id_fk" FOREIGN KEY ("assessment_session_id") REFERENCES "public"."assessment_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_recommendations" ADD CONSTRAINT "user_recommendations_recommendation_set_id_recommendation_sets_id_fk" FOREIGN KEY ("recommendation_set_id") REFERENCES "public"."recommendation_sets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_recommendations" ADD CONSTRAINT "user_recommendations_academic_direction_id_academic_directions_id_fk" FOREIGN KEY ("academic_direction_id") REFERENCES "public"."academic_directions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_recommendations" ADD CONSTRAINT "user_recommendations_career_id_careers_id_fk" FOREIGN KEY ("career_id") REFERENCES "public"."careers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_recommendations" ADD CONSTRAINT "user_recommendations_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
