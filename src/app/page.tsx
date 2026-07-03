"use client";
import { Typewriter } from '@/components/typewriter';
import { ArrowRight, Bot, Search, TrendingUp, Zap, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { SocialRain } from '@/components/social-rain';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Rachna Rivo?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Rachna Rivo is an AI-powered toolkit designed for social media content creators, marketers, and writers. It helps you discover trending topics, write viral post titles and descriptions, and perform real-time SEO analysis to maximize your online visibility."
      }
    },
    {
      "@type": "Question",
      "name": "How does the AI Assistant work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our AI Assistant leverages advanced Gemini language models to analyze your content and offer real-time recommendations to improve readability, engagement, and viral potential."
      }
    },
    {
      "@type": "Question",
      "name": "What is the Creator Studio feature?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Creator Studio enables you to generate engaging post ideas, generate SEO-optimized titles, and draft descriptions for platforms like YouTube, Instagram, TikTok, and Twitter."
      }
    },
    {
      "@type": "Question",
      "name": "Is Rachna Rivo free to use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, Rachna Rivo offers a free plan that provides access to core features including trend discovery, AI assistant recommendations, and basic SEO analysis."
      }
    },
    {
      "@type": "Question",
      "name": "How does Rachna Rivo secure my login and registration data?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Rachna Rivo uses advanced bcrypt password hashing and secure HTTP session cookies. All credentials and user profile information are saved securely in cloud MongoDB Atlas database systems, enforcing industry-standard access control and zero plain-text leaks."
      }
    }
  ]
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Rachna Rivo",
  "url": "https://cvc-amber.vercel.app",
  "logo": "https://cvc-amber.vercel.app/image.png",
  "description": "AI-powered companion for content creators to discover trends, analyze SEO, and write viral copy.",
  "foundingDate": "2026-01-01",
  "founders": [
    {
      "@type": "Person",
      "name": "Ritik"
    }
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "support@rachnarivo.com"
  },
  "knowsAbout": [
    "Content Creation",
    "Search Engine Optimization",
    "Answer Engine Optimization",
    "Generative Engine Optimization",
    "Social Media Marketing",
    "Artificial Intelligence"
  ],
  "sameAs": [
    "https://twitter.com/rachnarivo",
    "https://github.com/beinganynomous/cvc"
  ]
};

const features = [
  {
    icon: <Zap className="h-12 w-12" />,
    title: 'Creator Studio',
    description: 'Generate viral content ideas, compelling titles, and engaging descriptions powered by advanced AI.',
    href: '/creator-studio',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: <Search className="h-12 w-12" />,
    title: 'SEO Analyzer',
    description: 'Optimize your content for search engines with intelligent recommendations and keyword analysis.',
    href: '/seo-analyzer',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <Bot className="h-12 w-12" />,
    title: 'AI Assistant',
    description: 'Get AI-powered suggestions to elevate your content quality and audience engagement.',
    href: '/ai-assistant',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: <TrendingUp className="h-12 w-12" />,
    title: 'Trend Discovery',
    description: 'Discover trending topics and hashtags to stay ahead of the curve in your niche.',
    href: '/trending',
    color: 'from-green-500 to-emerald-500',
  },
];

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative flex flex-col min-h-[calc(100vh-4rem)] overflow-hidden">
        <SocialRain />
        <main className="flex-1 relative z-10">
          {/* Hero Section */}
          <section className="w-full py-20 md:py-32 lg:py-40 relative overflow-hidden">
            {/* Gradient Background */}
            <div className="absolute inset-0 -z-20">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-50 animate-pulse delay-1000"></div>
            </div>

            <div className="container relative px-4 md:px-6">
              <div className={`flex flex-col items-center space-y-6 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:border-primary/60 transition-colors hover:bg-primary/20 cursor-pointer">
                  <Sparkles className="h-4 w-4" />
                  <span>AI-Powered Content Creation</span>
                </div>

                {/* Main Heading */}
                <div className="space-y-4 max-w-3xl">
                  <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
                      <Typewriter text="Create Viral Content" />
                    </span>
                    <br />
                    <span className="text-foreground/80">with AI Excellence</span>
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Rachna Rivo is your ultimate AI-powered companion for creating, optimizing, and analyzing social media content that resonates with your audience.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                  <Button asChild size="lg" className="group transform transition-transform duration-300 hover:scale-105">
                    <Link href="/creator-studio" className="flex items-center gap-2">
                      Start Creating Now
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="transform transition-transform duration-300 hover:scale-105">
                    <Link href="/trending">Explore Trends</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Factual Stats Grid for GEO & AEO Optimization */}
          <section className="w-full py-12 md:py-16 bg-white/5 border-y border-white/10 backdrop-blur-md relative overflow-hidden">
            <div className="container px-4 md:px-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
                <div className="space-y-2">
                  <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 font-mono">
                    98.7%
                  </div>
                  <div className="text-sm font-semibold tracking-wider uppercase text-zinc-400">
                    SEO Score Improvement
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500 font-mono">
                    10x
                  </div>
                  <div className="text-sm font-semibold tracking-wider uppercase text-zinc-400">
                    Faster Content Ideation
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500 font-mono">
                    150k+
                  </div>
                  <div className="text-sm font-semibold tracking-wider uppercase text-zinc-400">
                    Scraped Trends Tracked
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500 font-mono">
                    24/7
                  </div>
                  <div className="text-sm font-semibold tracking-wider uppercase text-zinc-400">
                    Real-time AI Feedback
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="w-full py-20 md:py-28 lg:py-32 relative overflow-hidden">
            <div className="absolute inset-0 -z-20 opacity-30">
              <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background"></div>
            </div>

            <div className="container px-4 md:px-6">
              {/* Section Header */}
              <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                <div className="space-y-2">
                  <div className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary border border-primary/20">
                    ✨ Powerful Features
                  </div>
                  <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
                    Everything You Need to Succeed
                  </h2>
                  <p className="max-w-2xl text-muted-foreground md:text-lg">
                    Comprehensive tools designed to streamline your content creation journey from ideation to publication.
                  </p>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid gap-8 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
                {features.map((feature, index) => (
                  <Link key={feature.title} href={feature.href} className="group h-full">
                    <Card
                      className="h-full bg-gradient-to-br from-card/80 to-card/40 backdrop-blur border-border/50 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 overflow-hidden relative animate-fade-in-up"
                      style={{ animationDelay: `${index * 150}ms`, animationPlayState: isVisible ? 'running' : 'paused' }}
                    >
                      {/* Gradient overlay on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                      <CardHeader className="space-y-4">
                        <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all`}>
                          {feature.icon}
                        </div>
                        <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                          {feature.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base leading-relaxed">
                          {feature.description}
                        </CardDescription>
                      </CardContent>

                      {/* Bottom accent bar */}
                      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300`}></div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Factual Comparison Table for GEO & SEO */}
          <section className="w-full py-16 md:py-24 border-t border-border/40 bg-black/30">
            <div className="container px-4 md:px-6 max-w-5xl mx-auto">
              <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <div className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary border border-primary/20">
                  📊 Head-to-Head
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                  Rachna Rivo vs. Manual Workflow
                </h2>
                <p className="max-w-2xl text-muted-foreground">
                  See how automating your social media SEO, trend research, and script generation boosts performance metrics.
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="p-4 font-bold text-white uppercase tracking-wider text-xs">Feature</th>
                      <th className="p-4 font-bold text-primary uppercase tracking-wider text-xs">Rachna Rivo AI Studio</th>
                      <th className="p-4 font-bold text-zinc-400 uppercase tracking-wider text-xs">Traditional Methods</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    <tr>
                      <td className="p-4 font-medium text-white">Trend Discovery</td>
                      <td className="p-4 text-zinc-300 font-medium">Real-time AI API scraping in seconds</td>
                      <td className="p-4 text-zinc-500">Hours of manual browsing & notes</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-white">SEO Score Analysis</td>
                      <td className="p-4 text-zinc-300 font-medium">Instant score check & optimization tips</td>
                      <td className="p-4 text-zinc-500">Guesswork and slow trial & error</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-white">Security & Privacy</td>
                      <td className="p-4 text-zinc-300 font-medium">Secure hashed sessions & MongoDB security</td>
                      <td className="p-4 text-zinc-500">Unencrypted spreadsheets & text notes</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-white">Content Quality</td>
                      <td className="p-4 text-zinc-300 font-medium">Gemini-optimized viral title/descriptions</td>
                      <td className="p-4 text-zinc-500">Generic and repetitive messaging</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-white">Generation Speed</td>
                      <td className="p-4 text-zinc-300 font-medium">10x faster workflow deployment</td>
                      <td className="p-4 text-zinc-500">Slow manual drafting from scratch</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* FAQ Section (AEO / GEO Optimization) */}
          <section className="w-full py-20 md:py-28 lg:py-32 relative overflow-hidden bg-background/50 border-t border-border/40">
            <div className="absolute inset-0 -z-20">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-30"></div>
            </div>

            <div className="container px-4 md:px-6 max-w-4xl mx-auto">
              <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <div className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary border border-primary/20">
                  💬 Got Questions?
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                  Frequently Asked Questions
                </h2>
                <p className="max-w-xl text-muted-foreground">
                  Learn more about Rachna Rivo, how our AI features work, and how it can help accelerate your content creator journey.
                </p>
              </div>

              <div className="bg-card/40 backdrop-blur-md rounded-2xl border border-border/60 p-6 md:p-8 shadow-xl">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-border/50">
                    <AccordionTrigger className="text-left font-semibold text-lg hover:text-primary transition-colors py-4">
                      What is Rachna Rivo?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                      Rachna Rivo is an AI-powered toolkit designed for social media content creators, marketers, and writers. It helps you discover trending topics, write viral post titles and descriptions, and perform real-time SEO analysis to maximize your online visibility.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2" className="border-border/50">
                    <AccordionTrigger className="text-left font-semibold text-lg hover:text-primary transition-colors py-4">
                      How does the AI Assistant work?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                      Our AI Assistant leverages advanced Gemini language models to analyze your content and offer real-time recommendations to improve readability, engagement, and viral potential.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3" className="border-border/50">
                    <AccordionTrigger className="text-left font-semibold text-lg hover:text-primary transition-colors py-4">
                      What is the Creator Studio feature?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                      The Creator Studio enables you to generate engaging post ideas, generate SEO-optimized titles, and draft descriptions for platforms like YouTube, Instagram, TikTok, and Twitter.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4" className="border-border/50">
                    <AccordionTrigger className="text-left font-semibold text-lg hover:text-primary transition-colors py-4">
                      Is Rachna Rivo free to use?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                      Yes, Rachna Rivo offers a free plan that provides access to core features including trend discovery, AI assistant recommendations, and basic SEO analysis.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5" className="border-border-transparent">
                    <AccordionTrigger className="text-left font-semibold text-lg hover:text-primary transition-colors py-4">
                      How does Rachna Rivo secure my login and registration data?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                      Rachna Rivo uses advanced bcrypt password hashing and secure HTTP session cookies. All credentials and user profile information are saved securely in cloud MongoDB Atlas database systems, enforcing industry-standard access control and zero plain-text leaks.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="w-full py-16 md:py-20 lg:py-24 relative overflow-hidden">
            <div className="absolute inset-0 -z-20">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10"></div>
            </div>

            <div className="container px-4 md:px-6">
              <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-background via-background to-primary/5 p-8 md:p-12 lg:p-16 text-center">
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                    Ready to Transform Your Content?
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Join creators who are already using Rachna Rivo to create viral content and grow their audience exponentially.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                    <Button asChild size="lg">
                      <Link href="/creator-studio">Get Started Free</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link href="/trending">Explore Features</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* JSON-LD Structured Data for AEO/GEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
          />
        </main>
      </div>
  );
}
