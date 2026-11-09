import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AssessmentAttempt, InterviewAttempt, PracticeSession, UserProfile } from '../types';

const env = (import.meta as any).env || {};
export const supabaseUrl = env.VITE_SUPABASE_URL || '';
export const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('xyzcompany') &&
  !supabaseAnonKey.includes('your-anon-key')
);

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return supabaseInstance;
}

export const supabase = getSupabase();

/**
 * Validates Supabase PostgreSQL connectivity by attempting a lightweight query.
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  latencyMs?: number;
}> {
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      message: 'Supabase credentials not configured in environment (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Using Local Storage & Express Database fallback.',
    };
  }

  const client = getSupabase();
  if (!client) {
    return {
      connected: false,
      message: 'Failed to initialize Supabase client instance.',
    };
  }

  const start = Date.now();
  try {
    const { error } = await client.from('roles').select('id').limit(1);
    const latency = Date.now() - start;

    if (error && error.code !== 'PGRST116') {
      return {
        connected: false,
        message: `Supabase query error: ${error.message} (Code: ${error.code})`,
        latencyMs: latency,
      };
    }

    return {
      connected: true,
      message: `Supabase PostgreSQL Connected Successfully (${latency}ms latency).`,
      latencyMs: latency,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Network connection to Supabase failed: ${err.message || 'Unknown network error'}`,
      latencyMs: Date.now() - start,
    };
  }
}

// ==================== SUPABASE CLOUD SYNC HELPERS ====================

export async function syncProfileToSupabase(profile: UserProfile): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client.from('profiles').upsert({
      id: profile.id,
      email: profile.email,
      full_name: profile.fullName,
      role: profile.role,
      selected_role: profile.selectedRole,
      college: profile.college || 'Engineering Institute of Technology',
      placement_readiness: profile.placementReadiness || 0,
      sessions_count: profile.sessionsCount || 1,
      active_time_minutes: profile.activeTimeMinutes || 0,
      practice_questions_count: profile.practiceQuestionsCount || 0,
      assessment_status: profile.assessmentStatus || 'Not Started',
      interview_status: profile.interviewStatus || 'locked',
      strong_skills: profile.strongSkills || [],
      needs_improvement: profile.needsImprovement || [],
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase profile sync warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase profile sync exception:', err);
    return false;
  }
}

export async function fetchProfileFromSupabase(userId: string): Promise<UserProfile | null> {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      role: data.role,
      selectedRole: data.selected_role,
      college: data.college,
      placementReadiness: data.placement_readiness,
      sessionsCount: data.sessions_count,
      activeTimeMinutes: data.active_time_minutes,
      practiceMinutes: 0,
      assessmentMinutes: 0,
      interviewMinutes: 0,
      practiceQuestionsCount: data.practice_questions_count,
      dsaSolvedCount: 0,
      assessmentStatus: data.assessment_status,
      interviewStatus: data.interview_status,
      strongSkills: data.strong_skills || [],
      needsImprovement: data.needs_improvement || [],
      memberSince: data.created_at ? new Date(data.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
      themePreference: 'light',
    };
  } catch {
    return null;
  }
}

export async function syncAttemptToSupabase(attempt: AssessmentAttempt): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client.from('assessment_attempts').insert({
      attempt_number: attempt.attemptNumber,
      student_id: attempt.studentId,
      role_title: attempt.role,
      score: attempt.score,
      is_qualified: attempt.isQualified,
      mcq_score: attempt.mcqScore,
      pseudo_score: attempt.pseudoScore,
      coding_score: attempt.codingScore,
      total_questions: attempt.totalQuestions || 39,
      correct_count: attempt.correctCount,
      duration_minutes: attempt.durationMinutes,
      topic_breakdown: attempt.topicBreakdown || {},
      weak_topics: attempt.weakTopics || [],
      strong_topics: attempt.strongTopics || [],
      is_adaptive: Boolean(attempt.isAdaptive),
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('Supabase attempt sync warning:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function fetchAttemptsFromSupabase(userId: string): Promise<AssessmentAttempt[]> {
  const client = getSupabase();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('assessment_attempts')
      .select('*')
      .eq('student_id', userId)
      .order('attempt_number', { ascending: false });

    if (error || !data) return [];

    return data.map((d: any) => ({
      id: d.id,
      attemptNumber: d.attempt_number,
      studentId: d.student_id,
      role: d.role_title,
      date: new Date(d.created_at).toLocaleDateString('en-US'),
      score: d.score,
      isQualified: d.is_qualified,
      mcqScore: d.mcq_score,
      aptitudeScore: 0,
      pseudoScore: d.pseudo_score,
      codingScore: d.coding_score,
      totalQuestions: d.total_questions,
      correctCount: d.correct_count,
      durationMinutes: d.duration_minutes,
      questions: [],
      answers: {},
      topicBreakdown: d.topic_breakdown || {},
      weakTopics: d.weak_topics || [],
      strongTopics: d.strong_topics || [],
      isAdaptive: d.is_adaptive,
    }));
  } catch {
    return [];
  }
}

export async function syncInterviewToSupabase(interview: InterviewAttempt): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client.from('interview_attempts').insert({
      student_id: interview.studentId,
      role_title: interview.role,
      overall_score: interview.score || interview.evaluation?.overallScore || 0,
      technical_score: interview.evaluation?.technicalScore || 0,
      communication_score: interview.evaluation?.communicationScore || 0,
      problem_solving_score: interview.evaluation?.problemSolvingScore || 0,
      strengths: interview.evaluation?.strengths || [],
      weaknesses: interview.evaluation?.weaknesses || [],
      suggestions: interview.evaluation?.suggestions || [],
      transcript: interview.transcript || [],
      is_direct_test: Boolean(interview.isDirectTest),
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('Supabase interview sync warning:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
