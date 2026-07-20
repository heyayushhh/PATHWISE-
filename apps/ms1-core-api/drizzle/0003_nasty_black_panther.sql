CREATE TABLE IF NOT EXISTS "academic_direction_careers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"academic_direction_id" uuid NOT NULL,
	"career_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "academic_direction_courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"academic_direction_id" uuid NOT NULL,
	"course_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "personalized_insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"assessment_session_id" uuid NOT NULL,
	"recommendation_id" uuid NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"insight_type" varchar(50) NOT NULL,
	"content_json" jsonb,
	"model" varchar(50),
	"prompt_version" integer,
	"generation_status" varchar(50) NOT NULL,
	"failure_reason" text,
	"generated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "personalized_insights_assessment_session_id_recommendation_id_insight_type_prompt_version_unique" UNIQUE("assessment_session_id","recommendation_id","insight_type","prompt_version")
);
--> statement-breakpoint
ALTER TABLE "academic_directions" ADD COLUMN "overview" text;--> statement-breakpoint
ALTER TABLE "academic_directions" ADD COLUMN "typical_subjects" jsonb;--> statement-breakpoint
ALTER TABLE "academic_directions" ADD COLUMN "recommended_strengths" jsonb;--> statement-breakpoint
ALTER TABLE "academic_directions" ADD COLUMN "suitable_interests" jsonb;--> statement-breakpoint
ALTER TABLE "academic_directions" ADD COLUMN "considerations" jsonb;--> statement-breakpoint
ALTER TABLE "careers" ADD COLUMN "typical_responsibilities" jsonb;--> statement-breakpoint
ALTER TABLE "careers" ADD COLUMN "education_pathways" jsonb;--> statement-breakpoint
ALTER TABLE "careers" ADD COLUMN "progression" jsonb;--> statement-breakpoint
ALTER TABLE "careers" ADD COLUMN "future_opportunities" jsonb;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "eligibility_criteria" jsonb;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "entrance_exams" jsonb;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "major_subjects" jsonb;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "higher_study_options" jsonb;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "academic_direction_careers" ADD CONSTRAINT "academic_direction_careers_academic_direction_id_academic_directions_id_fk" FOREIGN KEY ("academic_direction_id") REFERENCES "public"."academic_directions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "academic_direction_careers" ADD CONSTRAINT "academic_direction_careers_career_id_careers_id_fk" FOREIGN KEY ("career_id") REFERENCES "public"."careers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "academic_direction_courses" ADD CONSTRAINT "academic_direction_courses_academic_direction_id_academic_directions_id_fk" FOREIGN KEY ("academic_direction_id") REFERENCES "public"."academic_directions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "academic_direction_courses" ADD CONSTRAINT "academic_direction_courses_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "personalized_insights" ADD CONSTRAINT "personalized_insights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "personalized_insights" ADD CONSTRAINT "personalized_insights_assessment_session_id_assessment_sessions_id_fk" FOREIGN KEY ("assessment_session_id") REFERENCES "public"."assessment_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "personalized_insights" ADD CONSTRAINT "personalized_insights_recommendation_id_user_recommendations_id_fk" FOREIGN KEY ("recommendation_id") REFERENCES "public"."user_recommendations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "recommendation_sets" ADD CONSTRAINT "recommendation_sets_assessment_session_id_unique" UNIQUE("assessment_session_id");