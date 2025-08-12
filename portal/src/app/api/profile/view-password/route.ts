import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { setProfileViewPassword, getProfileViewHint, verifyProfileViewPassword } from '@/lib/profile';

// Set or clear password (owner only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response(JSON.stringify({ ok:false, error:'unauthorized' }), { status: 401 });
  const { password, hint } = await req.json().catch(() => ({}));
  await setProfileViewPassword(session.user.id, typeof password === 'string' ? password : null, typeof hint === 'string' ? hint : null);
  return Response.json({ ok: true });
}

// Verify password for a given userId (returns ok:true if allowed)
export async function PUT(req: NextRequest) {
  const { userId, password } = await req.json().catch(() => ({}));
  if (!userId) return new Response(JSON.stringify({ ok:false, error:'missing userId' }), { status: 400 });
  const ok = await verifyProfileViewPassword(userId, String(password || ''));
  if (ok) {
    const res = NextResponse.json({ ok: true });
    // 6 hours TTL; cookie scoped to public profile routes
    res.cookies.set(`pv_${userId}`, '1', { httpOnly: true, sameSite: 'lax', secure: true, maxAge: 60 * 60 * 6, path: '/' });
    return res;
  }
  return NextResponse.json({ ok: false });
}

// Get hint for a given userId
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return new Response(JSON.stringify({ ok:false, error:'missing userId' }), { status: 400 });
  const hint = await getProfileViewHint(userId);
  return Response.json({ ok:true, hint });
}
