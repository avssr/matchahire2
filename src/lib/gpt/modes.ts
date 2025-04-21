/**
 * Types of conversation modes supported by the system
 */
export enum ConversationMode {
  STRUCTURED = 'structured',
  CONVERSATIONAL = 'conversational',
  MIXED = 'mixed',
}

/**
 * Gets the next question based on the conversation mode, previous answers, and question sequence
 */
export const getNextQuestion = (
  mode: ConversationMode | string,
  answers: Array<{ q: string; a: string }>,
  questionSequence: Array<{ id: string; text: string }>,
  context?: string
): string | null => {
  // If we've reached the end of the questions, return null
  if (answers.length >= questionSequence.length) {
    return null;
  }

  // For structured mode, return the next question in sequence
  if (mode === ConversationMode.STRUCTURED) {
    return questionSequence[answers.length].text;
  }

  // For conversational mode, GPT will determine the next question
  if (mode === ConversationMode.CONVERSATIONAL) {
    return "Let GPT decide the next best question based on context.";
  }

  // For mixed mode, use structured sequence for first few questions
  // then switch to conversational
  if (mode === ConversationMode.MIXED) {
    if (answers.length < Math.min(2, questionSequence.length)) {
      return questionSequence[answers.length].text;
    } else {
      return "Let GPT decide the next best question based on context.";
    }
  }

  // Default to structured mode
  return questionSequence[answers.length]?.text || null;
};

/**
 * Determines if the interview is complete based on mode and answers
 */
export const isInterviewComplete = (
  mode: ConversationMode | string,
  answers: Array<{ q: string; a: string }>,
  questionSequence: Array<{ id: string; text: string }>,
  minQuestions: number = 3
): boolean => {
  // For structured mode, interview is complete when all questions are answered
  if (mode === ConversationMode.STRUCTURED) {
    return answers.length >= questionSequence.length;
  }

  // For conversational mode, interview is complete after minimum questions
  if (mode === ConversationMode.CONVERSATIONAL) {
    return answers.length >= minQuestions;
  }

  // For mixed mode, use a combination approach
  if (mode === ConversationMode.MIXED) {
    return answers.length >= Math.max(minQuestions, questionSequence.length * 0.7);
  }

  // Default behavior
  return answers.length >= questionSequence.length;
}; 