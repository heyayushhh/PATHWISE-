"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { startDynamicAssessment, submitDynamicAssessmentAnswer } from "@/services/assessment";
import {
  readAssessmentSnapshot,
  readLastAssessmentResultId,
  writeAssessmentSnapshot,
  writeLastAssessmentResultId,
} from "@/utils";
import { ArrowRight, ArrowLeft, Loader2, Sparkles, BrainCircuit, AlertCircle } from "lucide-react";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";

export default function AssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [questionNumber, setQuestionNumber] = useState<number>(1);
  const [totalQuestions, setTotalQuestions] = useState<number>(4);
  const [assessmentStatus, setAssessmentStatus] = useState<"continue" | "completed">("continue");
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastResultId, setLastResultId] = useState<string | null>(null);

  useEffect(() => {
    const requestedSessionId = searchParams.get("sessionId");
    const snapshot = readAssessmentSnapshot();

    if (requestedSessionId && snapshot?.sessionId === requestedSessionId) {
      setSessionId(snapshot.sessionId);
      setCurrentQuestion(snapshot.currentQuestion);
      setOptions(snapshot.options || []);
      setProgress(snapshot.progress);
      setAssessmentStatus(snapshot.status);
      setQuestionNumber(snapshot.questionNumber ?? 1);
      setTotalQuestions(snapshot.totalQuestions ?? 4);
      setIsHydrated(true);
      return;
    }

    if (snapshot?.status === "continue") {
      if (snapshot.options && snapshot.options.length > 0) {
        setSessionId(snapshot.sessionId);
        setCurrentQuestion(snapshot.currentQuestion);
        setOptions(snapshot.options);
        setProgress(snapshot.progress);
        setAssessmentStatus(snapshot.status);
        setQuestionNumber(snapshot.questionNumber ?? 1);
        setTotalQuestions(snapshot.totalQuestions ?? 4);
      } else {
        setSessionId(snapshot.sessionId);
        setCurrentQuestion(snapshot.currentQuestion);
        setOptions([]);
        setProgress(snapshot.progress);
        setAssessmentStatus(snapshot.status);
        setQuestionNumber(snapshot.questionNumber ?? 1);
        setTotalQuestions(snapshot.totalQuestions ?? 4);
      }
    }

    setLastResultId(readLastAssessmentResultId());
    setIsHydrated(true);
  }, [searchParams]);

  const handleStartAssessment = async () => {
    try {
      setIsLoading(true);
      setError("");
      const session = await startDynamicAssessment("career_interest");

      const qNum = session.questionNumber ?? 1;
      const totalQs = session.totalQuestions ?? 4;
      const startProgress = session.progress ?? 0;

      setSessionId(session.sessionId);
      setCurrentQuestion(session.question);
      setOptions(session.options || []);
      setProgress(startProgress);
      setAssessmentStatus("continue");
      setSelectedOption("");
      setQuestionNumber(qNum);
      setTotalQuestions(totalQs);

      writeAssessmentSnapshot({
        sessionId: session.sessionId,
        status: "continue",
        currentQuestion: session.question,
        options: session.options || [],
        progress: startProgress,
        questionNumber: qNum,
        totalQuestions: totalQs,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      setError("Unable to start the assessment right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!sessionId || !selectedOption) {
      setError("Please select an option before continuing.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const response = await submitDynamicAssessmentAnswer(sessionId, selectedOption);
      const newStatus = response.status === "completed" ? "completed" : "continue";
      setAssessmentStatus(newStatus);
      const nextProgress = response.progress ?? progress;
      setProgress(nextProgress);

      if (response.status === "completed") {
        writeAssessmentSnapshot({
          sessionId,
          status: "completed",
          currentQuestion: null,
          options: [],
          progress: 100,
          questionNumber,
          totalQuestions,
          updatedAt: new Date().toISOString(),
        });
        writeLastAssessmentResultId(sessionId);
        setLastResultId(sessionId);
        router.push(`/dashboard/results?sessionId=${sessionId}`);
        return;
      }

      const nextQNum = response.questionNumber ?? (questionNumber + 1);
      const nextTotalQs = response.totalQuestions ?? totalQuestions;

      setCurrentQuestion(response.nextQuestion);
      setOptions(response.options || []);
      setSelectedOption("");
      setQuestionNumber(nextQNum);
      setTotalQuestions(nextTotalQs);

      writeAssessmentSnapshot({
        sessionId,
        status: "continue",
        currentQuestion: response.nextQuestion,
        options: response.options || [],
        progress: nextProgress,
        questionNumber: nextQNum,
        totalQuestions: nextTotalQs,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      setError("Unable to submit your answer right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (sessionId && currentQuestion && (!options || options.length === 0)) {
      console.error("[PathWise Assessment Diagnostic] API returned question without options", {
        sessionId,
        currentQuestion,
        options,
        progress,
      });
    }
  }, [sessionId, currentQuestion, options, progress]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasNoOptions = !!(sessionId && currentQuestion && (!options || options.length === 0));

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>

      {/* Compact Sticky Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/50 bg-background/80 px-4 sm:px-6 backdrop-blur-md w-full">
        <div className="flex items-center justify-between max-w-[760px] mx-auto w-full">
          <Logo />
          {sessionId && currentQuestion && (
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-muted-foreground bg-secondary px-3 py-1 rounded-lg border border-border">
                {progress}% complete
              </span>
              <button 
                onClick={() => router.push("/dashboard")}
                className="text-xs font-bold text-foreground hover:text-primary transition-colors uppercase tracking-wider"
              >
                Save & Exit
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area - moves content container upward */}
      <main className="flex-1 flex flex-col items-center justify-start pt-8 pb-16 px-4 sm:px-6 w-full max-w-[760px] mx-auto relative z-10">
        {!sessionId || !currentQuestion ? (
          <div className="flex flex-col items-center text-center max-w-lg mx-auto animate-slide-up pt-12">
            <div className="rounded-3xl bg-primary/10 p-6 text-primary mb-8 ring-1 ring-primary/20 shadow-glow">
              <BrainCircuit className="h-16 w-16" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-foreground mb-4 tracking-tight">Ready to discover your path?</h2>
            <p className="text-muted-foreground text-sm sm:text-base mb-10 leading-relaxed">
              Answer a few questions for our AI to find the careers that best match your unique interests and strengths.
            </p>
            <div className="flex flex-col gap-4 w-full">
              <button 
                onClick={handleStartAssessment} 
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    Start Assessment
                    <Sparkles size={18} />
                  </>
                )}
              </button>
              {lastResultId && (
                <Link href={`/dashboard/results?sessionId=${lastResultId}`} className="w-full">
                  <button className="w-full rounded-xl border border-border bg-card py-3.5 text-base font-semibold text-foreground hover:bg-secondary transition-all">
                    View Last Result
                  </button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full animate-fade-in flex flex-col min-h-[500px] justify-between gap-6">
            <div>
              {/* Progress Bar before content */}
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden mb-6 border border-border/20">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-bold text-primary bg-primary/5 border border-primary/15 px-3 py-1 rounded-lg uppercase tracking-wider">
                    Question {questionNumber} of {totalQuestions}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground leading-snug mb-6">
                  {currentQuestion}
                </h2>

                <div className="space-y-3">
                  {options && options.length > 0 ? (
                    options.map((option) => (
                      <button
                        key={option}
                        onClick={() => setSelectedOption(option)}
                        className={`flex items-center w-full min-h-[54px] sm:min-h-[58px] rounded-xl border p-4 text-left transition-all duration-200 group ${
                          selectedOption === option
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border bg-card hover:border-primary/30 hover:bg-secondary/50"
                        }`}
                      >
                        <div className={`mr-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                          selectedOption === option 
                            ? "border-primary bg-primary" 
                            : "border-muted-foreground/30 group-hover:border-primary/30"
                        }`}>
                          {selectedOption === option && (
                            <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                          )}
                        </div>
                        <span className={`text-sm sm:text-base font-medium ${
                          selectedOption === option ? "text-foreground font-semibold" : "text-foreground/80"
                        }`}>
                          {option}
                        </span>
                      </button>
                    ))
                  ) : (
                    /* Clean User-Friendly Error state - no raw JSON block */
                    <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-3 max-w-md mx-auto text-center shadow-sm">
                      <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                        <AlertCircle className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-bold font-display text-foreground mt-1">Unable to Load Options</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        We encountered an issue preparing the answer choices for this question. Please try reloading the page, or return to the dashboard.
                      </p>
                      {/* TODO: Next Development Phase: API contract must guarantee valid options for selectable question types. */}
                      <div className="pt-2 flex justify-center gap-3">
                        <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="font-bold rounded-lg px-4">
                          Reload Question
                        </Button>
                        <Link href="/dashboard">
                          <Button variant="ghost" size="sm" className="text-muted-foreground font-bold px-4">
                            Back to Dashboard
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-medium text-destructive">
                  {error}
                </div>
              )}
            </div>

            {/* Footer Controls */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
              <button 
                className="text-muted-foreground hover:text-foreground font-semibold flex items-center gap-2 transition-colors text-sm"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft size={16} />
                Previous
              </button>
              
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedOption || isSubmitting || hasNoOptions}
                className={`flex items-center gap-2 px-6 rounded-xl py-3 text-sm font-semibold transition-all ${
                  (!selectedOption || isSubmitting || hasNoOptions)
                    ? "bg-secondary text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:scale-95"
                }`}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Next Step
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
