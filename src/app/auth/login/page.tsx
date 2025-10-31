"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ email, password, rememberMe }) 
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-1 block w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="mt-1 block w-full rounded-md border px-3 py-2" />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="remember-me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <a href="/auth/password-reset" className="text-primary hover:text-primary/80">
            Forgot your password?
          </a>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}
        <div>
          <button disabled={loading} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-white">{loading ? 'Signing in...' : 'Sign in'}</button>
        </div>
      </form>
    </div>
  );
}
