import { db } from "../../db";

import {
  assessmentSessions,
  questions,
  questionOptions,
  assessmentResponses,
  profiles,
} from "../../db/schemas";

import { eq, asc, and } from "drizzle-orm";

import {
  buildAssessmentPayload,
  getCareerRecommendations,
  type AssessmentAnswerPayload,
} from "./assessment.ai";



export async function startAssessment(
  userId: string,
  assessmentType: string,
  academicStage: string = "Class 10"
) {
  const [session] = await db
    .insert(assessmentSessions)
    .values({
      userId,
      assessmentType,
      status: "IN_PROGRESS",
      academicStage,
      currentQuestionId: "start",
      currentQuestionNumber: 1,
      totalQuestions: 10,
      answers: JSON.stringify([]),
      progress: 0,
      recommendationStatus: "NOT_STARTED",
    })
    .returning();

  return session;
}

export async function saveAssessmentState(
  sessionId: string,
  state: {
    current_question?: any;
    iteration_count?: number;
    total_questions?: number;
    answers?: any[];
    progress?: number;
    is_complete?: boolean;
    recommendation_status?: string;
    recommendations?: any[];
    explanation?: string;
  }
) {
  const updates: Record<string, any> = {};

  if (state.current_question !== undefined) {
    updates.currentQuestionId = state.current_question?.id ?? null;
  }
  if (state.iteration_count !== undefined) {
    updates.currentQuestionNumber = state.iteration_count;
  }
  if (state.total_questions !== undefined) {
    updates.totalQuestions = state.total_questions;
  }
  if (state.answers !== undefined) {
    updates.answers = JSON.stringify(state.answers);
  }
  if (state.progress !== undefined) {
    updates.progress = state.progress;
  }
  if (state.is_complete !== undefined) {
    updates.status = state.is_complete ? "COMPLETED" : "IN_PROGRESS";
    if (state.is_complete) {
      updates.completedAt = new Date();
    }
  }
  if (state.recommendation_status !== undefined) {
    updates.recommendationStatus = state.recommendation_status;
  }
  if (state.recommendations !== undefined) {
    updates.recommendations = JSON.stringify(state.recommendations);
  }
  if (state.explanation !== undefined) {
    updates.explanation = state.explanation;
  }

  const [session] = await db
    .update(assessmentSessions)
    .set(updates)
    .where(eq(assessmentSessions.id, sessionId))
    .returning();

  return session ?? null;
}

export function formatDbSessionToMs2State(session: any): Record<string, any> {
  const answers = session.answers ? JSON.parse(session.answers) : [];
  const recommendations = session.recommendations ? JSON.parse(session.recommendations) : [];
  
  const questionHistory = answers.map((a: any, idx: number) => ({
    question: a.question,
    question_id: a.question_id,
    category: a.category,
    reason: "",
    answer: a.answer,
    iteration: idx + 1
  }));

  const askedCategories = answers.map((a: any) => a.category).filter(Boolean);
  const allCategories = [
    "interests", "strengths", "personality", "work_style",
    "leadership", "creativity", "communication", "problem_solving"
  ];
  const remainingCategories = allCategories.filter(c => !askedCategories.includes(c));

  return {
    user_id: session.userId,
    session_id: session.id,
    assessment_type: session.assessmentType,
    academic_stage: session.academicStage || "Class 10",
    user_profile: { user_id: session.userId },
    answers: answers,
    current_question: session.currentQuestionId ? { id: session.currentQuestionId } : null,
    question_history: questionHistory,
    pending_answer: null,
    candidate_careers: [],
    extracted_interests: [],
    inferred_traits: [],
    inferred_strengths: [],
    confidence_score: 0.0,
    uncertainty_score: 1.0,
    asked_categories: askedCategories,
    remaining_categories: remainingCategories,
    iteration_count: session.currentQuestionNumber || 0,
    max_questions: 12,
    confidence_threshold: 0.85,
    is_complete: session.status === "COMPLETED",
    recommendations: recommendations,
    explanation: session.explanation || "",
    recommendation_status: session.recommendationStatus || "NOT_STARTED"
  };
}





export async function getAssessmentQuestions(){


  const questionList =
    await db
      .select()
      .from(questions)
      .orderBy(
        asc(questions.orderNo)
      );



  const result = [];



  for(const question of questionList){


    const options =
      await db
        .select()
        .from(questionOptions)
        .where(
          eq(
            questionOptions.questionId,
            question.id
          )
        )
        .orderBy(
          asc(questionOptions.orderNo)
        );



    result.push({

      id:
        question.id,

      questionText:
        question.questionText,

      questionType:
        question.questionType,

      options

    });


  }



  return result;

}







export async function saveAssessmentAnswer(

  sessionId:string,

  questionId:string,

  selectedOptionId:string

){


  const [response] =
    await db
      .insert(assessmentResponses)
      .values({

        sessionId,

        questionId,

        selectedOptionId

      })
      .returning();



  return response;

}

export async function saveDynamicAssessmentAnswer(sessionId: string, answer: string) {
  const [existingSession] = await db
    .select()
    .from(assessmentSessions)
    .where(eq(assessmentSessions.id, sessionId));

  if (!existingSession) {
    throw new Error("Assessment session not found");
  }

  const response = await db
    .insert(assessmentResponses)
    .values({
      sessionId,
      questionId: "00000000-0000-0000-0000-000000000001",
      selectedOptionId: "00000000-0000-0000-0000-000000000001",
    })
    .returning();

  return {
    session: existingSession,
    response: response[0],
    answer,
  };
}

export async function getAssessmentSessionById(sessionId: string) {
  const [session] = await db
    .select()
    .from(assessmentSessions)
    .where(eq(assessmentSessions.id, sessionId));

  return session ?? null;
}

export async function updateAssessmentSessionStatus(
  sessionId: string,
  status: "IN_PROGRESS" | "COMPLETED",
) {
  const [session] = await db
    .update(assessmentSessions)
    .set({
      status,
      completedAt: status === "COMPLETED" ? new Date() : null,
    })
    .where(eq(assessmentSessions.id, sessionId))
    .returning();

  return session ?? null;
}

export async function updateProfileAssessmentStatus(
  userId: string,
  assessmentStatus: string,
) {
  const [profile] = await db
    .update(profiles)
    .set({
      assessmentStatus,
      updatedAt: new Date(),
    })
    .where(eq(profiles.userId, userId))
    .returning();

  return profile ?? null;
}

export async function completeStaticAssessment(
  sessionId: string
) {
  const session = await db
    .select()
    .from(assessmentSessions)
    .where(eq(assessmentSessions.id, sessionId));

  if (session.length === 0) {
    throw new Error("Assessment session not found");
  }

  const responses = await db
    .select()
    .from(assessmentResponses)
    .where(eq(assessmentResponses.sessionId, sessionId));

  const answers: AssessmentAnswerPayload[] = [];

  for (const response of responses) {
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, response.questionId));

    const [option] = await db
      .select()
      .from(questionOptions)
      .where(eq(questionOptions.id, response.selectedOptionId));

    answers.push({
      question: question?.questionText ?? response.questionId,
      selectedOption: option?.optionText ?? response.selectedOptionId,
      score: 3,
    });
  }

  await db
    .update(assessmentSessions)
    .set({
      status: "COMPLETED",
      completedAt: new Date(),
    })
    .where(eq(assessmentSessions.id, sessionId));

  const updatedSession = await db
    .select()
    .from(assessmentSessions)
    .where(eq(assessmentSessions.id, sessionId));

  const payload = buildAssessmentPayload(
    session[0].userId,
    session[0].assessmentType,
    answers
  );

  let recommendations;
  try {
    recommendations = await getCareerRecommendations(payload);
  } catch (error) {
    recommendations = {
      careers: [],
      explanation: "Recommendation generation is temporarily unavailable. The assessment was still completed successfully.",
    };
  }

  return {
    session: updatedSession[0],
    responses,
    recommendations,
  };
}
