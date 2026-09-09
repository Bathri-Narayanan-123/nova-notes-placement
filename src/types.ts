export type UserRole = 'student' | 'admin';

export type QuestionType = 'MCQ' | 'MSQ' | 'PSEUDOCODE' | 'CODING';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface OptionWithExplanation {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
  explanation: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface Question {
  id: string;
  role: string;
  type: QuestionType;
  topic: string;
  skill: string;
  difficulty: Difficulty;
  question: string;
  // MCQ specific
  options?: OptionWithExplanation[];
  correctAnswer?: string | string[];
  // Pseudocode specific
  pseudocode?: string;
  expectedOutput?: string;
  explanation?: string;
  // Coding specific
  codeTemplate?: string;
  testCases?: TestCase[];
  constraints?: string;
  supportedLanguages?: string[];
}

export interface PlacementRole {
  id: string;
  title: string;
  description: string;
  skills: string[];
  icon: string;
  color: string;
  defaultComposition: {
    mcq: number;
    msq: number;
    output: number;
    coding: number;
  };
}

export interface AssessmentAttempt {
  id: string;
  attemptNumber: number;
  studentId: string;
  role: string;
  date: string;
  score: number; // 0 - 100
  isQualified: boolean;
  mcqScore: number;
  pseudoScore: number;
  codingScore: number;
  totalQuestions: number;
  correctCount: number;
  durationMinutes: number;
  questions: Question[];
  answers: Record<string, any>;
  topicBreakdown: Record<string, { total: number; correct: number; percentage: number }>;
  weakTopics: string[];
  strongTopics: string[];
  isAdaptive?: boolean;
}

export interface PracticeSession {
  id: string;
  studentId: string;
  role: string;
  skill: string;
  topic: string;
  difficulty: Difficulty;
  type: QuestionType;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
}

export interface InterviewMessage {
  speaker: 'ai' | 'candidate';
  text: string;
  timestamp: string;
}

export interface InterviewEvaluation {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  relevanceScore: number;
  clarityConfidenceScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  actionableSuggestions?: string[];
  verdict: string;
}

export interface InterviewAttempt {
  id: string;
  studentId: string;
  role: string;
  date: string;
  status: 'completed' | 'abandoned';
  messages: any[];
  evaluation?: InterviewEvaluation;
  isDirectTest?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  selectedRole: string;
  memberSince: string;
  placementReadiness: number;
  sessionsCount: number;
  activeTimeMinutes: number;
  practiceMinutes: number;
  assessmentMinutes: number;
  interviewMinutes: number;
  practiceQuestionsCount: number;
  assessmentStatus: string;
  interviewStatus: 'locked' | 'unlocked' | 'completed';
  strongSkills: string[];
  needsImprovement: string[];
}

export interface SystemConfig {
  qualificationThreshold: number; // default 70
  assessmentTimeMinutes: number; // default 30
  fullscreenRequired: boolean;
  suspiciousActivityDetection: boolean;
}
