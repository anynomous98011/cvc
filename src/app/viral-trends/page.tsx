'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getViralTrends } from '@/lib/actions';
import { FileText, Lightbulb, TrendingUp, CheckCircle, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { GetViralTrendsState } from '@/lib/actions';

function ViralTrendsContent() {
  const [trendsState, setTrendsState] = useState<GetViralTrendsState>({status: 'idle'});

  useEffect(() => {
    async function fetchTrends() {
      const trends = await getViralTrends();
      setTrendsState(trends);
    }
    fetchTrends();
  }, []);

  if (trendsState.status === 'idle' || trendsState.status === 'pending') {
     return <ViralTrendsSkeleton />;
  }

  if (trendsState.status === 'error') {
    return (
      <div className="flex flex-col gap-6">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Could not load viral trends. The AI model may be overloaded. Please try again in a few moments.</p>
            <p className="text-sm text-muted-foreground mt-2">{trendsState.error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { trendingTopics, viralTitleExamples, viralDescriptionExamples, suggestions } = trendsState.data!;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <TrendingUp />
            Trending Topics
          </CardTitle>
          <CardDescription>
            These topics are gaining traction right now.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-2">
            {trendingTopics.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <FileText />
            Viral Title Examples
          </CardTitle>
          <CardDescription>
            Use these formats as inspiration for your next title.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-2">
            {viralTitleExamples.map((item, index) => (
              <li key={index}><span className="font-bold">{item.split(':')[0]}:</span>{item.substring(item.indexOf(':') + 1)}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Lightbulb />
            Viral Description Examples
          </CardTitle>
           <CardDescription>
            Structure your descriptions like this to increase engagement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-2">
            {viralDescriptionExamples.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <CheckCircle />
            Actionable Suggestions
          </CardTitle>
           <CardDescription>
            Follow these strategies to boost your chances of going viral.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-2">
            {suggestions.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}


function ViralTrendsSkeleton() {
    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                </CardContent>
            </Card>
            <Card>
                 <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                </CardContent>
            </Card>
        </div>
    )
}

// Auth wrapper
function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (!data.authenticated) {
          router.push('/login');
        }
      } catch (error) {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span>Loading...</span>
      </div>
    );
  }

  return <>{children}</>;
}

export default function ViralTrendsPage() {
  return (
    <AuthWrapper>
      <ViralTrendsContent />
    </AuthWrapper>
  );
}

function ViralTrendsDisplay() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Trending Content Analysis</h2>
        <p className="text-gray-500">Loading viral content trends...</p>
      </div>
    </div>
  );
}