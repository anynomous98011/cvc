'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast({
          title: "Request Failed",
          description: error.error || 'Could not process your request.',
          variant: "destructive",
        });
        return;
      }

      setSuccess(true);
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

  return (
    <div className="min-h-screen bg-black relative flex items-center justify-center overflow-hidden py-12 px-4">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[100px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[420px] z-10"
      >
        <Card className="bg-black/40 backdrop-blur-2xl border-white/10 shadow-[0_0_40px_rgba(99,102,241,0.15)] relative overflow-hidden group">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 pointer-events-none" />
          
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
                Reset Password
              </CardTitle>
              <CardDescription className="text-zinc-400 text-sm">
                Enter your email and we&apos;ll send you a link to reset your password.
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center space-y-4 py-4"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-center text-zinc-300">
                  If an account exists with <span className="text-white font-medium">{email}</span>, you will receive a password reset link shortly.
                </p>
                <Link href="/login" className="w-full mt-4">
                  <Button className="w-full bg-white text-black hover:bg-zinc-200">
                    Return to Login
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-300 text-xs uppercase tracking-wider font-semibold">
                    Email Address
                  </Label>
                  <div className="relative group/input">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4 transition-colors group-focus-within/input:text-indigo-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder-zinc-500 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/50 transition-all h-11"
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-white text-black hover:bg-zinc-200 transition-colors font-medium relative overflow-hidden" 
                  disabled={loading || !email}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
                
                <div className="text-center">
                  <Link href="/login" className="inline-flex items-center text-sm text-zinc-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
