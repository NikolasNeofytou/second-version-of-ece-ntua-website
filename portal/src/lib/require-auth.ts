import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { redirect } from 'next/navigation';

export async function requireAuth(callbackUrl: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return session;
}
