import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });
  const body = await req.json();
  try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client: any = prisma as any; // temporary until prisma generate
  await client.profile.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, degreePlanJson: JSON.stringify(body) },
      update: { degreePlanJson: JSON.stringify(body) }
    });
    return new Response('OK');
  } catch {
    return new Response('Error', { status: 500 });
  }
}
