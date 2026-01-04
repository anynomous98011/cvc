'use server';

/**
 * @fileOverview AI flows for discovering trending content, including hashtags, viral content ideas, and thumbnail ideas.
 *
 * - getTrendingHashtags - A function that retrieves trending hashtags.
 * - getViralContentIdeas - A function that generates viral content ideas.
 * - getTrendingThumbnailIdeas - A function that suggests trending thumbnail ideas.
 * - TrendingContentOutput - The output type for the trending content functions.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TrendingContentOutputSchema = z.object({
  trendingHashtags: z.array(z.string()).describe('A list of trending hashtags.'),
  viralContentIdeas: z.array(z.string()).describe('A list of viral content ideas.'),
  trendingThumbnailIdeas: z
    .array(z.string())
    .describe('A list of trending thumbnail ideas.'),
});
export type TrendingContentOutput = z.infer<typeof TrendingContentOutputSchema>;

const TrendingContentInputSchema = z.object({
  topic: z.string().optional().describe('The topic for which to find trending content. If not provided, find general trending content.'),
  platform: z.string().describe('The social media platform.'),
});
export type TrendingContentInput = z.infer<typeof TrendingContentInputSchema>;

export async function discoverTrendingContent(input: TrendingContentInput): Promise<TrendingContentOutput> {
  return await discoverTrendingContentFlow(input);
}

export async function getTrendingHashtags(input: TrendingContentInput): Promise<string[]> {
  const result = await discoverTrendingContent(input);
  return result.trendingHashtags;
}

export async function getViralContentIdeas(input: TrendingContentInput): Promise<string[]> {
  const result = await discoverTrendingContent(input);
  return result.viralContentIdeas;
}

export async function getTrendingThumbnailIdeas(input: TrendingContentInput): Promise<string[]> {
  const result = await discoverTrendingContent(input);
  return result.trendingThumbnailIdeas;
}

const discoverTrendingContentPrompt = ai.definePrompt({
  name: 'discoverTrendingContentPrompt',
  input: {schema: TrendingContentInputSchema},
  output: {schema: TrendingContentOutputSchema},
  prompt: `You are an AI assistant designed to help content creators discover trending content.

  Based on the platform "{{platform}}"{{#if topic}} and the topic "{{topic}}"{{/if}}, generate:
  - A list of trending hashtags.
  - A list of viral content ideas.
  - A list of trending thumbnail ideas.
  
  {{#unless topic}}
  The hashtags, ideas, and thumbnails should be generally trending on the platform, not specific to any topic.
  {{/unless}}
  `,
});

const discoverTrendingContentFlow = ai.defineFlow(
  {
    name: 'discoverTrendingContentFlow',
    inputSchema: TrendingContentInputSchema,
    outputSchema: TrendingContentOutputSchema,
  },
  async input => {
    const {output} = await discoverTrendingContentPrompt(input);
    return output!;
  }
);
