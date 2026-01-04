'use server';
/**
 * @fileOverview Analyzes media content (images or videos) and generates relevant content suggestions.
 *
 * - analyzeMediaAndGenerateContent - A function that takes media as input, analyzes it, and returns generated content suggestions.
 * - AnalyzeMediaAndGenerateContentInput - The input type for the analyzeMediaAndGenerateContent function.
 * - AnalyzeMediaAndGenerateContentOutput - The return type for the analyzeMediaAndGenerateContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
// @ts-ignore
import wav from 'wav';

const AnalyzeMediaAndGenerateContentInputSchema = z.object({
  mediaDataUri: z
    .string()
    .describe(
      "The media file (image or video) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeMediaAndGenerateContentInput = z.infer<typeof AnalyzeMediaAndGenerateContentInputSchema>;

const AnalyzeMediaAndGenerateContentOutputSchema = z.object({
  title: z.string().describe('The generated title for the media content.'),
  description: z.string().describe('The generated description for the media content.'),
  hashtags: z.array(z.string()).describe('The generated hashtags for the media content.'),
  thumbnailDataUri: z
    .string()
    .optional()
    .describe(
      'The suggested thumbnail for video content, as a data URI. Only applicable to video content.'
    ),
});
export type AnalyzeMediaAndGenerateContentOutput = z.infer<typeof AnalyzeMediaAndGenerateContentOutputSchema>;

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d: Buffer) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

export async function analyzeMediaAndGenerateContent(
  input: AnalyzeMediaAndGenerateContentInput
): Promise<AnalyzeMediaAndGenerateContentOutput> {
  return analyzeMediaAndGenerateContentFlow(input);
}

const analyzeMediaAndGenerateContentPrompt = ai.definePrompt({
  name: 'analyzeMediaAndGenerateContentPrompt',
  input: {schema: AnalyzeMediaAndGenerateContentInputSchema},
  output: {schema: AnalyzeMediaAndGenerateContentOutputSchema},
  prompt: `You are an AI social media expert. Analyze the provided media content and generate a title, description, and a list of hashtags appropriate for the media.

  Media: {{media url=mediaDataUri}}

  Your response should contain the following parts:
  - title: A concise and engaging title for the content.
  - description: An SEO-optimized description of the content.
  - hashtags: A list of relevant hashtags.`,
});

const analyzeMediaAndGenerateContentFlow = ai.defineFlow(
  {
    name: 'analyzeMediaAndGenerateContentFlow',
    inputSchema: AnalyzeMediaAndGenerateContentInputSchema,
    outputSchema: AnalyzeMediaAndGenerateContentOutputSchema,
  },
  async input => {
    const {output} = await analyzeMediaAndGenerateContentPrompt(input);

    const mediaType = input.mediaDataUri.substring(0, input.mediaDataUri.indexOf(';'));
    const isVideo = mediaType.startsWith('data:video/');

    let thumbnailDataUri: string | undefined;

    if (isVideo) {
      // Generate a thumbnail for video content.
      const {media} = await ai.generate({
        model: 'googleai/gemini-2.5-flash-image-preview',
        prompt: [
          {media: {url: input.mediaDataUri}},
          {text: 'generate a detailed and eye-catching thumbnail image for this video'},
        ],
        config: {
          responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
        },
      });
      thumbnailDataUri = media?.url;
    }

    return {
      title: output!.title,
      description: output!.description,
      hashtags: output!.hashtags,
      thumbnailDataUri,
    };
  }
);
