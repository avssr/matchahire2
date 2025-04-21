import { NextResponse } from 'next/server';
import { logger } from '@/utils/logger';
import { QuickApplyFormData } from '@/types/gpt';

export async function POST(
  request: Request,
  { params }: { params: { roleId: string } }
) {
  try {
    const { roleId } = params;
    const formData: QuickApplyFormData = await request.json();
    
    logger.info(`Processing quick apply for role ID: ${roleId}`, {
      name: formData.name,
      email: formData.email
    });
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.resume) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields' 
        },
        { status: 400 }
      );
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In a real app:
    // 1. Store application data in database
    // 2. Upload resume file to storage
    // 3. Send confirmation email
    // 4. Queue application for review
    
    // For demo, generate an application ID
    const applicationId = `app-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    return NextResponse.json({
      success: true,
      applicationId,
      message: `Thank you for your application, ${formData.name}! We will review your submission and contact you soon.`
    });
  } catch (error) {
    logger.error(`Error processing quick apply for role ID: ${params.roleId}`, error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process application' 
      },
      { status: 500 }
    );
  }
} 