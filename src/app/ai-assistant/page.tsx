'use client';
import { useRouter } from 'next/navigation';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getImprovements, type GetImprovementsState } from '@/lib/actions';
import { useActionState, useEffect, useRef, useState, startTransition } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
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
import { Loader2, Sparkles, Bot } from 'lucide-react';

// Auth check component
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

const platforms = ['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook', 'Blog'];
const styles = ['Humorous', 'Educational', 'Inspirational', 'Vlog', 'Review', 'News'];

const assistantSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters'),
  platform: z.string().min(1, 'Please select a platform'),
  style: z.string().min(1, 'Please select a style'),
});

type FormData = z.infer<typeof assistantSchema>;

interface Message {
    id: number;
    type: 'user' | 'ai' | 'form' | 'ai-thinking';
    content: React.ReactNode;
}

export default function AiAssistantPage() {
  return (
    <AuthWrapper>
      <AiAssistantContent />
    </AuthWrapper>
  );
}

function AiAssistantContent() {
  const [state, formAction, isPending] = useActionState(getImprovements, { status: 'idle' });
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, type: 'ai', content: "I'm here to help you brainstorm! What's your content idea?" },
    { id: 2, type: 'form', content: null }
  ]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);


  const form: UseFormReturn<FormData> = useForm<FormData>({
    resolver: zodResolver(assistantSchema),
    defaultValues: { topic: '', platform: '', style: '' },
  });


  const onSubmit = (data: FormData) => {
    const formData = new FormData();
    formData.append('topic', data.topic);
    formData.append('platform', data.platform);
    formData.append('style', data.style);

    const userMessage = `My idea is about "${data.topic}" for ${data.platform} in a ${data.style} style.`;
    setMessages(prev => [
        ...prev.filter(m => m.type !== 'form' && m.type !== 'ai-thinking'),
        { id: Date.now(), type: 'user', content: userMessage },
        { id: Date.now() + 1, type: 'ai-thinking', content: "Thinking of some great ideas..." }
    ]);
    startTransition(() => {
        formAction(formData);
    });
  };
  
  useEffect(() => {
    if (state.status === 'success' && state.data) {
        setMessages(prev => [
            ...prev.filter(m => m.type !== 'ai-thinking'),
            { id: Date.now(), type: 'ai', content: (
              <div>
                <p className="font-bold mb-2">Here are some suggestions to improve your idea:</p>
                <ul className="list-inside list-disc space-y-2">
                  {state.data?.improvements.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )},
            { id: Date.now() + 1, type: 'form', content: null }
        ]);
        form.reset();
    }
    if (state.status === 'error') {
       setMessages(prev => [
            ...prev.filter(m => m.type !== 'ai-thinking'),
             { id: Date.now(), type: 'ai', content: <p className="text-destructive">{state.error}</p> },
            { id: Date.now() + 1, type: 'form', content: null }
       ]);
    }
  }, [state, form]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
       <div className="container mx-auto max-w-3xl px-4 py-8 text-center md:p-8">
            <h1 className="mb-4 font-headline text-4xl font-bold">AI Assistant</h1>
            <p className="mb-8 text-muted-foreground">
            Refine your content ideas with actionable feedback from our AI.
            </p>
        </div>
      <div
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto"
      >
        <div className="container mx-auto max-w-3xl space-y-6 px-4 pb-8 md:p-8">
          {messages.map((message) => {
            if (message.type === 'ai' || message.type === 'ai-thinking') {
                return (
                    <div key={message.id} className="flex items-start gap-4">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Bot className="h-6 w-6" />
                        </div>
                        <div className="w-full rounded-lg bg-muted p-4">
                          {message.type === 'ai-thinking' ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>{message.content}</span>
                            </div>
                          ) : message.content}
                        </div>
                    </div>
                );
            }
            if (message.type === 'user') {
                return (
                     <div key={message.id} className="flex items-start justify-end gap-4">
                        <div className="max-w-[80%] rounded-lg bg-primary p-4 text-primary-foreground">
                            {message.content}
                        </div>
                    </div>
                )
            }
             if (message.type === 'form') {
                return (
                     <div key={message.id} className="ml-0 md:ml-14">
                        <Form {...form}>
                            <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                            >
                            <FormField
                                control={form.control}
                                name="topic"
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                    <Input placeholder="What's the topic?" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <FormField
                                control={form.control}
                                name="platform"
                                render={({ field }) => (
                                    <FormItem>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Platform" />
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
                                <FormField
                                control={form.control}
                                name="style"
                                render={({ field }) => (
                                    <FormItem>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Style" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        {styles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </div>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                <Sparkles className="mr-2 h-4 w-4" />
                                )}
                                Get Suggestions
                            </Button>
                            </form>
                        </Form>
                     </div>
                )
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}
