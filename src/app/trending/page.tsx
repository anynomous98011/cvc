'use client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { discoverTrends, type DiscoverTrendsState } from '@/lib/actions';
import { useActionState, useEffect, startTransition, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, TrendingUp, Hash, Lightbulb, Image as ImageIcon } from 'lucide-react';

const platforms = ['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook'];

const trendingSchema = z.object({
  platform: z.string().min(1, 'Please select a platform'),
});

function TrendingResults({ state }: { state: DiscoverTrendsState }) {
  if (!state.data) return null;
  const { data } = state;
  return (
    <div className="mt-6 grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <Hash />
                Trending Hashtags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
                {data.trendingHashtags.map((tag) => (
                    <span key={tag} className="rounded-full bg-secondary px-3 py-1 text-sm font-medium">#{tag}</span>
                ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <Lightbulb />
                Viral Content Ideas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-2">
              {data.viralContentIdeas.map((idea, index) => (
                <li key={index}>{idea}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <ImageIcon />
                Trending Thumbnail Ideas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-2">
              {data.trendingThumbnailIdeas.map((idea, index) => (
                <li key={index}>{idea}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
    </div>
  );
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

export default function TrendingPage() {
  return (
    <AuthWrapper>
      <TrendingContent />
    </AuthWrapper>
  );
}

function TrendingContent() {
  const [state, formAction, isPending] = useActionState(discoverTrends, { status: 'idle' });

  const form = useForm<z.infer<typeof trendingSchema>>({
    resolver: zodResolver(trendingSchema),
    defaultValues: { platform: '' },
  });

  useEffect(() => {
    if (state.status === 'success') {
      // Don't reset the form to allow for easy re-submission
    }
  }, [state, form]);

  return (
    <div className="container mx-auto max-w-6xl p-4 md:p-8">
      <div className="text-center">
        <h1 className="mb-4 font-headline text-4xl font-bold">Discover Trends</h1>
        <p className="mb-8 text-muted-foreground">
          Find out what's currently trending in your niche.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Find Trending Content</CardTitle>
          <CardDescription>
            Select a platform to see what's hot right now.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              action={formAction}
              className="flex flex-col items-start gap-4 md:flex-row md:items-end"
            >
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem className="w-full flex-1">
                    <FormLabel>Platform</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {platforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="w-full md:w-auto">
                <Button type="submit" disabled={isPending} className="w-full md:w-auto">
                    {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    <TrendingUp className="mr-2 h-4 w-4" />
                    )}
                    Discover
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {state.status === 'error' && <p className="mt-4 text-center text-destructive">{state.error}</p>}
      {isPending && <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" /> Discovering trends...</div>}
      {state.status === 'success' && <TrendingResults state={state} />}
    </div>
  );
}
