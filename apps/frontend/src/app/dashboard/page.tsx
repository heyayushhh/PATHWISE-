"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { logout, testAiConnection } from "@/services/auth";
import { useRouter } from "next/navigation";
import { ArrowRight, Brain, Compass, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const { state, logout: clearAuth } = useAuth();
  const router = useRouter();
  const [connectionMessage, setConnectionMessage] = useState("");
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      clearAuth();
      router.push("/login");
    }
  };

  const handleConnectionTest = async () => {
    try {
      setIsCheckingConnection(true);
      setConnectionMessage("");
      const response = await testAiConnection();
      setConnectionMessage(response.data?.message ?? "AI Engine Connected");
    } catch {
      setConnectionMessage("Connection test failed");
    } finally {
      setIsCheckingConnection(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <div className="text-lg font-semibold text-slate-900">PathWise</div>
            <div className="text-sm text-slate-500">AI Career Guidance Platform</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:block">
              Hello, {state.user?.firstName} {state.user?.lastName}!
            </span>
            <button
              onClick={handleLogout}
              className="rounded-full border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-sky-700">
              <Sparkles className="h-3.5 w-3.5" />
              Welcome back
            </div>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900">Your next step is ready.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Start your assessment to receive a focused view of your strengths, interests, and recommended academic paths.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => router.push("/assessment")}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-900 px-4 py-4 text-left text-white transition hover:bg-slate-800"
              >
                <span>
                  <div className="text-sm font-semibold">Start assessment</div>
                  <div className="mt-1 text-sm text-slate-300">Continue your career evaluation</div>
                </span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={handleConnectionTest}
                disabled={isCheckingConnection}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left text-slate-700 transition hover:bg-slate-50"
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Brain className="h-4 w-4" />
                  {isCheckingConnection ? "Checking..." : "Test connection"}
                </div>
                <div className="mt-1 text-sm text-slate-500">Validate the AI engine connection</div>
              </button>
            </div>
            {connectionMessage ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                {connectionMessage}
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Compass className="h-4 w-4" />
                Assessment status
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-slate-500">Current stage</div>
                  <div className="mt-1 font-medium text-slate-900">{state.profile?.currentStage || "Not available yet"}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-slate-500">Status</div>
                  <div className="mt-1 font-medium text-slate-900">{state.profile?.assessmentStatus || "No assessment completed yet"}</div>
                </div>
              </div>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">What happens next</div>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li className="rounded-2xl bg-slate-50 p-3">• Complete your assessment to receive tailored career suggestions.</li>
                <li className="rounded-2xl bg-slate-50 p-3">• Review your recommendation flow once the assessment is submitted.</li>
                <li className="rounded-2xl bg-slate-50 p-3">• Return here at any time to continue your progress.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
