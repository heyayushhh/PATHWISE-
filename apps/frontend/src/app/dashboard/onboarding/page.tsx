"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, BookOpen, GraduationCap, Sparkles } from "lucide-react";
import { updateStage } from "@/services/auth";
import { useAuth } from "@/providers/AuthProvider";

export default function OnboardingPage() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setProfile } = useAuth();

  const handleContinue = async () => {
    if (!selectedStage) return;
    setLoading(true);
    try {
      const res = await updateStage(selectedStage);
      if (res.success && res.data) {
        setProfile(res.data.profile);
        router.push("/dashboard/assessment");
      }
    } catch (error) {
      console.error("Failed to update stage:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-50"></div>
      
      <div className="w-full max-w-4xl flex flex-col items-center relative z-10 animate-slide-up">
        {/* Step indicator */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">
          <Sparkles size={14} className="text-primary" />
          Step 1 of 3 — Academic Profile
        </div>

        <h1 className="text-4xl font-extrabold text-foreground tracking-tight sm:text-5xl text-center">
          What&apos;s your current stage?
        </h1>
        <p className="mt-4 text-lg text-muted-foreground text-center max-w-xl">
          We&apos;ll tailor your assessment and career guidance based on your current academic level.
        </p>

        <div className="mt-16 grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Class 10 Card */}
          <div
            onClick={() => setSelectedStage("Class 10")}
            className={`group cursor-pointer rounded-3xl border bg-card/80 backdrop-blur-xl p-8 transition-all duration-300 relative overflow-hidden ${
              selectedStage === "Class 10"
                ? "border-primary ring-1 ring-primary shadow-glow scale-[1.02]"
                : "border-border hover:border-primary/50 hover:shadow-soft hover:-translate-y-1"
            }`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full transition-opacity ${selectedStage === "Class 10" ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}></div>
            
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl mb-6 transition-colors ${
              selectedStage === "Class 10" ? "bg-primary text-primary-foreground shadow-md" : "bg-primary/10 text-primary group-hover:bg-primary/20"
            }`}>
              <BookOpen size={28} />
            </div>
            
            <div className="flex flex-col gap-2 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Secondary Level</span>
              <h3 className="text-2xl font-bold text-foreground">Class 10</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
              Explore streams and career options. Prepare for board exams and choose the right path forward.
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><ArrowRight size={14} className="text-primary" /> Stream selection guidance</li>
              <li className="flex items-center gap-2"><ArrowRight size={14} className="text-primary" /> Post-10th career paths</li>
              <li className="flex items-center gap-2"><ArrowRight size={14} className="text-primary" /> Subject combination advice</li>
            </ul>
          </div>

          {/* Class 12 Card */}
          <div
            onClick={() => setSelectedStage("Class 12")}
            className={`group cursor-pointer rounded-3xl border bg-card/80 backdrop-blur-xl p-8 transition-all duration-300 relative overflow-hidden ${
              selectedStage === "Class 12"
                ? "border-primary ring-1 ring-primary shadow-glow scale-[1.02]"
                : "border-border hover:border-primary/50 hover:shadow-soft hover:-translate-y-1"
            }`}
          >
             <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full transition-opacity ${selectedStage === "Class 12" ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}></div>
            
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl mb-6 transition-colors ${
              selectedStage === "Class 12" ? "bg-primary text-primary-foreground shadow-md" : "bg-primary/10 text-primary group-hover:bg-primary/20"
            }`}>
              <GraduationCap size={28} />
            </div>
            
            <div className="flex flex-col gap-2 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Senior Secondary Level</span>
              <h3 className="text-2xl font-bold text-foreground">Class 12</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
              Finalize career choices, prepare for entrance exams, and plan your college admissions.
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><ArrowRight size={14} className="text-primary" /> Entrance exam roadmap</li>
              <li className="flex items-center gap-2"><ArrowRight size={14} className="text-primary" /> College shortlisting</li>
              <li className="flex items-center gap-2"><ArrowRight size={14} className="text-primary" /> Specialization advice</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex w-full max-w-sm justify-center">
          <button
            className={`w-full flex items-center justify-center rounded-xl py-4 text-base font-semibold shadow-sm transition-all duration-300 ${
              !selectedStage || loading 
                ? "bg-secondary text-muted-foreground cursor-not-allowed opacity-70" 
                : "bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
            }`}
            disabled={!selectedStage || loading}
            onClick={handleContinue}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                Continue to Assessment
                <ArrowRight className="ml-2" size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
