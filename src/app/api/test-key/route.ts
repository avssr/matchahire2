import { NextResponse } from 'next/server';
import { testOpenAIKey } from '@/lib/gpt/testKey';
import { logger } from '@/utils/logger';

export async function GET() {
  try {
    logger.info('Testing OpenAI API key');
    const result = await testOpenAIKey();
    
    return NextResponse.json(result);
  } catch (error) {
    logger.error('Error in test-key route:', error);
    return NextResponse.json(
      { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 