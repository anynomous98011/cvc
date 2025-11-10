'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, Bot, Search, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import { SocialRain } from '@/components/social-rain';
import { Icons } from '@/components/icons';

const features = [
  {
    icon: <Zap className="h-10 w-10" />,
    title: 'Creator Studio',
    description: 'Generate viral content ideas, titles, and descriptions.',
    href: '/creator-studio',
  },
  {
    icon: <TrendingUp className="h-10 w-10" />,
    title: 'Trend Discovery',
    description: 'Discover the latest trends and hashtags in your niche.',
    href: '/trending',
  },
];

export default function Home() {

  return (
    <div className="relative flex flex-col min-h-[calc(100vh-4rem)] overflow-hidden">
      <SocialRain />
      <main className="flex-1">
        <section className="w-full py-20 md:py-28 lg:py-36">
          <div className="container relative px-4 md:px-6">
            <Icons.logo className="absolute inset-0 -z-10 mx-auto my-auto h-auto w-full max-w-4xl text-primary/5 opacity-30" />
             <div className="flex flex-col items-center space-y-16 text-center">
               <div className="space-y-4">
                 <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl xl:text-7xl/none font-headline animate-subtle-shine bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-yellow-500 to-pink-500 bg-[200%_100%] uppercase">
                   Everything You Need to Go Viral
                 </h1>
                 <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                   CVC is your AI growth engine — create viral ideas, titles, and captions in seconds, boost engagement effortlessly, and stay 100% secure while scaling your reach like top creators.
                 </p>
               </div>
               <div className="space-x-4">
                <Button asChild size="lg" className="transition-all duration-200 hover:scale-105">
                  <Link href="/creator-studio">
                    Start Creating
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background/50 backdrop-blur-sm border-t border-border/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm font-medium">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Everything You Need to Go Viral
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From brainstorming to publishing, our comprehensive toolkit
                  streamlines your entire content creation workflow.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-4 mt-12">
              {features.map((feature) => (
                <Link key={feature.title} href={feature.href} className="h-full">
                  <Card className="h-full bg-card/80 transition-all hover:bg-card/100 hover:scale-105 hover:shadow-lg">
                    <CardHeader>
                      <div className="mb-4 text-primary">{feature.icon}</div>
                      <CardTitle className="font-headline">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
