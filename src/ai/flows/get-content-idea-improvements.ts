'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting content idea improvements.
 *
 * The flow takes a content idea (topic, platform, style) as input and returns a list of concrete improvements suggested by the AI.
 *
 * @exports {function} getContentIdeaImprovements - The main function to trigger the flow.
 * @exports {type} ContentIdeaImprovementsInput - The input type for the getContentIdeaImprovements function.
 * @exports {type} ContentIdeaImprovementsOutput - The output type for the getContentIdeaImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContentIdeaImprovementsInputSchema = z.object({
  topic: z.string().describe('The topic of the content idea.'),
  platform: z.string().describe('The target platform for the content (e.g., YouTube, TikTok, Instagram).'),
  style: z.string().describe('The desired style of the content (e.g., educational, humorous, vlog).'),
});
export type ContentIdeaImprovementsInput = z.infer<typeof ContentIdeaImprovementsInputSchema>;

const ContentIdeaImprovementsOutputSchema = z.object({
  improvements: z.array(z.string()).describe('A list of concrete suggestions for improving the content idea.'),
});
export type ContentIdeaImprovementsOutput = z.infer<typeof ContentIdeaImprovementsOutputSchema>;

export async function getContentIdeaImprovements(input: ContentIdeaImprovementsInput): Promise<ContentIdeaImprovementsOutput> {
  return getContentIdeaImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contentIdeaImprovementsPrompt',
  input: {
    schema: ContentIdeaImprovementsInputSchema,
  },
  output: {
    schema: ContentIdeaImprovementsOutputSchema,
  },
  prompt: `You are an AI assistant helping content creators refine their ideas. Given the following content idea, provide a list of concrete improvements to make the content more engaging and successful on the specified platform.

Topic: {{{topic}}}
Platform: {{{platform}}}
Style: {{{style}}}

Improvements:`,
});

const getContentIdeaImprovementsFlow = ai.defineFlow(
  {
    name: 'getContentIdeaImprovementsFlow',
    inputSchema: ContentIdeaImprovementsInputSchema,
    outputSchema: ContentIdeaImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
