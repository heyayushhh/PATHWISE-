import { db } from "../../db";

import {
  assessmentSessions,
  questions,
  questionOptions,
  assessmentResponses,
} from "../../db/schemas";

import { eq, asc } from "drizzle-orm";

import {
  buildAssessmentPayload,
  getCareerRecommendations,
  type AssessmentAnswerPayload,
} from "./assessment.ai";



export async function startAssessment(
  userId:string,
  assessmentType:string
){


  const [session] =
    await db
      .insert(assessmentSessions)
      .values({

        userId,

        assessmentType,

        status:"IN_PROGRESS"

      })
      .returning();



  return session;

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

  const recommendations = await getCareerRecommendations(payload);

  return {
    session: updatedSession[0],
    responses,
    recommendations,
  };
}
