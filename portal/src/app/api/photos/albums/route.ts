import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listAlbums } from '@/lib/google-photos';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const pageToken = searchParams.get('pageToken') ?? undefined;
  try {
    const data = await listAlbums((session.user as { id: string }).id, 50, pageToken);
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch albums';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
