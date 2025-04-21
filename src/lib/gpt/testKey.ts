import { OpenAI } from 'openai';
import { logger } from '@/utils/logger';

export async function testOpenAIKey() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    logger.error('OpenAI API key not found');
    return {
      valid: false,
      error: 'API key not found'
    };
  }

  try {
    const openai = new OpenAI({
      apiKey,
      maxRetries: 1,
      timeout: 5000,
    });

    // Try to make a simple request
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 5
    });

    return {
      valid: true,
      response: response.choices[0]?.message?.content
    };
  } catch (error) {
    logger.error('Error validating OpenAI key:', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 