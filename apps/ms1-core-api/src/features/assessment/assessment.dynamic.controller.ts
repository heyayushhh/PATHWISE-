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
import { academicDirections, careers, courses, studentAssessmentProfiles } from "../../db/schemas";
import { recommendationService } from "./recommendation.service";
import { eq } from "drizzle-orm";


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

async function orchestrateRecommendations(
  userId: string,
  sessionId: string,
  academicStage: string,
  ms2Profile: any,
  currentStream?: string
) {
  // Idempotency: Check if set exists and is valid
  let existingSet = null;
  try {
    existingSet = await recommendationService.getRecommendationSetBySessionId(sessionId);
  } catch (error: any) {
    if (error.message === "LEGACY_RECOMMENDATION_SET_DETECTED") {
      throw error;
    }
  }

  if (existingSet) {
    console.log(`[Recommendation Orchestration] Idempotency hit: existing recommendation set found in DB.`);
    return {
      recommendations: existingSet.items,
      recommendationSetId: existingSet.id
    };
  }

  // 1. Validate that profile exists.
  if (!ms2Profile || Object.keys(ms2Profile).length === 0) {
    throw new Error("Profile is missing or empty.");
  }

  // 2. Persist profile in student_assessment_profiles.
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

  // 3. Branch by session.academicStage.
  let candidates = [];
  let candidateTypes: string[] = [];
  if (academicStage === "Class 10") {
    const dbDirections = await db.select().from(academicDirections);
    candidates = dbDirections.map(d => ({ id: d.id, slug: d.slug, title: d.title, type: "ACADEMIC_DIRECTION" }));
    candidateTypes = ["ACADEMIC_DIRECTION"];
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
      if (!userStream) return true;
      const elig = eligibilities.find(e => e.courseId === course.id);
      if (!elig || !elig.allowedStreams) return true;
      try {
        const allowed = JSON.parse(elig.allowedStreams);
        if (Array.isArray(allowed)) {
          return allowed.includes(userStream) || allowed.includes("ANY") || allowed.length === 0;
        }
      } catch {
        return true;
      }
      return true;
    });

    const courseCandidates = eligibleCourses.map(c => ({ id: c.id, slug: c.slug, title: c.title, type: "COURSE" }));
    candidates = [...careerCandidates, ...courseCandidates];
    candidateTypes = ["COURSE", "CAREER"];
  }

  // Task 6 Logging
  console.log(`[Recommendation Orchestration]`);
  console.log(`candidateTypes: ${JSON.stringify(candidateTypes)}`);
  console.log(`candidateCount: ${candidates.length}`);
  console.log(`scoringStarted: true`);

  // Enforce strict invariants before sending to MS2
  if (academicStage === "Class 10") {
    const hasInvalid = candidates.some(c => c.type !== "ACADEMIC_DIRECTION");
    if (hasInvalid) throw new Error("Invariant Violation: Class 10 assessment must only contain ACADEMIC_DIRECTION candidates");
  } else if (academicStage === "Class 12") {
    const hasInvalid = candidates.some(c => c.type !== "COURSE" && c.type !== "CAREER");
    if (hasInvalid) throw new Error("Invariant Violation: Class 12 assessment must only contain COURSE or CAREER candidates");
  }

  // 4. Call MS2 /score.
  const enrichedProfile = { 
    ...ms2Profile, 
    academic_stage: academicStage, 
    current_stream: currentStream,
    extracted_interests: ms2Profile.extracted_interests || [],
    inferred_strengths: ms2Profile.inferred_strengths || [],
    career_values: ms2Profile.career_values || [],
    work_preferences: ms2Profile.work_preferences || []
  };

  console.log(`\n[MS1 Scoring Payload]`);
  console.log(`Academic Stage: ${enrichedProfile.academic_stage}`);
  console.log(`Raw Answers Count: ${enrichedProfile.answers?.length || 0}`);
  console.log(`Candidates Sent: ${candidates.length}\n`);

  const scoreRes = await fetch(`${config.aiEngineUrl}/assessment/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile: enrichedProfile, candidates }),
  });
  
  if (!scoreRes.ok) {
    console.log(`[Recommendation Orchestration] scoringCompleted: false`);
    throw new Error(`AI engine score endpoint returned ${scoreRes.status}`);
  }

  const scoreData = (await scoreRes.json()) as any;
  console.log(`[Recommendation Orchestration] scoringCompleted: true`);

  // 5. & 6. Persist recommendation_set and user_recommendations.
  let generatedRecommendations = [];
  if (scoreData.recommendations && scoreData.recommendations.length > 0) {
    const recSet = await recommendationService.saveRecommendations(
      userId,
      sessionId,
      academicStage,
      scoreData.recommendations
    );
    generatedRecommendations = scoreData.recommendations;
    console.log(`[Recommendation Orchestration] recommendationSetSaved: true`);
    return {
      recommendations: generatedRecommendations,
      recommendationSetId: recSet.id
    };
  } else {
    console.log(`[Recommendation Orchestration] recommendationSetSaved: false`);
    throw new Error("No recommendations scored by AI engine.");
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
    let recommendationSetId = null;
    
    if (payload.status === "completed") {
      const userProfile = await db.query.profiles.findFirst({ where: (p, { eq }) => eq(p.userId, userId) });
      const ms2Profile = payload.profile || {};
      const academicStage = session.academicStage || userProfile?.currentStage || "Class 10";
      const currentStream = ms2Profile.current_stream || (userProfile as any)?.currentStream || undefined;

      console.log(`[Assessment Complete]`);
      console.log(`sessionId: ${sessionId}`);
      console.log(`academicStage: ${academicStage}`);
      console.log(`profileExists: ${!!payload.profile}`);

      try {
        const result = await orchestrateRecommendations(
          userId,
          sessionId,
          academicStage,
          ms2Profile,
          currentStream
        );
        generatedRecommendations = result.recommendations;
        recommendationSetId = result.recommendationSetId;
        recStatus = "READY";
      } catch (error: any) {
        console.error(`[MS1 Submit Answer] Recommendation Orchestration failed: ${error.message}`);
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
      recommendationSetId,
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

    const academicStage = session.academicStage || "Class 10";

    // Try to load existing relational recommendations
    let recSet = null;
    let legacyDetected = false;

    try {
      recSet = await recommendationService.getRecommendationSetBySessionId(sessionId);
    } catch (error: any) {
      if (error.message === "LEGACY_RECOMMENDATION_SET_DETECTED") {
        legacyDetected = true;
      } else {
        throw error;
      }
    }

    if (legacyDetected) {
      console.log(`[Result API] Legacy recommendation set detected for session ${sessionId}`);
      throw new Error("LEGACY_RECOMMENDATION_SET_DETECTED");
    }

    if (recSet) {
      const recommendationTypes = Array.from(new Set(recSet.items.map((r: any) => r.recommendation_type)));
      console.log(`[Result API]`);
      console.log(`recommendationSetExists: true`);
      console.log(`recommendationTypes: ${JSON.stringify(recommendationTypes)}`);
      console.log(`source: POSTGRES`);

      return res.status(200).json({
        sessionId: session.id,
        academicStage,
        recommendationType: academicStage === "Class 10" ? "academic_direction" : "course_career",
        recommendationSetId: recSet.id,
        recommendations: recSet.items,
        status: session.status,
        explanation: session.explanation,
        answers: session.answers ? JSON.parse(session.answers) : []
      });
    }

    // CASE B: No relational recommendation_set exists yet -> NOT legacy -> recover/generate canonical recommendations
    console.log(`[Result API] No recommendation set found in Postgres. Attempting recovery for session ${sessionId}...`);

    // 1. Fetch persisted profile from student_assessment_profiles
    let profile = await db.query.studentAssessmentProfiles.findFirst({
      where: eq(studentAssessmentProfiles.assessmentSessionId, sessionId)
    });

    // 2. If profile is missing in DB, try to fetch/recover it from MS2
    if (!profile) {
      console.log(`[Result API] Profile missing in Postgres. Querying MS2 for state recovery...`);
      
      let ms2Response = await fetch(`${config.aiEngineUrl}/assessment/${sessionId}/result`);
      if (ms2Response.status === 404) {
        console.log(`[Result API] Session ${sessionId} not found in MS2. Restoring from PostgreSQL...`);
        const restored = await restoreSessionInMs2(sessionId);
        if (restored) {
          ms2Response = await fetch(`${config.aiEngineUrl}/assessment/${sessionId}/result`);
        }
      }

      if (ms2Response.ok) {
        const ms2ResultPayload = await ms2Response.json() as any;
        if (ms2ResultPayload.profile) {
          console.log(`[Result API] Successfully retrieved profile from MS2.`);
          const userProfile = await db.query.profiles.findFirst({ where: (p, { eq }) => eq(p.userId, userId) });
          const ms2Profile = ms2ResultPayload.profile || {};
          const currentStream = ms2Profile.current_stream || (userProfile as any)?.currentStream || undefined;
          
          const savedProfiles = await recommendationService.saveStudentProfile({
            userId,
            assessmentSessionId: sessionId,
            academicStage,
            currentStream,
            subjectInterests: ms2Profile.extracted_interests || [],
            strengths: ms2Profile.inferred_strengths || [],
            careerValues: ms2Profile.career_values || [],
            workStyle: ms2Profile.work_preferences || [],
          });
          profile = savedProfiles[0];
        }
      }
    }

    if (!profile) {
      console.log(`[Result API] Recovery impossible: Profile is missing.`);
      return res.status(400).json({
        message: "Recommendation generation is incomplete because student assessment profile is missing.",
        code: "RECOMMENDATION_GENERATION_INCOMPLETE"
      });
    }

    // Reconstruct MS2 profile format from our Postgres profile row
    const ms2ProfileFormat = {
      extracted_interests: profile.subjectInterests || [],
      inferred_strengths: profile.strengths || [],
      career_values: profile.careerValues || [],
      work_preferences: profile.workStyle || [],
      answers: session.answers ? JSON.parse(session.answers) : [],
    };

    const userProfile = await db.query.profiles.findFirst({ where: (p, { eq }) => eq(p.userId, userId) });
    const currentStream = profile.currentStream || (userProfile as any)?.currentStream || undefined;

    try {
      const recoveryResult = await orchestrateRecommendations(
        userId,
        sessionId,
        academicStage,
        ms2ProfileFormat,
        currentStream
      );

      // Save the session recommendation status to READY in DB
      await saveAssessmentState(sessionId, {
        recommendation_status: "READY",
        recommendations: recoveryResult.recommendations,
      });

      const recommendationTypes = Array.from(new Set(recoveryResult.recommendations.map((r: any) => r.recommendation_type)));
      console.log(`[Result API]`);
      console.log(`recommendationSetExists: true`);
      console.log(`recommendationTypes: ${JSON.stringify(recommendationTypes)}`);
      console.log(`source: RECOVERY`);

      return res.status(200).json({
        sessionId: session.id,
        academicStage,
        recommendationType: academicStage === "Class 10" ? "academic_direction" : "course_career",
        recommendationSetId: recoveryResult.recommendationSetId,
        recommendations: recoveryResult.recommendations,
        status: session.status,
        explanation: session.explanation,
        answers: session.answers ? JSON.parse(session.answers) : []
      });

    } catch (orchestrationError: any) {
      console.error(`[Result API Recovery] Failed to orchestrate recommendations:`, orchestrationError);
      return res.status(500).json({
        message: "Failed to generate dynamic assessment result during recovery.",
      });
    }

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
    const recommendationId = req.body?.recommendationId || req.body?.targetRecommendationId;

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
