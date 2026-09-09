-- ==============================================================================
-- NOVA NOTES: SUPABASE POSTGRESQL FULL 16-TABLE PRODUCTION SCHEMA & RLS
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOM ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE question_type AS ENUM ('MCQ', 'MSQ', 'PSEUDOCODE', 'CODING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE difficulty_level AS ENUM ('Easy', 'Medium', 'Hard');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 3. THE 16 CORE DATABASE TABLES
-- ==============================================================================

-- TABLE 1: profiles (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'student'::user_role NOT NULL,
    selected_role TEXT DEFAULT 'Python Developer' NOT NULL,
    placement_readiness INTEGER DEFAULT 32 NOT NULL,
    sessions_count INTEGER DEFAULT 1 NOT NULL,
    active_time_minutes INTEGER DEFAULT 0 NOT NULL,
    practice_questions_count INTEGER DEFAULT 0 NOT NULL,
    assessment_status TEXT DEFAULT 'Not Started' NOT NULL,
    interview_status TEXT DEFAULT 'locked' NOT NULL,
    strong_skills TEXT[] DEFAULT '{}',
    needs_improvement TEXT[] DEFAULT ARRAY['Python', 'OOP', 'DSA', 'SQL'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABLE 2: roles (Placement roles and career tracks)
CREATE TABLE IF NOT EXISTS public.roles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    skills TEXT[] NOT NULL,
    icon TEXT DEFAULT 'Code',
    color TEXT DEFAULT 'emerald',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABLE 3: questions (Comprehensive Question Bank)
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
    supported_languages TEXT[] DEFAULT ARRAY['python', 'javascript'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABLE 4: question_options (MCQ Options with option-specific explanations)
CREATE TABLE IF NOT EXISTS public.question_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    option_key CHAR(1) NOT NULL,
    option_text TEXT NOT NULL,
    explanation TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false NOT NULL
);

-- TABLE 5: assessments (Assessment metadata, templates & configs)
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    role_id TEXT REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
    total_mcq INTEGER DEFAULT 20 NOT NULL,
    total_pseudocode INTEGER DEFAULT 5 NOT NULL,
    total_coding INTEGER DEFAULT 5 NOT NULL,
    time_limit_minutes INTEGER DEFAULT 30 NOT NULL,
    qualification_threshold INTEGER DEFAULT 70 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABLE 6: assessment_questions (Assessment to question assignments)
CREATE TABLE IF NOT EXISTS public.assessment_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    order_index INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABLE 7: assessment_attempts (Candidate full assessment runs)
CREATE TABLE IF NOT EXISTS public.assessment_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_number INTEGER NOT NULL,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role_title TEXT NOT NULL,
    score INTEGER NOT NULL,
    is_qualified BOOLEAN DEFAULT false NOT NULL,
    mcq_score INTEGER DEFAULT 0 NOT NULL,
    pseudo_score INTEGER DEFAULT 0 NOT NULL,
    coding_score INTEGER DEFAULT 0 NOT NULL,
    total_questions INTEGER DEFAULT 30 NOT NULL,
    correct_count INTEGER DEFAULT 0 NOT NULL,
    duration_minutes INTEGER DEFAULT 30 NOT NULL,
    topic_breakdown JSONB DEFAULT '{}'::jsonb,
    weak_topics TEXT[] DEFAULT '{}',
    strong_topics TEXT[] DEFAULT '{}',
    is_adaptive BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABLE 8: assessment_answers (Granular answer-by-answer recording)
CREATE TABLE IF NOT EXISTS public.assessment_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID REFERENCES public.assessment_attempts(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    submitted_answer TEXT,
    is_correct BOOLEAN DEFAULT false NOT NULL,
    execution_results JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABLE 9: practice_sessions (Ungraded independent practice rounds)
CREATE TABLE IF NOT EXISTS public.practice_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role_id TEXT NOT NULL,
    skill TEXT NOT NULL,
    topic TEXT NOT NULL,
    difficulty difficulty_level NOT NULL,
    question_type question_type NOT NULL,
    total_questions INTEGER DEFAULT 1 NOT NULL,
    correct_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABLE 10: practice_answers (Practice question records)
CREATE TABLE IF NOT EXISTS public.practice_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.practice_sessions(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    user_answer TEXT,
    is_correct BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABLE 11: interviews (AI HR & Technical Interviews)
CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role_title TEXT NOT NULL,
    category TEXT DEFAULT 'Technical' NOT NULL,
    difficulty TEXT DEFAULT 'Medium' NOT NULL,
    status TEXT DEFAULT 'completed' NOT NULL,
    is_practice BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABLE 12: interview_questions (Turns asked by the AI Interviewer)
CREATE TABLE IF NOT EXISTS public.interview_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID REFERENCES public.interviews(id) ON DELETE CASCADE NOT NULL,
    turn_index INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABLE 13: interview_answers (Candidate audio transcripts or text answers)
CREATE TABLE IF NOT EXISTS public.interview_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_question_id UUID REFERENCES public.interview_questions(id) ON DELETE CASCADE NOT NULL,
    answer_text TEXT NOT NULL,
    audio_duration_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABLE 14: interview_evaluations (Gemini AI Rubric Evaluations)
CREATE TABLE IF NOT EXISTS public.interview_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID REFERENCES public.interviews(id) ON DELETE CASCADE NOT NULL,
    overall_score INTEGER NOT NULL,
    technical_score INTEGER NOT NULL,
    communication_score INTEGER NOT NULL,
    relevance_score INTEGER NOT NULL,
    clarity_confidence_score INTEGER NOT NULL,
    strengths TEXT[] DEFAULT '{}',
    weaknesses TEXT[] DEFAULT '{}',
    suggestions TEXT[] DEFAULT '{}',
    verdict TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABLE 15: skill_performance (Student aggregated skill metrics)
CREATE TABLE IF NOT EXISTS public.skill_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role_id TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    mastery_percentage INTEGER DEFAULT 0 NOT NULL,
    questions_attempted INTEGER DEFAULT 0 NOT NULL,
    questions_correct INTEGER DEFAULT 0 NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, role_id, skill_name)
);

-- TABLE 16: readiness_scores (Historical readiness trends)
CREATE TABLE IF NOT EXISTS public.readiness_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    readiness_percentage INTEGER NOT NULL,
    assessment_weight INTEGER DEFAULT 60 NOT NULL,
    interview_weight INTEGER DEFAULT 40 NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_scores ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Profiles view" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Profiles update" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Roles read" ON public.roles FOR SELECT USING (true);
CREATE POLICY "Roles admin manage" ON public.roles FOR ALL USING (public.is_admin());

CREATE POLICY "Questions read" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Questions admin manage" ON public.questions FOR ALL USING (public.is_admin());
CREATE POLICY "Question options read" ON public.question_options FOR SELECT USING (true);
CREATE POLICY "Question options admin manage" ON public.question_options FOR ALL USING (public.is_admin());

CREATE POLICY "Assessments read" ON public.assessments FOR SELECT USING (true);
CREATE POLICY "Assessments admin manage" ON public.assessments FOR ALL USING (public.is_admin());

CREATE POLICY "Attempts student manage" ON public.assessment_attempts FOR ALL USING (auth.uid() = student_id OR public.is_admin());
CREATE POLICY "Practice sessions manage" ON public.practice_sessions FOR ALL USING (auth.uid() = student_id OR public.is_admin());
CREATE POLICY "Interviews manage" ON public.interviews FOR ALL USING (auth.uid() = student_id OR public.is_admin());
CREATE POLICY "Interview questions manage" ON public.interview_questions FOR ALL USING (true);
CREATE POLICY "Interview answers manage" ON public.interview_answers FOR ALL USING (true);
CREATE POLICY "Interview evaluations manage" ON public.interview_evaluations FOR ALL USING (true);
CREATE POLICY "Skill performance manage" ON public.skill_performance FOR ALL USING (auth.uid() = student_id OR public.is_admin());
CREATE POLICY "Readiness scores manage" ON public.readiness_scores FOR ALL USING (auth.uid() = student_id OR public.is_admin());

-- ==============================================================================
-- 5. TRIGGER: AUTOMATIC PROFILE CREATION ON USER SIGNUP
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Student User'),
        'student'::user_role
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 6. PROMOTION SCRIPT FOR THE PROJECT OWNER (Single Admin Mandate)
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'bathrinarayanan53@gmail.com';
-- ==============================================================================
