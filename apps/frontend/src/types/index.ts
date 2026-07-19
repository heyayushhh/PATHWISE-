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
  questionId: string | null;
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
  id: string;
  recommendation_type?: string;
  candidate_id?: string;
  title?: string;
  slug?: string;
  description?: string;
  careerFamily?: string;
  educationLevel?: string;
  career_name?: string; // legacy support
  why_suitable?: string; // legacy support
  personalized_reason?: string;
  match_score?: number;
  match_level?: string;
  strengths?: string[];
  required_skills?: string[];
  next_steps?: string;
  confidence?: number;
  score_breakdown?: any;
  is_primary?: boolean;
  is_target?: boolean;
  type?: string;
}

export type CareerRecommendation = GeminiCareerRecommendation | DeterministicCareerRecommendation;

export interface DynamicAssessmentTurnResponse {
  sessionId: string;
  nextQuestion: string | null;
  nextQuestionId: string | null;
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
  sessionId?: string;
  session_id?: string; // legacy support
  status: string;
  recommendations: CareerRecommendation[];
  confidenceScore?: number | null;
  confidence_score?: number | null; // legacy
  progress?: number | null;
  explanation: string | null;
  academicStage?: string;
  academic_stage?: string; // legacy
  recommendationType?: string;
  recommendationSetId?: string;
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
  questionId: string | null;
  options: string[];
  progress: number;
  updatedAt: string;
  questionNumber?: number | null;
  totalQuestions?: number | null;
}
