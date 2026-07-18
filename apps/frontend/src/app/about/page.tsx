import MarketingLayout from "@/components/layout/MarketingLayout";
import { BookOpen, AlertCircle, Compass, Target } from "lucide-react";

export default function AboutPage() {
  return (
    <MarketingLayout>
      <div className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              About PathWise
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              PathWise helps students navigate career decisions by combining structured career exploration with personalized guidance.
            </p>
          </div>

          <div className="mt-16 space-y-12">
            {/* Section 1: Why PathWise exists */}
            <section className="flex gap-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Target size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Why PathWise Exists</h2>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  The transition from school to higher education and careers is one of the most critical phases in a student&apos;s life. Yet, many face this milestone with uncertainty, relying on generic advice or limited options. PathWise was created to give students a structured, personal way to explore their future, aligning academic choices with real interests.
                </p>
              </div>
            </section>

            {/* Section 2: The problem students face */}
            <section className="flex gap-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <AlertCircle size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">The Problem Students Face</h2>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  Traditional career counseling often stops at a single recommendation, or relies on marks alone. Students are frequently forced to choose academic streams under pressure without fully understanding where those paths lead. This subjects students to unnecessary stress and can lead to mismatched choices later in life.
                </p>
              </div>
            </section>

            {/* Section 3: Our approach */}
            <section className="flex gap-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Compass size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Our Approach</h2>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  We believe career guidance should be an ongoing journey, not a single questionnaire. By asking adaptive questions, we build a profile that respects a student&apos;s preferences, subject strengths, and personal uncertainty. We map these parameters to practical career directions and clear educational steps.
                </p>
              </div>
            </section>

            {/* Section 4: How personalized guidance works */}
            <section className="flex gap-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookOpen size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">How Personalized Guidance Works</h2>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  Personalization starts by understanding where you are—whether you are exploring options in Class 10 or selecting specific subjects in Class 12. PathWise evaluates your feedback step-by-step, generating a structured roadmap that lists relevant fields of study, potential college degrees, and professional outcomes.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
