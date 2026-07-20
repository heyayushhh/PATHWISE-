"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";
import { readLastAssessmentResultId, readSelectedCareer } from "@/utils";
import api from "@/lib/axios";
import { 
  ArrowRight,
  Map,
  CheckCircle2,
  Clock,
  Loader2
} from "lucide-react";

export default function RoadmapPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [lastResultId, setLastResultId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchRoadmap = async (sessionId: string, retry = false) => {
    try {
      if (retry) {
        setIsGenerating(true);
        setError(null);
      }
      
      const url = retry 
        ? `/roadmap/${sessionId}/retry`
        : `/roadmap/${sessionId}`;
        
      const res = await api.request({
        url,
        method: retry ? "POST" : "GET",
      });
      
      const data = res.data;
      
      setRoadmap(data.roadmap);
      
      if (data.roadmap?.generationStatus === "GENERATING") {
        setIsGenerating(true);
        // Poll every 3 seconds if still generating
        setTimeout(() => fetchRoadmap(sessionId), 3000);
      } else {
        setIsGenerating(false);
      }

    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 404) {
        setRoadmap(null);
      } else {
        setError(err.response?.data?.message || err.response?.data?.error || err.message || "Failed to load roadmap");
      }
      setIsGenerating(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const latestId = readLastAssessmentResultId();
    setLastResultId(latestId);
    
    if (latestId) {
      fetchRoadmap(latestId);
    } else {
      setLoading(false);
    }
  }, []);

  const handleRetry = () => {
    if (lastResultId) {
      fetchRoadmap(lastResultId, true);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Checking roadmap status...</p>
      </div>
    );
  }

  if (!lastResultId || (!roadmap && !loading && !error)) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center space-y-6 animate-fade-in text-foreground px-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <Map size={32} />
        </div>
        <h2 className="text-3xl font-extrabold font-display text-foreground">Roadmap Locked</h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
          You haven&apos;t selected a target career yet. Complete the assessment and star a target to unlock your personalized milestones.
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

  if (isGenerating || roadmap?.generationStatus === "GENERATING") {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="text-center">
          <h2 className="text-2xl font-extrabold font-display text-foreground mb-2">Generating Roadmap</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Our AI is carefully structuring your personalized path based on your assessment profile and selected target. This usually takes 10-20 seconds.
          </p>
        </div>
      </div>
    );
  }

  if (error || roadmap?.generationStatus === "FAILED") {
    return (
      <div className="mx-auto max-w-xl py-16 text-center space-y-6 text-foreground px-4">
        <div className="h-16 w-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
          <Map size={32} />
        </div>
        <h2 className="text-3xl font-extrabold font-display text-foreground">Generation Failed</h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
          {error || roadmap?.failureReason || "Something went wrong while generating your roadmap."}
        </p>
        <Button onClick={handleRetry} size="lg" className="rounded-xl font-bold shadow-lg">
          Try Again
        </Button>
      </div>
    );
  }

  const { roadmapJson, targetEntityType } = roadmap;

  if (!roadmapJson) return null;

  return (
    <div className="mx-auto max-w-4xl py-12 px-4 animate-fade-in text-foreground">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1.5 block">
            Personalized Roadmap
          </span>
          <h1 className="text-3xl font-extrabold font-display text-foreground tracking-tight sm:text-4xl">
            {roadmapJson.title || "Your Career Path"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
            {roadmapJson.summary}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <span className="rounded-lg bg-secondary px-3 py-1.5 text-[10px] font-bold text-foreground border border-border uppercase tracking-wider">
            {targetEntityType}
          </span>
        </div>
      </div>

      {/* Immediate Next Steps */}
      {roadmapJson.immediateNextSteps && roadmapJson.immediateNextSteps.length > 0 && (
        <div className="mb-12 p-6 rounded-2xl bg-primary/5 border border-primary/20">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Immediate Next Steps
          </h3>
          <ul className="space-y-3">
            {roadmapJson.immediateNextSteps.map((step: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm text-foreground/90">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Timeline */}
      <div className="relative space-y-8 before:absolute before:inset-y-3 before:left-4 md:before:left-1/2 md:before:-ml-px before:w-0.5 before:bg-border">
        {roadmapJson.milestones?.map((milestone: any, index: number) => {
          const isEven = index % 2 === 0;
          return (
            <div key={milestone.id || index} className="relative flex flex-col md:flex-row items-start md:items-center">
              
              {/* Timeline dot */}
              <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-primary -ml-2 border-4 border-background z-10 top-6 md:top-1/2 md:-translate-y-1/2" />
              
              {/* Content - Left side on Desktop */}
              <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${isEven ? 'md:pr-12 md:text-right' : 'md:hidden'}`}>
                {isEven && (
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-left md:text-right">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">{milestone.stage} • {milestone.timeframe}</span>
                    <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{milestone.description}</p>
                    {milestone.actions && milestone.actions.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider">Key Actions</span>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {milestone.actions.map((action: any, i: number) => (
                            <li key={i}>• {action.title}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Content - Right side on Desktop */}
              <div className={`w-full md:w-1/2 pl-12 ${!isEven ? 'md:pl-12' : 'hidden md:block'}`}>
                {!isEven && (
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-left">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">{milestone.stage} • {milestone.timeframe}</span>
                    <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{milestone.description}</p>
                    {milestone.actions && milestone.actions.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider">Key Actions</span>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {milestone.actions.map((action: any, i: number) => (
                            <li key={i}>• {action.title}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                {isEven && <div className="hidden md:block h-full" />}
              </div>

              {/* Mobile View Content (when isEven is true, mobile still needs to see it) */}
              <div className={`w-full pl-12 block md:hidden ${isEven ? '' : 'hidden'}`}>
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm mt-4 text-left">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">{milestone.stage} • {milestone.timeframe}</span>
                  <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{milestone.description}</p>
                  {milestone.actions && milestone.actions.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <span className="text-xs font-bold text-foreground uppercase tracking-wider">Key Actions</span>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {milestone.actions.map((action: any, i: number) => (
                          <li key={i}>• {action.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
