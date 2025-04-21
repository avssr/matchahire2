import { createServerSupabaseClient } from './supabaseClient';
import { logger } from './logger';

/**
 * Maximum file size in bytes (5MB)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Allowed file types for resume uploads
 */
export const ALLOWED_RESUME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

/**
 * Allowed file types for portfolio uploads
 */
export const ALLOWED_PORTFOLIO_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif'
];

/**
 * Validates a file for upload
 */
export const validateFile = (
  file: File, 
  allowedTypes: string[] = ALLOWED_RESUME_TYPES, 
  maxSize: number = MAX_FILE_SIZE
): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `File size exceeds maximum limit of ${Math.round(maxSize / (1024 * 1024))}MB` 
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'File type not allowed. Please upload a PDF, DOC, or DOCX file.' 
    };
  }

  return { valid: true };
};

/**
 * Uploads a file to Supabase storage
 */
export const uploadFile = async (
  file: File,
  bucketName: string = 'resumes',
  path?: string
): Promise<{ url: string; error?: string }> => {
  try {
    logger.info(`Uploading file: ${file.name} to ${bucketName}`);
    
    // Validate file before upload
    const validation = validateFile(
      file, 
      bucketName === 'portfolios' ? ALLOWED_PORTFOLIO_TYPES : ALLOWED_RESUME_TYPES
    );
    
    if (!validation.valid) {
      logger.warn(`File validation failed: ${validation.error}`);
      return { url: '', error: validation.error };
    }
    
    // Create a unique file path
    const timestamp = new Date().getTime();
    const fileExt = file.name.split('.').pop();
    const filePath = path 
      ? `${path}/${timestamp}-${file.name}` 
      : `${timestamp}-${file.name}`;
    
    // Get Supabase client and upload
    const supabase = createServerSupabaseClient();
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      logger.error(`Error uploading file: ${error.message}`);
      return { url: '', error: error.message };
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);
    
    logger.info(`File uploaded successfully. URL: ${publicUrl}`);
    return { url: publicUrl };
  } catch (error: any) {
    logger.error(`Unexpected error during file upload: ${error.message}`);
    return { url: '', error: `Unexpected error: ${error.message}` };
  }
};

/**
 * Extracts text content from an uploaded resume
 * Note: This is a placeholder. Implement actual extraction based on needs.
 */
export const extractResumeText = async (
  fileUrl: string
): Promise<{ text: string; error?: string }> => {
  try {
    logger.info(`Extracting text from resume: ${fileUrl}`);
    // This would be implemented with a document parsing service
    // For now, return a placeholder message
    return { 
      text: 'Resume text extraction not implemented. This would require a document parsing service.' 
    };
  } catch (error: any) {
    logger.error(`Error extracting resume text: ${error.message}`);
    return { text: '', error: error.message };
  }
}; 