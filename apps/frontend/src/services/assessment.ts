import api from "@/lib/axios";
import type { ApiResponse } from "@/types";

export interface AssessmentQuestionOption {
  id: string;
  optionText: string;
  orderNo?: number;
}

export interface AssessmentQuestion {
  id: string;
  questionText: string;
  questionType: string;
  options: AssessmentQuestionOption[];
}

export interface StartAssessmentResponse {
  message: string;
  sessionId: string;
}

export interface AssessmentQuestionsResponse {
  questions: AssessmentQuestion[];
}

function buildSuccessResponse<T>(message: string, data: T): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    errors: null,
    timestamp: new Date().toISOString(),
  };
}

function buildFailureResponse(message: string): ApiResponse<null> {
  return {
    success: false,
    message,
    data: null,
    errors: null,
    timestamp: new Date().toISOString(),
  };
}

export async function startAssessment(assessmentType = "career_interest") {
  try {
    const res = await api.post<Partial<ApiResponse<StartAssessmentResponse>> | { message?: string; sessionId?: string }>(
      "/assessment/start",
      { assessmentType }
    );

    const payload = res.data as { message?: string; sessionId?: string };
    return buildSuccessResponse(payload.message || "Assessment started", {
      sessionId: payload.sessionId || "",
    });
  } catch (error: any) {
    return buildFailureResponse(error.response?.data?.message || "Unable to start assessment");
  }
}

export async function getAssessmentQuestions(sessionId: string) {
  try {
    const res = await api.get<Partial<ApiResponse<AssessmentQuestionsResponse>> | { questions?: AssessmentQuestion[] }>(
      `/assessment/${sessionId}/questions`
    );

    const payload = res.data as { questions?: AssessmentQuestion[] };
    const questions = Array.isArray(payload.questions) ? payload.questions : [];
    return buildSuccessResponse("Questions loaded", { questions });
  } catch (error: any) {
    return buildFailureResponse(error.response?.data?.message || "Unable to load questions");
  }
}

export async function saveAssessmentAnswer(sessionId: string, questionId: string, selectedOptionId: string) {
  try {
    const res = await api.post<Partial<ApiResponse> | { message?: string; response?: unknown }>(
      `/assessment/${sessionId}/answer`,
      {
        questionId,
        selectedOptionId,
      }
    );

    const payload = res.data as { message?: string };
    return buildSuccessResponse(payload.message || "Answer saved", null);
  } catch (error: any) {
    return buildFailureResponse(error.response?.data?.message || "Unable to save answer");
  }
}

export async function completeAssessment(sessionId: string) {
  try {
    const res = await api.post<Partial<ApiResponse> | { message?: string; data?: unknown }>(
      `/assessment/${sessionId}/complete-static`
    );

    const payload = res.data as { message?: string; data?: unknown };
    return buildSuccessResponse(payload.message || "Assessment completed", payload.data ?? null);
  } catch (error: any) {
    return buildFailureResponse(error.response?.data?.message || "Unable to complete assessment");
  }
}
