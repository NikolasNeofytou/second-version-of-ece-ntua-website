import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { closeSignal } from '@/lib/partners';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response(JSON.stringify({ ok:false, error: 'unauthorized' }), { status: 401 });
  try {
    const updated = await closeSignal(p.id, session.user.id);
    return Response.json({ ok: true, updated });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'error';
    return new Response(JSON.stringify({ ok:false, error: msg }), { status: 400 });
  }
}
