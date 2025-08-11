import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function validateUsername(u: string) {
  return /^[a-zA-Z0-9_]{3,30}$/.test(u);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { username } = await request.json().catch(()=> ({}));
  const raw = typeof username === 'string' ? username.trim().toLowerCase() : '';
  if (!validateUsername(raw)) {
    return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
  }
  // Ensure user not already onboarded
  const existingUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!existingUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if ((existingUser as any).onboardingCompleted) return NextResponse.json({ error: 'Already completed' }, { status: 400 });
  const taken = await prisma.user.findFirst({ where: { username: raw } } as any);
  if (taken) return NextResponse.json({ error: 'Username taken' }, { status: 400 });
  await prisma.user.update({ where: { id: session.user.id }, data: { username: raw, onboardingCompleted: true } as any });
  // Optionally set initial completeness here later
  return NextResponse.json({ ok: true });
}
