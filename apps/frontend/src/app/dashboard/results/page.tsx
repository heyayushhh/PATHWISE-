"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { getDynamicAssessmentResult } from "@/services/assessment";
import { 
  readAssessmentSnapshot, 
  readLastAssessmentResultId,
  readSelectedCareer,
  writeSelectedCareer
} from "@/utils";
import type { CareerRecommendation, DynamicAssessmentResultResponse } from "@/types";
import { ArrowRight, Award, Briefcase, ChevronRight, GraduationCap, Lightbulb, RefreshCw, Star, Target, Trophy } from "lucide-react";

function normalizeCareer(recommendation: CareerRecommendation) {
  if ("title" in recommendation) {
    return {
      title: recommendation.title,
      score: recommendation.matchScore ? `${Math.round(recommendation.matchScore)}% Match` : null,
      reason: recommendation.whyRecommended,
      skills: recommendation.requiredSkills,
      strengths: [],
      nextSteps: "",
      salary: recommendation.salaryRange || null,
      demand: recommendation.futureDemand || null,
    };
  }

  return {
    title: recommendation.career_name,
    score: recommendation.match_score ? `${recommendation.match_score}% Match` : (recommendation.confidence ? `${Math.round(recommendation.confidence * 100)}% Match` : null),
    reason: recommendation.why_suitable,
    skills: recommendation.required_skills || [],
    strengths: recommendation.strengths || [],
    nextSteps: recommendation.next_steps || "",
    salary: null,
    demand: null,
  };
}

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<DynamicAssessmentResultResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [resolvedSessionId, setResolvedSessionId] = useState<string | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [assessmentState, setAssessmentState] = useState<"not_started" | "in_progress" | "error">("not_started");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedCareer(readSelectedCareer());
    
    const snapshot = readAssessmentSnapshot();
    if (snapshot) {
      if (snapshot.status === "continue") {
        setAssessmentState("in_progress");
        setActiveSessionId(snapshot.sessionId);
      } else {
        setAssessmentState("not_started");
      }
    } else {
      setAssessmentState("not_started");
    }
  }, []);

  const handleToggleSelectCareer = (careerName: string) => {
    const newValue = selectedCareer === careerName ? null : careerName;
    setSelectedCareer(newValue);
    writeSelectedCareer(newValue);
  };

  useEffect(() => {
    const requestedSessionId = searchParams.get("sessionId");
    const latestResultId = readLastAssessmentResultId();
    const snapshot = readAssessmentSnapshot();

    if (requestedSessionId) {
      setResolvedSessionId(requestedSessionId);
      return;
    }

    if (latestResultId) {
      setResolvedSessionId(latestResultId);
      return;
    }

    if (snapshot?.status === "completed") {
      setResolvedSessionId(snapshot.sessionId);
      return;
    }

    setResolvedSessionId(null);
  }, [searchParams]);

  useEffect(() => {
    const loadResult = async () => {
      if (!resolvedSessionId) {
        setError("No completed assessment result is available yet.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        const payload = await getDynamicAssessmentResult(resolvedSessionId);
        setResult(payload);
      } catch {
        setError("Unable to load the assessment result right now. Complete the assessment first.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadResult();
  }, [resolvedSessionId]);

  const normalizedCareers = (result?.recommendations ?? []).map(normalizeCareer);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Generating your career discovery report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center space-y-6">
        <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <Target size={32} />
        </div>
        <h2 className="text-3xl font-extrabold font-display text-foreground">Assessment Required</h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
          {assessmentState === "in_progress" 
            ? "Your assessment is currently in progress. Resume it to unlock your career recommendations."
            : "You haven't completed the career assessment yet. Complete it to unlock your personalized AI recommendations."}
        </p>
        <div className="pt-2">
          {assessmentState === "in_progress" ? (
            <Link href={`/dashboard/assessment?sessionId=${activeSessionId}`}>
              <Button size="lg" className="rounded-xl font-bold shadow-lg">
                Continue Assessment <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link href="/dashboard/assessment">
              <Button size="lg" className="rounded-xl font-bold shadow-lg">
                Start Assessment <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl py-12 px-4 animate-fade-in">
      {/* Header */}
      <div className="mb-12">
        <span className="inline-block rounded-full bg-secondary px-4 py-1.5 text-xs font-bold text-secondary-foreground uppercase tracking-wider mb-4">
          Assessment Complete
        </span>
        <h1 className="text-4xl font-extrabold font-display text-foreground mb-3">Your Career Matches</h1>
        <p className="text-muted-foreground text-lg">
          {normalizedCareers.length} careers matched based on your assessment · {result?.academic_stage || "Class 10"}
        </p>
      </div>

      <div className="space-y-6">
        {/* Top Match Card */}
        {normalizedCareers.length > 0 && (
          <Card className="p-8 rounded-3xl border border-border shadow-md bg-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
              <div className="flex gap-6">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Target size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-extrabold font-display text-foreground">
                      Top Match: {normalizedCareers[0].title}
                    </h2>
                    <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-bold">
                      {normalizedCareers[0].score}
                    </span>
                  </div>
                  <p className="text-muted-foreground max-w-2xl leading-relaxed">
                    {normalizedCareers[0].reason}
                  </p>
                </div>
              </div>
              <Link href="/dashboard/assessment" className="shrink-0">
                <Button variant="outline" size="sm" className="rounded-xl px-6">
                  Retake
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Other Matches List */}
        <div className="space-y-4">
          {normalizedCareers.map((career) => (
            <Card key={career.title} className="p-6 rounded-3xl border border-border shadow-sm bg-card hover:border-primary/30 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6 md:gap-10">
                  {/* Match Score */}
                  <div className="text-center min-w-[80px]">
                    <div className="text-xl font-bold text-foreground">{career.score?.replace('% Match', '%')}</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">match</div>
                  </div>

                  {/* Career Info */}
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold font-display text-foreground">{career.title}</h3>
                      <span className="rounded-full bg-secondary px-3 py-0.5 text-[10px] font-bold text-secondary-foreground uppercase">
                        {result?.academic_stage || "Any"}
                      </span>
                    </div>
                    {(career.salary || career.demand) && (
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-medium mt-1">
                        {career.salary && <span>Salary: {career.salary}</span>}
                        {career.demand && <span>Demand: {career.demand}</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button variant="ghost" className="font-bold px-4">View</Button>
                  <Button variant="ghost" className="font-bold px-4">Compare</Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleToggleSelectCareer(career.title)}
                    className={selectedCareer === career.title ? "text-primary" : "text-muted-foreground hover:text-primary"}
                  >
                    <Star size={20} fill={selectedCareer === career.title ? "currentColor" : "none"} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-16 flex items-center justify-between border-t border-border pt-10">
        <Link href="/dashboard">
          <Button variant="ghost" className="text-muted-foreground font-bold hover:text-foreground">
            ← Back to Dashboard
          </Button>
        </Link>
        <Link href="/dashboard/roadmap">
          <Button size="lg" className="rounded-xl px-10 font-bold shadow-lg">
            View My Roadmap
          </Button>
        </Link>
      </div>
    </div>
  );
}
