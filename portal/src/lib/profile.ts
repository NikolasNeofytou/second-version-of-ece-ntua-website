import { prisma } from './prisma';
import { z } from 'zod';

export const profileUpdateSchema = z.object({
  year: z.number().int().min(1).max(10).optional(),
  bio: z.string().max(500).optional(),
  interests: z.array(z.string().min(1).max(40)).max(20).optional(),
  skills: z.array(z.string().min(1).max(40)).max(30).optional(),
  visibility: z.enum(['PUBLIC','STUDENTS','PRIVATE']).optional(),
  avatarUrl: z.string().url().max(500).optional(),
  bannerUrl: z.string().url().max(500).optional(),
  bioVisibility: z.enum(['PUBLIC','STUDENTS','PRIVATE']).optional(),
  interestsVisibility: z.enum(['PUBLIC','STUDENTS','PRIVATE']).optional(),
  skillsVisibility: z.enum(['PUBLIC','STUDENTS','PRIVATE']).optional(),
  yearVisibility: z.enum(['PUBLIC','STUDENTS','PRIVATE']).optional(),
  avatarVisibility: z.enum(['PUBLIC','STUDENTS','PRIVATE']).optional(),
  bannerVisibility: z.enum(['PUBLIC','STUDENTS','PRIVATE']).optional()
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
  visibility: data.visibility ?? undefined,
  avatarUrl: data.avatarUrl ?? undefined,
  bannerUrl: data.bannerUrl ?? undefined,
  bioVisibility: data.bioVisibility ?? undefined,
  interestsVisibility: data.interestsVisibility ?? undefined,
  skillsVisibility: data.skillsVisibility ?? undefined,
  yearVisibility: data.yearVisibility ?? undefined,
  avatarVisibility: data.avatarVisibility ?? undefined,
  bannerVisibility: data.bannerVisibility ?? undefined
  };
}

export interface RawProfileShape { interestsRaw: string; skillsRaw: string; visibility?: string | null; year?: number | null; bio?: string | null; completeness?: number | null; avatarUrl?: string | null; bannerUrl?: string | null; bioVisibility?: string | null; interestsVisibility?: string | null; skillsVisibility?: string | null; yearVisibility?: string | null; avatarVisibility?: string | null; bannerVisibility?: string | null; [k: string]: unknown }

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

export async function getProfileByUsername(username: string) {
  const user = await prisma.user.findUnique({ where: { username }, include: { profile: true } });
  if (!user || !user.profile) return null;
  return { user: { id: user.id, name: user.name, username: user.username }, profile: presentProfile(user.profile as unknown as RawProfileShape) };
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

export function computeProfileCompleteness(input: { username?: string | null; year?: number | null; bio?: string | null; interests?: string[]; skills?: string[]; avatarUrl?: string | null; bannerUrl?: string | null; bioVisibility?: string | null; interestsVisibility?: string | null; skillsVisibility?: string | null; yearVisibility?: string | null; avatarVisibility?: string | null; bannerVisibility?: string | null }) {
  let score = 0; let total = 0;
  function consider(vis: string | null | undefined, present: boolean) {
    if (vis === 'PRIVATE') return; // skip from denominator
    total++;
    if (present) score++;
  }
  consider('PUBLIC', !!input.username); // username global (no field visibility flag stored on profile)
  consider(input.yearVisibility, !!input.year);
  consider(input.bioVisibility, !!(input.bio && input.bio.trim()));
  consider(input.interestsVisibility, !!(input.interests && input.interests.length));
  consider(input.skillsVisibility, !!(input.skills && input.skills.length));
  consider(input.avatarVisibility, !!input.avatarUrl);
  consider(input.bannerVisibility, !!input.bannerUrl);
  if (total === 0) return 0;
  return Math.round((score / total) * 100);
}

export async function recomputeProfileCompleteness(userId: string) {
  try {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
    if (!user || !user.profile) return null;
  const p = user.profile as unknown as RawProfileShape;
    let score = 0; let total = 0;
    function consider(vis: string | null | undefined, present: boolean) {
      if (vis === 'PRIVATE') return; total++; if (present) score++; }
    consider('PUBLIC', !!user.username);
    consider(p.yearVisibility, !!p.year);
    consider(p.bioVisibility, !!(p.bio && typeof p.bio === 'string' && p.bio.trim()));
    consider(p.interestsVisibility, !!(p.interestsRaw && typeof p.interestsRaw === 'string' && p.interestsRaw.trim()));
    consider(p.skillsVisibility, !!(p.skillsRaw && typeof p.skillsRaw === 'string' && p.skillsRaw.trim()));
    consider(p.avatarVisibility, !!p.avatarUrl);
    consider(p.bannerVisibility, !!p.bannerUrl);
    const value = total ? Math.round((score / total) * 100) : 0;
    if (p.completeness !== value) {
      await prisma.profile.update({ where: { userId }, data: { completeness: value } });
    }
    return value;
  } catch {
    return null;
  }
}
