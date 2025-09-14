'use server';

import { generateMatchExplanation, type GenerateMatchExplanationInput } from '@/ai/flows/generate-match-explanation';

export async function getExplanationAction(
  input: GenerateMatchExplanationInput
): Promise<{ explanation: string } | { error: string }> {
  try {
    // Basic input validation
    if (!input.team1 || !input.team2 || !input.prediction) {
      return { error: 'Invalid input provided for explanation.' };
    }

    const result = await generateMatchExplanation({
      team1: input.team1,
      team2: input.team2,
      prediction: input.prediction,
      relevantStats: input.relevantStats || 'No additional stats available.',
    });
    
    return { explanation: result.explanation };
  } catch (error) {
    console.error('Error generating match explanation:', error);
    return { error: 'Failed to generate explanation. Please try again later.' };
  }
}
