import type { Response } from "express";

import { config } from "../../config";
import type { AuthenticatedRequest } from "../authentication/types";
import {
  getAssessmentSessionById,
  saveDynamicAssessmentAnswer,
  startAssessment,
  updateAssessmentSessionStatus,
  updateProfileAssessmentStatus,
} from "./assessment.service";
import { getCurrentUser } from "../authentication/services";

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

    const session = await startAssessment(userId, assessmentType);
    await updateProfileAssessmentStatus(userId, "in_progress");

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
      options?: string[];
      status?: string;
      question_number?: number;
      total_questions?: number;
    };

    if (payload.status === "continue") {
      if (!payload.question || !Array.isArray(payload.options) || payload.options.length < 2) {
        throw new Error("AI engine started dynamic assessment but returned invalid question/options payload");
      }
    }

    return res.status(201).json({
      sessionId: payload.session_id ?? session.id,
      question: payload.question ?? null,
      options: payload.options ?? [],
      status: payload.status ?? "continue",
      questionNumber: payload.question_number ?? 1,
      totalQuestions: payload.total_questions ?? 4,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to start dynamic assessment",
    });
  }
}

export async function submitDynamicAnswerController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const sessionId = Array.isArray(req.params.sessionId)
      ? req.params.sessionId[0]
      : req.params.sessionId;

    const answer = typeof req.body?.answer === "string" ? req.body.answer.trim() : "";
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

    await saveDynamicAssessmentAnswer(sessionId, answer);

    const aiResponse = await fetch(`${config.aiEngineUrl}/assessment/${sessionId}/answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ answer }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`AI engine returned ${aiResponse.status}: ${errorText}`);
    }

    const payload = (await aiResponse.json()) as {
      session_id?: string;
      question?: string;
      options?: string[];
      status?: string;
      recommendations?: Array<Record<string, unknown>>;
      confidence_score?: number;
      progress?: number;
      explanation?: string;
      question_number?: number;
      total_questions?: number;
    };

    if (payload.status === "continue") {
      if (!payload.question || !Array.isArray(payload.options) || payload.options.length < 2) {
        throw new Error("AI engine returned continue status but with invalid question/options payload");
      }
    }

    if (payload.status === "completed") {
      await updateAssessmentSessionStatus(sessionId, "COMPLETED");
      await updateProfileAssessmentStatus(userId, "completed");
    }

    return res.status(200).json({
      sessionId: payload.session_id ?? sessionId,
      nextQuestion: payload.question ?? null,
      options: payload.options ?? [],
      status: payload.status ?? "continue",
      recommendations: payload.recommendations ?? [],
      confidenceScore: payload.confidence_score ?? null,
      progress: payload.progress ?? null,
      explanation: payload.explanation ?? null,
      questionNumber: payload.question_number ?? null,
      totalQuestions: payload.total_questions ?? null,
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
    const sessionId = Array.isArray(req.params.sessionId)
      ? req.params.sessionId[0]
      : req.params.sessionId;

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

    if (req.user?.userId !== session.userId) {
      return res.status(403).json({
        message: "You do not have access to this assessment result",
      });
    }

    const aiResponse = await fetch(`${config.aiEngineUrl}/assessment/${sessionId}/result`);

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`AI engine returned ${aiResponse.status}: ${errorText}`);
    }

    const payload = await aiResponse.json();

    return res.status(200).json(payload);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to load assessment result",
    });
  }
}
