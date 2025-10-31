"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function PasswordResetPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      const res = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to request password reset');
      }

      setStatus('success');
      // In production, we'd show a "Check your email" message
      // For demo, we show the reset token
      if (data.resetToken) {
        setError(`Demo mode: Use this token to reset: ${data.resetToken}`);
      }
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-semibold mb-4">Reset Password</h1>
      
      {status === 'success' ? (
        <div className="bg-green-50 p-4 rounded-md text-green-800">
          Check your email for password reset instructions.
          {error && <div className="mt-2 p-2 bg-gray-100 rounded text-sm">{error}</div>}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border px-3 py-2"
            />
          </div>
          
          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}
          
          <Button 
            type="submit"
            disabled={status === 'loading'}
            className="w-full"
          >
            {status === 'loading' ? 'Sending...' : 'Reset Password'}
          </Button>
        </form>
      )}
    </div>
  );
}