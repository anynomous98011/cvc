'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/components/session-provider';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [particles, setParticles] = useState<number[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, refreshSession } = useSession();

  useEffect(() => {
    if (user) {
      router.push(searchParams.get('redirect') || '/');
    }
  }, [user, router, searchParams]);

  useEffect(() => {
    // Generate particles for animation
    const newParticles = Array.from({ length: 50 }, () => Math.random() * 100);
    setParticles(newParticles);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast({
          title: "Login Failed",
          description: error.error || 'Invalid credentials',
          variant: "destructive",
        });
        return;
      }

      await refreshSession();
      router.push(searchParams.get('redirect') || '/');
      toast({
        title: "Login successful!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `/api/auth/google?redirect=${searchParams.get('redirect') || '/'}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Particles */}
      <AnimatePresence>
        {particles.map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </AnimatePresence>

      <div className="absolute inset-0 bg-black/20" />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-24 h-screen flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <Card className="w-[400px] bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader className="text-center space-y-2">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                  <Lock className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              <CardTitle className="text-3xl bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-300">
                Sign in to your account to continue to Rachna Rivo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gradient-to-r from-purple-900 px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button 
                type="button"
                variant="outline"
                className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10"
                onClick={handleGoogleLogin}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23.99-3.71.99-2.85 0-5.27-1.93-6.13-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.88 14.29c-.28-.78-.43-1.57-.43-2.39s.15-1.61.43-2.39l-0.01-.03L2.18 7.07C1.36 8.5 1 10.09 1 11.75s.36 3.25 1.18 4.68l3.7-2.84z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.44c1.48 0 2.8.51 3.85 1.38L17.96 4c-1.82-1.67-4.3-2.69-7.05-2.69-2.3 0-4.45.74-6.18 2.02l3.7 2.84c.86-.91 1.95-1.44 3.23-1.44z"
                  />
                </svg>
                Continue with Google
              </Button>

              <p className="text-center text-sm text-gray-400">
                Don&apos;t have an account?{' '}
                <a href="/signup" className="text-pink-400 hover:text-pink-300 font-medium">
                  Sign up
                </a>
              </p>
              <p className="text-center text-xs text-gray-400">
                By continuing, you agree to our <a href="/privacy-policy" className="underline">Privacy Policy</a>.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

