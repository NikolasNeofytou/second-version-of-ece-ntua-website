"use client";
import { signIn } from 'next-auth/react';
import { useState } from 'react';

export function SignInButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (loading) return;
    setLoading(true); setError(null);
    try {
      const res = await signIn('google', { callbackUrl: '/', redirect: false });
      if (res?.error) {
        setError('Sign in failed. Try a different account.');
        setLoading(false);
      } else if (res?.url) {
        window.location.href = res.url; // manual redirect
      } else {
        setError('Unexpected response.');
        setLoading(false);
      }
  } catch {
      setError('Network error.');
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className="btn-primary w-full text-xs disabled:opacity-60"
        aria-busy={loading}
        aria-live="polite"
      >
        {loading ? 'Signing in…' : 'Continue with Google'}
      </button>
      {error && <p className="text-[10px] text-[var(--color-error)]" role="alert">{error}</p>}
    </div>
  );
}
