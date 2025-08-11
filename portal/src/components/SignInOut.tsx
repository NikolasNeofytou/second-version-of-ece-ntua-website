"use client";
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import type { Session } from 'next-auth';

export default function SignInOut({ session }: { session: Session | null }) {
  return session?.user ? (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[var(--color-text-secondary)] max-w-[12ch] truncate" title={session.user.name || session.user.email || ''}>{session.user.name || session.user.email}</span>
      <button onClick={() => signOut()} className="btn-secondary text-xs">Sign out</button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Link href="/auth/signin" className="btn-primary text-xs">Sign in</Link>
    </div>
  );
}
