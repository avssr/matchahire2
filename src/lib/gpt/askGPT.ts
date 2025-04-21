import { OpenAI } from 'openai';
import { logger } from '@/utils/logger';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Sends a request to the OpenAI API and returns the response
 */
export const askGPT = async (
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  modelName: string = 'gpt-3.5-turbo',
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