'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  generateContent,
  analyzeMedia,
  analyzeSeo,
  type GenerateContentState,
  type AnalyzeMediaState,
  type AnalyzeSeoState,
} from '@/lib/actions';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
import { Loader2, Sparkles, Upload, FileText, Image as ImageIcon, Pilcrow, Hash, Search } from 'lucide-react';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';

const platforms = ['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook'];

// Add authentication check
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
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
const styles = ['Humorous', 'Educational', 'Inspirational', 'Vlog', 'Review'];

// Schemas
const textContentSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters'),
  platform: z.string().min(1, 'Please select a platform'),
  style: z.string().min(1, 'Please select a style'),
});

const mediaContentSchema = z.object({
  media: z.any().refine((val) => val, 'Please upload a file'),
});

const seoSchema = z.object({
  textContent: z.string().min(10, 'Content must be at least 10 characters'),
  targetKeywords: z.string().min(3, 'Keywords must be at least 3 characters'),
});


// Result Display Components
function ContentResults({ state }: { state: GenerateContentState }) {
  if (!state.data) return null;
  const { viralTitles, seoDescriptions, hashtags, thumbnailIdeas, aiImagePrompts } = state.data;
  return (
    <div className="mt-8 space-y-6">
       <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="font-headline flex items-center gap-2"><Pilcrow /> Viral Titles</CardTitle></CardHeader>
            <CardContent><ul className="list-inside list-disc space-y-2">{viralTitles.map((item, index) => <li key={index}>{item}</li>)}</ul></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="font-headline flex items-center gap-2"><FileText /> SEO Descriptions</CardTitle></CardHeader>
            <CardContent><ul className="list-inside list-disc space-y-2">{seoDescriptions.map((item, index) => <li key={index}>{item}</li>)}</ul></CardContent>
          </Card>
      </div>
       <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader><CardTitle className="font-headline flex items-center gap-2"><Hash /> Hashtags</CardTitle></CardHeader>
            <CardContent><div className="flex flex-wrap gap-2">{hashtags.map((item) => <span key={item} className="rounded-full bg-secondary px-3 py-1 text-sm">#{item}</span>)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="font-headline flex items-center gap-2"><ImageIcon /> Thumbnail Ideas</CardTitle></CardHeader>
            <CardContent><ul className="list-inside list-disc space-y-2">{thumbnailIdeas.map((item, index) => <li key={index}>{item}</li>)}</ul></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="font-headline flex items-center gap-2"><Sparkles /> AI Image Prompts</CardTitle></CardHeader>
            <CardContent><ul className="list-inside list-disc space-y-2">{aiImagePrompts.map((item, index) => <li key={index}>{item}</li>)}</ul></CardContent>
          </Card>
      </div>
    </div>
  );
}

function MediaResults({ state }: { state: AnalyzeMediaState }) {
  if (!state.data) return null;
  const { data } = state;
  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Analysis Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Title</h3>
            <p className="text-muted-foreground">{data.title}</p>
          </div>
          <div>
            <h3 className="mt-4 text-lg font-semibold">Description</h3>
            <p className="text-muted-foreground">{data.description}</p>
          </div>
          <div>
            <h3 className="mt-4 text-lg font-semibold">Hashtags</h3>
            <div className="flex flex-wrap gap-2 pt-2">
              {data.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-secondary px-3 py-1 text-sm font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
       {data.thumbnailDataUri && (
          <Card>
            <CardHeader><CardTitle className="font-headline">Suggested Thumbnail</CardTitle></CardHeader>
            <CardContent>
                <Image
                    src={data.thumbnailDataUri}
                    alt="Suggested thumbnail"
                    width={1280}
                    height={720}
                    className="mt-2 w-full rounded-lg object-cover aspect-video"
                />
            </CardContent>
          </Card>
        )}
    </div>
  );
}

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


export default function CreatorStudioPage() {
  return (
    <AuthWrapper>
      <CreatorStudioContent />
    </AuthWrapper>
  );
}

function CreatorStudioContent() {
  const [contentState, contentAction, isContentPending] = useActionState(generateContent, { status: 'idle' });
  const [mediaState, mediaAction, isMediaPending] = useActionState(analyzeMedia, { status: 'idle' });
  const [seoState, seoAction, isSeoPending] = useActionState(analyzeSeo, { status: 'idle' });

  const isAnyPending = isContentPending || isMediaPending || isSeoPending;

  const [preview, setPreview] = useState<string | null>(null);

  const textForm = useForm<z.infer<typeof textContentSchema>>({
    resolver: zodResolver(textContentSchema),
    defaultValues: { topic: '', platform: '', style: '' },
  });

  const mediaForm = useForm<z.infer<typeof mediaContentSchema>>({
    resolver: zodResolver(mediaContentSchema),
    defaultValues: { media: '' }
  });
  
  const seoForm = useForm<z.infer<typeof seoSchema>>({
    resolver: zodResolver(seoSchema),
    defaultValues: { textContent: '', targetKeywords: '' },
  });
  
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        mediaForm.setValue('media', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (contentState.status === 'success') {
      textForm.reset();
    }
  }, [contentState, textForm]);
  
  useEffect(() => {
    if (mediaState.status === 'success') {
      mediaForm.reset();
      setPreview(null);
      const fileInput = document.getElementById('media-file-input') as HTMLInputElement;
      if (fileInput) {
          fileInput.value = '';
      }
    }
  }, [mediaState, mediaForm]);

  useEffect(() => {
    if (seoState.status === 'success') {
        seoForm.reset();
    }
  }, [seoState, seoForm]);

  return (
    <div className="container mx-auto max-w-7xl p-4 md:p-8">
        <h1 className="mb-4 text-center font-headline text-4xl font-bold">Creator Studio</h1>
        <p className="mb-8 text-center text-muted-foreground">
            Your AI-powered toolkit for content creation and optimization.
        </p>

        <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text"><FileText className="mr-2 h-4 w-4"/>Text Content</TabsTrigger>
                <TabsTrigger value="media"><ImageIcon className="mr-2 h-4 w-4"/>Media Content</TabsTrigger>
            </TabsList>
            
            <TabsContent value="text">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Generate Viral Content Ideas</CardTitle>
                        <CardDescription>
                            Input a topic and let our AI generate engaging content for you.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...textForm}>
                            <form action={contentAction} className="space-y-4">
                                <FormField
                                    control={textForm.control}
                                    name="topic"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Topic</FormLabel>
                                            <FormControl><Input placeholder="e.g., 'Space Exploration'" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <FormField
                                        control={textForm.control}
                                        name="platform"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Platform</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a platform" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {platforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={textForm.control}
                                        name="style"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Style</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a style" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {styles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Button type="submit" disabled={isAnyPending}>
                                    {isContentPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                    Generate Content
                                </Button>
                            </form>
                        </Form>
                        {contentState.status === 'error' && <p className="mt-4 text-destructive">{contentState.error}</p>}
                        {isContentPending && <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" /> Thinking...</div>}
                        {contentState.status === 'success' && <ContentResults state={contentState} />}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="media">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Analyze Media Content</CardTitle>
                        <CardDescription>
                            Upload an image or video to get AI-generated titles, descriptions, and more.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Form {...mediaForm}>
                            <form action={mediaAction} className="space-y-4">
                                 <FormField
                                    control={mediaForm.control}
                                    name="media"
                                    render={({ field: { onChange, value, ...rest } }) => (
                                        <FormItem>
                                        <FormLabel>Media File</FormLabel>
                                        <FormControl>
                                          <label htmlFor="media-file-input" className="mt-2 flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 p-8 text-center text-muted-foreground hover:bg-muted/100">
                                            <div>
                                              <Upload className="mx-auto h-12 w-12"/>
                                              <p className="mt-2">Click to upload or drag and drop</p>
                                              <p className="text-xs">Image or Video</p>
                                            </div>
                                            <Input id="media-file-input" type="file" accept="image/*,video/*" onChange={handleMediaChange} className="hidden" />
                                          </label>
                                        </FormControl>
                                        <Input {...rest} type="hidden" name="media" value={value || ''} />
                                        <FormMessage>{mediaForm.formState.errors.media?.message as string}</FormMessage>
                                        </FormItem>
                                    )}
                                    />
                                {preview && (
                                    <div className="mt-4">
                                      <p className="text-sm font-medium">Preview:</p>
                                    {preview.startsWith('data:image') && (
                                        <Image src={preview} alt="Media preview" width={300} height={200} className="mt-2 rounded-lg border" />
                                    )}
                                    {preview.startsWith('data:video') && (
                                        <video src={preview} controls width="300" className="mt-2 rounded-lg border" />
                                    )}
                                    </div>
                                )}
                                <Button type="submit" disabled={isAnyPending || !preview}>
                                    {isMediaPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                    Analyze Media
                                </Button>
                            </form>
                        </Form>
                        {mediaState.status === 'error' && <p className="mt-4 text-destructive">{mediaState.error}</p>}
                        {isMediaPending && <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" /> Analyzing...</div>}
                        {mediaState.status === 'success' && <MediaResults state={mediaState} />}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
