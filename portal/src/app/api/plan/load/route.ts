import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client: any = prisma as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profile: any = await client.profile.findUnique({ where: { userId: session.user.id } });
  return new Response(profile?.degreePlanJson || 'null', { status: 200, headers: { 'Content-Type': 'application/json' }});
}
