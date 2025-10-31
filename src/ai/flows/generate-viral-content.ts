'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating viral content ideas based on a topic, platform, and style.
 *
 * - generateViralContent - A function that triggers the viral content generation flow.
 * - GenerateViralContentInput - The input type for the generateViralContent function.
 * - GenerateViralContentOutput - The return type for the generateViralContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateViralContentInputSchema = z.object({
  topic: z.string().describe('The topic of the content.'),
  platform: z.string().describe('The target platform for the content (e.g., Instagram, TikTok, YouTube).'),
  style: z.string().describe('The desired style of the content (e.g., humorous, educational, inspirational).'),
});
export type GenerateViralContentInput = z.infer<typeof GenerateViralContentInputSchema>;

const GenerateViralContentOutputSchema = z.object({
  viralTitles: z.array(z.string()).describe('A list of viral title suggestions.'),
  seoDescriptions: z.array(z.string()).describe('A list of SEO-optimized description suggestions.'),
  hashtags: z.array(z.string()).describe('A list of relevant hashtag suggestions.'),
  thumbnailIdeas: z.array(z.string()).describe('A list of thumbnail idea suggestions.'),
  aiImagePrompts: z.array(z.string()).describe('A list of AI image prompts for generating visuals.'),
});
export type GenerateViralContentOutput = z.infer<typeof GenerateViralContentOutputSchema>;

export async function generateViralContent(input: GenerateViralContentInput): Promise<GenerateViralContentOutput> {
  return generateViralContentFlow(input);
}

const generateViralContentPrompt = ai.definePrompt({
  name: 'generateViralContentPrompt',
  input: {schema: GenerateViralContentInputSchema},
  output: {schema: GenerateViralContentOutputSchema},
  prompt: `You are a social media expert. Generate viral content ideas based on the following topic, platform, and style:

Topic: {{{topic}}}
Platform: {{{platform}}}
Style: {{{style}}}

Generate a list of viral titles, SEO descriptions, hashtags, thumbnail ideas, and AI image prompts. Return results as a JSON object.
`,
});

const generateViralContentFlow = ai.defineFlow(
  {
    name: 'generateViralContentFlow',
    inputSchema: GenerateViralContentInputSchema,
    outputSchema: GenerateViralContentOutputSchema,
  },
  async input => {
    const {output} = await generateViralContentPrompt(input);
    return output!;
  }
);
