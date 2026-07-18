"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAuth } from "@/providers/AuthProvider";
import { getDynamicAssessmentResult } from "@/services/assessment";
import { readLastAssessmentResultId, readSelectedCareer } from "@/utils";
import { 
  Calendar, 
  ChevronRight, 
  GraduationCap, 
  Briefcase, 
  Wrench, 
  Rocket,
  CheckCircle2,
  MapPin,
  Clock,
  Trophy,
  ArrowLeft,
  ArrowRight,
  Map
} from "lucide-react";

interface RoadmapStep {
  title: string;
  period: string;
  description: string;
  icon: any;
  items: string[];
}

const getRoadmapSteps = (stage: string, career: string): RoadmapStep[] => {
  const isClass10 = stage === "Class 10";
  
  return [
    {
      title: isClass10 ? "Foundation Stage" : "Preparation Stage",
      period: "Current - 6 Months",
      description: isClass10 
        ? "Explore interests and strengthen foundational subjects." 
        : "Focus on stream-specific excellence and entrance preparation.",
      icon: GraduationCap,
      items: isClass10 
        ? ["Identify favorite subjects", "Explore hobby-to-career links", "Strengthen Math/Science/English basics"]
        : ["Master Class 12 syllabus", "Start entrance exam prep", "Identify top colleges/universities"]
    },
    {
      title: isClass10 ? "Stream Selection" : "Admission & Skill Up",
      period: "6 - 18 Months",
      description: isClass10 
        ? "Choose the right stream (Science/Commerce/Arts) for your path." 
        : "Secure admission and begin building professional foundations.",
      icon: MapPin,
      items: isClass10
        ? ["Consult with career mentors", "Evaluate stream-career alignment", "Select Class 11-12 subjects"]
        : ["Complete college applications", "Learn foundational tools (Excel/Coding/Design)", "Join student societies"]
    },
    {
      title: "Skill Development",
      period: "18 - 36 Months",
      description: `Build core skills required for ${career || "your chosen field"}.`,
      icon: Wrench,
      items: [
        "Take online certifications",
        "Build a project portfolio",
        "Participate in workshops/seminars"
      ]
    },
    {
      title: "Professional Experience",
      period: "3 - 5 Years",
      description: "Gain real-world exposure through internships and projects.",
      icon: Briefcase,
      items: [
        "Apply for summer internships",
        "Network with industry professionals",
        "Work on live industry projects"
      ]
    },
    {
      title: "Career Launch",
      period: "5+ Years",
      description: `Successfully transition into a ${career || "professional"} role.`,
      icon: Rocket,
      items: [
        "Prepare for campus placements",
        "Fine-tune your resume/LinkedIn",
        "Launch your professional career"
      ]
    }
  ];
};

export default function RoadmapPage() {
  const { profile } = useAuth();
  const [topCareer, setTopCareer] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [lastResultId, setLastResultId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestResult = async () => {
      const latestId = readLastAssessmentResultId();
      setLastResultId(latestId);
      const starredCareer = readSelectedCareer();
      
      if (starredCareer) {
        setTopCareer(starredCareer);
      } else {
        setTopCareer("");
      }
      setLoading(false);
    };
    fetchLatestResult();
  }, []);

  const stage = profile?.currentStage || "Class 10";
  const steps = getRoadmapSteps(stage, topCareer);

  // Dynamic progress calculation: Step 1 is done (100%), Step 2 is 60% in progress, others are 0%.
  const stepProgressions = [100, 60, 0, 0, 0];
  const overallProgress = Math.round(
    stepProgressions.reduce((acc, curr) => acc + curr, 0) / steps.length
  );

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground font-medium">Generating your career roadmap...</p>
      </div>
    );
  }

  if (!topCareer) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center space-y-6 animate-fade-in text-foreground px-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <Map size={32} />
        </div>
        <h2 className="text-3xl font-extrabold font-display text-foreground">Roadmap Locked</h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
          You haven&apos;t selected a target career yet. Complete the assessment and star a career match to unlock your personalized milestones.
        </p>
        <div className="pt-2">
          <Link href={lastResultId ? `/dashboard/results?sessionId=${lastResultId}` : "/dashboard/assessment"}>
            <Button size="lg" className="rounded-xl font-bold shadow-lg">
              {lastResultId ? "Explore Career Matches" : "Start Assessment"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl py-12 px-4 animate-fade-in text-foreground">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1.5 block">Personalized Roadmap</span>
          <h1 className="text-3xl font-extrabold font-display text-foreground tracking-tight sm:text-4xl">
            {topCareer || "Career Exploration"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Structured roadmap steps tailored for a career in {topCareer || "your chosen field"}.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <span className="rounded-lg bg-secondary px-3 py-1.5 text-[10px] font-bold text-foreground border border-border uppercase tracking-wider">
            {stage}
          </span>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm mb-12 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">Overall Progress</span>
          <span className="text-xs font-bold text-primary uppercase tracking-wider">{overallProgress}%</span>
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${overallProgress}%` }} />
        </div>
        <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          <span>1 of {steps.length} steps completed</span>
          <span>Est. 4 years remaining</span>
        </div>
      </div>

      {/* Editorial Timeline */}
      <div className="relative space-y-12 before:absolute before:inset-y-3 before:left-4 before:w-0.5 before:bg-border">
        {steps.map((step, index) => {
          const isDone = index === 0;
          const isCurrent = index === 1;
          const isLocked = index > 1;

          return (
            <div key={step.title} className="relative pl-12">
              {/* Timeline Indicator Node */}
              <div className={`absolute left-0 flex h-8.5 w-8.5 items-center justify-center rounded-full border-2 bg-background text-xs font-bold transition-all ${
                isDone 
                  ? "border-primary bg-primary text-primary-foreground" 
                  : isCurrent 
                    ? "border-primary text-primary bg-background shadow-[0_0_0_4px_rgba(229,72,77,0.15)]"
                    : "border-border text-muted-foreground bg-background"
              }`} style={{ width: "34px", height: "34px" }}>
                {isDone ? <CheckCircle2 size={16} /> : index + 1}
              </div>

              {/* Content block */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Step {index + 1} · {step.period}
                  </span>
                  {isDone && (
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[9px] font-bold text-muted-foreground uppercase border border-border">Done</span>
                  )}
                  {isCurrent && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[9px] font-bold text-primary uppercase border border-primary/20">In Progress</span>
                  )}
                </div>

                <h3 className="text-xl font-extrabold font-display text-foreground leading-snug">{step.title}</h3>
                
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  {step.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {step.items.map((item) => (
                    <span key={item} className="rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-[10px] font-bold text-foreground/80 uppercase tracking-tight">
                      {item}
                    </span>
                  ))}
                </div>

                {isCurrent && (
                  <div className="pt-3 max-w-md">
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                      <span>Milestone Progress</span>
                      <span>60%</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden border border-border">
                      <div className="h-full bg-primary w-[60%]" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer back button */}
      <div className="mt-16 flex justify-center border-t border-border pt-10">
        <Link href="/dashboard">
          <Button variant="outline" className="rounded-xl px-8 font-bold">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
