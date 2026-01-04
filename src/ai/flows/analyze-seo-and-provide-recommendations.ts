'use server';

/**
 * @fileOverview Analyzes SEO and provides recommendations for improvement.
 *
 * - analyzeSeoAndProvideRecommendations - A function that handles the SEO analysis process.
 * - AnalyzeSeoAndProvideRecommendationsInput - The input type for the analyzeSeoAndProvideRecommendations function.
 * - AnalyzeSeoAndProvideRecommendationsOutput - The return type for the analyzeSeoAndProvideRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSeoAndProvideRecommendationsInputSchema = z.object({
  textContent: z.string().describe('The text content to analyze for SEO.'),
  targetKeywords: z.string().describe('The target keywords to optimize the content for.'),
});
export type AnalyzeSeoAndProvideRecommendationsInput = z.infer<
  typeof AnalyzeSeoAndProvideRecommendationsInputSchema
>;

const AnalyzeSeoAndProvideRecommendationsOutputSchema = z.object({
  seoScore: z.number().describe('The overall SEO score of the content (0-100).'),
  keywordDensityAnalysis: z
    .string()
    .describe('Analysis of keyword density in the content.'),
  readabilityAnalysis: z.string().describe('Analysis of the readability of the content.'),
  actionableRecommendations: z
    .string()
    .describe('Actionable recommendations to improve the content SEO.'),
});
export type AnalyzeSeoAndProvideRecommendationsOutput = z.infer<
  typeof AnalyzeSeoAndProvideRecommendationsOutputSchema
>;

export async function analyzeSeoAndProvideRecommendations(
  input: AnalyzeSeoAndProvideRecommendationsInput
): Promise<AnalyzeSeoAndProvideRecommendationsOutput> {
  return analyzeSeoAndProvideRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSeoAndProvideRecommendationsPrompt',
  input: {schema: AnalyzeSeoAndProvideRecommendationsInputSchema},
  output: {schema: AnalyzeSeoAndProvideRecommendationsOutputSchema},
  prompt: `You are an SEO specialist. Analyze the following text content for SEO, considering the target keywords. Provide an SEO score (0-100), keyword density analysis, readability analysis, and actionable recommendations to improve the content's search engine ranking.

Text Content: {{{textContent}}}
Target Keywords: {{{targetKeywords}}}`,
});

const analyzeSeoAndProvideRecommendationsFlow = ai.defineFlow(
  {
    name: 'analyzeSeoAndProvideRecommendationsFlow',
    inputSchema: AnalyzeSeoAndProvideRecommendationsInputSchema,
    outputSchema: AnalyzeSeoAndProvideRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
