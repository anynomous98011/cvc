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

// Strip leading '#' so AI-returned '#tag' doesn't become '##tag' in UI
function stripHash(tag: string): string {
  return tag.replace(/^#+/, '');
}

// ─── Reusable copy button ───
function CopyButton({ text, label = 'Copy', className = '' }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${className}`}
    >
      {copied
        ? <><Check className="h-3 w-3 text-green-500" /><span className="text-green-500">Copied!</span></>
        : <><Copy className="h-3 w-3" /><span>{label}</span></>
      }
    </button>
  );
}

// ─── Results: Text content (Start Creating section) ───
function ContentResults({ state }: { state: GenerateContentState }) {
  if (!state.data) return null;
  const { viralTitles, seoDescriptions, hashtags, thumbnailIdeas, aiImagePrompts } = state.data;
  const cleanHashtags = hashtags.map(stripHash);

  // Build "copy everything" text
  const allText = [
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
  ].join('\n');

  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Viral Titles — Copy All only */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="font-headline flex items-center gap-2"><Pilcrow /> Viral Titles</CardTitle>
              <CopyButton
                text={viralTitles.join('\n')}
                label="Copy All"
                className="border border-border"
              />
            </div>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-2">
              {viralTitles.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </CardContent>
        </Card>

        {/* SEO Descriptions — Copy All only */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="font-headline flex items-center gap-2"><FileText /> SEO Descriptions</CardTitle>
              <CopyButton
                text={seoDescriptions.join('\n')}
                label="Copy All"
                className="border border-border"
              />
            </div>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-2">
              {seoDescriptions.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Hashtags — Copy All + individual click-to-copy pills */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="font-headline flex items-center gap-2"><Hash /> Hashtags</CardTitle>
              <CopyButton
                text={cleanHashtags.map(t => `#${t}`).join(' ')}
                label="Copy All"
                className="border border-border"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {cleanHashtags.map((tag) => (
                <HashtagPill key={tag} tag={tag} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">Click any hashtag to copy it</p>
          </CardContent>
        </Card>

        {/* Thumbnail Ideas — no copy (just read) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-headline flex items-center gap-2"><ImageIcon /> Thumbnail Ideas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-2">
              {thumbnailIdeas.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </CardContent>
        </Card>

        {/* AI Image Prompts — individual copy (exact prompt matters for AI tools) */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="font-headline flex items-center gap-2"><Sparkles /> AI Image Prompts</CardTitle>
              <CopyButton
                text={aiImagePrompts.join('\n')}
                label="Copy All"
                className="border border-border"
              />
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {aiImagePrompts.map((item, i) => (
                <li key={i} className="flex items-start justify-between gap-2">
                  <span className="flex-1 text-sm">{item}</span>
                  <CopyButton text={item} label="Copy" />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Copy Everything button */}
      <div className="flex justify-end pt-2">
        <CopyButton
          text={allText}
          label="Copy Everything"
          className="border border-border px-4 py-2 rounded-md font-medium text-sm"
        />
      </div>
    </div>
  );
}

// Clickable hashtag pill — click = copy
function HashtagPill({ tag }: { tag: string }) {
  const [copied, setCopied] = useState(false);
  const handleClick = useCallback(async () => {
    try { await navigator.clipboard.writeText(`#${tag}`); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [tag]);

  return (
    <button
      onClick={handleClick}
      title={`Copy #${tag}`}
      className={`rounded-full px-3 py-1 text-sm transition-all duration-200 flex items-center gap-1 ${
        copied
          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
          : 'bg-secondary hover:bg-secondary/80 hover:scale-105'
      }`}
    >
      {copied ? <Check className="h-3 w-3" /> : null}
      #{tag}
    </button>
  );
}

// ─── Results: Media content ───
function MediaResults({ state }: { state: AnalyzeMediaState }) {
  if (!state.data) return null;
  const { data } = state;
  const cleanHashtags = data.hashtags.map(stripHash);

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-headline">Analysis Results</CardTitle>
            {/* Copy all media result in one shot */}
            <CopyButton
              text={`Title: ${data.title}\n\nDescription: ${data.description}\n\nHashtags: ${cleanHashtags.map(t => `#${t}`).join(' ')}`}
              label="Copy All"
              className="border border-border"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">Title</h3>
            <p>{data.title}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">Description</h3>
            <p>{data.description}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Hashtags</h3>
            <div className="flex flex-wrap gap-2">
              {cleanHashtags.map((tag) => (
                <HashtagPill key={tag} tag={tag} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Click any hashtag to copy it</p>
          </div>
        </CardContent>
      </Card>

      {data.thumbnailDataUri && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Suggested Thumbnail</CardTitle>
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

// ─── Results: SEO ───
function SeoResults({ state }: { state: AnalyzeSeoState }) {
  if (!state.data) return null;
  const { data } = state;
  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="font-headline">SEO Score</CardTitle></CardHeader>
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
            <CardTitle className="font-headline">Recommendations</CardTitle>
            <CopyButton text={data.actionableRecommendations} label="Copy" className="border border-border" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">{data.actionableRecommendations}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="font-headline">Keyword Density</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">{data.keywordDensityAnalysis}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="font-headline">Readability</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">{data.readabilityAnalysis}</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Page ───
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
    defaultValues: { media: '' },
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

  useEffect(() => { if (contentState.status === 'success') textForm.reset(); }, [contentState, textForm]);
  useEffect(() => {
    if (mediaState.status === 'success') {
      mediaForm.reset();
      setPreview(null);
      const fileInput = document.getElementById('media-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  }, [mediaState, mediaForm]);
  useEffect(() => { if (seoState.status === 'success') seoForm.reset(); }, [seoState, seoForm]);

  return (
    <div className="container mx-auto max-w-7xl p-4 md:p-8">
      <h1 className="mb-4 text-center font-headline text-4xl font-bold">Creator Studio</h1>
      <p className="mb-8 text-center text-muted-foreground">
        Your AI-powered toolkit for content creation and optimization.
      </p>

      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text"><FileText className="mr-2 h-4 w-4" />Text Content</TabsTrigger>
          <TabsTrigger value="media"><ImageIcon className="mr-2 h-4 w-4" />Media Content</TabsTrigger>
        </TabsList>

        <TabsContent value="text">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Generate Viral Content Ideas</CardTitle>
              <CardDescription>Input a topic and let our AI generate engaging content for you.</CardDescription>
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
                              {platforms.map((p) => {
                                const Icon = p.icon;
                                return (
                                  <SelectItem key={p.value} value={p.value}>
                                    <span className="inline-flex items-center gap-2">
                                      <Icon className="h-4 w-4" /><span>{p.label}</span>
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
              <CardDescription>Upload an image or video to get AI-generated titles, descriptions, and more.</CardDescription>
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
                            <Upload className="mx-auto h-12 w-12" />
                            <p className="mt-2">Click to upload or drag and drop</p>
                            <p className="text-xs">Image or Video</p>
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
                      {preview.startsWith('data:image') && <Image src={preview} alt="Preview" width={300} height={200} className="mt-2 rounded-lg border" />}
                      {preview.startsWith('data:video') && <video src={preview} controls width="300" className="mt-2 rounded-lg border" />}
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
