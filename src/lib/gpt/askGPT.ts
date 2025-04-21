import { OpenAI } from 'openai';
import { logger } from '@/utils/logger';

// Initialize OpenAI client with better error handling
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    logger.error('OpenAI API key not found in environment variables');
    throw new Error('OpenAI API key not found');
  }

  try {
    return new OpenAI({
      apiKey,
      maxRetries: 3,
      timeout: 30000,
    });
  } catch (error) {
    logger.error('Failed to initialize OpenAI client:', error);
    throw error;
  }
};

// Get a singleton instance of the OpenAI client
const openai = getOpenAIClient();

/**
 * Sends a request to the OpenAI API and returns the response
 */
export const askGPT = async (
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  modelName: string = process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  temperature: number = 0.7,
  stream: boolean = false,
  maxTokens?: number
): Promise<any> => {
  try {
    logger.info(`Sending request to OpenAI using ${modelName} model`);
    
    // Prepare the messages array with system prompt
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];
    
    // Configure OpenAI request options
    const options: any = {
      model: modelName,
      messages: formattedMessages,
      temperature,
      stream,
    };
    
    if (maxTokens) {
      options.max_tokens = maxTokens;
    }
    
    // Send request to OpenAI API
    if (stream) {
      return await openai.chat.completions.create(options);
    } else {
      const response = await openai.chat.completions.create(options);
      logger.info(`Received response from OpenAI`);
      logger.debug(`Response content: ${response.choices[0].message.content?.substring(0, 50)}...`);
      return response.choices[0].message.content;
    }
  } catch (error) {
    logger.error(`Error in askGPT: ${error}`);
    throw error;
  }
};

/**
 * Parses a JSON response from GPT
 */
export const parseGPTResponse = <T>(response: string): T | null => {
  try {
    // Extract JSON if it's wrapped in backticks
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                      response.match(/```\n([\s\S]*?)\n```/) ||
                      response.match(/{[\s\S]*?}/);
    
    const jsonString = jsonMatch ? jsonMatch[0] : response;
    return JSON.parse(jsonString.replace(/```json\n|```\n|```/g, ''));
  } catch (error) {
    logger.error(`Error parsing GPT JSON response: ${error}`);
    return null;
  }
}; 