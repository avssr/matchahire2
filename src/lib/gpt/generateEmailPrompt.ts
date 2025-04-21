/**
 * Generates a prompt for GPT to create a follow-up email to the candidate
 */
export const generateEmailPrompt = (
  answers: Array<{ q: string; a: string }>, 
  roleTitle: string,
  companyName: string,
  candidateName: string,
  fitScore: number,
  emailPrompt?: string
) => {
  // If a custom email prompt is provided, use it with the answers
  if (emailPrompt) {
    return emailPrompt
      .replace('{ANSWERS}', answers.map((a, i) => `Q${i+1}: ${a.q}\nA${i+1}: ${a.a}`).join("\n\n"))
      .replace('{ROLE}', roleTitle)
      .replace('{COMPANY}', companyName)
      .replace('{CANDIDATE}', candidateName)
      .replace('{SCORE}', fitScore.toString());
  }

  // Default email prompt
  return `
Draft a personalized follow-up email to ${candidateName} regarding their application for the ${roleTitle} position at ${companyName}.

Based on their interview, they received a fit score of ${fitScore} out of 1.0.

Q&A from their interview:
${answers.map((a, i) => `Q${i+1}: ${a.q}\nA${i+1}: ${a.a}`).join("\n\n")}

Include:
1. Appreciation for their time
2. Summary of their relevant experience and strengths
3. Next steps in the hiring process
4. Contact information for any questions

The tone should be professional but warm, representative of the company's culture.

Return only the email text, ready to send.
`;
}; 