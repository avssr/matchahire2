/**
 * Builds a prompt for GPT to evaluate a candidate based on their answers
 */
export const generateScoringPrompt = (
  answers: Array<{ q: string; a: string }>, 
  roleTitle: string,
  scoringPrompt?: string
) => {
  // If a custom scoring prompt is provided, use it with the answers
  if (scoringPrompt) {
    return scoringPrompt.replace(
      '{ANSWERS}', 
      answers.map((a, i) => `Q${i+1}: ${a.q}\nA${i+1}: ${a.a}`).join("\n\n")
    );
  }

  // Default scoring prompt
  return `
Evaluate the candidate for the ${roleTitle} role.

Q&A:
${answers.map((a, i) => `Q${i+1}: ${a.q}\nA${i+1}: ${a.a}`).join("\n\n")}

Please provide:
1. fit_score: A number between 0.0 and 1.0 representing how well the candidate fits the role
2. summary_candidate: A friendly, encouraging summary for the candidate
3. summary_recruiter: A professional assessment for the recruiter highlighting strengths and areas of concern

Return your response in JSON format:
{
  "fit_score": 0.0 to 1.0,
  "summary_candidate": "text",
  "summary_recruiter": "text"
}
`;
}; 