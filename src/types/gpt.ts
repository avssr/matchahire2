/**
 * Types for GPT interactions
 */

/**
 * Role definition in Supabase
 */
export interface Role {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  location: string;
  salary?: string;
  tags?: string[];
  skills?: string[];
  company_id: string;
  created_at: string;
  updated_at: string;
  companies?: Company;
}

/**
 * Company definition in Supabase
 */
export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  website: string;
  description: string;
  industry: string;
  size: string;
  created_at: string;
  updated_at: string;
}

/**
 * Persona definition in Supabase
 */
export interface Persona {
  id: string;
  role_id: string;
  name: string;
  bio: string;
  personality: string;
  experience: string;
  skills: string[];
  avatar_url?: string;
  fallback_message?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Chat message structure
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

/**
 * GPT evaluation result
 */
export interface GPTEvaluation {
  fit_score: number;
  summary_candidate: string;
  summary_recruiter: string;
}

/**
 * Question and answer pair
 */
export interface QnAPair {
  q: string;
  a: string;
  timestamp?: Date;
}

/**
 * Uploaded asset
 */
export interface UploadedAsset {
  id: string;
  type: 'resume' | 'portfolio' | 'other';
  name: string;
  size: number;
  url?: string;
  status: 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
}

export interface QuickApplyFormData {
  name: string;
  email: string;
  phone?: string;
  resume: File;
  coverLetter?: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  yearsOfExperience?: string;
  education?: string;
  currentCompany?: string;
  availability?: string;
  salary?: string;
  referral?: string;
  questions?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 