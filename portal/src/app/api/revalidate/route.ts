import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  const body = await req.json().catch(()=>({}));
  if (!secret || body.secret !== secret) {
    return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), { status: 401 });
  }
  const path = typeof body.path === 'string' ? body.path : '/courses';
  try {
    revalidatePath(path);
    return Response.json({ ok: true, path });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'error';
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500 });
  }
}

export const runtime = 'node';
