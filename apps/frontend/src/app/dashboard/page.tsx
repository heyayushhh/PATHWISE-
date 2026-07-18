"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAuth } from "@/providers/AuthProvider";
import { 
  readAssessmentSnapshot, 
  readLastAssessmentResultId, 
  readSelectedCareer 
} from "@/utils";
import { getDynamicAssessmentResult } from "@/services/assessment";
import { 
  ArrowRight, 
  GraduationCap, 
  Compass, 
  Clock, 
  Trophy, 
  Map, 
  Target, 
  CheckCircle2, 
  BrainCircuit, 
  ListTodo
} from "lucide-react";

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeSessionStatus, setActiveSessionStatus] = useState<"continue" | "completed" | null>(null);
  const [lastResultId, setLastResultId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  
  // Dynamic snapshot/interests/strengths
  const [interests, setInterests] = useState<string[]>([]);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const snapshot = readAssessmentSnapshot();
    const latestResultId = readLastAssessmentResultId();
    const chosenCareer = readSelectedCareer();

    setActiveSessionId(snapshot?.sessionId ?? null);
    setActiveSessionStatus(snapshot?.status ?? null);
    setProgress(snapshot?.progress ?? 0);
    setLastResultId(latestResultId);
    setSelectedCareer(chosenCareer);

    // Fetch details from latest completed result if present
    if (latestResultId) {
      setLoadingDetails(true);
      getDynamicAssessmentResult(latestResultId)
        .then((res) => {
          // Extract unique categories as interests
          const uniqueCategories = Array.from(new Set(
            res.answers
              ?.map(a => a.category)
              .filter((cat): cat is string => !!cat && cat !== "general")
          ));
          setInterests(uniqueCategories);

          // Extract strengths from recommendations
          const firstRec = res.recommendations?.[0];
          if (firstRec) {
            const recStrengths = "strengths" in firstRec ? firstRec.strengths : [];
            setStrengths(recStrengths || []);
          }
        })
        .catch(err => console.error("Error loading assessment details", err))
        .finally(() => setLoadingDetails(false));
    }
  }, []);

  const currentStage = profile?.currentStage;
  const isOnboarded = currentStage && currentStage !== "unspecified";

  // Dynamic next step data based on actual state
  const ctaData = useMemo(() => {
    if (!isOnboarded) {
      return {
        href: "/dashboard/onboarding",
        title: "Set your academic stage",
        description: "Choose whether you are in Class 10 or Class 12 to customize your career discovery path.",
        buttonText: "Choose Academic Stage",
        indicator: "Onboarding"
      };
    }

    if (activeSessionId && activeSessionStatus === "continue") {
      return {
        href: `/dashboard/assessment?sessionId=${activeSessionId}`,
        title: "Continue your assessment",
        description: "Resume your adaptive career assessment where you left off.",
        buttonText: "Continue Assessment",
        indicator: `Assessment • ${progress}% complete`
      };
    }

    if (lastResultId) {
      if (selectedCareer) {
        return {
          href: "/dashboard/roadmap",
          title: `Continue your roadmap for ${selectedCareer}`,
          description: "Follow your personalized roadmap milestones, credentials, and experience steps.",
          buttonText: "Continue Your Roadmap",
          indicator: "Roadmap • Unlocked"
        };
      } else {
        return {
          href: `/dashboard/results?sessionId=${lastResultId}`,
          title: "Explore your career matches",
          description: "Our AI engine has generated personalized career recommendations for you. Explore them to choose a target direction.",
          buttonText: "Explore Your Matches",
          indicator: "Matches • Results available"
        };
      }
    }

    return {
      href: "/dashboard/assessment",
      title: "Discover what fits you",
      description: "Your interests, strengths, and preferences help PathWise understand which career directions naturally suit you.",
      buttonText: "Start Assessment",
      indicator: "Assessment • Not started"
    };
  }, [isOnboarded, activeSessionId, activeSessionStatus, lastResultId, progress, selectedCareer]);

  // Timeline stage status
  const step1Status = "completed"; // registered/profile
  const line1Status = isOnboarded ? "active" : "pending";
  const step2Status = lastResultId ? "completed" : (isOnboarded ? "current" : "locked");
  const line2Status = lastResultId ? "active" : "pending";
  const step3Status = (lastResultId && selectedCareer) ? "completed" : (lastResultId ? "current" : "locked");
  const line3Status = (lastResultId && selectedCareer) ? "active" : "pending";
  const step4Status = (lastResultId && selectedCareer) ? "current" : "locked";

  return (
    <div className="mx-auto max-w-5xl space-y-10 py-6 px-4 sm:px-6 animate-fade-in text-foreground">
      {/* Top Welcome Header */}
      <div>
        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1">Your Path</p>
        <h1 className="text-3xl font-extrabold font-display text-foreground tracking-tight sm:text-4xl">
          Welcome back, {user?.firstName || "there"}.
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
          Let&apos;s continue building a career direction around who you are.
        </p>
      </div>

      {/* Horizontal Career Journey Timeline */}
      <div className="py-2 border-t border-b border-border">
        <div className="flex items-center w-full max-w-3xl py-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center w-full min-w-[500px]">
            {/* Step 1: Profile */}
            <div className="flex flex-col items-center relative z-10 shrink-0">
              <div className="h-8 w-8 rounded-full border-2 flex items-center justify-center font-bold text-xs bg-primary border-primary text-primary-foreground">
                ✓
              </div>
              <span className="text-[11px] font-bold mt-2 text-foreground uppercase tracking-wider">Profile</span>
            </div>

            {/* Line 1 -> 2 */}
            <div className={`flex-1 h-0.5 mx-2 min-w-[60px] ${
              line1Status === "active" ? "bg-primary" : "bg-border"
            }`} />

            {/* Step 2: Assessment */}
            <div className="flex flex-col items-center relative z-10 shrink-0">
              <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center font-bold text-xs ${
                step2Status === "completed"
                  ? "bg-primary border-primary text-primary-foreground"
                  : step2Status === "current"
                    ? "border-primary text-primary bg-background shadow-[0_0_0_4px_rgba(229,72,77,0.15)]"
                    : "border-border text-muted-foreground bg-background"
              }`}>
                {step2Status === "completed" ? "✓" : "2"}
              </div>
              <span className={`text-[11px] font-bold mt-2 uppercase tracking-wider ${
                step2Status === "locked" ? "text-muted-foreground" : "text-foreground"
              }`}>Assessment</span>
            </div>

            {/* Line 2 -> 3 */}
            <div className={`flex-1 h-0.5 mx-2 min-w-[60px] ${
              line2Status === "active" ? "bg-primary" : "bg-border"
            }`} />

            {/* Step 3: Matches */}
            <div className="flex flex-col items-center relative z-10 shrink-0">
              <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center font-bold text-xs ${
                step3Status === "completed"
                  ? "bg-primary border-primary text-primary-foreground"
                  : step3Status === "current"
                    ? "border-primary text-primary bg-background shadow-[0_0_0_4px_rgba(229,72,77,0.15)]"
                    : "border-border text-muted-foreground bg-background"
              }`}>
                {step3Status === "completed" ? "✓" : "3"}
              </div>
              <span className={`text-[11px] font-bold mt-2 uppercase tracking-wider ${
                step3Status === "locked" ? "text-muted-foreground" : "text-foreground"
              }`}>Matches</span>
            </div>

            {/* Line 3 -> 4 */}
            <div className={`flex-1 h-0.5 mx-2 min-w-[60px] ${
              line3Status === "active" ? "bg-primary" : "bg-border"
            }`} />

            {/* Step 4: Roadmap */}
            <div className="flex flex-col items-center relative z-10 shrink-0">
              <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center font-bold text-xs ${
                step4Status === "current"
                  ? "border-primary text-primary bg-background shadow-[0_0_0_4px_rgba(229,72,77,0.15)]"
                  : "border-border text-muted-foreground bg-background"
              }`}>
                4
              </div>
              <span className={`text-[11px] font-bold mt-2 uppercase tracking-wider ${
                step4Status === "locked" ? "text-muted-foreground" : "text-foreground"
              }`}>Roadmap</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Next Action */}
      <div className="relative pl-6 py-2 border-l-[3px] border-primary/40 flex flex-col gap-3">
        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.25em]">Next Step</span>
        <h3 className="text-2xl font-extrabold font-display text-foreground leading-snug tracking-tight">
          {ctaData.title}
        </h3>
        <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
          {ctaData.description}
        </p>
        
        <div className="flex items-center gap-4 mt-2">
          <Link href={ctaData.href}>
            <Button size="lg" className="shadow-lg font-bold rounded-xl">
              {ctaData.buttonText} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg border border-border uppercase tracking-wider">
            {ctaData.indicator}
          </span>
        </div>
      </div>

      {/* Lower Section — 2-Column Layout */}
      <div className="grid gap-8 md:grid-cols-2 pt-6">
        {/* Left Column — Your Profile snapshot */}
        <div className="space-y-4">
          <h2 className="text-base font-extrabold uppercase tracking-wider text-foreground">Your Profile So Far</h2>
          
          <Card className="p-6 border border-border bg-card shadow-sm space-y-5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <GraduationCap size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Academic Stage</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{isOnboarded ? currentStage : "Not selected"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Target size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Selected Target Career</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{selectedCareer || "No career selected yet"}</p>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Discovered Interests</p>
              {interests.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {interests.map(interest => (
                    <span key={interest} className="text-[10px] font-bold text-primary bg-primary/5 border border-primary/10 px-2.5 py-1 rounded-md capitalize">
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Complete assessment to discover your interests.
                </p>
              )}
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Identified Strengths</p>
              {strengths.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {strengths.map(strength => (
                    <span key={strength} className="text-[10px] font-bold text-foreground bg-secondary px-2.5 py-1 rounded-md">
                      {strength}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Strengths will be extracted from matches.
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column — What happens next timeline */}
        <div className="space-y-4">
          <h2 className="text-base font-extrabold uppercase tracking-wider text-foreground">What Happens Next</h2>
          
          <div className="relative pl-6 space-y-6 before:absolute before:inset-y-2 before:left-2 before:w-0.5 before:bg-border">
            {[
              {
                step: 1,
                title: "Complete assessment",
                description: "Answer the adaptive career diagnostic questions to map your interests.",
                active: !lastResultId
              },
              {
                step: 2,
                title: "Review AI matches",
                description: "Explore the personalized career possibilities generated by the engine.",
                active: lastResultId && !selectedCareer
              },
              {
                step: 3,
                title: "Select a direction",
                description: "Star your target career path to finalize your primary guidance focus.",
                active: lastResultId && !selectedCareer
              },
              {
                step: 4,
                title: "Follow personalized roadmap",
                description: "Access curated skills, certificates, and academic goals tailored for your selected path.",
                active: !!selectedCareer
              }
            ].map(item => (
              <div key={item.step} className="relative">
                {/* Dot */}
                <div className={`absolute -left-[22px] top-1.5 h-3.5 w-3.5 rounded-full border-2 bg-background flex items-center justify-center z-10 transition-colors ${
                  item.active ? "border-primary bg-primary/10 shadow-[0_0_0_3px_rgba(229,72,77,0.15)]" : "border-border"
                }`} />
                <div>
                  <h4 className={`text-sm font-bold ${item.active ? "text-foreground" : "text-foreground/80"}`}>
                    {item.step}. {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
