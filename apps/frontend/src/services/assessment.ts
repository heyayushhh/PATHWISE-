import api from "@/lib/axios";
import type {
  AssessmentQuestion,
  AssessmentSessionResponse,
  DynamicAssessmentResultResponse,
  DynamicAssessmentStartResponse,
  DynamicAssessmentTurnResponse,
} from "@/types";

export async function startAssessment(assessmentType = "static") {
  const res = await api.post<AssessmentSessionResponse>("/assessment/start", {
    assessmentType,
  });

  return res.data;
}

export async function getAssessmentQuestions(sessionId: string) {
  const res = await api.get<{ questions: AssessmentQuestion[] }>(`/assessment/${sessionId}/questions`);
  return res.data.questions;
}

export async function startDynamicAssessment(assessmentType = "career_interest") {
  const res = await api.post<DynamicAssessmentStartResponse>("/assessment/dynamic/start", {
    assessmentType,
  });

  return res.data;
}

export async function submitDynamicAssessmentAnswer(sessionId: string, answer: string, questionId: string) {
  const res = await api.post<DynamicAssessmentTurnResponse>(`/assessment/dynamic/${sessionId}/answer`, {
    answer,
    questionId,
  });

  return res.data;
}

export async function getDynamicAssessmentStatus(sessionId: string) {
  const res = await api.get<DynamicAssessmentStartResponse & { isComplete: boolean; recommendationStatus: string }>(`/assessment/dynamic/${sessionId}`);
  return res.data;
}

export async function getDynamicAssessmentResult(sessionId: string) {
  const res = await api.get<DynamicAssessmentResultResponse>(`/assessment/dynamic/${sessionId}/result`);
  return res.data;
}
