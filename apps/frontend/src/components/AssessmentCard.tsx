"use client";

import { ReactNode } from "react";

interface AssessmentCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  tone?: "default" | "info" | "success";
}

export function AssessmentCard({ title, description, children, tone = "default" }: AssessmentCardProps) {
  const toneClasses = {
    default: "border-slate-200 bg-white",
    info: "border-sky-200 bg-sky-50",
    success: "border-emerald-200 bg-emerald-50",
  };

  return (
    <div className={`rounded-3xl border p-6 shadow-sm ${toneClasses[tone]}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {description ? <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}
