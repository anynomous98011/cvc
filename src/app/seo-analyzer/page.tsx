'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { analyzeSeo, type AnalyzeSeoState } from '@/lib/actions';
import { useActionState } from 'react';


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
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Search } from 'lucide-react';

const seoSchema = z.object({
  textContent: z.string().min(10, 'Content must be at least 10 characters'),
  targetKeywords: z.string().min(3, 'Keywords must be at least 3 characters'),
});

function SeoResults({ state }: { state: AnalyzeSeoState }) {
    if (!state.data) return null;
    const { data } = state;
    return (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">SEO Score</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-bold text-primary">{data.seoScore}</span>
                        <span className="text-muted-foreground">/ 100</span>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Actionable Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{data.actionableRecommendations}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Keyword Density</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{data.keywordDensityAnalysis}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Readability Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{data.readabilityAnalysis}</p>
                </CardContent>
            </Card>
        </div>
    );
}

export default function SeoAnalyzerPage() {
  const [seoState, seoAction, isSeoPending] = useActionState(analyzeSeo, { status: 'idle' });

  const seoForm = useForm<z.infer<typeof seoSchema>>({
    resolver: zodResolver(seoSchema),
    defaultValues: { textContent: '', targetKeywords: '' },
  });

  useEffect(() => {
    if (seoState.status === 'success') {
        seoForm.reset();
    }
  }, [seoState, seoForm]);

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="text-center">
        <h1 className="mb-4 font-headline text-4xl font-bold">SEO Analyzer</h1>
        <p className="mb-8 text-muted-foreground">
          Optimize your content for search engines to improve its visibility.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Analyze SEO Performance</CardTitle>
          <CardDescription>
            Enter your content and keywords to get an SEO score and recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...seoForm}>
            <form action={seoAction} className="space-y-4">
              <FormField
                control={seoForm.control}
                name="textContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content to Analyze</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Paste your blog post, video description, or other text here..." {...field} rows={8} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={seoForm.control}
                name="targetKeywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Keywords</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 'AI content creation, social media marketing'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSeoPending}>
                {isSeoPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Analyze SEO
              </Button>
            </form>
          </Form>
          {seoState.status === 'error' && <p className="mt-4 text-destructive">{seoState.error}</p>}
          {isSeoPending && <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" /> Analyzing...</div>}
          {seoState.status === 'success' && <SeoResults state={seoState} />}
        </CardContent>
      </Card>
    </div>
  );
}
