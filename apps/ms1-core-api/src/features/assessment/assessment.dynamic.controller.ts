import type { Response } from "express";

import { config } from "../../config";
import type { AuthenticatedRequest } from "../authentication/types";
import { startAssessment, saveDynamicAssessmentAnswer } from "./assessment.service";

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

    const session = await startAssessment(userId, assessmentType);

    const aiResponse = await fetch(`${config.aiEngineUrl}/assessment/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        session_id: session.id,
        assessment_type: assessmentType,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`AI engine returned ${aiResponse.status}: ${errorText}`);
    }

    const payload = (await aiResponse.json()) as {
      session_id?: string;
      question?: string;
      status?: string;
    };

    return res.status(201).json({
      sessionId: payload.session_id ?? session.id,
      question: payload.question ?? null,
      status: payload.status ?? "continue",
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
      status?: string;
    };

    return res.status(200).json({
      sessionId: payload.session_id ?? sessionId,
      nextQuestion: payload.question ?? null,
      status: payload.status ?? "continue",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to submit dynamic assessment answer",
    });
  }
}
