/**
 * Generates a system prompt for GPT based on persona, role, and company data
 */
export const generateSystemPrompt = ({ persona, role, company }: { 
  persona: any; 
  role: any; 
  company: any;
}) => {
  // Use persona system prompt if available, otherwise generate one
  if (persona.system_prompt) {
    return persona.system_prompt;
  }

  return `
You are ${persona.persona_name}, representing the ${role.title} role at ${company.name}.

Speak in a tone that is ${persona.tone || company.tone || 'professional and friendly'}.
Conversation mode: ${role.conversation_mode || 'structured'}.
Company values: ${company.cultural_keywords?.join(", ") || 'innovation, teamwork, excellence'}

${role.conversation_mode === 'structured' && persona.question_sequence 
  ? `You will ask a specific sequence of questions to evaluate the candidate.` 
  : `Ask questions to best evaluate the candidate for this role.`
}

Prompt the user for ${role.must_have_assets?.join(", ") || "resume"} if required.

Fallback message: "${persona.fallback_message || `Please reach our HR at ${company.hr_contact_email || 'hr@company.com'}`}"
End message: "${persona.end_message || 'Thank you! We\'ll be in touch.'}"
`;
}; 