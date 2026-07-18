"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { completeAssessment, getAssessmentQuestions, saveAssessmentAnswer, startAssessment } from "@/services/assessment";
import { AssessmentCard } from "@/components/AssessmentCard";
import { ProtectedRoute } from "@/components/ProtectedRoute";

interface AnswerState {
  [questionId: string]: string;
}

export default function AssessmentPage() {
  const router = useRouter();
  const { state } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const initializeAssessment = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const started = await startAssessment("career_interest");
      if (!started.success || !started.data?.sessionId) {
        throw new Error(started.message || "Unable to start assessment");
      }

      const questionsResponse = await getAssessmentQuestions(started.data.sessionId);
      if (!questionsResponse.success || !questionsResponse.data?.questions?.length) {
        throw new Error(questionsResponse.message || "No questions available");
      }

      setSessionId(started.data.sessionId);
      setQuestions(questionsResponse.data.questions);
      setCurrentIndex(0);
      setAnswers({});
      setCompleted(false);
      setNotice(null);
    } catch (err: any) {
      setError(err.message || "Unable to load assessment right now.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!state.isLoading) {
      void initializeAssessment();
    }
  }, [state.isLoading]);

  const currentQuestion = questions[currentIndex];
  const progressValue = useMemo(() => {
    if (!questions.length) return 0;
    return ((currentIndex + 1) / questions.length) * 100;
  }, [currentIndex, questions.length]);

  const remainingQuestions = questions.length - (currentIndex + 1);
  const estimatedMinutes = Math.max(1, Math.ceil(remainingQuestions * 0.75));

  const selectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    setNotice("Answer selected. Saving your response...");
  };

  const saveCurrentAnswer = async () => {
    if (!sessionId || !currentQuestion) return;

    const selectedOptionId = answers[currentQuestion.id];
    if (!selectedOptionId) {
      setError("Please choose an option before continuing.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await saveAssessmentAnswer(sessionId, currentQuestion.id, selectedOptionId);
      if (!response.success) {
        throw new Error(response.message || "Your answer could not be saved.");
      }

      setNotice("Response saved successfully.");
      if (currentIndex === questions.length - 1) {
        const completionResponse = await completeAssessment(sessionId);
        if (!completionResponse.success) {
          throw new Error(completionResponse.message || "Assessment could not be completed.");
        }

        const storedPayload = completionResponse.data;
        if (storedPayload) {
          sessionStorage.setItem("assessmentRecommendations", JSON.stringify(storedPayload));
        }

        setCompleted(true);
        router.replace("/recommendations");
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    } catch (err: any) {
      setError(err.message || "Your answer could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setError(null);
      setNotice(null);
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      await saveCurrentAnswer();
    } else {
      await saveCurrentAnswer();
    }
  };

  useEffect(() => {
    if (currentIndex >= 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentIndex]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl space-y-4">
            <div className="h-3 w-32 animate-pulse rounded-full bg-slate-200" />
            <AssessmentCard title="Preparing your assessment" description="We are creating your session and loading the first question.">
              <div className="space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-4/6 animate-pulse rounded bg-slate-200" />
              </div>
            </AssessmentCard>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error && !questions.length) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <AssessmentCard title="Assessment unavailable" description="We could not start your assessment right now. Please try again in a moment." tone="info">
              <div className="flex flex-col gap-3">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  {error}
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="w-fit rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                >
                  Try again
                </button>
              </div>
            </AssessmentCard>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (completed) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-4">
            <AssessmentCard title="Assessment completed" description="Your responses have been recorded successfully. Our recommendation engine is preparing personalized career insights." tone="success">
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white p-4 text-sm text-emerald-800">
                  <CheckCircle2 className="h-5 w-5" />
                  Your responses have been saved and the workflow is ready for the next stage of analysis.
                </div>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => router.push("/dashboard")} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">Return dashboard</button>
                  <button onClick={() => router.push("/dashboard")} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Explore careers</button>
                </div>
              </div>
            </AssessmentCard>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-sky-700">
                <Sparkles className="h-3.5 w-3.5" />
                Assessment
              </div>
              <h1 className="mt-3 text-2xl font-semibold text-slate-900">Career evaluation</h1>
              <p className="mt-2 text-sm text-slate-600">Answer each question thoughtfully. Your responses will be used to generate career recommendations.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <div className="font-medium">Estimated time</div>
              <div className="text-slate-500">{estimatedMinutes} min remaining</div>
            </div>
          </div>

          <AssessmentCard title={`Question ${currentIndex + 1} of ${questions.length}`} description={currentQuestion?.questionText}>
            <div className="space-y-5">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-slate-900 transition-all duration-300" style={{ width: `${progressValue}%` }} />
              </div>
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Progress</span>
                <span>{Math.round(progressValue)}%</span>
              </div>

              {notice ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                  {notice}
                </div>
              ) : null}

              {error ? (
                <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              ) : null}

              <div className="grid gap-3">
                {currentQuestion?.options?.map((option: any) => {
                  const selected = answers[currentQuestion.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => selectOption(currentQuestion.id, option.id)}
                      className={`rounded-2xl border p-4 text-left text-sm transition ${selected ? "border-slate-900 bg-slate-900 text-white shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span>{option.optionText}</span>
                        {selected ? <CheckCircle2 className="h-4 w-4" /> : null}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={goToPrevious}
                  disabled={currentIndex === 0 || saving}
                  className="flex items-center justify-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={saving || !answers[currentQuestion.id]}
                  className="flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : currentIndex === questions.length - 1 ? (
                    <>
                      Submit
                      <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </AssessmentCard>
        </div>
      </div>
    </ProtectedRoute>
  );
}
