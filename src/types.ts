export type UserRole = 'student' | 'admin';

export type QuestionType = 'MCQ' | 'MSQ' | 'APTITUDE' | 'PSEUDOCODE' | 'CODING';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type ProgrammingLanguage = 'python' | 'java' | 'c' | 'cpp' | 'javascript' | 'sql';

export type ApplicationState = 
  | 'ROLE_SELECTED'
  | 'ASSESSMENT_NOT_STARTED'
  | 'ASSESSMENT_SUBMITTED'
  | 'RESULT_AVAILABLE'
  | 'NOT_QUALIFIED'
  | 'QUALIFIED'
  | 'INTERVIEW_UNLOCKED'
  | 'INTERVIEW_COMPLETED';

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
  // MCQ and Aptitude specific
  options?: OptionWithExplanation[];
  correctAnswer?: string | string[];
  // Pseudocode specific
  pseudocode?: string;
  expectedOutput?: string;
  explanation?: string;
  // Coding specific
  codeTemplate?: string;
  codeTemplatesByLanguage?: Partial<Record<ProgrammingLanguage, string>>;
  testCases?: TestCase[];
  constraints?: string;
  supportedLanguages?: ProgrammingLanguage[];
  // SQL specific table schema hints
  sqlSchema?: string;
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
    aptitude: number;
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
  score: number; // 0 - 100 overall
  isQualified: boolean;
  mcqScore: number; // out of 15
  aptitudeScore?: number; // out of 10
  pseudoScore: number; // out of 10
  codingScore: number; // out of 4
  totalQuestions: number; // 39
  correctCount: number;
  durationMinutes: number;
  questions: Question[];
  answers: Record<string, any>;
  topicBreakdown: Record<string, { total: number; correct: number; percentage: number }>;
  weakTopics: string[];
  strongTopics: string[];
  isAdaptive?: boolean;
  applicationState?: ApplicationState;
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

export interface InterviewFocusArea {
  topic: string;
  observation: string;
  recommendation: string;
}

export interface InterviewEvaluation {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  relevanceScore: number;
  clarityConfidenceScore: number;
  problemSolvingScore?: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  actionableSuggestions?: string[];
  focusAreas?: InterviewFocusArea[];
  whatYouShouldFocusOn?: string[];
  verdict: string;
}

export interface InterviewAttempt {
  id: string;
  studentId: string;
  role: string;
  date: string;
  score?: number;
  status: 'completed' | 'abandoned';
  messages?: any[];
  transcript?: any[];
  evaluation?: InterviewEvaluation;
  isDirectTest?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  college?: string;
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
  applicationState?: ApplicationState;
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
