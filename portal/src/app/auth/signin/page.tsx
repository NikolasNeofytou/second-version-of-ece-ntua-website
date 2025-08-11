import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SignInButton } from '@/components/SignInButton';

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    const ob = (session.user as { onboardingCompleted?: boolean }).onboardingCompleted;
    if (ob) redirect('/profile');
    redirect('/profile/setup');
  }
  return (
    <main className="mx-auto max-w-sm mt-24 p-6 rounded-xl bg-[var(--color-bg-elevated)] shadow space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Sign in</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Use Google. If you see an account creation error, clear dev DB or regenerate provider secret.</p>
      </div>
  <SignInButton />
      <p className="text-xs text-[var(--color-text-secondary)]">Need help? <Link href="/" className="underline">Return home</Link></p>
    </main>
  );
}
