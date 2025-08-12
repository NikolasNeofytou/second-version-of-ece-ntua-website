import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createSignal, listSignals } from '@/lib/partners';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const courseCode = searchParams.get('courseCode') || undefined;
  const type = (searchParams.get('type') as 'INDIVIDUAL'|'GROUP'|null) || undefined;
  const status = (searchParams.get('status') as 'OPEN'|'CLOSED'|null) || undefined;
  const rows = await listSignals({ courseCode, type, status });
  return Response.json({ ok: true, rows });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response(JSON.stringify({ ok:false, error: 'unauthorized' }), { status: 401 });
  const body = await req.json().catch(()=> ({}));
  const { type, courseCode, project, details, membersNeeded } = body;
  if (!type || !courseCode || !project) return new Response(JSON.stringify({ ok:false, error: 'missing fields' }), { status: 400 });
  const created = await createSignal(session.user.id, { type, courseCode, project, details, membersNeeded });
  return Response.json({ ok: true, created });
}
