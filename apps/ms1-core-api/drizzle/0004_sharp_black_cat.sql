CREATE TABLE IF NOT EXISTS "roadmaps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"assessment_session_id" uuid NOT NULL,
	"recommendation_id" uuid NOT NULL,
	"target_entity_type" varchar(50) NOT NULL,
	"target_entity_id" uuid NOT NULL,
	"roadmap_version" integer DEFAULT 1 NOT NULL,
	"prompt_version" integer DEFAULT 1 NOT NULL,
	"generation_status" varchar(50) NOT NULL,
	"roadmap_json" jsonb,
	"model" varchar(50),
	"failure_reason" text,
	"generated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roadmaps_assessment_session_id_recommendation_id_roadmap_version_prompt_version_unique" UNIQUE("assessment_session_id","recommendation_id","roadmap_version","prompt_version")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "roadmaps" ADD CONSTRAINT "roadmaps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "roadmaps" ADD CONSTRAINT "roadmaps_assessment_session_id_assessment_sessions_id_fk" FOREIGN KEY ("assessment_session_id") REFERENCES "public"."assessment_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "roadmaps" ADD CONSTRAINT "roadmaps_recommendation_id_user_recommendations_id_fk" FOREIGN KEY ("recommendation_id") REFERENCES "public"."user_recommendations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
