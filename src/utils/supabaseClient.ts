import { createClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type cookies } from 'next/headers';
import { logger } from './logger';
import { Role, Persona, Company } from '@/types/gpt';

// Create a Supabase client for server-side operations
export const createServerSupabaseClient = (cookieStore: ReturnType<typeof cookies>) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    logger.error('Supabase credentials not found in environment variables');
    throw new Error('Supabase credentials not found');
  }
  
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle cookies in read-only environments like middleware
            logger.warn(`Failed to set cookie: ${error}`);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            logger.warn(`Failed to remove cookie: ${error}`);
          }
        },
      },
    }
  );
};

// Create a simple client for use in API routes or server components
export const createStandaloneClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    logger.error('Supabase credentials not found in environment variables');
    throw new Error('Supabase credentials not found');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

// Fetch a role by ID
export async function fetchRoleById(id: string): Promise<Role | null> {
  try {
    const supabase = createStandaloneClient();
    
    const { data, error } = await supabase
      .from('roles')
      .select(`
        *,
        companies (*)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      logger.error(`Error fetching role: ${error.message}`);
      return null;
    }
    
    return data as Role;
  } catch (error: any) {
    logger.error(`Error in fetchRoleById: ${error.message}`);
    return null;
  }
}

// Fetch all roles
export async function fetchRoles(): Promise<Role[]> {
  try {
    const supabase = createStandaloneClient();
    
    const { data, error } = await supabase
      .from('roles')
      .select(`
        *,
        companies (*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      logger.error(`Error fetching roles: ${error.message}`);
      return [];
    }
    
    return data as Role[];
  } catch (error: any) {
    logger.error(`Error in fetchRoles: ${error.message}`);
    return [];
  }
}

// Fetch a persona by role ID
export async function fetchPersonaByRoleId(roleId: string): Promise<Persona | null> {
  try {
    const supabase = createStandaloneClient();
    
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .eq('role_id', roleId)
      .single();
    
    if (error) {
      logger.error(`Error fetching persona: ${error.message}`);
      return null;
    }
    
    return data as Persona;
  } catch (error: any) {
    logger.error(`Error in fetchPersonaByRoleId: ${error.message}`);
    return null;
  }
}

/**
 * Saves chat session data to Supabase
 */
export const saveChatSession = async (
  sessionData: {
    role_id: string;
    answers: any[];
    fit_score?: number;
    summary_candidate?: string;
    summary_recruiter?: string;
    resume_url?: string;
    candidate_email?: string;
    candidate_name?: string;
  }
) => {
  try {
    logger.info(`Saving chat session data for role ID: ${sessionData.role_id}`);
    const supabase = createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('candidates')
      .insert([sessionData])
      .select()
      .single();
    
    if (error) {
      logger.error(`Error saving chat session: ${JSON.stringify(error)}`);
      throw error;
    }
    
    logger.info(`Successfully saved chat session, ID: ${data.id}`);
    return data;
  } catch (error) {
    logger.error(`Error saving chat session: ${error}`);
    throw error;
  }
}; 