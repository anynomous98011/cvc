import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder-key-for-demo',
  dangerouslyAllowBrowser: true
});

export interface PredictionItem {
  id: string;
  title: string;
  content: string;
  source: string;
  fetchedAt: string;
}

export async function generate2025Predictions(): Promise<PredictionItem[]> {
  try {
    const prompt = `Generate 6 realistic and insightful technology predictions for 2025. Each prediction should be about emerging trends, innovations, or disruptions in tech. Format each as a JSON object with:
- title: A catchy, concise title (max 80 chars)
- content: A detailed explanation (200-300 words) covering what it is, why it's important, potential impact, and timeline
- source: "AI Prediction 2025"

Make predictions diverse across areas like AI, blockchain, quantum computing, biotech, space tech, etc. Ensure they're forward-thinking but grounded in current technological trajectories.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    // Parse the JSON response
    const predictions = JSON.parse(content);

    return predictions.map((pred: any, index: number) => ({
      id: `ai-${Date.now()}-${index}`,
      title: pred.title,
      content: pred.content,
      source: pred.source,
      fetchedAt: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error generating predictions:', error);
    // Fallback predictions
    return [
      {
        id: 'fallback-1',
        title: 'Quantum Computing Breakthrough',
        content: 'Major advancements in quantum computing will enable unprecedented computational power, revolutionizing cryptography, drug discovery, and complex system modeling.',
        source: 'AI Prediction 2025',
        fetchedAt: new Date().toISOString()
      },
      {
        id: 'fallback-2',
        title: 'AI-Human Collaboration Peak',
        content: 'Seamless integration of AI assistants in daily work and creative processes will become the norm, enhancing human capabilities across all professions.',
        source: 'AI Prediction 2025',
        fetchedAt: new Date().toISOString()
      }
    ];
  }
}

export async function generateCreatorStudioIdeas(topic?: string, platform?: string, style?: string): Promise<string[]> {
  try {
    const numTitles = Math.floor(Math.random() * 6) + 5; // Random between 5-10
    const prompt = `Generate ${numTitles} highly relevant and personalized viral content titles for ${platform || 'social media'} in 2025 specifically about "${topic || 'content creation'}". Each title should be ${style || 'engaging'} and directly relate to the user's topic. Make them extremely catchy, trending, and optimized for the ${platform || 'social media'} algorithm. Focus on current trends, user interests, and viral potential. Format as a JSON array of strings only.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: 0.9,
      max_tokens: 800
    });

    const content = response.choices[0]?.message?.content;
    const parsed = content ? JSON.parse(content) : [];
    // Ensure we return between 5-10 titles
    return parsed.slice(0, Math.min(Math.max(parsed.length, 5), 10));
  } catch (error) {
    console.error('Error generating ideas:', error);
    // Generate fallback titles based on user inputs
    const fallbackTitles = [];
    const baseTopic = topic || 'content creation';
    const basePlatform = platform || 'social media';
    const baseStyle = style || 'engaging';

    const templates = [
      `The Ultimate ${baseTopic} Guide: ${baseStyle} ${basePlatform} Strategies That Work`,
      `${baseTopic} Revolution 2025: ${baseStyle} Methods for ${basePlatform} Success`,
      `From Zero to Viral: ${baseTopic} ${basePlatform} Hacks That Actually Convert`,
      `${baseTopic} Mastery: ${baseStyle} ${basePlatform} Techniques for Explosive Growth`,
      `${baseTopic} Domination: ${baseStyle} ${basePlatform} Secrets Revealed`,
      `Unleashing ${baseTopic}: ${basePlatform} ${baseStyle} Strategies That Skyrocket Engagement`,
      `${baseTopic} Breakthrough: ${baseStyle} ${basePlatform} Methods That Go Viral`,
      `${baseTopic} Empire Building: ${baseStyle} ${basePlatform} Success Formula`,
      `The ${baseTopic} Algorithm Hack: ${baseStyle} ${basePlatform} Techniques That Dominate`,
      `${baseTopic} Transformation: ${baseStyle} ${basePlatform} Strategies for Maximum Reach`
    ];

    // Return 5-10 random titles
    const numTitles = Math.floor(Math.random() * 6) + 5;
    const shuffled = templates.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numTitles);
  }
}

export async function generateSEORecommendations(content: string, keywords?: string): Promise<string[]> {
  try {
    const prompt = keywords
      ? `Analyze this content: "${content}" and provide 5 SEO recommendations for 2025 specifically targeting keywords: "${keywords}". Format as JSON array of strings.`
      : `Analyze this content and provide 5 SEO recommendations for 2025: "${content}". Format as JSON array of strings.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: 0.6,
      max_tokens: 500
    });

    const recommendations = response.choices[0]?.message?.content;
    return recommendations ? JSON.parse(recommendations) : ['Optimize for voice search', 'Use semantic HTML', 'Focus on user intent'];
  } catch (error) {
    console.error('Error generating SEO recommendations:', error);
    return ['Optimize for voice search', 'Use semantic HTML', 'Focus on user intent'];
  }
}

export async function generateTrends(topic?: string): Promise<string[]> {
  try {
    const prompt = topic
      ? `Generate 10 unique trending hashtags for ${topic} in 2025. Make them relevant and viral. Format as JSON array of strings, each being a hashtag (include the # symbol).`
      : 'Generate 10 trending technology hashtags for 2025. Format as JSON array of strings, each being a hashtag (include the # symbol).';

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: 0.8,
      max_tokens: 500
    });

    const trends = response.choices[0]?.message?.content;
    return trends ? JSON.parse(trends) : ['#AI', '#Tech2025', '#Innovation'];
  } catch (error) {
    console.error('Error generating trends:', error);
    // Generate dynamic hashtags based on the topic
    const baseTopic = topic || 'technology';
    const topicWords = baseTopic.toLowerCase().split(' ').filter(word => word.length > 2);
    const mainTopic = topicWords.length > 0 ? topicWords[0] : baseTopic;

    // Create more relevant and varied hashtags
    const hashtagTemplates = [
      `#${mainTopic}`,
      `#${mainTopic}2025`,
      `#${mainTopic}Trends`,
      `#FutureOf${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}`,
      `#${mainTopic}Innovation`,
      `#${mainTopic}Revolution`,
      `#${mainTopic}Mastery`,
      `#${mainTopic}Hacks`,
      `#${mainTopic}Tips`,
      `#${mainTopic}Guide`,
      `#${mainTopic}Strategy`,
      `#${mainTopic}Success`,
      `#${mainTopic}Community`,
      `#${mainTopic}Experts`,
      `#${mainTopic}Evolution`
    ];

    // Shuffle and return 10 unique hashtags
    const shuffled = hashtagTemplates.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
  }
}

export async function generateViralTrends(): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: 'Generate 8 viral social media trends for 2025. Format as JSON array of strings.'
      }],
      temperature: 0.8,
      max_tokens: 500
    });

    const viralTrends = response.choices[0]?.message?.content;
    return viralTrends ? JSON.parse(viralTrends) : ['AI-generated art challenges', 'Virtual reality concerts', 'Sustainable fashion hauls'];
  } catch (error) {
    console.error('Error generating viral trends:', error);
    return ['AI-generated art challenges', 'Virtual reality concerts', 'Sustainable fashion hauls'];
  }
}
