"use client";
import { signIn, signOut } from 'next-auth/react';
import type { Session } from 'next-auth';

export default function SignInOut({ session }: { session: Session | null }) {
  return session?.user ? (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[var(--color-text-secondary)] max-w-[12ch] truncate" title={session.user.name || session.user.email || ''}>{session.user.name || session.user.email}</span>
      <button onClick={() => signOut()} className="btn-secondary text-xs">Sign out</button>
    </div>
  ) : (
    <div className="flex items-center gap-1">
      <button onClick={() => signIn('google')} className="btn-primary text-xs">Google</button>
      <button onClick={() => signIn('linkedin')} className="btn-secondary text-xs">LinkedIn</button>
    </div>
  );
}
