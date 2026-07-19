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

import { db } from "../../db";
import { academicDirections, careers, courses } from "../../db/schemas";
import { recommendationService } from "./recommendation.service";

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

    const payload = (await aiResponse.json()) as any;

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
    const sessionId = String(req.params.sessionId);
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

    const payload = (await aiResponse.json()) as any;

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
    const sessionId = String(req.params.sessionId);
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

    const payload = (await aiResponse.json()) as any;

    if (payload.status === "continue") {
      if (!payload.question || !Array.isArray(payload.options) || payload.options.length < 2) {
        throw new Error("AI engine returned continue status but with invalid question/options payload");
      }
    }

    const ms2State = await (await fetch(`${config.aiEngineUrl}/assessment/${sessionId}`)).json() as any;
    
    // Orchestration: if complete, score candidates
    let generatedRecommendations = [];
    let recStatus = ms2State.recommendation_status;
    
    if (payload.status === "completed") {
      console.log("[MS1 Submit Answer] MS2 payload keys:", Object.keys(payload));
      console.log("[MS1 Submit Answer] MS2 payload profile exists?", !!payload.profile);
    }
    
    if (payload.status === "completed") {
      const ms2Profile = payload.profile || {};
      // 1. Fetch real profile from DB
      const userProfile = await db.query.profiles.findFirst({ where: (p, { eq }) => eq(p.userId, userId) });
      const academicStage = userProfile?.currentStage || "Class 10";
      const currentStream = userProfile?.currentStream || undefined;

      // 2. Save profile
      await recommendationService.saveStudentProfile({
        userId,
        assessmentSessionId: sessionId,
        academicStage,
        currentStream,
        subjectInterests: ms2Profile.extracted_interests || [],
        strengths: ms2Profile.inferred_strengths || [],
        careerValues: ms2Profile.career_values || [],
        workStyle: ms2Profile.work_preferences || [],
      });
      
      // 3. Fetch candidates based on academic stage
      let candidates = [];
      if (academicStage === "Class 10") {
        const dbDirections = await db.select().from(academicDirections);
        candidates = dbDirections.map(d => ({ id: d.id, slug: d.slug, title: d.title, type: "ACADEMIC_DIRECTION" }));
      } else {
        // Class 12: Careers + Eligible Courses
        const dbCareers = await db.select().from(careers);
        const careerCandidates = dbCareers.map(c => ({ id: c.id, slug: c.slug, title: c.title, type: "CAREER", careerFamily: c.careerFamily }));
        
        // Filter courses by eligibility (current stream)
        const dbCourses = await db.select().from(courses);
        const { courseEligibility } = await import("../../db/schemas");
        const eligibilities = await db.select().from(courseEligibility);
        
        const userStream = currentStream;
        const eligibleCourses = dbCourses.filter(course => {
          if (!userStream) return true; // If stream is unknown, include it (or should we exclude? safe to include)
          const elig = eligibilities.find(e => e.courseId === course.id);
          if (!elig || !elig.allowedStreams) return true;
          try {
            const allowed = JSON.parse(elig.allowedStreams);
            if (Array.isArray(allowed)) {
              return allowed.includes(userStream) || allowed.includes("ANY") || allowed.length === 0;
            }
          } catch {
            return true; // JSON parse error fallback
          }
          return true;
        });

        const courseCandidates = eligibleCourses.map(c => ({ id: c.id, slug: c.slug, title: c.title, type: "COURSE" }));
        candidates = [...careerCandidates, ...courseCandidates];
      }
      
      // Enforce strict invariants before sending to MS2
      if (academicStage === "Class 10") {
        const hasInvalid = candidates.some(c => c.type !== "ACADEMIC_DIRECTION");
        if (hasInvalid) throw new Error("Invariant Violation: Class 10 assessment must only contain ACADEMIC_DIRECTION candidates");
      } else if (academicStage === "Class 12") {
        const hasInvalid = candidates.some(c => c.type !== "COURSE" && c.type !== "CAREER");
        if (hasInvalid) throw new Error("Invariant Violation: Class 12 assessment must only contain COURSE or CAREER candidates");
      }
      
      // 3. Call MS2 /score
      const enrichedProfile = { 
        ...ms2Profile, 
        academic_stage: academicStage, 
        current_stream: currentStream,
        extracted_interests: ms2Profile.extracted_interests || [],
        inferred_strengths: ms2Profile.inferred_strengths || [],
        career_values: ms2Profile.career_values || [],
        work_preferences: ms2Profile.work_preferences || []
      };
      const scoreRes = await fetch(`${config.aiEngineUrl}/assessment/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: enrichedProfile, candidates }),
      });
      
      if (scoreRes.ok) {
        const scoreData = (await scoreRes.json()) as any;
        
        // 4. Save recommendations to DB
        if (scoreData.recommendations && scoreData.recommendations.length > 0) {
          await recommendationService.saveRecommendations(
            userId,
            sessionId,
            academicStage,
            scoreData.recommendations
          );
          generatedRecommendations = scoreData.recommendations;
          recStatus = "READY";
        }
      } else {
        recStatus = "FAILED";
      }
    }

    await saveAssessmentState(sessionId, {
      current_question: payload.status === "completed" ? null : { id: payload.question_id },
      iteration_count: payload.question_number,
      total_questions: payload.total_questions,
      progress: payload.progress ?? 0,
      is_complete: payload.status === "completed",
      recommendation_status: recStatus,
      answers: ms2State.answers,
      recommendations: generatedRecommendations.length > 0 ? generatedRecommendations : null,
      explanation: payload.explanation,
    });

    return res.status(200).json({
      sessionId: payload.session_id ?? sessionId,
      nextQuestion: payload.question ?? null,
      nextQuestionId: payload.question_id ?? null,
      options: payload.options ?? [],
      status: payload.status ?? "continue",
      recommendations: generatedRecommendations,
      confidenceScore: payload.confidence_score ?? null,
      progress: payload.progress ?? null,
      explanation: payload.explanation ?? null,
      questionNumber: payload.question_number ?? null,
      totalQuestions: payload.total_questions ?? null,
      recommendationStatus: recStatus,
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
    const sessionId = String(req.params.sessionId);
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

    if (session.recommendationStatus === "READY") {
      console.log(`[Result API] Serving relational recommendations for session ${sessionId}`);
      const recSet = await recommendationService.getRecommendationSetBySessionId(sessionId);
      if (recSet) {
        return res.status(200).json({
          sessionId: session.id,
          academicStage: session.academicStage || "Class 10",
          recommendationType: session.academicStage === "Class 10" ? "academic_direction" : "course_career",
          recommendationSetId: recSet.id,
          recommendations: recSet.items,
          status: session.status,
          explanation: session.explanation,
          answers: session.answers ? JSON.parse(session.answers) : []
        });
      }
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

    const payload = (await aiResponse.json()) as any;
    
    // Explicitly add academicStage to MS2 response to ensure frontend consistency
    payload.academicStage = session.academicStage || "Class 10";
    payload.recommendationType = payload.academicStage === "Class 10" ? "academic_direction" : "course_career";

    // Detect legacy broken state from MS2
    if (payload.academicStage === "Class 10") {
      const hasInvalid = payload.recommendations?.some((r: any) => 
        r.type === "CAREER" || r.recommendation_type === "CAREER" || 
        r.type === "COURSE" || r.recommendation_type === "COURSE" ||
        (!r.type && !r.recommendation_type) // Catch old untyped formats
      );
      if (hasInvalid) {
        throw new Error("LEGACY_RECOMMENDATION_SET_DETECTED");
      }
    }

    // If MS2 regenerates or we get something, we just return it. 
    // In actual flow, it should already be persisted if completed.
    
    return res.status(200).json(payload);
  } catch (error: any) {
    console.error(error);

    if (error.message === "LEGACY_RECOMMENDATION_SET_DETECTED") {
      return res.status(409).json({
        message: "Your previous assessment results are outdated. Please retake the assessment to get updated recommendations.",
        code: "LEGACY_RECOMMENDATION_SET_DETECTED"
      });
    }

    return res.status(500).json({
      message: "Failed to load assessment result",
    });
  }
}

export async function setTargetRecommendationController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const sessionId = String(req.params.sessionId);
    const userId = req.user?.userId;
    const recommendationId = req.body?.recommendationId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!sessionId || !recommendationId) {
      return res.status(400).json({ message: "Session ID and Recommendation ID are required" });
    }

    await recommendationService.setTargetRecommendation(sessionId, recommendationId, userId);

    return res.status(200).json({ success: true, message: "Target updated successfully" });
  } catch (error: any) {
    console.error(`[Target Selection Error] ${error.message}`);
    const status = error.message.includes("not found") ? 404 : 500;
    return res.status(status).json({
      message: error.message || "Failed to set target recommendation",
    });
  }
}
