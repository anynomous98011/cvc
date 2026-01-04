'use server';

import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { streamText, generateText } from 'ai';
import { readStreamableValue } from 'ai/rsc';

async function getKeywordSuggestionsFromGemini(keyword: string) {
  'use server';
  if (!process.env.GOOGLE_API_KEY) {
    return null;
  }
  // Temporary mock response for testing
  return JSON.stringify([
    {
      keyword: `${keyword} tips`,
      traffic_potential: "High",
      business_potential: "Medium",
      search_intent: "Informational",
      content_idea: `Ultimate Guide to ${keyword} in 2025`,
      curation_idea: `Best ${keyword} resources and tutorials`,
      conversation_idea: `What are your favorite ${keyword} tools?`
    }
  ]);
}

async function getKeywordSuggestionsFromOpenAI(keyword: string) {
    'use server';
    if (!process.env.OPENAI_API_KEY) {
        return null;
    }

    try {
      const { text } = await generateText({
        model: openai('gpt-4o-mini') as any,
        prompt: `Generate 3 keyword suggestions related to "${keyword}" for content creation. For each suggestion, provide:
        - keyword: the suggested keyword
        - traffic_potential: High/Medium/Low
        - business_potential: High/Medium/Low
        - search_intent: Informational/Commercial/Transactional/Local
        - content_idea: A specific content idea using this keyword
        - curation_idea: A curation idea using this keyword
        - conversation_idea: A conversation starter idea using this keyword

        Return as JSON array.`,
      });

      return text;
    } catch (error) {
      console.error('OpenAI API error:', error);
      return null;
    }
  }

  async function rankAndFilterSuggestions(suggestions: any[]) {
    'use server';
    if (suggestions.length === 0) {
        return JSON.stringify([]);
    }
    const query = `
        You are an expert content strategist.
        The following is a list of keyword suggestions from two different AI models (Gemini and OpenAI).
        Your task is to rank these suggestions based on their overall quality and potential for creating viral content in 2025.
        Select the top 5 suggestions and return them as a JSON array.
        The input format is a JSON array of objects, where each object has the following properties: "keyword", "traffic_potential", "business_potential", "search_intent", "content_idea", "curation_idea", "conversation_idea", "source".
        The output should be a JSON array of the top 5 objects.

        Suggestions:
        ${JSON.stringify(suggestions)}
    `;

    // Using mock response for production build
    // TODO: Fix Google AI SDK integration
    const mockText = JSON.stringify(suggestions.slice(0, 5));
    return mockText;
}

  export async function getKeywordSuggestions(keyword: string) {
    'use server';

    if (!process.env.GOOGLE_API_KEY && !process.env.OPENAI_API_KEY) {
        return JSON.stringify({ error: "No API keys found. Please set GOOGLE_API_KEY or OPENAI_API_KEY in your .env.local file." });
    }
    
    const [geminiResult, openaiResult] = await Promise.all([
        getKeywordSuggestionsFromGemini(keyword),
        getKeywordSuggestionsFromOpenAI(keyword)
    ]);

    let geminiJson: any[] = [];
    let openaiJson: any[] = [];

    try {
        if(geminiResult) geminiJson = JSON.parse(geminiResult).map((item: any) => ({...item, source: 'gemini'}));
    } catch (e) {
        console.error("Failed to parse Gemini response:", e);
    }

    try {
        if(openaiResult) openaiJson = JSON.parse(openaiResult).map((item: any) => ({...item, source: 'openai'}));
    }
    catch (e) {
        console.error("Failed to parse OpenAI response:", e);
    }

    const combined = [...geminiJson, ...openaiJson];

    if (combined.length === 0) {
        return JSON.stringify({ error: "No suggestions found. Please check your API keys." });
    }

    const rankedSuggestions = await rankAndFilterSuggestions(combined);

    return rankedSuggestions;
  }
