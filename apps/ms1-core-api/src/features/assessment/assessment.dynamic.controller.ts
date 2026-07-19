import type { Response } from "express";

import { config } from "../../config";
import type { AuthenticatedRequest } from "../authentication/types";
import {
  getAssessmentSessionById,
  startAssessment,
  saveAssessmentState,
  formatDbSessionToMs2State,
} from "./assessment.service";
import { getCurrentUser } from "../authentication/services";

async function restoreSessionInMs2(sessionId: string): Promise<boolean> {
  try {
    const session = await getAssessmentSessionById(sessionId);
    if (!session) return false;

    const state = formatDbSessionToMs2State(session);
    const restoreRes = await fetch(`${config.aiEngineUrl}/assessment/restore`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        state: state,
      }),
    });

    return restoreRes.ok;
  } catch (error) {
    console.error(`[Restore Session] Error restoring session ${sessionId} in MS2:`, error);
    return false;
  }
}

export async function startDynamicAssessmentController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const assessmentType =
      typeof req.body?.assessmentType === "string" && req.body.assessmentType.trim()
        ? req.body.assessmentType
        : "career_interest";

    const { profile } = await getCurrentUser(userId);
    const academicStage = profile?.currentStage || "Class 10";

    const session = await startAssessment(userId, assessmentType, academicStage);

    const aiResponse = await fetch(`${config.aiEngineUrl}/assessment/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        session_id: session.id,
        assessment_type: assessmentType,
        academic_stage: academicStage,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`AI engine returned ${aiResponse.status}: ${errorText}`);
    }

    const payload = (await aiResponse.json()) as {
      session_id?: string;
      question?: string;
      question_id?: string;
      options?: string[];
      status?: string;
      question_number?: number;
      total_questions?: number;
      progress?: number;
    };

    if (payload.status === "continue") {
      if (!payload.question || !Array.isArray(payload.options) || payload.options.length < 2) {
        throw new Error("AI engine started dynamic assessment but returned invalid question/options payload");
      }
    }
    
    console.log("[MS1 Start Assessment] Payload received from MS2:", payload);

    // Persist start state to Postgres
    await saveAssessmentState(session.id, {
      current_question: { id: payload.question_id },
      iteration_count: payload.question_number,
      total_questions: payload.total_questions,
      progress: payload.progress ?? 0,
      recommendation_status: "NOT_STARTED",
      answers: [],
    });

    return res.status(201).json({
      sessionId: payload.session_id ?? session.id,
      question: payload.question ?? null,
      questionId: payload.question_id ?? null,
      options: payload.options ?? [],
      status: payload.status ?? "continue",
      questionNumber: payload.question_number ?? 1,
      totalQuestions: payload.total_questions ?? 10,
      progress: payload.progress ?? 0,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to start dynamic assessment",
    });
  }
}

export async function getDynamicAssessmentStatusController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const sessionId = req.params.sessionId;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!sessionId) {
      return res.status(400).json({
        message: "Session ID is required",
      });
    }

    const session = await getAssessmentSessionById(sessionId);
    if (!session) {
      return res.status(404).json({
        message: "Assessment session not found",
      });
    }

    if (session.userId !== userId) {
      return res.status(403).json({
        message: "You do not have access to this assessment session",
      });
    }

    let aiResponse = await fetch(`${config.aiEngineUrl}/assessment/${sessionId}`);

    if (aiResponse.status === 404) {
      console.log(`[Status API] Session ${sessionId} not found in MS2. Restoring from PostgreSQL...`);
      const restored = await restoreSessionInMs2(sessionId);
      if (!restored) {
        throw new Error("Failed to restore session in AI engine");
      }
      aiResponse = await fetch(`${config.aiEngineUrl}/assessment/${sessionId}`);
    }

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`AI engine returned ${aiResponse.status}: ${errorText}`);
    }

    const payload = await aiResponse.json();

    return res.status(200).json({
      sessionId: payload.session_id,
      question: payload.question ?? null,
      questionId: payload.question_id ?? null,
      options: payload.options ?? [],
      status: payload.status ?? "continue",
      progress: payload.progress ?? 0,
      questionNumber: payload.question_number ?? 1,
      totalQuestions: payload.total_questions ?? 10,
      isComplete: payload.is_complete ?? false,
      recommendationStatus: payload.recommendation_status ?? "NOT_STARTED",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to load assessment status",
    });
  }
}

export async function submitDynamicAnswerController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const sessionId = req.params.sessionId;
    const answer = typeof req.body?.answer === "string" ? req.body.answer.trim() : "";
    const questionId = typeof req.body?.questionId === "string" ? req.body.questionId.trim() : "";
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!sessionId) {
      return res.status(400).json({
        message: "Session ID is required",
      });
    }

    if (!answer) {
      return res.status(400).json({
        message: "Answer is required",
      });
    }

    if (!questionId) {
      return res.status(400).json({
        message: "Question ID is required",
      });
    }

    // Verify session existence and user ownership
    const session = await getAssessmentSessionById(sessionId);
    if (!session) {
      return res.status(404).json({
        message: "Assessment session not found",
      });
    }

    if (session.userId !== userId) {
      return res.status(403).json({
        message: "You do not have access to this assessment session",
      });
    }

    // Forward to MS2. If 404, restore and retry.
    let aiResponse = await fetch(`${config.aiEngineUrl}/assessment/${sessionId}/answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        answer,
        question_id: questionId,
      }),
    });

    if (aiResponse.status === 404) {
      console.log(`[Submit Answer API] Session ${sessionId} not found in MS2. Restoring from PostgreSQL...`);
      const restored = await restoreSessionInMs2(sessionId);
      if (!restored) {
        throw new Error("Failed to restore session in AI engine");
      }
      aiResponse = await fetch(`${config.aiEngineUrl}/assessment/${sessionId}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answer,
          question_id: questionId,
        }),
      });
    }

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`AI engine returned ${aiResponse.status}: ${errorText}`);
    }

    const payload = (await aiResponse.json()) as {
      session_id?: string;
      question?: string;
      question_id?: string;
      options?: string[];
      status?: string;
      recommendations?: Array<Record<string, unknown>>;
      confidence_score?: number;
      progress?: number;
      explanation?: string;
      question_number?: number;
      total_questions?: number;
      recommendation_status?: string;
    };

    if (payload.status === "continue") {
      if (!payload.question || !Array.isArray(payload.options) || payload.options.length < 2) {
        throw new Error("AI engine returned continue status but with invalid question/options payload");
      }
    }

    // Persist new state back to PostgreSQL
    const ms2State = await (await fetch(`${config.aiEngineUrl}/assessment/${sessionId}`)).json();
    await saveAssessmentState(sessionId, {
      current_question: payload.status === "completed" ? null : { id: payload.question_id },
      iteration_count: payload.question_number,
      total_questions: payload.total_questions,
      progress: payload.progress ?? 0,
      is_complete: payload.status === "completed",
      recommendation_status: payload.recommendation_status || ms2State.recommendation_status,
      answers: ms2State.answers,
      recommendations: payload.recommendations,
      explanation: payload.explanation,
    });

    return res.status(200).json({
      sessionId: payload.session_id ?? sessionId,
      nextQuestion: payload.question ?? null,
      nextQuestionId: payload.question_id ?? null,
      options: payload.options ?? [],
      status: payload.status ?? "continue",
      recommendations: payload.recommendations ?? [],
      confidenceScore: payload.confidence_score ?? null,
      progress: payload.progress ?? null,
      explanation: payload.explanation ?? null,
      questionNumber: payload.question_number ?? null,
      totalQuestions: payload.total_questions ?? null,
      recommendationStatus: payload.recommendation_status ?? ms2State.recommendation_status,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to submit dynamic assessment answer",
    });
  }
}

export async function getDynamicAssessmentResultController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const sessionId = req.params.sessionId;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!sessionId) {
      return res.status(400).json({
        message: "Session ID is required",
      });
    }

    const session = await getAssessmentSessionById(sessionId);
    if (!session) {
      return res.status(404).json({
        message: "Assessment session not found",
      });
    }

    if (userId !== session.userId) {
      return res.status(403).json({
        message: "You do not have access to this assessment result",
      });
    }

    if (session.recommendationStatus === "COMPLETED" && session.recommendations) {
      console.log(`[Result API] Serving cached recommendations for session ${sessionId}`);
      return res.status(200).json({
        session_id: session.id,
        status: session.status,
        recommendations: JSON.parse(session.recommendations),
        explanation: session.explanation,
        academic_stage: session.academicStage,
        answers: session.answers ? JSON.parse(session.answers) : []
      });
    }

    let aiResponse = await fetch(`${config.aiEngineUrl}/assessment/${sessionId}/result`);

    if (aiResponse.status === 404) {
      console.log(`[Result API] Session ${sessionId} not found in MS2. Restoring from PostgreSQL...`);
      const restored = await restoreSessionInMs2(sessionId);
      if (!restored) {
        throw new Error("Failed to restore session in AI engine");
      }
      aiResponse = await fetch(`${config.aiEngineUrl}/assessment/${sessionId}/result`);
    }

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`AI engine returned ${aiResponse.status}: ${errorText}`);
    }

    const payload = await aiResponse.json();

    // Persist regenerated recommendations back to Postgres if they were generated/recovered
    if (payload.recommendations && payload.recommendations.length > 0) {
      await saveAssessmentState(sessionId, {
        recommendation_status: "READY",
        recommendations: payload.recommendations,
        explanation: payload.explanation,
      });
    }

    return res.status(200).json(payload);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to load assessment result",
    });
  }
}
