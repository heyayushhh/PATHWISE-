import type { AssessmentSessionSnapshot } from "@/types";

function getStorageKey() {
  if (typeof window === "undefined") return "pathwiseCurrentAssessment";
  const userId = window.localStorage.getItem("userId");
  return userId ? `pathwiseCurrentAssessment_${userId}` : "pathwiseCurrentAssessment";
}

function getResultKey() {
  if (typeof window === "undefined") return "pathwiseLastAssessmentResult";
  const userId = window.localStorage.getItem("userId");
  return userId ? `pathwiseLastAssessmentResult_${userId}` : "pathwiseLastAssessmentResult";
}

function getSelectedCareerKey() {
  if (typeof window === "undefined") return "pathwiseSelectedCareer";
  const userId = window.localStorage.getItem("userId");
  return userId ? `pathwiseSelectedCareer_${userId}` : "pathwiseSelectedCareer";
}

export function readAssessmentSnapshot() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(getStorageKey());
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AssessmentSessionSnapshot;
  } catch {
    return null;
  }
}

export function writeAssessmentSnapshot(snapshot: AssessmentSessionSnapshot) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getStorageKey(), JSON.stringify(snapshot));
}

export function clearAssessmentSnapshot() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(getStorageKey());
}

export function readLastAssessmentResultId() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(getResultKey());
}

export function writeLastAssessmentResultId(sessionId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getResultKey(), sessionId);
}

export function readSelectedCareer() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(getSelectedCareerKey());
}

export function writeSelectedCareer(careerName: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (careerName) {
    window.localStorage.setItem(getSelectedCareerKey(), careerName);
  } else {
    window.localStorage.removeItem(getSelectedCareerKey());
  }
}

// TODO: Next Development Phase: Synchronize user session metadata back to database/sync endpoints if localStorage is cleared.
