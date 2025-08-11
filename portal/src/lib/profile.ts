import { prisma } from './prisma';
import { z } from 'zod';

export const profileUpdateSchema = z.object({
  year: z.number().int().min(1).max(10).optional(),
  bio: z.string().max(500).optional(),
  interests: z.array(z.string().min(1).max(40)).max(20).optional(),
  skills: z.array(z.string().min(1).max(40)).max(30).optional(),
  visibility: z.enum(['PUBLIC','STUDENTS','PRIVATE']).optional()
});
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

function join(arr?: string[]) { return (arr && arr.length) ? arr.join(',') : ''; }
function split(raw?: string | null): string[] { return raw? raw.split(',').map(s=>s.trim()).filter(Boolean): []; }

export function serializeProfileUpdate(data: ProfileUpdateInput) {
  return {
    year: data.year ?? undefined,
    bio: data.bio ?? undefined,
    interestsRaw: data.interests? join(data.interests): undefined,
    skillsRaw: data.skills? join(data.skills): undefined,
    visibility: data.visibility ?? undefined
  };
}

export interface RawProfileShape { interestsRaw: string; skillsRaw: string; visibility?: string | null; year?: number | null; bio?: string | null; completeness?: number | null; [k: string]: unknown }

export function presentProfile(p: RawProfileShape) {
  return {
    ...p,
    interests: split(p.interestsRaw),
    skills: split(p.skillsRaw),
    completeness: p.completeness ?? 0
  };
}

export async function getProfileByUserId(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) return null;
  return presentProfile(profile);
}

export async function upsertProfile(userId: string, data: ProfileUpdateInput) {
  const parsed = profileUpdateSchema.parse(data);
  const serialized = serializeProfileUpdate(parsed);
  const profile = await prisma.profile.upsert({
    where: { userId },
    create: { userId, ...serialized },
    update: serialized
  });
  return presentProfile(profile);
}

export function computeProfileCompleteness(input: { username?: string | null; year?: number | null; bio?: string | null; interests?: string[]; skills?: string[] }) {
  let score = 0;
  const checks: Array<[boolean]> = [
    [!!input.username],
    [!!input.year],
    [!!(input.bio && input.bio.trim())],
    [!!(input.interests && input.interests.length)],
    [!!(input.skills && input.skills.length)]
  ];
  for (const [ok] of checks) if (ok) score++;
  return Math.round((score / checks.length) * 100);
}

export async function recomputeProfileCompleteness(userId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } }) as any;
    if (!user || !user.profile) return null;
    const p = user.profile as any;
    let score = 0;
    if (user.username) score++;
    if (p.year) score++;
    if (p.bio && typeof p.bio === 'string' && p.bio.trim()) score++;
    if (p.interestsRaw && typeof p.interestsRaw === 'string' && p.interestsRaw.trim()) score++;
    if (p.skillsRaw && typeof p.skillsRaw === 'string' && p.skillsRaw.trim()) score++;
    const value = Math.round((score / 5) * 100);
    if (p.completeness !== value) {
      await prisma.profile.update({ where: { userId }, data: { completeness: value as any } } as any);
    }
    return value;
  } catch {
    return null;
  }
}
