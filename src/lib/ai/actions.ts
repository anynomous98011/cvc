'use server';

import { generateText } from 'ai';

// Fallback responses to avoid API key issues
const FALLBACK_SUGGESTIONS = [
  { keyword: "content marketing strategy", traffic_potential: "High", business_potential: "High", search_intent: "Informational", content_idea: "Ultimate guide to content marketing", curation_idea: "Best content marketing resources", conversation_idea: "What's your content strategy?", source: "fallback" },
  { keyword: "viral video ideas", traffic_potential: "High", business_potential: "Medium", search_intent: "Informational", content_idea: "10 viral video ideas for 2025", curation_idea: "Most viral videos this month", conversation_idea: "What makes videos go viral?", source: "fallback" },
  { keyword: "social media trends 2025", traffic_potential: "High", business_potential: "Low", search_intent: "Informational", content_idea: "Latest social media trends", curation_idea: "Trending now on social media", conversation_idea: "What's trending in your niche?", source: "fallback" },
  { keyword: "audience engagement tips", traffic_potential: "Medium", business_potential: "High", search_intent: "Informational", content_idea: "How to boost audience engagement", curation_idea: "Best engagement tactics", conversation_idea: "How do you engage your audience?", source: "fallback" },
  { keyword: "content calendar planning", traffic_potential: "Medium", business_potential: "Medium", search_intent: "Informational", content_idea: "Effective content calendar strategy", curation_idea: "Content planning tools", conversation_idea: "How do you plan your content?", source: "fallback" }
];

export async function getKeywordSuggestions(keyword: string) {
  'use server';

  try {
    // Return enhanced fallback suggestions with the specific keyword
    const enhancedSuggestions = FALLBACK_SUGGESTIONS.map(s => ({
      ...s,
      keyword: `${keyword} ${s.keyword}`,
      content_idea: s.content_idea.replace(/content|video|trends|engagement|calendar/, keyword)
    }));

    return JSON.stringify(enhancedSuggestions);
  } catch (error) {
    console.error('Error getting keyword suggestions:', error);
    return JSON.stringify({ 
      error: "Error fetching suggestions. Please try again.",
      suggestions: [
        { keyword: `${keyword} tips`, traffic_potential: "High", business_potential: "Medium", search_intent: "Informational", content_idea: `Ultimate Guide to ${keyword}`, curation_idea: `Best ${keyword} resources`, conversation_idea: `What are your favorite ${keyword} tools?`, source: "fallback" }
      ]
    });
  }
}
