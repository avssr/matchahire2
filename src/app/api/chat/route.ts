import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabase } from '@/lib/supabase'

// Initialize OpenAI client
let openai: OpenAI | null = null;
try {
  console.log('Initializing OpenAI client with API key (length):', process.env.OPENAI_API_KEY?.length);
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not defined in environment variables');
  } else {
    // Remove any whitespace from API key
    const apiKey = process.env.OPENAI_API_KEY.trim();
    openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
    console.log('OpenAI client initialized successfully with API key');
  }
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
}

// List of available models for fallback
const FALLBACK_MODELS = [
  "gpt-3.5-turbo",
  "gpt-3.5-turbo-0125",
  "gpt-3.5-turbo-instruct"
];

export async function POST(request: Request) {
  console.log('Chat API: Received request');
  try {
    // Parse the request body
    const body = await request.json();
    const { message, role, isInitial } = body;
    
    console.log(`Chat API: Processing ${isInitial ? 'initial' : 'follow-up'} message:`, message?.substring(0, 50));
    console.log('Chat API: Role ID:', role?.id);
    
    if (!role || !role.id) {
      console.error('Chat API: Invalid role information provided');
      return NextResponse.json(
        { 
          error: 'Invalid role information provided',
          message: 'I apologize, but I need information about the role to assist you properly.'
        },
        { status: 400 }
      );
    }
    
    // Handle test role directly (for testing purposes)
    if (role.id === 'test-role-id') {
      console.log('Chat API: Using test role, bypassing database');
      
      // Create a simple test response
      let responseMessage = '';
      if (isInitial) {
        responseMessage = `Hello! I'm an AI assistant for the ${role.title} role at ${role.companies?.name || 'the company'}. How can I help you today?`;
      } else if (message.toLowerCase().includes('smartjoules')) {
        responseMessage = `SmartJoules is a leading energy efficiency company that helps businesses reduce their energy consumption through innovative IoT solutions and analytics. They provide end-to-end energy management services including audit, implementation, and monitoring. As a Business Development Representative at SmartJoules, you would be responsible for identifying potential clients, conducting initial outreach, and setting up meetings for the sales team. The company is known for its focus on sustainability and has received recognition for its impact on reducing carbon emissions.`;
      } else if (message.toLowerCase().includes('responsibilities') || message.toLowerCase().includes('duties')) {
        responseMessage = `As a ${role.title}, your main responsibilities would include:

1. Prospecting and outreach to potential clients
2. Qualifying leads and scheduling meetings for Account Executives
3. Managing the early stages of the sales pipeline
4. Tracking activities and maintaining accurate records in CRM
5. Collaborating with marketing and sales teams
6. Researching target markets and identifying decision makers
7. Meeting or exceeding monthly quotas for calls, emails, and meetings

Would you like to know more about any specific aspect of the role?`;
      } else {
        responseMessage = `Thank you for your question about ${message.substring(0, 30)}... As a Business Development Representative, you would be focused on identifying and reaching out to potential clients, qualifying leads, and setting up meetings for the sales team. Is there something specific about this role or the company you'd like to know more about?`;
      }
      
      return NextResponse.json({ message: responseMessage });
    }
    
    // Try to get role details from Supabase
    let roleData;
    let persona;
    
    try {
      console.log('Chat API: Fetching role details from Supabase');
      const { data: fetchedRole, error: roleError } = await supabase
        .from('roles')
        .select(`
          *,
          companies (*),
          personas (
            id,
            system_prompt,
            conversation_mode,
            question_sequence,
            tone,
            persona_name
          )
        `)
        .eq('id', role.id)
        .single();
        
      if (roleError) {
        console.error('Chat API: Supabase error:', roleError);
        throw new Error(`Supabase error: ${roleError.message}`);
      }
      
      if (!fetchedRole) {
        console.error('Chat API: Role not found');
        throw new Error('Role not found');
      }
      
      if (!fetchedRole.personas?.[0]) {
        console.error('Chat API: No persona associated with this role');
        throw new Error('No persona associated with this role');
      }
      
      roleData = fetchedRole;
      persona = fetchedRole.personas[0];
      console.log(`Chat API: Successfully retrieved role details for ${roleData.title}`);
    } catch (dbError) {
      console.error('Chat API: Database error:', dbError);
      
      // Provide a fallback response if we can't get the role data
      const fallbackMessage = isInitial
        ? `Hello! I'm an AI assistant for the ${role.title || 'open role'} position. How can I help you today?`
        : `I'm having trouble accessing the role information right now, but I'll do my best to help. Could you ask your question again or try a different one?`;
        
      console.log('Chat API: Returning fallback message due to database error');
      return NextResponse.json({ message: fallbackMessage });
    }
    
    // Create the system message for OpenAI
    console.log('Chat API: Creating system message for OpenAI');
    const systemMessage = `You are ${persona.persona_name || 'an AI assistant'}, an AI assistant specializing in the ${roleData.title} role at ${roleData.companies?.name || 'the company'}.
Your communication style is ${persona.tone || 'professional and friendly'}.

Role Information:
- Title: ${roleData.title}
- Company: ${roleData.companies?.name || 'Unknown Company'}
- Location: ${roleData.location || 'Unspecified'}
- Description: ${roleData.description || 'No description available'}
- Requirements: ${Array.isArray(roleData.requirements) ? roleData.requirements.map((req: string) => `  • ${req}`).join('\n') : 'No specific requirements provided'}
- Key Skills: ${Array.isArray(roleData.tags) ? roleData.tags.join(', ') : 'Not specified'}

${persona.system_prompt || ''}

Remember to:
1. Stay in character as ${persona.persona_name || 'an AI assistant'}
2. Provide accurate information about the role
3. Be helpful and encouraging
4. Address candidate concerns professionally
5. Maintain the specified communication tone
6. If asked about salary or benefits, be transparent about available information
7. Guide candidates through the application process when relevant`;

    // Determine the user message
    const userMessage = isInitial 
      ? `Introduce yourself as ${persona.persona_name || 'an AI assistant'} and briefly explain the ${roleData.title} role at ${roleData.companies?.name || 'the company'}. Then ask how you can help.`
      : message;
      
    // Try to get a response from OpenAI
    try {
      if (!openai) {
        console.error('Chat API: OpenAI client not initialized properly');
        throw new Error('OpenAI client not initialized properly');
      }
      
      let selectedModel = "gpt-3.5-turbo";
      console.log(`Chat API: Sending request to OpenAI using ${selectedModel} model`);
      
      try {
        const completion = await openai.chat.completions.create({
          model: selectedModel,
          messages: [
            {
              role: "system",
              content: systemMessage
            },
            {
              role: "user",
              content: userMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
          presence_penalty: 0.6,
          frequency_penalty: 0.3,
        });

        console.log('Chat API: Received response from OpenAI');
        if (completion.choices && completion.choices[0]?.message?.content) {
          console.log('Chat API: Response content:', completion.choices[0].message.content.substring(0, 50) + '...');
          
          // Return the AI response
          return NextResponse.json({
            message: completion.choices[0].message.content,
            shouldAskQuestion: persona.conversation_mode === 'structured' && 
              persona.question_sequence?.questions?.length > 0
          });
        } else {
          throw new Error('Empty or invalid response from OpenAI');
        }
      } catch (error: any) {
        console.error(`Chat API: Error with model ${selectedModel}:`, error);
        
        // Try fallback models
        for (const fallbackModel of FALLBACK_MODELS) {
          if (fallbackModel === selectedModel) continue;
          
          try {
            console.log(`Chat API: Trying fallback model ${fallbackModel}`);
            const fallbackCompletion = await openai.chat.completions.create({
              model: fallbackModel,
              messages: [
                {
                  role: "system", 
                  content: systemMessage
                },
                {
                  role: "user",
                  content: userMessage
                }
              ],
              temperature: 0.7,
              max_tokens: 500
            });
            
            if (fallbackCompletion.choices && fallbackCompletion.choices[0]?.message?.content) {
              console.log('Chat API: Fallback model succeeded');
              return NextResponse.json({
                message: fallbackCompletion.choices[0].message.content,
                usedFallbackModel: true
              });
            }
          } catch (fallbackError) {
            console.error(`Chat API: Fallback model ${fallbackModel} also failed:`, fallbackError);
          }
        }
        
        // All models failed, return a nice error message
        throw new Error(`OpenAI API error: ${error.message || 'Unknown error'}`);
      }
    } catch (aiError: any) {
      console.error('Chat API: OpenAI API error:', aiError);
      
      // Check if the error is related to authentication or invalid API key
      const errorMessage = aiError.message || '';
      if (errorMessage.includes('API key') || errorMessage.includes('auth') || errorMessage.includes('401')) {
        console.error('Chat API: API key issue detected. Check your OpenAI API key.');
      }
      
      // Provide a fallback response if OpenAI fails
      const fallbackMessage = isInitial
        ? `Hello! I'm ${persona.persona_name || 'an AI assistant'}, an AI assistant for the ${roleData.title} role at ${roleData.companies?.name || 'the company'}. How can I help you today?`
        : `I apologize, but I'm having some technical difficulties processing your request. Could you try asking again in a different way?`;
        
      console.log('Chat API: Returning fallback message due to OpenAI API error');
      return NextResponse.json({ 
        message: fallbackMessage,
        error: aiError.message,
        isError: true
      });
    }
  } catch (error: any) {
    console.error('Chat API: Unexpected error:', error);
    
    // Return a friendly error message
    return NextResponse.json(
      { 
        error: 'Failed to process chat message',
        message: 'I apologize, but I encountered an error while trying to respond. Please try again later.',
        debugError: error.message
      },
      { status: 500 }
    );
  }
} 