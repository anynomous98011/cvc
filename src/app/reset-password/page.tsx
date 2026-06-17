'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { toast } = useToast();

  useEffect(() => {
    if (!token) {
      toast({
        title: "Invalid Link",
        description: "Your password reset link is invalid or has expired.",
        variant: "destructive",
      });
      router.push('/login');
    }
  }, [token, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast({
          title: "Reset Failed",
          description: error.error || 'Could not reset password.',
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Password Reset Successful",
        description: "You can now log in with your new password.",
      });
      router.push('/login');
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

  if (!token) return null;

  return (
    <div className="min-h-screen bg-black relative flex items-center justify-center overflow-hidden py-12 px-4">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-emerald-600/20 rounded-full blur-[100px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-teal-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[420px] z-10"
      >
        <Card className="bg-black/40 backdrop-blur-2xl border-white/10 shadow-[0_0_40px_rgba(16,185,129,0.15)] relative overflow-hidden group">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 pointer-events-none" />
          
          <CardHeader className="text-center space-y-4 pb-6 pt-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-2xl p-3 border border-zinc-200 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-transparent" />
              <img src="/image.png" alt="Logo" className="w-full h-full object-contain relative z-10" />
            </motion.div>
            
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold tracking-tight text-white">
                Create New Password
              </CardTitle>
              <CardDescription className="text-zinc-400 text-sm">
                Enter your new password below.
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300 text-xs uppercase tracking-wider font-semibold">
                  New Password
                </Label>
                <div className="relative group/input">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4 transition-colors group-focus-within/input:text-emerald-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder-zinc-500 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 transition-all h-11"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-zinc-300 text-xs uppercase tracking-wider font-semibold">
                  Confirm Password
                </Label>
                <div className="relative group/input">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4 transition-colors group-focus-within/input:text-emerald-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder-zinc-500 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 transition-all h-11"
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-11 bg-white text-black hover:bg-zinc-200 transition-colors font-medium relative overflow-hidden group/btn" 
                disabled={loading || !password || !confirmPassword}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Reset Password
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
