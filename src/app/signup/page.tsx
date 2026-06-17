'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useSession } from '@/components/session-provider';
import Image from 'next/image';
import Link from 'next/link';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email').refine((email) => !email.includes('temp') && !email.endsWith('example.com'), 'Use real email'),
  phone: z.string().optional().refine((phone) => !phone || /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, '')), 'Invalid phone'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, refreshSession } = useSession();

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  if (user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      signupSchema.parse(formData);

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        toast({
          title: "Signup Failed",
          description: error.error || 'Something went wrong',
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Account created!",
        description: "Welcome to Rachna Rivo",
      });
      await refreshSession();
      router.push('/');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Something went wrong",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = '/api/auth/google?redirect=/';
  };

  return (
    <div className="min-h-screen bg-black relative flex items-center justify-center overflow-hidden py-12 px-4">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-pink-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-900/20 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[480px] z-10"
      >
        <Card className="bg-black/40 backdrop-blur-2xl border-white/10 shadow-[0_0_40px_rgba(236,72,153,0.15)] relative overflow-hidden group">
          {/* Subtle hover border glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-pink-500/10 via-transparent to-purple-500/10 pointer-events-none" />
          
          <CardHeader className="text-center space-y-4 pb-4 pt-8">
            <motion.div
              whileHover={{ scale: 1.05, rotate: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-2xl p-3 border border-zinc-200 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-transparent" />
              <img src="/image.png" alt="Logo" className="w-full h-full object-contain relative z-10" />
            </motion.div>
            
            <div className="space-y-1">
              <CardTitle className="text-3xl font-bold tracking-tight text-white">
                Create an account
              </CardTitle>
              <CardDescription className="text-zinc-400 text-sm">
                Enter your details below to join Rachna Rivo
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300 text-xs uppercase tracking-wider font-semibold">Full Name</Label>
                  <div className="relative group/input">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4 transition-colors group-focus-within/input:text-pink-400" />
                    <Input
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value })}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder-zinc-500 focus-visible:ring-pink-500/50 focus-visible:border-pink-500/50 transition-all h-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300 text-xs uppercase tracking-wider font-semibold">Phone (Optional)</Label>
                  <div className="relative group/input">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4 transition-colors group-focus-within/input:text-pink-400" />
                    <Input
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value })}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder-zinc-500 focus-visible:ring-pink-500/50 focus-visible:border-pink-500/50 transition-all h-10"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-zinc-300 text-xs uppercase tracking-wider font-semibold">Email</Label>
                <div className="relative group/input">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4 transition-colors group-focus-within/input:text-pink-400" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value })}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder-zinc-500 focus-visible:ring-pink-500/50 focus-visible:border-pink-500/50 transition-all h-10"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300 text-xs uppercase tracking-wider font-semibold">Password</Label>
                  <div className="relative group/input">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4 transition-colors group-focus-within/input:text-pink-400" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value })}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder-zinc-500 focus-visible:ring-pink-500/50 focus-visible:border-pink-500/50 transition-all h-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300 text-xs uppercase tracking-wider font-semibold">Confirm Password</Label>
                  <div className="relative group/input">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4 transition-colors group-focus-within/input:text-pink-400" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value })}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder-zinc-500 focus-visible:ring-pink-500/50 focus-visible:border-pink-500/50 transition-all h-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-white text-black hover:bg-zinc-200 transition-colors font-medium relative overflow-hidden group/btn mt-2" 
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Create Account
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black px-2 text-zinc-500">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignup}
              className="w-full h-11 bg-white/5 hover:bg-white/10 text-white border-white/10 transition-all font-medium flex items-center justify-center gap-2 group/google"
            >
              <svg className="w-5 h-5 transition-transform group-hover/google:scale-110" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  className="fill-[#4285F4]"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  className="fill-[#34A853]"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  className="fill-[#FBBC05]"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  className="fill-[#EA4335]"
                />
              </svg>
              Sign up with Google
            </Button>

            <p className="text-center text-sm text-zinc-400 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-white hover:underline font-medium transition-colors">
                Sign in
              </Link>
            </p>
            <p className="text-center text-xs text-zinc-600">
              By continuing, you agree to our <Link href="/privacy-policy" className="hover:text-zinc-400 underline transition-colors">Privacy Policy</Link>.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
