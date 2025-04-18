-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    website TEXT NOT NULL,
    industry TEXT NOT NULL,
    description TEXT NOT NULL,
    values TEXT[] NOT NULL,
    culture TEXT NOT NULL,
    logo_url TEXT,
    tone TEXT NOT NULL,
    persona_context JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    level TEXT NOT NULL,
    tags TEXT[] NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT[] NOT NULL,
    responsibilities TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create personas table
CREATE TABLE IF NOT EXISTS personas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    persona_name TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    tone TEXT NOT NULL,
    conversation_mode TEXT NOT NULL CHECK (conversation_mode IN ('structured', 'conversational', 'manual')),
    question_sequence JSONB NOT NULL,
    scoring_prompt TEXT NOT NULL,
    email_prompt TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create candidates table
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    resume_url TEXT,
    portfolio_urls TEXT[],
    status TEXT NOT NULL CHECK (status IN ('applied', 'interviewing', 'offered', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_roles_company_id ON roles(company_id);
CREATE INDEX IF NOT EXISTS idx_personas_role_id ON personas(role_id);
CREATE INDEX IF NOT EXISTS idx_candidates_role_id ON candidates(role_id); 