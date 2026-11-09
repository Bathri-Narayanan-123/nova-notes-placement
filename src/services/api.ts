/**
 * NOVA NOTES: Centralized API Service Layer
 * Organizes backend operations into clean, reusable, type-safe service functions.
 * Modules:
 * - authService
 * - studentService
 * - practiceService
 * - assessmentService
 * - adaptiveService
 * - interviewService
 * - adminService
 * - systemService
 */

import { 
  AssessmentAttempt, 
  InterviewAttempt, 
  PracticeSession, 
  Question, 
  SystemConfig, 
  UserProfile 
} from '../types';

const BASE_URL = '';

function getAuthHeaders(userEmail?: string, userRole?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (userEmail) headers['x-user-email'] = userEmail;
  if (userRole) headers['x-user-role'] = userRole;
  return headers;
}

// ==================== 1. AUTHENTICATION SERVICES ====================
export const authService = {
  async signup(data: { fullName: string; email: string; password: string; confirmPassword?: string; college?: string }) {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async verifyEmail(email: string, otp: string) {
    const res = await fetch(`${BASE_URL}/api/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    return res.json();
  },

  async resendOtp(email: string, type: 'signup' | 'login' | 'reset' = 'signup') {
    const res = await fetch(`${BASE_URL}/api/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, type }),
    });
    return res.json();
  },

  async requestOtpLogin(email: string) {
    const res = await fetch(`${BASE_URL}/api/auth/otp-login-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  async verifyOtpLogin(email: string, otp: string) {
    const res = await fetch(`${BASE_URL}/api/auth/otp-login-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    return res.json();
  },

  async login(email: string, password: string, portalTab: 'student' | 'admin' = 'student') {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, portalTab }),
    });
    return res.json();
  },

  async verifyAdmin(email: string) {
    const res = await fetch(`${BASE_URL}/api/auth/verify-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },
};

// ==================== 2. STUDENT & PROFILE SERVICES ====================
export const studentService = {
  async getProfile(userId?: string): Promise<{ success: boolean; profile: UserProfile }> {
    const url = userId ? `${BASE_URL}/api/profile/${userId}` : `${BASE_URL}/api/profile`;
    const res = await fetch(url);
    return res.json();
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<{ success: boolean; profile: UserProfile }> {
    const res = await fetch(`${BASE_URL}/api/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    return res.json();
  },

  async saveSelectedRole(userId: string, roleTitle: string): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/api/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, selectedRole: roleTitle }),
    });
    return res.ok;
  },
};

// ==================== 3. PRACTICE SERVICES ====================
export const practiceService = {
  async getQuestions(filters?: { role?: string; type?: string; topic?: string; difficulty?: string; search?: string }): Promise<{ success: boolean; questions: Question[]; count: number; total: number }> {
    const params = new URLSearchParams();
    if (filters?.role) params.set('role', filters.role);
    if (filters?.type) params.set('type', filters.type);
    if (filters?.topic) params.set('topic', filters.topic);
    if (filters?.difficulty) params.set('difficulty', filters.difficulty);
    if (filters?.search) params.set('search', filters.search);

    const res = await fetch(`${BASE_URL}/api/questions?${params.toString()}`);
    return res.json();
  },

  async savePracticeSession(studentId: string, session: Partial<PracticeSession>): Promise<{ success: boolean; session: any }> {
    const res = await fetch(`${BASE_URL}/api/practice/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, session }),
    });
    return res.json();
  },

  async getPracticeHistory(userId: string): Promise<{ success: boolean; history: PracticeSession[] }> {
    const res = await fetch(`${BASE_URL}/api/practice/history/${userId}`);
    return res.json();
  },

  async runCode(language: string, code: string, stdin?: string) {
    const res = await fetch(`${BASE_URL}/api/code/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, code, stdin }),
    });
    return res.json();
  },

  async runSql(query: string) {
    const res = await fetch(`${BASE_URL}/api/sql/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    return res.json();
  },
};

// ==================== 4. ASSESSMENT SERVICES ====================
export const assessmentService = {
  async getAssessmentQuestions(roleTitle: string): Promise<{ success: boolean; count: number; composition: any; questions: Question[] }> {
    const res = await fetch(`${BASE_URL}/api/assessment/questions?role=${encodeURIComponent(roleTitle)}`);
    return res.json();
  },

  async submitAssessment(data: {
    studentId: string;
    role: string;
    answers: Record<string, any>;
    questions: Question[];
    durationMinutes: number;
    isAdaptive?: boolean;
    tabSwitchCount?: number;
  }): Promise<{ success: boolean; result: AssessmentAttempt }> {
    const res = await fetch(`${BASE_URL}/api/assessment/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getCooldown(userId: string): Promise<{ inCooldown: boolean; remainingMinutes: number; nextAttemptTime?: string; cooldownDurationMinutes?: number }> {
    const res = await fetch(`${BASE_URL}/api/assessment/cooldown/${userId}`);
    return res.json();
  },

  async getAttempts(userId: string): Promise<{ success: boolean; attempts: AssessmentAttempt[] }> {
    const res = await fetch(`${BASE_URL}/api/assessment/attempts/${userId}`);
    return res.json();
  },
};

// ==================== 5. ADAPTIVE LEARNING SERVICES ====================
export const adaptiveService = {
  async getAdaptiveQuestions(userId: string, weakTopics?: string[]): Promise<{ success: boolean; count: number; weakTopics: string[]; questions: Question[] }> {
    const url = weakTopics && weakTopics.length > 0
      ? `${BASE_URL}/api/adaptive/questions/${userId}?weakTopics=${encodeURIComponent(weakTopics.join(','))}`
      : `${BASE_URL}/api/adaptive/questions/${userId}`;
    const res = await fetch(url);
    return res.json();
  },

  async getAdaptiveRecommendation(data: { role: string; score: number; weakTopics: string[]; attemptCount: number }) {
    const res = await fetch(`${BASE_URL}/api/ai/adaptive-recommendation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

// ==================== 6. AI INTERVIEW SERVICES ====================
export const interviewService = {
  async sendTurn(data: {
    role: string;
    round: string;
    conversationHistory: any[];
    candidateAnswer: string;
    studentProfile?: any;
  }) {
    const res = await fetch(`${BASE_URL}/api/ai/interview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async evaluateInterview(role: string, transcript: any[]) {
    const res = await fetch(`${BASE_URL}/api/ai/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, transcript }),
    });
    return res.json();
  },

  async saveInterview(studentId: string, interview: any): Promise<{ success: boolean; interview: InterviewAttempt }> {
    const res = await fetch(`${BASE_URL}/api/ai/interview/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, interview }),
    });
    return res.json();
  },

  async getInterviewHistory(userId: string): Promise<{ success: boolean; interviews: InterviewAttempt[] }> {
    const res = await fetch(`${BASE_URL}/api/ai/interview/history/${userId}`);
    return res.json();
  },
};

// ==================== 7. ADMIN & STAFF SERVICES ====================
export const adminService = {
  async getOverviewStats(adminEmail: string, adminRole: string = 'admin') {
    const res = await fetch(`${BASE_URL}/api/staff/overview-stats`, {
      headers: getAuthHeaders(adminEmail, adminRole),
    });
    return res.json();
  },

  async getStudents(adminEmail: string, adminRole: string = 'admin'): Promise<{ success: boolean; students: any[] }> {
    const res = await fetch(`${BASE_URL}/api/staff/students`, {
      headers: getAuthHeaders(adminEmail, adminRole),
    });
    return res.json();
  },

  async getStudentReport(studentId: string, adminEmail: string, adminRole: string = 'admin') {
    const res = await fetch(`${BASE_URL}/api/staff/student/${studentId}/report`, {
      headers: getAuthHeaders(adminEmail, adminRole),
    });
    return res.json();
  },

  async addQuestion(question: Omit<Question, 'id'>, adminEmail: string, adminRole: string = 'admin') {
    const res = await fetch(`${BASE_URL}/api/questions`, {
      method: 'POST',
      headers: getAuthHeaders(adminEmail, adminRole),
      body: JSON.stringify(question),
    });
    return res.json();
  },

  async updateQuestion(id: string, updates: Partial<Question>, adminEmail: string, adminRole: string = 'admin') {
    const res = await fetch(`${BASE_URL}/api/questions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(adminEmail, adminRole),
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async deleteQuestion(id: string, adminEmail: string, adminRole: string = 'admin') {
    const res = await fetch(`${BASE_URL}/api/questions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(adminEmail, adminRole),
    });
    return res.json();
  },

  async getSystemConfig(): Promise<{ success: boolean; config: SystemConfig }> {
    const res = await fetch(`${BASE_URL}/api/system/config`);
    return res.json();
  },

  async updateSystemConfig(config: Partial<SystemConfig>): Promise<{ success: boolean; config: SystemConfig }> {
    const res = await fetch(`${BASE_URL}/api/system/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return res.json();
  },

  async getAuditLogs(adminEmail: string, adminRole: string = 'admin'): Promise<{ success: boolean; logs: any[]; count: number }> {
    const res = await fetch(`${BASE_URL}/api/system/audit-logs`, {
      headers: getAuthHeaders(adminEmail, adminRole),
    });
    return res.json();
  },

  async getDatabaseExplorer(table?: string, adminEmail: string = 'bathrinarayanan53@gmail.com', adminRole: string = 'admin'): Promise<any> {
    const q = table ? `?table=${encodeURIComponent(table)}` : '';
    const res = await fetch(`${BASE_URL}/api/admin/database-explorer${q}`, {
      headers: getAuthHeaders(adminEmail, adminRole),
    });
    return res.json();
  },
};

// ==================== 8. SYSTEM MONITORING SERVICES ====================
export const systemService = {
  async getMetrics(): Promise<any> {
    const res = await fetch(`${BASE_URL}/api/system/metrics`);
    return res.json();
  },

  async runHealthProbe(): Promise<any> {
    const res = await fetch(`${BASE_URL}/api/system/probe`, {
      method: 'POST',
    });
    return res.json();
  },

  async getHealth(): Promise<{ status: string; timestamp: string; geminiConfigured: boolean }> {
    const res = await fetch(`${BASE_URL}/api/health`);
    return res.json();
  },
};
