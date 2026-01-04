'use server';

import {
  generateViralContent,
  GenerateViralContentInput,
  GenerateViralContentOutput,
} from '@/ai/flows/generate-viral-content';
import {
  analyzeMediaAndGenerateContent,
  AnalyzeMediaAndGenerateContentInput,
  AnalyzeMediaAndGenerateContentOutput,
} from '@/ai/flows/analyze-media-and-generate-content';
import {
  analyzeSeoAndProvideRecommendations,
  AnalyzeSeoAndProvideRecommendationsInput,
  AnalyzeSeoAndProvideRecommendationsOutput,
} from '@/ai/flows/analyze-seo-and-provide-recommendations';
import {
  getContentIdeaImprovements,
  ContentIdeaImprovementsInput,
  ContentIdeaImprovementsOutput,
} from '@/ai/flows/get-content-idea-improvements';
import {
  discoverTrendingContent,
  getTrendingHashtags,
  getViralContentIdeas,
  getTrendingThumbnailIdeas,
  TrendingContentInput,
  TrendingContentOutput,
} from '@/ai/flows/discover-trending-content';
import {
  getViralTrends as getViralTrendsFlow,
  ViralTrendsOutput,
} from '@/ai/flows/get-viral-trends';

type ActionState<T> = {
  status: 'idle' | 'success' | 'error' | 'pending';
  data?: T;
  error?: string;
};

// State types
export type GenerateContentState = ActionState<GenerateViralContentOutput>;
export type AnalyzeMediaState = ActionState<AnalyzeMediaAndGenerateContentOutput>;
export type AnalyzeSeoState = ActionState<AnalyzeSeoAndProvideRecommendationsOutput>;
export type GetImprovementsState = ActionState<ContentIdeaImprovementsOutput>;
export type DiscoverTrendsState = ActionState<TrendingContentOutput>;
export type GetViralTrendsState = ActionState<ViralTrendsOutput>;


function handleAIError(e: any): { status: 'error'; error: string } {
  let errorMessage = 'An unexpected error occurred.';
  if (e instanceof Error) {
    if (e.message.includes('503 Service Unavailable') || e.message.includes('model is overloaded')) {
      errorMessage = 'The AI model is currently overloaded. Please try again in a few moments.';
    } else {
      errorMessage = e.message;
    }
  }
  return { status: 'error', error: errorMessage };
}

export async function generateContent(
  prevState: GenerateContentState,
  formData: FormData
): Promise<GenerateContentState> {
  const input: GenerateViralContentInput = {
      topic: formData.get('topic') as string,
      platform: formData.get('platform') as string,
      style: formData.get('style') as string,
  };
  try {
      const result = await generateViralContent(input);
      return { status: 'success', data: result };
  } catch (e: any) {
      return handleAIError(e);
  }
}

export async function analyzeMedia(
  prevState: AnalyzeMediaState,
  formData: FormData
): Promise<AnalyzeMediaState> {
  const input: AnalyzeMediaAndGenerateContentInput = {
      mediaDataUri: formData.get('media') as string,
  };
   if (!input.mediaDataUri) {
    return { status: 'error', error: 'Please upload a file.' };
  }
  try {
      const result = await analyzeMediaAndGenerateContent(input);
      return { status: 'success', data: result };
  } catch (e: any) {
      return handleAIError(e);
  }
}


export async function analyzeSeo(
  prevState: AnalyzeSeoState,
  formData: FormData
): Promise<AnalyzeSeoState> {
    const input: AnalyzeSeoAndProvideRecommendationsInput = {
        textContent: formData.get('textContent') as string,
        targetKeywords: formData.get('targetKeywords') as string,
    };
    try {
        const result = await analyzeSeoAndProvideRecommendations(input);
        return { status: 'success', data: result };
    } catch (e: any) {
        return handleAIError(e);
    }
}

export async function getImprovements(
  prevState: GetImprovementsState,
  formData: FormData,
): Promise<GetImprovementsState> {
    const input: ContentIdeaImprovementsInput = {
        topic: formData.get('topic') as string,
        platform: formData.get('platform') as string,
        style: formData.get('style') as string,
    };
    try {
        const result = await getContentIdeaImprovements(input);
        return { status: 'success', data: result };
    } catch (e: any) {
        return handleAIError(e);
    }
}

export async function discoverTrends(
  prevState: DiscoverTrendsState,
  formData: FormData,
): Promise<DiscoverTrendsState> {
    const input: TrendingContentInput = {
        topic: (formData.get('topic') as string) || undefined,
        platform: formData.get('platform') as string,
    };
  try {
      const result = await discoverTrendingContent(input);
      return { status: 'success', data: result };
  } catch (e: any) {
        return handleAIError(e);
  }
}

export async function getViralTrends(): Promise<GetViralTrendsState> {
    try {
        const result = await getViralTrendsFlow();
        return { status: 'success', data: result };
    } catch (e: any) {
        return handleAIError(e);
    }
}
