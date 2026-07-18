import MarketingLayout from "@/components/layout/MarketingLayout";
import { UserPlus, Layers, ClipboardCopy, Star, Compass, Map, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      icon: UserPlus,
      title: "Create Account",
      desc: "Register securely with your basic contact information to establish your private profile.",
    },
    {
      num: "02",
      icon: Layers,
      title: "Choose Academic Stage",
      desc: "Specify your current class (Class 10 or Class 12) so we can structure recommendations for your immediate decisions.",
    },
    {
      num: "03",
      icon: ClipboardCopy,
      title: "Complete Adaptive Assessment",
      desc: "Take an interactive assessment that customizes questions based on your previous answers to capture your genuine interests.",
    },
    {
      num: "04",
      icon: Star,
      title: "Discover Career Matches",
      desc: "Review a curated list of career matches matching your cognitive strengths, goals, and academic background.",
    },
    {
      num: "05",
      icon: Compass,
      title: "Explore Career Details",
      desc: "Deep dive into required skills, work environments, stream requirements, and alternative paths for each match.",
    },
    {
      num: "06",
      icon: Map,
      title: "Build Personalized Roadmap",
      desc: "Generate an action plan showing college courses, recommended subjects, and long-term milestones to follow.",
    },
  ];

  return (
    <MarketingLayout>
      <div className="py-16 sm:py-24 bg-background">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Product Tour</span>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Your Journey on PathWise
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              We guide you step-by-step from general interest mapping to a clear, actionable education and career roadmap.
            </p>
          </div>

          {/* Timeline of Steps */}
          <div className="mt-20 relative">
            {/* Central line for large screens */}
            <div className="absolute left-[20px] md:left-1/2 top-4 bottom-4 w-0.5 border-l border-border pointer-events-none -translate-x-1/2 hidden md:block" />

            <div className="space-y-12">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isEven = idx % 2 === 0;

                return (
                  <div
                    key={idx}
                    className={`relative flex flex-col md:flex-row items-start gap-8 md:gap-0 ${
                      isEven ? "" : "md:flex-row-reverse"
                    }`}
                  >
                    {/* Left/Right content box */}
                    <div className="w-full md:w-[45%] flex justify-end">
                      <div
                        className={`w-full rounded-xl border border-border bg-card p-6 shadow-sm ${
                          isEven ? "md:text-right" : "md:text-left"
                        }`}
                      >
                        <span className="text-sm font-semibold text-primary uppercase tracking-wider">Step {step.num}</span>
                        <h3 className="mt-2 text-lg font-bold text-foreground">{step.title}</h3>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                      </div>
                    </div>

                    {/* Timeline Node Icon in center */}
                    <div className="absolute left-[20px] md:left-1/2 top-6 -translate-x-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-primary shadow-sm">
                      <Icon size={18} />
                    </div>

                    {/* Empty spacer side for alignment */}
                    <div className="hidden md:block md:w-[45%]" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Call to Action */}
          <div className="mt-24 text-center border-t border-border pt-16">
            <h2 className="text-2xl font-bold text-foreground">Ready to take the first step?</h2>
            <p className="mt-2 text-sm text-muted-foreground">Setup your profile in under two minutes.</p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-98"
              >
                Create Free Account
                <ArrowRight className="ml-2" size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
