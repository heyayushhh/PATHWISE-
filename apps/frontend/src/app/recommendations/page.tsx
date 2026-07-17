"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

interface RecommendationPayload {
  recommendations?: {
    careers?: Array<{ title?: string; description?: string; match?: string }>;
    explanation?: string;
  };
  session?: Record<string, unknown>;
  responses?: Array<Record<string, unknown>>;
}

export default function RecommendationsPage() {
  const router = useRouter();
  const [payload, setPayload] = useState<RecommendationPayload | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("assessmentRecommendations");
    if (stored) {
      try {
        setPayload(JSON.parse(stored));
      } catch {
        setPayload(null);
      }
    }
  }, []);

  const recommendations = payload?.recommendations?.careers ?? [];
  const explanation = payload?.recommendations?.explanation ?? "Your assessment results are ready.";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </button>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-sky-700">
              <Sparkles className="h-3.5 w-3.5" />
              Recommendations
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900">Your personalized results are ready</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{explanation}</p>

            <div className="mt-8 space-y-4">
              {recommendations.length > 0 ? (
                recommendations.map((career, index) => (
                  <div key={`${career.title ?? "career"}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-base font-semibold text-slate-900">{career.title ?? `Recommendation ${index + 1}`}</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{career.description ?? "More details will be available as your profile evolves."}</p>
                      </div>
                      {career.match ? (
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">{career.match}</span>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
                  The recommendation service returned no career matches for this submission yet, but the assessment was completed successfully.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
