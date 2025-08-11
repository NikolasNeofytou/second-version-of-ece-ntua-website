import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Simple availability check (unauthenticated allowed so user can see immediately after sign-in redirect)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const u = (searchParams.get('u') || '').trim().toLowerCase();
  if (!u || u.length < 3) return NextResponse.json({ available: false });
  const valid = /^[a-zA-Z0-9_]{3,30}$/.test(u);
  if (!valid) return NextResponse.json({ available: false });
  const existing = await prisma.user.findUnique({ where: { username: u } });
  return NextResponse.json({ available: !existing });
}
