'use server';

/**
 * @fileOverview A flow to generate an explanation for a given soccer match prediction.
 *
 * - generateMatchExplanation - A function that generates an explanation for a given match prediction.
 * - GenerateMatchExplanationInput - The input type for the generateMatchExplanation function.
 * - GenerateMatchExplanationOutput - The return type for the generateMatchExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMatchExplanationInputSchema = z.object({
  team1: z.string().describe('The name of the first team.'),
  team2: z.string().describe('The name of the second team.'),
  prediction: z.string().describe('The predicted outcome of the match.'),
  relevantStats: z.string().describe('Relevant statistics about the teams and their past performances.'),
});
export type GenerateMatchExplanationInput = z.infer<typeof GenerateMatchExplanationInputSchema>;

const GenerateMatchExplanationOutputSchema = z.object({
  explanation: z.string().describe('An AI-generated explanation of why the prediction is likely to be true.'),
});
export type GenerateMatchExplanationOutput = z.infer<typeof GenerateMatchExplanationOutputSchema>;

export async function generateMatchExplanation(input: GenerateMatchExplanationInput): Promise<GenerateMatchExplanationOutput> {
  return generateMatchExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMatchExplanationPrompt',
  input: {schema: GenerateMatchExplanationInputSchema},
  output: {schema: GenerateMatchExplanationOutputSchema},
  prompt: `You are an AI assistant that generates explanations for soccer match predictions.

  Given two teams, the predicted outcome of their match, and relevant statistics about the teams,
  generate a brief explanation of why the AI thinks the prediction is likely to be true.

  Team 1: {{{team1}}}
  Team 2: {{{team2}}}
  Prediction: {{{prediction}}}
  Relevant Statistics: {{{relevantStats}}}

  Explanation:`,
});

const generateMatchExplanationFlow = ai.defineFlow(
  {
    name: 'generateMatchExplanationFlow',
    inputSchema: GenerateMatchExplanationInputSchema,
    outputSchema: GenerateMatchExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
