import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getProfileByUserId, upsertProfile, recomputeProfileCompleteness } from '@/lib/profile';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const profile = await getProfileByUserId(session.user.id);
  return NextResponse.json({ profile });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const json = await request.json().catch(()=> ({}));
  try {
    await upsertProfile(session.user.id, json);
    // Recompute + persist completeness server-side for consistency
    await recomputeProfileCompleteness(session.user.id);
    const profile = await getProfileByUserId(session.user.id);
    return NextResponse.json({ profile });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Invalid data';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
