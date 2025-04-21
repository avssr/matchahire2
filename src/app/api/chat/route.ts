import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServerSupabaseClient, fetchPersonaByRoleId, fetchRoleById } from '@/utils/supabaseClient'
import { generateSystemPrompt } from '@/lib/gpt/generateSystemPrompt'
import { logger } from '@/utils/logger'

// Initialize OpenAI client with better error handling
const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    logger.error('OpenAI API key not found')
    throw new Error('OpenAI API key not found')
  }

  try {
    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
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

export async function POST(request: Request) {
  try {
    logger.info('Chat API: Received request')
    
    // Parse the request body
    const body = await request.json()
    const { message, role_id, isInitial = false, conversation_history = [] } = body
    
    logger.info(`Chat API: Processing ${isInitial ? 'initial' : 'follow-up'} message: ${message?.substring(0, 30) || 'initial greeting'}...`)
    logger.info(`Chat API: Role ID: ${role_id}`)
    
    // Validate role_id
    if (!role_id) {
      return NextResponse.json({ 
        error: 'Role ID is required', 
        message: 'I cannot process your request without a role ID.' 
      }, { status: 400 })
    }
    
    // Test mode fallback for development
    if (role_id === 'test-role-id' || process.env.NODE_ENV === 'development') {
      logger.info('Chat API: Using test role, bypassing database')
      return NextResponse.json({
        message: isInitial
          ? "Hello! I'm a test AI assistant for development purposes. I can provide basic responses about job roles."
          : `You asked: ${message}\n\nThis is a test response. In production, this would connect to the real GPT model.`,
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
    
    // Generate system prompt
    logger.info('Chat API: Creating system message for OpenAI')
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
      // Initialize OpenAI client
      const openai = getOpenAIClient()
      
      // Choose model based on configuration
      const modelName = process.env.OPENAI_MODEL || FALLBACK_MODELS[0]
      logger.info(`Chat API: Sending request to OpenAI using ${modelName} model`)
      
      // Send request to OpenAI with proper typing
      const response = await openai.chat.completions.create({
        model: modelName,
        messages: messages.map(msg => ({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content
        })),
        temperature: 0.7,
        max_tokens: 800,
      })
      
      const content = response.choices[0].message.content
      logger.info(`Chat API: Received response from OpenAI`)
      logger.info(`Chat API: Response content: ${content?.substring(0, 50)}...`)
      
      if (!content) {
        throw new Error('Empty response from OpenAI')
      }
      
      return NextResponse.json({
        message: content,
        isError: false,
        usedFallbackModel: false
      })
    } catch (error: any) {
      logger.error(`Error from OpenAI: ${error.message}`)
      
      // Try fallback models if available
      const currentModel = process.env.OPENAI_MODEL || FALLBACK_MODELS[0]
      for (const fallbackModel of FALLBACK_MODELS) {
        try {
          if (fallbackModel !== currentModel) {
            const openai = getOpenAIClient()
            const fallbackResponse = await openai.chat.completions.create({
              model: fallbackModel,
              messages: messages.map(msg => ({
                role: msg.role as 'system' | 'user' | 'assistant',
                content: msg.content
              })),
              temperature: 0.7,
              max_tokens: 800,
            })
            
            const content = fallbackResponse.choices[0].message.content
            if (content) {
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