import { ChatMessage, Company, Persona, QnAPair, Role, UploadedAsset } from './gpt';

/**
 * Chat session state
 */
export interface ChatSessionState {
  // Session data
  sessionId: string;
  roleId: string;
  role: Role | null;
  company: Company | null;
  persona: Persona | null;
  
  // Chat state
  messages: ChatMessage[];
  questions: Array<{ id: string, text: string }>;
  answers: QnAPair[];
  currentQuestion: string | null;
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
  
  // Assets
  uploadedAssets: UploadedAsset[];
  
  // Progress
  questionIndex: number;
  progressPercentage: number;
  
  // Status
  interviewComplete: boolean;
  showSummary: boolean;
  
  // Evaluation results
  fitScore: number | null;
  summaryCandidate: string | null;
  summaryRecruiter: string | null;
  
  // User info
  candidateName: string | null;
  candidateEmail: string | null;
  
  // System state
  useTestMode: boolean;
  hasApiError: boolean;
  initialLoadFailed: boolean;
  retryCount: number;
}

/**
 * Chat session actions
 */
export type ChatSessionAction = 
  | { type: 'SET_ROLE_DATA'; payload: { role: Role; company: Company } }
  | { type: 'SET_PERSONA'; payload: Persona }
  | { type: 'ADD_USER_MESSAGE'; payload: string }
  | { type: 'ADD_ASSISTANT_MESSAGE'; payload: string }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_ANSWER'; payload: QnAPair }
  | { type: 'SET_CURRENT_QUESTION'; payload: string | null }
  | { type: 'INCREMENT_QUESTION_INDEX' }
  | { type: 'SET_INTERVIEW_COMPLETE'; payload: boolean }
  | { type: 'SET_SHOW_SUMMARY'; payload: boolean }
  | { type: 'SET_EVALUATION'; payload: { fitScore: number; summaryCandidate: string; summaryRecruiter: string } }
  | { type: 'SET_CANDIDATE_INFO'; payload: { name: string; email: string } }
  | { type: 'ADD_UPLOADED_ASSET'; payload: UploadedAsset }
  | { type: 'UPDATE_UPLOADED_ASSET'; payload: { id: string; updates: Partial<UploadedAsset> } }
  | { type: 'REMOVE_UPLOADED_ASSET'; payload: string } // id
  | { type: 'SET_TEST_MODE'; payload: boolean }
  | { type: 'SET_API_ERROR'; payload: boolean }
  | { type: 'INCREMENT_RETRY_COUNT' }
  | { type: 'RESET_SESSION' };

/**
 * Candidate data to save to Supabase
 */
export interface CandidateData {
  role_id: string;
  answers: QnAPair[];
  fit_score?: number;
  summary_candidate?: string;
  summary_recruiter?: string;
  resume_url?: string;
  candidate_email?: string;
  candidate_name?: string;
}

/**
 * Chat context provided to components
 */
export interface ChatContextType {
  state: ChatSessionState;
  sendMessage: (message: string) => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
  completeInterview: () => Promise<void>;
  restartChat: () => void;
}; 