import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Company {
  id: string
  name: string
  industry: string
  logo_url?: string
  created_at: string
}

export interface Role {
  id: string
  title: string
  description: string
  requirements: string[]
  location: string
  tags: string[]
  created_at: string
  companies?: Company
  personas?: {
    id: string
    system_prompt: string
    conversation_mode: 'structured' | 'free'
  }[]
}

export interface Application {
  id: string
  role_id: string
  applicant_name: string
  applicant_email: string
  applicant_phone: string
  cover_letter?: string
  resume_url: string
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected'
  created_at: string
}

export type Persona = {
  id: string
  role_id: string
  persona_name: string
  system_prompt: string
  tone: string
  conversation_mode: 'structured' | 'conversational' | 'manual'
  question_sequence: {
    questions: {
      id: string
      text: string
      type: string
    }[]
  }
  scoring_prompt: string
  email_prompt: string
  created_at: string
}

export type Candidate = {
  id: string
  role_id: string
  name: string
  email: string
  phone?: string
  resume_url?: string
  portfolio_urls?: string[]
  status: 'applied' | 'interviewing' | 'offered' | 'rejected'
  created_at: string
} 