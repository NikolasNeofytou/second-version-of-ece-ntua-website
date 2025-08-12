/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from './prisma';

type PrismaSignal = {
  id: string; createdById: string; type: string; courseCode: string; project: string; details: string|null; membersNeeded: number|null; status: string; createdAt: Date; updatedAt: Date;
};

export type SignalType = 'INDIVIDUAL' | 'GROUP';
export type SignalStatus = 'OPEN' | 'CLOSED';

export interface CreateSignalInput {
  type: SignalType;
  courseCode: string;
  project: string;
  details?: string;
  membersNeeded?: number;
}

export async function createSignal(userId: string, input: CreateSignalInput) {
  const client = prisma as unknown as { partnerSignal: { create: (args: any) => Promise<PrismaSignal> } };
  return client.partnerSignal.create({
    data: {
      createdById: userId,
      type: input.type,
      courseCode: input.courseCode,
      project: input.project,
      details: input.details || null,
      membersNeeded: input.type === 'GROUP' ? (input.membersNeeded ?? 1) : null,
      status: 'OPEN'
    }
  }) as Promise<PrismaSignal>;
}

export async function listSignals(params?: { courseCode?: string; type?: SignalType; status?: SignalStatus }) {
  const client = prisma as unknown as { partnerSignal: { findMany: (args: any) => Promise<PrismaSignal[]> } };
  const where: Partial<{ courseCode: string; type: SignalType; status: SignalStatus }> = {};
  if (params?.courseCode) where.courseCode = params.courseCode;
  if (params?.type) where.type = params.type;
  if (params?.status) where.status = params.status;
  const rows: PrismaSignal[] = await client.partnerSignal.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });
  return rows;
}

export async function closeSignal(id: string, userId: string) {
  const client = prisma as unknown as { partnerSignal: { findUnique: (args: any) => Promise<PrismaSignal|null>; update: (args: any) => Promise<PrismaSignal> } };
  const existing: PrismaSignal | null = await client.partnerSignal.findUnique({ where: { id } });
  if (!existing || existing.createdById !== userId) {
    throw new Error('Not found or unauthorized');
  }
  return client.partnerSignal.update({ where: { id }, data: { status: 'CLOSED' } });
}
