import { config } from "../../config";
import { logger } from "../../utils/logger";

export interface AssessmentAnswerPayload {
  question: string;
  selectedOption: string;
  score: number;
}

export interface AssessmentRecommendationPayload {
  userId: string;
  assessmentType: string;
  answers: AssessmentAnswerPayload[];
}

export interface AdaptiveAssessmentStartResponse {
  questions: Array<Record<string, unknown>>;
  state: Record<string, unknown>;
  isComplete: boolean;
}

export interface AdaptiveAssessmentNextResponse {
  questions: Array<Record<string, unknown>>;
  state: Record<string, unknown>;
  isComplete: boolean;
  careers: Array<Record<string, unknown>>;
  explanation: string;
}

export interface AdaptiveAnswerSubmission {
  questionId: string;
  questionText: string;
  selectedOption: string;
  score: number;
}

export function buildAssessmentPayload(
  userId: string,
  assessmentType: string,
  answers: AssessmentAnswerPayload[]
): AssessmentRecommendationPayload {
  return {
    userId,
    assessmentType,
    answers,
  };
}

export async function startAdaptiveAssessment(
  userId: string,
  assessmentType: string
): Promise<AdaptiveAssessmentStartResponse> {
  const response = await fetch(
    `${config.aiEngineUrl}/career/assessment/start`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        assessmentType,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `AI engine returned ${response.status} while starting assessment`
    );
  }

  return (await response.json()) as AdaptiveAssessmentStartResponse;
}

export async function submitAdaptiveAnswers(
  userId: string,
  answers: AdaptiveAnswerSubmission[],
  state: Record<string, unknown>
): Promise<AdaptiveAssessmentNextResponse> {
  const response = await fetch(
    `${config.aiEngineUrl}/career/assessment/next`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        answers,
        state,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `AI engine returned ${response.status} while processing assessment answers`
    );
  }

  return (await response.json()) as AdaptiveAssessmentNextResponse;
}

export async function getCareerRecommendations(
  payload: AssessmentRecommendationPayload
): Promise<{ careers: Array<Record<string, unknown>>; explanation: string }> {
  
  //remove
  console.log("Calling AI Engine:", config.aiEngineUrl);

  const response = await fetch(
    `${config.aiEngineUrl}/career/recommend`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    logger.error(
      `AI engine returned ${response.status} while generating recommendations`
    );

    throw new Error(
      `AI engine returned ${response.status} while generating recommendations`
    );
  }

  return (await response.json()) as { careers: Array<Record<string, unknown>>; explanation: string };

  //remove 
  console.log("Recommendation received");  

}
