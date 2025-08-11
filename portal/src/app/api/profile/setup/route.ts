import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeUsername, validateUsernameFormat } from '@/lib/username';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const raw = typeof body.username === 'string' ? body.username : '';
  const normalized = normalizeUsername(raw);
  const validation = validateUsernameFormat(normalized);
  if (!validation.ok) {
    return NextResponse.json({ error: { code: validation.code, message: validation.message } }, { status: 400 });
  }
  const existingUser = await prisma.$queryRaw<{ id: string; onboardingCompleted: number }[]>`SELECT id, onboardingCompleted FROM User WHERE id = ${session.user.id} LIMIT 1`;
  if (!existingUser.length) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'User not found' } }, { status: 404 });
  if (existingUser[0].onboardingCompleted) {
    return NextResponse.json({ error: { code: 'ALREADY_COMPLETED', message: 'Onboarding already completed' } }, { status: 400 });
  }
  const taken = await prisma.$queryRaw<{ one: number }[]>`SELECT 1 as one FROM User WHERE username = ${normalized} LIMIT 1`;
  if (taken.length) {
    return NextResponse.json({ error: { code: 'USERNAME_TAKEN', message: 'Username already taken' } }, { status: 400 });
  }
  await prisma.$executeRaw`UPDATE User SET username = ${normalized}, onboardingCompleted = 1 WHERE id = ${session.user.id}`;
  return NextResponse.json({ ok: true });
}
