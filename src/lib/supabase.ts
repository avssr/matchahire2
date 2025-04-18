import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export type Company = {
  id: string
  name: string
  website: string
  industry: string
  description: string
  values: string[]
  culture: string
  logo_url?: string
  tone: string
  persona_context: {
    vision: string
    mission: string
    policies: string
    culture_summary: string
  }
  created_at: string
}

export type Role = {
  id: string
  company_id: string
  title: string
  location: string
  level: string
  tags: string[]
  description: string
  requirements: string[]
  responsibilities: string[]
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