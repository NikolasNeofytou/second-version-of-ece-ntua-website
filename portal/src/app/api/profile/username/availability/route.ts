import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeUsername, validateUsernameFormat } from '@/lib/username';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = (searchParams.get('u') || '').trim();
  const normalized = normalizeUsername(raw);
  const validation = validateUsernameFormat(normalized);
  if (!validation.ok) {
    return NextResponse.json({ available: false, error: { code: validation.code, message: validation.message } });
  }
  const rows = await prisma.$queryRaw<{ one: number }[]>`SELECT 1 as one FROM User WHERE username = ${normalized} LIMIT 1`;
  return NextResponse.json({ available: rows.length === 0 });
}
