import { logger } from './logger';
import { Role, Persona, ApiResponse, QuickApplyFormData } from '@/types/gpt';
import { createStandaloneClient, fetchRoleById, fetchRoles, fetchPersonaByRoleId } from './supabaseClient';
import { z } from 'zod';

// Validation schemas
const roleIdSchema = z.string().uuid();
const sessionIdSchema = z.string().min(1);
const messageSchema = z.string().min(1);

// Error types
class APIError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchWithErrorHandling<T>(
  apiPromise: Promise<T | null>,
  errorContext: string
): Promise<ApiResponse<T>> {
  try {
    const data = await apiPromise;
    
    if (!data) {
      logger.error(`API error: No data returned for ${errorContext}`);
      return { 
        success: false, 
        error: `No data returned for ${errorContext}` 
      };
    }
    
    return { success: true, data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`API request failed (${errorContext}): ${errorMessage}`);
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

/**
 * Role-related API functions
 */
export const RoleService = {
  // Get all roles
  async getRoles(): Promise<ApiResponse<Role[]>> {
    return fetchWithErrorHandling<Role[]>(fetchRoles(), 'getRoles');
  },
  
  // Get a role by id
  async getRoleById(id: string): Promise<ApiResponse<Role>> {
    try {
      // Validate role ID
      const validatedId = roleIdSchema.parse(id);
      return fetchWithErrorHandling<Role>(fetchRoleById(validatedId), 'getRoleById');
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: 'Invalid role ID format'
        };
      }
      throw error;
    }
  },
  
  // Get chat persona for a role
  async getPersonaByRoleId(roleId: string): Promise<ApiResponse<Persona>> {
    try {
      // Validate role ID
      const validatedId = roleIdSchema.parse(roleId);
      return fetchWithErrorHandling<Persona>(fetchPersonaByRoleId(validatedId), 'getPersonaByRoleId');
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: 'Invalid role ID format'
        };
      }
      throw error;
    }
  },
  
  // Submit quick apply form
  async submitQuickApply(
    roleId: string,
    formData: QuickApplyFormData
  ): Promise<ApiResponse<{ applicationId: string }>> {
    try {
      // Validate role ID
      const validatedId = roleIdSchema.parse(roleId);
      
      // For test mode or development without API connection
      if (validatedId === 'test-role-id' || process.env.NODE_ENV !== 'production') {
        logger.info(`Using test mode for quick apply submission for role ID: ${validatedId}`);
        
        // Log application data for debugging
        logger.info(`Application data:`, {
          name: formData.name,
          email: formData.email,
          resumeSize: formData.resume?.size || 0,
          fields: Object.keys(formData).filter(k => k !== 'resume' && formData[k as keyof QuickApplyFormData])
        });
        
        // Simulate 1s delay for a more realistic response
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          success: true,
          data: { applicationId: `test-app-${Date.now()}` }
        };
      }
      
      const supabase = createStandaloneClient();
      
      // Create form data to insert
      const applicationData = {
        role_id: validatedId,
        applicant_name: formData.name,
        applicant_email: formData.email,
        applicant_phone: formData.phone || '',
        cover_letter: formData.coverLetter || '',
        resume_url: 'pending', // In a real implementation, you would upload the file
        linkedin_url: formData.linkedIn || '',
        portfolio_url: formData.portfolio || '',
        github_url: formData.github || '',
        years_of_experience: formData.yearsOfExperience || '',
        education: formData.education || '',
        current_company: formData.currentCompany || '',
        availability: formData.availability || '',
        salary_expectation: formData.salary || '',
        referral_source: formData.referral || '',
        questions: formData.questions || '',
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
      // Insert application data
      const { data, error } = await supabase
        .from('applications')
        .insert([applicationData])
        .select('id')
        .single();
      
      if (error) {
        logger.error(`Error submitting application: ${error.message}`);
        throw new APIError(error.message, error.code, 500);
      }
      
      return { 
        success: true, 
        data: { applicationId: data.id } 
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: 'Invalid role ID format'
        };
      }
      
      if (error instanceof APIError) {
        return {
          success: false,
          error: error.message
        };
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Application submit failed: ${errorMessage}`);
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  },
  
  // Start a chat session with AI for a role
  async startChatSession(
    roleId: string
  ): Promise<ApiResponse<{ sessionId: string }>> {
    try {
      // Validate role ID
      const validatedId = roleIdSchema.parse(roleId);
      
      // For test mode or development without API connection
      if (validatedId === 'test-role-id' || process.env.NODE_ENV !== 'production') {
        logger.info(`Using test mode for chat session with role ID: ${validatedId}`);
        return { 
          success: true, 
          data: { sessionId: `test-session-${Date.now()}` } 
        };
      }
      
      const supabase = createStandaloneClient();
      
      // Create a new chat session
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([{
          role_id: validatedId,
          status: 'active',
          created_at: new Date().toISOString()
        }])
        .select('id')
        .single();
      
      if (error) {
        logger.error(`Error creating chat session: ${error.message}`);
        throw new APIError(error.message, error.code, 500);
      }
      
      return { 
        success: true, 
        data: { sessionId: data.id } 
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: 'Invalid role ID format'
        };
      }
      
      if (error instanceof APIError) {
        return {
          success: false,
          error: error.message
        };
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Chat session start failed: ${errorMessage}`);
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  },
  
  // Send a message in an existing chat session
  async sendChatMessage(
    sessionId: string, 
    message: string
  ): Promise<ApiResponse<{ reply: string }>> {
    try {
      // Validate inputs
      const validatedSessionId = sessionIdSchema.parse(sessionId);
      const validatedMessage = messageSchema.parse(message);
      
      // For test mode or development without API endpoint
      if (validatedSessionId.startsWith('test-session') || 
          validatedSessionId.startsWith('fallback-session') || 
          validatedSessionId.startsWith('error-fallback-session')) {
        logger.info(`Using test response for session ${validatedSessionId}`);
        
        // Simulate 500ms delay for a more realistic response
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
          success: true,
          data: { 
            reply: `This is a test response for your message: "${validatedMessage}". In production, this would be generated by the AI.` 
          }
        };
      }
      
      // Make a request to the API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: validatedMessage,
          role_id: validatedSessionId.split('-')[0], // Extract role ID from session ID if needed
          session_id: validatedSessionId
        }),
      });
      
      if (!response.ok) {
        throw new APIError(`Request failed with status: ${response.status}`, 'API_ERROR', response.status);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new APIError(data.error, 'API_ERROR', 500);
      }
      
      // Map the API response structure to our expected structure
      return { 
        success: !data.isError, 
        data: { reply: data.message || "Sorry, no response was generated." },
        error: data.error || (data.isError ? "Unknown error occurred" : undefined)
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: 'Invalid input format'
        };
      }
      
      if (error instanceof APIError) {
        return {
          success: false,
          error: error.message
        };
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Send chat message failed: ${errorMessage}`);
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }
};