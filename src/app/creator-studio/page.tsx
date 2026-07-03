'use client';
import { useState, useEffect, useCallback } from 'react';
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
import {
  Loader2,
  Sparkles,
  Upload,
  FileText,
  Image as ImageIcon,
  Pilcrow,
  Hash,
  Instagram,
  Music2,
  Youtube,
  Twitter,
  Facebook,
  Copy,
  Check,
} from 'lucide-react';
import Image from 'next/image';

const platforms = [
  { value: 'Instagram', icon: Instagram, label: 'Instagram' },
  { value: 'TikTok', icon: Music2, label: 'TikTok' },
  { value: 'YouTube', icon: Youtube, label: 'YouTube' },
  { value: 'Twitter', icon: Twitter, label: 'Twitter' },
  { value: 'Facebook', icon: Facebook, label: 'Facebook' },
];


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

// Helper: strip leading '#' to prevent ##doublehashtag
function stripHash(tag: string): string {
  return tag.replace(/^#+/, '');
}

// Copy button with checkmark feedback
function CopyButton({ text, className = '' }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${className}`}
    >
      {copied ? (
        <><Check className="h-3 w-3 text-green-500" /><span className="text-green-500">Copied!</span></>
      ) : (
        <><Copy className="h-3 w-3" /><span>Copy</span></>
      )}
    </button>
  );
}

// Copy All button for an entire section
function CopyAllButton({ items, label = 'Copy All' }: { items: string[]; label?: string }) {
  const text = items.join('\n');
  return (
    <CopyButton text={text} className="ml-auto text-xs font-medium border border-border px-3 py-1 rounded-md" />
  );
}

// Result Display Components
function ContentResults({ state }: { state: GenerateContentState }) {
  if (!state.data) return null;
  const { viralTitles, seoDescriptions, hashtags, thumbnailIdeas, aiImagePrompts } = state.data;

  // Sanitize hashtags - strip any leading # the AI might have included
  const cleanHashtags = hashtags.map(stripHash);

  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Viral Titles */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="font-headline flex items-center gap-2"><Pilcrow /> Viral Titles</CardTitle>
              <CopyAllButton items={viralTitles} label="Copy All Titles" />
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {viralTitles.map((item, index) => (
                <li key={index} className="flex items-start justify-between gap-2 group">
                  <span className="flex-1 list-item list-disc ml-4">{item}</span>
                  <CopyButton text={item} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* SEO Descriptions */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="font-headline flex items-center gap-2"><FileText /> SEO Descriptions</CardTitle>
              <CopyAllButton items={seoDescriptions} label="Copy All Descriptions" />
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {seoDescriptions.map((item, index) => (
                <li key={index} className="flex items-start justify-between gap-2 group">
                  <span className="flex-1 list-item list-disc ml-4">{item}</span>
                  <CopyButton text={item} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Hashtags */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="font-headline flex items-center gap-2"><Hash /> Hashtags</CardTitle>
              <CopyAllButton items={cleanHashtags.map(t => `#${t}`)} label="Copy All Hashtags" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {cleanHashtags.map((item) => (
                <div key={item} className="flex items-center gap-1">
                  <span className="rounded-full bg-secondary px-3 py-1 text-sm">#{item}</span>
                  <CopyButton text={`#${item}`} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Thumbnail Ideas */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="font-headline flex items-center gap-2"><ImageIcon /> Thumbnail Ideas</CardTitle>
              <CopyAllButton items={thumbnailIdeas} label="Copy All Ideas" />
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {thumbnailIdeas.map((item, index) => (
                <li key={index} className="flex items-start justify-between gap-2 group">
                  <span className="flex-1 list-item list-disc ml-4">{item}</span>
                  <CopyButton text={item} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* AI Image Prompts */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="font-headline flex items-center gap-2"><Sparkles /> AI Image Prompts</CardTitle>
              <CopyAllButton items={aiImagePrompts} label="Copy All Prompts" />
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {aiImagePrompts.map((item, index) => (
                <li key={index} className="flex items-start justify-between gap-2 group">
                  <span className="flex-1 list-item list-disc ml-4">{item}</span>
                  <CopyButton text={item} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Copy Everything */}
      <div className="flex justify-end">
        <CopyButton
          text={[
            '=== VIRAL TITLES ===',
            viralTitles.join('\n'),
            '',
            '=== SEO DESCRIPTIONS ===',
            seoDescriptions.join('\n'),
            '',
            '=== HASHTAGS ===',
            cleanHashtags.map(t => `#${t}`).join(' '),
            '',
            '=== THUMBNAIL IDEAS ===',
            thumbnailIdeas.join('\n'),
            '',
            '=== AI IMAGE PROMPTS ===',
            aiImagePrompts.join('\n'),
          ].join('\n')}
          className="border border-border px-4 py-2 rounded-md font-medium text-sm"
        />
      </div>
    </div>
  );
}

function MediaResults({ state }: { state: AnalyzeMediaState }) {
  if (!state.data) return null;
  const { data } = state;
  const cleanHashtags = data.hashtags.map(stripHash);

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Analysis Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-semibold">Title</h3>
              <CopyButton text={data.title} />
            </div>
            <p className="text-muted-foreground">{data.title}</p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="mt-4 text-lg font-semibold">Description</h3>
              <CopyButton text={data.description} />
            </div>
            <p className="text-muted-foreground">{data.description}</p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="mt-4 text-lg font-semibold">Hashtags</h3>
              <CopyAllButton items={cleanHashtags.map(t => `#${t}`)} label="Copy All" />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {cleanHashtags.map((tag) => (
                <div key={tag} className="flex items-center gap-1">
                  <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium">
                    #{tag}
                  </span>
                  <CopyButton text={`#${tag}`} />
                </div>
              ))}
            </div>
          </div>
          {/* Copy all media content */}
          <div className="pt-4 border-t">
            <CopyButton
              text={[
                `Title: ${data.title}`,
                '',
                `Description: ${data.description}`,
                '',
                `Hashtags: ${cleanHashtags.map(t => `#${t}`).join(' ')}`,
              ].join('\n')}
              className="border border-border px-4 py-2 rounded-md font-medium text-sm w-full justify-center"
            />
          </div>
        </CardContent>
      </Card>
       {data.thumbnailDataUri && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-headline">Suggested Thumbnail</CardTitle>
                <CopyButton text={data.thumbnailDataUri} />
              </div>
            </CardHeader>
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
                    <div className="flex items-center justify-between">
                        <CardTitle className="font-headline">Actionable Recommendations</CardTitle>
                        <CopyButton text={data.actionableRecommendations} />
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{data.actionableRecommendations}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="font-headline">Keyword Density</CardTitle>
                        <CopyButton text={data.keywordDensityAnalysis} />
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{data.keywordDensityAnalysis}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="font-headline">Readability Analysis</CardTitle>
                        <CopyButton text={data.readabilityAnalysis} />
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{data.readabilityAnalysis}</p>
                </CardContent>
            </Card>
        </div>
    );
}


export default function CreatorStudioPage() {
  return <CreatorStudioContent />;
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
                                                        {platforms.map((platform) => {
                                                          const Icon = platform.icon;
                                                          return (
                                                            <SelectItem key={platform.value} value={platform.value}>
                                                              <span className="inline-flex items-center gap-2">
                                                                <Icon className="h-4 w-4" />
                                                                <span>{platform.label}</span>
                                                              </span>
                                                            </SelectItem>
                                                          );
                                                        })}
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
