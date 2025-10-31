'use server';

/**
 * @fileOverview This file defines a Genkit flow for fetching live viral content trends.
 *
 * - getViralTrends - A function that triggers the viral trends generation flow.
 * - ViralTrendsOutput - The return type for the getViralTrends function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ViralTrendsOutputSchema = z.object({
  trendingTopics: z.array(z.string()).describe('A list of 3-5 currently trending topics or niches on social media.'),
  viralTitleExamples: z.array(z.string()).describe('3-5 examples of title formats or styles that are currently performing well.'),
  viralDescriptionExamples: z.array(z.string()).describe('3-5 examples of description formats or styles that are currently performing well, including calls-to-action.'),
  suggestions: z.array(z.string()).describe('A list of 3-5 actionable suggestions and strategies for creating viral content right now.'),
});
export type ViralTrendsOutput = z.infer<typeof ViralTrendsOutputSchema>;

export async function getViralTrends(): Promise<ViralTrendsOutput> {
  return getViralTrendsFlow();
}

const prompt = ai.definePrompt({
  name: 'viralTrendsPrompt',
  output: {
    schema: ViralTrendsOutputSchema,
  },
  prompt: `You are a social media expert and trend analyst. Your knowledge is up-to-the-minute.

Provide a real-time analysis of what's currently going viral on major social media platforms like TikTok, YouTube, and Instagram.

Give me a concise but insightful rundown of:
1.  Currently trending topics or niches.
2.  Examples of viral title formats.
3.  Examples of viral description formats, including effective calls-to-action.
4.  Actionable strategies and suggestions for a content creator to go viral right now.

Focus on fresh, current trends.`,
});

const getViralTrendsFlow = ai.defineFlow(
  {
    name: 'getViralTrendsFlow',
    outputSchema: ViralTrendsOutputSchema,
  },
  async () => {
    const {output} = await prompt();
    return output!;
  }
);
