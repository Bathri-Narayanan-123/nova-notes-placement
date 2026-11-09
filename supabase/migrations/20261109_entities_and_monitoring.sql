-- ==============================================================================
-- NOVA NOTES: SUPABASE POSTGRESQL 15-ENTITY MIGRATION & RLS POLICIES
-- Migration: 20261109_entities_and_monitoring.sql
-- Fulfills Phase 2 Required Data Entities:
--   1. users
--   2. student_profiles
--   3. user_roles
--   4. placement_roles
--   5. practice_questions
--   6. assessment_questions
--   7. assessment_attempts
--   8. student_answers
--   9. topic_performance
--  10. adaptive_practice
--  11. interview_sessions
--  12. interview_responses
--  13. interview_feedback
--  14. student_activity
--  15. placement_readiness
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOM ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'staff', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE question_type AS ENUM ('MCQ', 'MSQ', 'APTITUDE', 'PSEUDOCODE', 'CODING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE difficulty_level AS ENUM ('Easy', 'Medium', 'Hard');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. CORE BASE TABLES

-- ENTITY 1 & 2: student_profiles (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    college TEXT DEFAULT 'Engineering Institute of Technology',
    role user_role DEFAULT 'student'::user_role NOT NULL,
    selected_role TEXT DEFAULT 'Python Developer' NOT NULL,
    placement_readiness INTEGER DEFAULT 32 NOT NULL,
    sessions_count INTEGER DEFAULT 1 NOT NULL,
    active_time_minutes INTEGER DEFAULT 0 NOT NULL,
    practice_questions_count INTEGER DEFAULT 0 NOT NULL,
    dsa_solved_count INTEGER DEFAULT 0 NOT NULL,
    assessment_status TEXT DEFAULT 'Not Started' NOT NULL,
    interview_status TEXT DEFAULT 'locked' NOT NULL,
    strong_skills TEXT[] DEFAULT '{}',
    needs_improvement TEXT[] DEFAULT ARRAY['Python', 'OOP', 'DSA', 'SQL'],
    theme_preference TEXT DEFAULT 'light',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- View: student_profiles (exact match for entity 2)
CREATE OR REPLACE VIEW public.student_profiles AS
SELECT 
    id, email, full_name, college, role, selected_role,
    placement_readiness, sessions_count, active_time_minutes,
    practice_questions_count, dsa_solved_count, assessment_status,
    interview_status, strong_skills, needs_improvement,
    theme_preference, created_at, updated_at
FROM public.profiles;

-- ENTITY 3: user_roles (Explicit Role-Based Access Control)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role user_role DEFAULT 'student'::user_role NOT NULL,
    granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, role)
);

-- ENTITY 4: placement_roles (Roles & career tracks)
CREATE TABLE IF NOT EXISTS public.roles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    skills TEXT[] NOT NULL,
    icon TEXT DEFAULT 'Code',
    color TEXT DEFAULT 'emerald',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE OR REPLACE VIEW public.placement_roles AS
SELECT id, title, description, skills, icon, color, created_at
FROM public.roles;

-- ENTITY 5: practice_questions (Question Bank)
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id TEXT NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    type question_type NOT NULL,
    topic TEXT NOT NULL,
    skill TEXT NOT NULL,
    difficulty difficulty_level DEFAULT 'Medium'::difficulty_level NOT NULL,
    question TEXT NOT NULL,
    correct_answer TEXT,
    pseudocode TEXT,
    expected_output TEXT,
    explanation TEXT,
    code_template TEXT,
    constraints TEXT,
    test_cases JSONB DEFAULT '[]'::jsonb,
    supported_languages TEXT[] DEFAULT ARRAY['python', 'javascript', 'java', 'cpp'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE OR REPLACE VIEW public.practice_questions AS
SELECT * FROM public.questions;

-- ENTITY 6: assessment_questions (Assessment composition & templates)
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    role_id TEXT REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
    total_mcq INTEGER DEFAULT 15 NOT NULL,
    total_aptitude INTEGER DEFAULT 10 NOT NULL,
    total_pseudocode INTEGER DEFAULT 10 NOT NULL,
    total_coding INTEGER DEFAULT 4 NOT NULL,
    time_limit_minutes INTEGER DEFAULT 30 NOT NULL,
    qualification_threshold INTEGER DEFAULT 70 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.assessment_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    order_index INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENTITY 7: assessment_attempts (39-question diagnostic attempts)
CREATE TABLE IF NOT EXISTS public.assessment_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_number INTEGER NOT NULL,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role_title TEXT NOT NULL,
    score INTEGER NOT NULL,
    is_qualified BOOLEAN DEFAULT false NOT NULL,
    mcq_score INTEGER DEFAULT 0 NOT NULL,
    aptitude_score INTEGER DEFAULT 0 NOT NULL,
    pseudo_score INTEGER DEFAULT 0 NOT NULL,
    coding_score INTEGER DEFAULT 0 NOT NULL,
    total_questions INTEGER DEFAULT 39 NOT NULL,
    correct_count INTEGER DEFAULT 0 NOT NULL,
    duration_minutes INTEGER DEFAULT 30 NOT NULL,
    topic_breakdown JSONB DEFAULT '{}'::jsonb,
    weak_topics TEXT[] DEFAULT '{}',
    strong_topics TEXT[] DEFAULT '{}',
    is_adaptive BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENTITY 8: student_answers (Granular answer-by-answer recording)
CREATE TABLE IF NOT EXISTS public.assessment_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID REFERENCES public.assessment_attempts(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    submitted_answer TEXT,
    is_correct BOOLEAN DEFAULT false NOT NULL,
    execution_results JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE OR REPLACE VIEW public.student_answers AS
SELECT * FROM public.assessment_answers;

-- ENTITY 9: topic_performance (Topic-level mastery tracking)
CREATE TABLE IF NOT EXISTS public.skill_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role_id TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    topic_name TEXT NOT NULL,
    mastery_percentage INTEGER DEFAULT 0 NOT NULL,
    questions_attempted INTEGER DEFAULT 0 NOT NULL,
    questions_correct INTEGER DEFAULT 0 NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, role_id, topic_name)
);

CREATE OR REPLACE VIEW public.topic_performance AS
SELECT * FROM public.skill_performance;

-- ENTITY 10: adaptive_practice (Targeted weak-topic assignments)
CREATE TABLE IF NOT EXISTS public.adaptive_practice (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    attempt_id UUID REFERENCES public.assessment_attempts(id) ON DELETE SET NULL,
    role_title TEXT NOT NULL,
    weak_topics TEXT[] NOT NULL,
    prescribed_questions UUID[] DEFAULT '{}',
    completed_questions UUID[] DEFAULT '{}',
    improvement_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' NOT NULL, -- 'pending' | 'in_progress' | 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- ENTITY 11: interview_sessions (AI HR & Technical Interviews)
CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role_title TEXT NOT NULL,
    round_type TEXT DEFAULT 'Technical Competency' NOT NULL,
    status TEXT DEFAULT 'completed' NOT NULL, -- 'completed' | 'abandoned'
    turns_count INTEGER DEFAULT 0 NOT NULL,
    overall_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE OR REPLACE VIEW public.interview_sessions AS
SELECT * FROM public.interviews;

-- ENTITY 12: interview_responses (STT transcript & candidate turns)
CREATE TABLE IF NOT EXISTS public.interview_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID REFERENCES public.interviews(id) ON DELETE CASCADE NOT NULL,
    turn_index INTEGER NOT NULL,
    interviewer_prompt TEXT NOT NULL,
    candidate_response TEXT NOT NULL,
    audio_duration_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE OR REPLACE VIEW public.interview_responses AS
SELECT * FROM public.interview_answers;

-- ENTITY 13: interview_feedback (Gemini AI Diagnostic Evaluation)
CREATE TABLE IF NOT EXISTS public.interview_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID REFERENCES public.interviews(id) ON DELETE CASCADE NOT NULL,
    overall_score INTEGER NOT NULL,
    technical_score INTEGER NOT NULL,
    communication_score INTEGER NOT NULL,
    problem_solving_score INTEGER NOT NULL,
    relevance_score INTEGER NOT NULL,
    clarity_confidence_score INTEGER NOT NULL,
    strengths TEXT[] DEFAULT '{}',
    weaknesses TEXT[] DEFAULT '{}',
    suggestions TEXT[] DEFAULT '{}',
    focus_areas JSONB DEFAULT '[]'::jsonb,
    verdict TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE OR REPLACE VIEW public.interview_feedback AS
SELECT * FROM public.interview_evaluations;

-- ENTITY 14: student_activity (Comprehensive Audit & Session Log)
CREATE TABLE IF NOT EXISTS public.student_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT NOT NULL, -- 'LOGIN', 'ASSESSMENT_START', 'ASSESSMENT_SUBMIT', 'PRACTICE_RUN', 'INTERVIEW_START'
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENTITY 15: placement_readiness (Historical Readiness Progression)
CREATE TABLE IF NOT EXISTS public.readiness_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    readiness_percentage INTEGER NOT NULL,
    assessment_contribution REAL NOT NULL,
    coding_contribution REAL NOT NULL,
    aptitude_contribution REAL NOT NULL,
    practice_contribution REAL NOT NULL,
    interview_contribution REAL NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE OR REPLACE VIEW public.placement_readiness AS
SELECT * FROM public.readiness_scores;

-- ==============================================================================
-- 4. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_questions_role ON public.questions(role_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON public.questions(topic);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_student ON public.assessment_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_created ON public.assessment_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessment_answers_attempt ON public.assessment_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_practice_student ON public.adaptive_practice(student_id);
CREATE INDEX IF NOT EXISTS idx_interviews_student ON public.interviews(student_id);
CREATE INDEX IF NOT EXISTS idx_student_activity_student ON public.student_activity(student_id);
CREATE INDEX IF NOT EXISTS idx_readiness_scores_student ON public.readiness_scores(student_id);

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_practice ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_scores ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (role = 'admin' OR role = 'staff')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles
DROP POLICY IF EXISTS "Profiles view" ON public.profiles;
CREATE POLICY "Profiles view" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
DROP POLICY IF EXISTS "Profiles update" ON public.profiles;
CREATE POLICY "Profiles update" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- Roles
DROP POLICY IF EXISTS "Roles read" ON public.roles;
CREATE POLICY "Roles read" ON public.roles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Roles admin manage" ON public.roles;
CREATE POLICY "Roles admin manage" ON public.roles FOR ALL USING (public.is_admin());

-- Questions
DROP POLICY IF EXISTS "Questions read" ON public.questions;
CREATE POLICY "Questions read" ON public.questions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Questions admin manage" ON public.questions;
CREATE POLICY "Questions admin manage" ON public.questions FOR ALL USING (public.is_admin());

-- Attempts & Answers (Strict Isolation)
DROP POLICY IF EXISTS "Attempts student manage" ON public.assessment_attempts;
CREATE POLICY "Attempts student manage" ON public.assessment_attempts FOR ALL USING (auth.uid() = student_id OR public.is_admin());

DROP POLICY IF EXISTS "Answers student manage" ON public.assessment_answers;
CREATE POLICY "Answers student manage" ON public.assessment_answers FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.assessment_attempts a 
        WHERE a.id = attempt_id AND (a.student_id = auth.uid() OR public.is_admin())
    )
);

-- Adaptive Practice
DROP POLICY IF EXISTS "Adaptive student manage" ON public.adaptive_practice;
CREATE POLICY "Adaptive student manage" ON public.adaptive_practice FOR ALL USING (auth.uid() = student_id OR public.is_admin());

-- Interviews & Feedback
DROP POLICY IF EXISTS "Interviews manage" ON public.interviews;
CREATE POLICY "Interviews manage" ON public.interviews FOR ALL USING (auth.uid() = student_id OR public.is_admin());

DROP POLICY IF EXISTS "Interview answers manage" ON public.interview_answers;
CREATE POLICY "Interview answers manage" ON public.interview_answers FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.interviews i
        WHERE i.id = interview_id AND (i.student_id = auth.uid() OR public.is_admin())
    )
);

DROP POLICY IF EXISTS "Interview evaluations manage" ON public.interview_evaluations;
CREATE POLICY "Interview evaluations manage" ON public.interview_evaluations FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.interviews i
        WHERE i.id = interview_id AND (i.student_id = auth.uid() OR public.is_admin())
    )
);

-- Student Activity
DROP POLICY IF EXISTS "Student activity manage" ON public.student_activity;
CREATE POLICY "Student activity manage" ON public.student_activity FOR ALL USING (auth.uid() = student_id OR public.is_admin());

-- Readiness Scores
DROP POLICY IF EXISTS "Readiness scores manage" ON public.readiness_scores;
CREATE POLICY "Readiness scores manage" ON public.readiness_scores FOR ALL USING (auth.uid() = student_id OR public.is_admin());
