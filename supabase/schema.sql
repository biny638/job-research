-- ========================================================
-- ENGINEER JOB (엔지니어 잡) - Supabase PostgreSQL Schema
-- Serverless Architecture with Row Level Security (RLS)
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 사용자 프로필 테이블 (User Profile & Engineering Specs)
CREATE TABLE IF NOT EXISTS public.users_profile (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    major TEXT,                          -- 전공 (예: 전자전기공학, 기계공학, 컴퓨터공학, 화학공학 등)
    degree TEXT DEFAULT '학사',          -- 학력 (학사, 석사, 박사)
    gpa TEXT,                            -- 학점 (예: 3.8 / 4.5)
    tech_skills TEXT[] DEFAULT '{}',     -- 보유 기술 (예: C/C++, Verilog, Python, ROS, PLC)
    tools TEXT[] DEFAULT '{}',           -- 사용 가능 프로그램 (예: MATLAB, CATIA, SolidWorks, Altium)
    projects JSONB DEFAULT '[]',         -- 프로젝트 경험
    desired_roles TEXT[] DEFAULT '{}',   -- 희망 직무
    desired_regions TEXT[] DEFAULT '{}', -- 희망 지역
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 관심 채용공고 (Saved Jobs)
CREATE TABLE IF NOT EXISTS public.saved_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id TEXT NOT NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    experience_level TEXT,
    major_requirement TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    original_url TEXT NOT NULL,
    source TEXT DEFAULT '외부 채용 포털',
    deadline TEXT,
    saved_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 관심 산업 뉴스 & AI 요약 (Saved News - Industry HINT)
CREATE TABLE IF NOT EXISTS public.saved_news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    article_title TEXT NOT NULL,
    press TEXT NOT NULL,
    original_url TEXT NOT NULL,
    published_at TEXT,
    is_overseas BOOLEAN DEFAULT FALSE,
    industry_category TEXT,
    summary_lines TEXT[] DEFAULT '{}',
    keywords TEXT[] DEFAULT '{}',
    technical_terms JSONB DEFAULT '[]', -- 어려운 전문용어와 쉬운 설명
    saved_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 이력서 관리 (Resumes)
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '공학 엔지니어 표준 이력서',
    summary TEXT,
    education JSONB DEFAULT '[]',
    tech_stack JSONB DEFAULT '[]',
    projects JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 자기소개서 관리 및 AI 첨삭 이력 (Cover Letters)
CREATE TABLE IF NOT EXISTS public.cover_letters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    job_role TEXT NOT NULL,
    question_title TEXT NOT NULL,
    original_content TEXT NOT NULL,
    improved_content TEXT,
    ai_feedback JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AI 기업 분석 대시보드 저장 (Saved Company Analyses)
CREATE TABLE IF NOT EXISTS public.company_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    analysis_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 검색 기록 (Search History)
CREATE TABLE IF NOT EXISTS public.search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    search_type TEXT NOT NULL,           -- 'jobs', 'news', 'company'
    searched_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- 사용자별 데이터 완벽 격리 및 보안
-- ========================================================

ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- 1) users_profile policies
CREATE POLICY "Users can view own profile" 
    ON public.users_profile FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON public.users_profile FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.users_profile FOR UPDATE 
    USING (auth.uid() = id);

-- 2) saved_jobs policies
CREATE POLICY "Users can access own saved jobs" 
    ON public.saved_jobs FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3) saved_news policies
CREATE POLICY "Users can access own saved news" 
    ON public.saved_news FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4) resumes policies
CREATE POLICY "Users can access own resumes" 
    ON public.resumes FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5) cover_letters policies
CREATE POLICY "Users can access own cover letters" 
    ON public.cover_letters FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 6) company_analysis policies
CREATE POLICY "Users can access own company analysis" 
    ON public.company_analysis FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 7) search_history policies
CREATE POLICY "Users can access own search history" 
    ON public.search_history FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
