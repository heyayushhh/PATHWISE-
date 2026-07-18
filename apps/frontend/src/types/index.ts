export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data: T | null;
  errors: Record<string, string[]> | null;
  timestamp: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role?: string;
}

export interface Profile {
  id: string;
  userId: string;
  currentStage: string;
  assessmentStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  profile: Profile;
  accessToken: string;
  refreshToken: string;
}

export interface GetMeResponse {
  user: User;
  profile: Profile;
}

export interface AssessmentQuestionOption {
  id: string;
  questionId: string;
  optionText: string;
  optionValue: number;
  orderNo: number;
}

export interface AssessmentQuestion {
  id: string;
  questionText: string;
  questionType: string;
  options: AssessmentQuestionOption[];
}

export interface AssessmentSessionResponse {
  message: string;
  sessionId: string;
}

export interface DynamicAssessmentStartResponse {
  sessionId: string;
  question: string | null;
  options: string[];
  status: string;
  questionNumber?: number | null;
  totalQuestions?: number | null;
  progress?: number | null;
}

export interface GeminiCareerRecommendation {
  title: string;
  matchScore: number;
  whyRecommended: string;
  requiredSkills: string[];
  futureDemand?: string | null;
  salaryRange?: string | null;
  learningRoadmapId?: string | null;
}

export interface DeterministicCareerRecommendation {
  career_name: string;
  why_suitable: string;
  match_score?: number;
  match_level?: string;
  strengths?: string[];
  required_skills?: string[];
  next_steps?: string;
  confidence?: number;
}

export type CareerRecommendation = GeminiCareerRecommendation | DeterministicCareerRecommendation;

export interface DynamicAssessmentTurnResponse {
  sessionId: string;
  nextQuestion: string | null;
  options: string[];
  status: "continue" | "completed" | string;
  recommendations: CareerRecommendation[];
  confidenceScore: number | null;
  progress: number | null;
  explanation: string | null;
  questionNumber?: number | null;
  totalQuestions?: number | null;
}

export interface DynamicAssessmentResultResponse {
  session_id: string;
  status: string;
  recommendations: CareerRecommendation[];
  confidence_score: number | null;
  progress: number | null;
  explanation: string | null;
  academic_stage?: string;
  answers: Array<{
    question?: string;
    category?: string;
    answer?: string;
  }>;
}

export interface AssessmentSessionSnapshot {
  sessionId: string;
  status: "continue" | "completed";
  currentQuestion: string | null;
  options: string[];
  progress: number;
  updatedAt: string;
  questionNumber?: number | null;
  totalQuestions?: number | null;
}
