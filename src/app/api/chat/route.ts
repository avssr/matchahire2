import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { createServerSupabaseClient, fetchPersonaByRoleId, fetchRoleById } from '@/utils/supabaseClient'
import { generateSystemPrompt } from '@/lib/gpt/generateSystemPrompt'
import { logger } from '@/utils/logger'
import { askGPT } from '@/lib/gpt/askGPT'

// Test mode responses
function getTestResponse(message: string, roleId: string): string {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('requirements') || lowerMessage.includes('qualifications')) {
    return 'This role typically requires relevant experience in the field, strong communication skills, and the ability to work well in a team environment.'
  }
  
  if (lowerMessage.includes('salary') || lowerMessage.includes('compensation')) {
    return 'The salary for this position is competitive and based on experience. We offer a comprehensive benefits package including health insurance and professional development opportunities.'
  }
  
  if (lowerMessage.includes('interview') || lowerMessage.includes('process')) {
    return 'Our interview process typically includes an initial screening, technical assessment, and team interviews. We aim to make it thorough but efficient.'
  }
  
  if (lowerMessage.includes('remote') || lowerMessage.includes('location')) {
    return 'We offer flexible working arrangements with a hybrid model. Specific details can be discussed during the interview process.'
  }
  
  if (lowerMessage.includes('team') || lowerMessage.includes('culture')) {
    return 'Our team values collaboration, innovation, and continuous learning. We maintain a supportive and inclusive work environment.'
  }
  
  return `I understand you're asking about ${message}. While I'm in test mode, I can tell you that this is an exciting opportunity with our company. Would you like to know more about any specific aspects of the role?`
}

// Initialize OpenAI client with better error handling
const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    logger.error('OpenAI API key not found')
    throw new Error('OpenAI API key not found')
  }

  try {
    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      maxRetries: 3,
      timeout: 30000,
    })
  } catch (error) {
    logger.error(`Error initializing OpenAI client: ${error}`)
    throw error
  }
}

// List of available models for fallback
const FALLBACK_MODELS = [
  "gpt-3.5-turbo",
  "gpt-3.5-turbo-0125",
  "gpt-3.5-turbo-instruct"
]

// Check if we should use test mode
const shouldUseTestMode = (roleId: string) => {
  return roleId === 'test-role-id' || 
         process.env.NEXT_PUBLIC_USE_TEST_MODE === 'true' || 
         !process.env.OPENAI_API_KEY;
}

export async function POST(request: Request) {
  try {
    logger.info('Chat API: Received request')
    
    // Parse the request body
    const body = await request.json()
    const { message, role_id, isInitial = false, conversation_history = [] } = body
    
    logger.info(`Chat API: Processing ${isInitial ? 'initial' : 'follow-up'} message for role ${role_id}`)
    logger.debug(`Message: ${message?.substring(0, 30)}...`)
    
    // Validate role_id
    if (!role_id) {
      return NextResponse.json({ 
        error: 'Role ID is required', 
        message: 'I cannot process your request without a role ID.' 
      }, { status: 400 })
    }
    
    // Test mode check
    if (shouldUseTestMode(role_id)) {
      logger.info('Chat API: Using test mode')
      return NextResponse.json({
        message: isInitial
          ? `Hello! I'm an AI assistant for the role you're interested in. While we're in test mode, I can still provide helpful information about the position.`
          : `You asked: ${message}\n\nHere's what I can tell you about that: ${getTestResponse(message, role_id)}`,
        isError: false,
        usedFallbackModel: true
      })
    }
    
    // Fetch role data from Supabase
    let role
    let persona
    let company
    
    try {
      // Fetch role data
      role = await fetchRoleById(role_id)
      
      if (!role) {
        logger.error(`No role found with ID: ${role_id}`)
        return NextResponse.json({ 
          error: 'Role not found', 
          message: 'I cannot find information about this role. Please try again later.' 
        }, { status: 404 })
      }
      
      logger.info(`Chat API: Successfully retrieved role details for ${role.title}`)
      
      // Get company data
      company = role.companies
      
      // Fetch persona data
      persona = await fetchPersonaByRoleId(role_id)
      
      if (!persona) {
        logger.warn(`No persona found for role ID: ${role_id}, using default`)
        persona = {
          name: 'AI Recruiter',
          bio: 'A professional AI recruiter',
          personality: 'professional and helpful',
          experience: '5+ years in recruiting',
          skills: ['interviewing', 'assessment', 'communication'],
          fallback_message: "I'm here to help you learn more about this role and assist with your application process."
        }
      }
    } catch (error) {
      logger.error(`Error fetching role/persona data: ${error}`)
      return NextResponse.json({ 
        error: 'Failed to fetch role data', 
        message: 'I encountered an error while retrieving information about this role. Please try again later.' 
      }, { status: 500 })
    }
    
    // Generate system prompt and prepare messages
    logger.info('Chat API: Creating system message')
    const systemPrompt = generateSystemPrompt({ persona, role, company })
    
    // Create message array for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversation_history,
    ]
    
    // Add the user's current message if it's not an initial greeting
    if (!isInitial && message) {
      messages.push({ role: 'user', content: message })
    }
    
    try {
      // Get response from OpenAI
      const content = await askGPT(
        systemPrompt,
        messages,
        process.env.OPENAI_MODEL || FALLBACK_MODELS[0],
        0.7,
        false,
        800
      )
      
      if (!content) {
        throw new Error('Empty response from OpenAI')
      }
      
      logger.info('Chat API: Successfully generated response')
      
      return NextResponse.json({
        message: content,
        isError: false,
        usedFallbackModel: false
      })
    } catch (error: any) {
      logger.error(`Error from OpenAI: ${error.message}`)
      
      // Try fallback models if available
      for (const fallbackModel of FALLBACK_MODELS) {
        try {
          if (fallbackModel !== process.env.OPENAI_MODEL) {
            const content = await askGPT(
              systemPrompt,
              messages,
              fallbackModel,
              0.7,
              false,
              800
            )
            
            if (content) {
              logger.info(`Successfully generated response using fallback model ${fallbackModel}`)
              return NextResponse.json({
                message: content,
                isError: false,
                usedFallbackModel: true
              })
            }
          }
        } catch (error: unknown) {
          const fallbackError = error instanceof Error ? error.message : 'Unknown error'
          logger.error(`Fallback model ${fallbackModel} failed: ${fallbackError}`)
        }
      }
      
      // All models failed, return fallback message
      return NextResponse.json({
        message: persona.fallback_message || 'I apologize, but I\'m having trouble connecting to my knowledge base right now. Please try again later.',
        isError: true,
        usedFallbackModel: true,
        error: error.message
      })
    }
  } catch (error: any) {
    logger.error(`Unexpected error in chat API: ${error.message}`)
    return NextResponse.json({ 
      error: 'An unexpected error occurred', 
      message: 'Sorry, something went wrong. Please try again later.',
      isError: true,
      usedFallbackModel: true
    }, { status: 500 })
  }
} 