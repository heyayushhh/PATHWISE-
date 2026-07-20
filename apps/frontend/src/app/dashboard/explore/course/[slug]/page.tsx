"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowLeft, CheckCircle2, ChevronRight, Target, Clock, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function ExploreCoursePage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [settingTarget, setSettingTarget] = useState(false);

  useEffect(() => {
    const fetchExploreData = async () => {
      try {
        const sessionId = searchParams.get("sessionId") || localStorage.getItem("currentSessionId");
        if (!sessionId) {
          toast.error("No active session found");
          router.push("/dashboard/results");
          return;
        }

        const res = await api.get(`/explore/course/${params.slug}?sessionId=${sessionId}`);
        setData(res.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load exploration data");
        router.push("/dashboard/results");
      } finally {
        setLoading(false);
      }
    };
    fetchExploreData();
  }, [params.slug, router, searchParams]);

  const handleSetTarget = async () => {
    const sessionId = searchParams.get("sessionId") || localStorage.getItem("currentSessionId");

    if (!sessionId || !data?.recommendation) return;

    setSettingTarget(true);
    try {
      await api.post(`/assessment/dynamic/${sessionId}/target`, {
        targetRecommendationId: data.recommendation.id
      });
      toast.success("Target course set successfully!");
      router.push("/dashboard/results");
    } catch (error) {
      console.error(error);
      toast.error("Failed to set target");
    } finally {
      setSettingTarget(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        <p className="text-gray-500 dark:text-gray-400">Loading canonical knowledge & personalized insights...</p>
      </div>
    );
  }

  if (!data || !data.entity) return null;

  const { entity, personalizedInsight, personalizationStatus } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-6">
        <div className="space-y-1">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Results
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{entity.title}</h1>
            <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full border border-red-100 dark:border-red-900/30">
              {data.recommendation?.matchScore}% Match
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center"><GraduationCap className="w-4 h-4 mr-1" /> {entity.courseType}</span>
            <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {entity.durationYears} Years</span>
          </div>
        </div>
        
        <button
          onClick={handleSetTarget}
          disabled={settingTarget || data.recommendation?.isTarget}
          className="flex items-center px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {settingTarget ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : data.recommendation?.isTarget ? (
            <><CheckCircle2 className="w-4 h-4 mr-2" /> Current Target</>
          ) : (
            <><Target className="w-4 h-4 mr-2" /> Set as Target</>
          )}
        </button>
      </div>

      {/* Personalized Insight (Gemini) */}
      <div className="bg-gradient-to-br from-red-50 to-white dark:from-red-950/30 dark:to-gray-800 rounded-2xl p-8 border border-red-100 dark:border-red-900/30 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
          <span className="text-red-600">✨</span> Why this fits you
        </h2>
        
        {personalizationStatus === "GENERATING" ? (
          <div className="flex items-center gap-3 text-red-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">AI is generating your personalized insight...</span>
          </div>
        ) : personalizationStatus === "FAILED" ? (
          <p className="text-gray-500 dark:text-gray-400 italic">Personalized insight is temporarily unavailable.</p>
        ) : personalizedInsight ? (
          <div className="space-y-6 text-gray-700 dark:text-gray-300">
            <p className="leading-relaxed">{personalizedInsight.summary}</p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Key Alignments</h3>
                <ul className="space-y-2">
                  {personalizedInsight.whyItFits?.map((point: string, i: number) => (
                    <li key={i} className="flex gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <span className="text-sm">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Things to Consider</h3>
                <ul className="space-y-2">
                  {personalizedInsight.considerations?.map((point: string, i: number) => (
                    <li key={i} className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                      <span className="text-sm">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Canonical Knowledge */}
      <div className="grid md:grid-cols-2 gap-8">
        
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Eligibility Criteria</h3>
            <ul className="space-y-2">
              {entity.eligibilityCriteria?.length ? entity.eligibilityCriteria.map((c: string, i: number) => (
                <li key={i} className="text-sm text-gray-600 dark:text-gray-300 list-disc list-inside">{c}</li>
              )) : <span className="text-gray-500 dark:text-gray-400 text-sm">Not available</span>}
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Major Subjects</h3>
            <div className="flex flex-wrap gap-2">
              {entity.majorSubjects?.length ? entity.majorSubjects.map((sub: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full text-sm border border-gray-200">
                  {sub}
                </span>
              )) : <span className="text-gray-500 dark:text-gray-400 text-sm">Not available</span>}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Entrance Exams</h3>
            <div className="flex flex-wrap gap-2">
              {entity.entranceExams?.length ? entity.entranceExams.map((exam: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-100 dark:border-blue-900/30">
                  {exam}
                </span>
              )) : <span className="text-gray-500 dark:text-gray-400 text-sm">Not available</span>}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Higher Study Options</h3>
            <div className="flex flex-wrap gap-2">
              {entity.higherStudyOptions?.length ? entity.higherStudyOptions.map((opt: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm border border-purple-100">
                  {opt}
                </span>
              )) : <span className="text-gray-500 dark:text-gray-400 text-sm">Not available</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Pathways */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Career Opportunities</h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="space-y-3">
              {entity.relatedCareers?.length ? entity.relatedCareers.map((car: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-red-200 hover:bg-red-50 transition-colors group cursor-default">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{car.title}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                </div>
              )) : <p className="text-sm text-gray-500 dark:text-gray-400">No careers listed.</p>}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
