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
        </main>
      </div>
  );
}
