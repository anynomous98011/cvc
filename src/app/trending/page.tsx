import type { Metadata } from 'next';
import TrendingClient from './trending-client';

export const metadata: Metadata = {
  title: 'Discover Social Media Trends & Viral Hashtags | Rachna Rivo',
  description: 'Identify what is trending in your niche across platforms like Instagram, TikTok, YouTube, Twitter, and Facebook using Rachna Rivo AI.',
  keywords: [
    'social media trends',
    'trending hashtags',
    'instagram trends',
    'youtube trend analysis',
    'tiktok viral ideas',
    'creator marketing'
  ],
  alternates: {
    canonical: 'http://localhost:3000/trending',
  },
};

const trendingFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Which social platforms does Rachna Rivo track for trends?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Rachna Rivo tracks real-time trends for major platforms including Instagram, YouTube, TikTok, Twitter (X), and Facebook."
      }
    },
    {
      "@type": "Question",
      "name": "How does AI analyze social media trends?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Rachna Rivo uses advanced LLM crawlers to scan recent topics and hashtags in your niche, generating actionable recommendations, title ideas, and visual thumbnail drafts instantly."
      }
    }
  ]
};

export default function TrendingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(trendingFaqSchema) }}
      />
      <TrendingClient />
    </>
  );
}
