import { NextResponse } from 'next/server';
import { logger } from '@/utils/logger';

// Sample persona responses based on different role types
const sampleResponses = {
  frontend: [
    "That's a great question! For a frontend role, you'll need strong skills in React, TypeScript, and modern CSS.",
    "Our frontend team works with Next.js extensively. Are you familiar with server components?",
    "We value clean code and component reusability. Can you tell me about your experience with design systems?",
    "Testing is important in our frontend workflow. We use Jest and React Testing Library. How familiar are you with these tools?",
    "We're currently migrating some older components to use the latest React patterns. Have you worked on similar projects before?"
  ],
  backend: [
    "For our backend roles, we primarily use Node.js with Express and MongoDB. What's your experience with these technologies?",
    "API design is critical for our backend engineers. How do you approach designing a new API endpoint?",
    "We handle quite a bit of data processing. Have you worked with stream processing or message queues before?",
    "Security is a top priority for us. How do you ensure your APIs are secure against common vulnerabilities?",
    "We're exploring GraphQL for some of our newer services. Do you have any experience with GraphQL?"
  ],
  design: [
    "Our design team works closely with product managers and engineers. How do you approach collaboration with cross-functional teams?",
    "We use Figma for all our design work. How experienced are you with component libraries in Figma?",
    "User research is a big part of our design process. What methods do you use to validate your designs?",
    "Accessibility is important to us. How do you ensure your designs are accessible to all users?",
    "We're always looking to improve our design system. What's your experience with maintaining design systems?"
  ],
  general: [
    "Thanks for your interest in our company! Could you tell me more about what attracted you to this role?",
    "Our team values continuous learning. What's something new you've learned recently that you found interesting?",
    "We have a hybrid work model with 2 days in office per week. How does that align with your preferences?",
    "Communication is key in our team. How do you prefer to communicate when working remotely?",
    "We're looking for someone who can start within the next 4-6 weeks. Does that timeline work for you?"
  ]
};

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const { message } = await request.json();
    
    logger.info(`Processing message in session: ${sessionId}`, { message });
    
    // Simulate network delay for a more realistic chat experience
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app:
    // 1. Retrieve session details from database
    // 2. Get the associated role and persona
    // 3. Generate a contextual response with an LLM
    
    // For this demo, determine category from sessionId and return a sample response
    let category = 'general';
    if (sessionId.includes('frontend')) {
      category = 'frontend';
    } else if (sessionId.includes('backend')) {
      category = 'backend';
    } else if (sessionId.includes('design')) {
      category = 'design';
    }
    
    // Select a random response from the appropriate category
    const responses = sampleResponses[category as keyof typeof sampleResponses];
    const randomIndex = Math.floor(Math.random() * responses.length);
    const reply = responses[randomIndex];
    
    return NextResponse.json({
      success: true,
      reply
    });
  } catch (error) {
    logger.error(`Error processing message in session: ${params.sessionId}`, error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process message' 
      },
      { status: 500 }
    );
  }
} 