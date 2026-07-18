"use client";

import { ReactNode } from "react";
import { Sparkles } from "lucide-react";

interface AuthShellProps {
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
}

export function AuthShell({ title, subtitle, footer, children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_55%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-center">
        <div className="w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_70px_-24px_rgba(15,23,42,0.35)]">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="hidden lg:flex flex-col justify-between bg-slate-950 px-10 py-12 text-white">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-slate-200">
                  <Sparkles className="h-4 w-4" />
                  PathWise AI Career Guidance
                </div>
                <h2 className="mt-8 text-3xl font-semibold leading-tight">
                  Discover your strongest academic and career path with clarity.
                </h2>
                <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
                  From your current stage to long-term goals, PathWise turns your profile into a focused recommendation experience.
                </p>
              </div>
              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
                <div className="font-medium text-white">What you can do</div>
                <ul className="space-y-2">
                  <li>• Review your assessment progress</li>
                  <li>• Explore personalized career recommendations</li>
                  <li>• Track your roadmap and skill-building path</li>
                </ul>
              </div>
            </div>
            <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
              </div>
              {children}
              <div className="mt-6 border-t border-slate-200 pt-4 text-center text-sm text-slate-600">
                {footer}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
