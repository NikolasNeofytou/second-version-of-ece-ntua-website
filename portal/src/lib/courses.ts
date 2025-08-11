import { prisma } from './prisma';
// Fallback shape until prisma client regenerated.
type PrismaCourse = {
  id: string; code: string; title: string; credits: number; semester: number; type: string;
  prerequisites: string; instructors: string; description: string; outcomes: string;
};

/* eslint-disable @typescript-eslint/no-explicit-any */ // Temporary until prisma generate adds strong types

export interface CreateCourseInput {
  code: string;
  title: string;
  credits: number;
  semester: number;
  type: 'CORE' | 'ELECTIVE';
  prerequisites?: string[];
  instructors?: string[];
  description: string;
  outcomes?: string[];
}

function arrToCsv(arr?: string[]) { return (arr && arr.length) ? arr.join(',') : ''; }
function arrToMultiline(arr?: string[]) { return (arr && arr.length) ? arr.join('\n') : ''; }
function csvToArr(csv: string) { return csv ? csv.split(',').map(s=>s.trim()).filter(Boolean) : []; }
function multilineToArr(text: string) { return text ? text.split('\n').map(s=>s.trim()).filter(Boolean) : []; }

export async function listCourses() {
  // After running prisma generate, prisma.course will be available.
  const client: any = prisma as any;
  const rows: PrismaCourse[] = await client.course.findMany({ orderBy: [{ semester: 'asc' }, { code: 'asc' }] });
  return rows.map((r: PrismaCourse) => ({
    id: r.id,
    code: r.code,
    title: r.title,
    credits: r.credits,
    semester: r.semester,
    type: r.type as 'CORE' | 'ELECTIVE',
    prerequisites: csvToArr(r.prerequisites),
    instructors: csvToArr(r.instructors),
    description: r.description,
    outcomes: multilineToArr(r.outcomes)
  }));
}

export async function getCourseByCode(code: string) {
  const client: any = prisma as any;
  const r: PrismaCourse | null = await client.course.findUnique({ where: { code } });
  if (!r) return null;
  return {
    id: r.id,
    code: r.code,
    title: r.title,
    credits: r.credits,
    semester: r.semester,
    type: r.type as 'CORE' | 'ELECTIVE',
    prerequisites: csvToArr(r.prerequisites),
    instructors: csvToArr(r.instructors),
    description: r.description,
    outcomes: multilineToArr(r.outcomes)
  };
}

export async function createCourse(input: CreateCourseInput) {
  const client: any = prisma as any;
  return client.course.create({
    data: {
      code: input.code,
      title: input.title,
      credits: input.credits,
      semester: input.semester,
      type: input.type,
      prerequisites: arrToCsv(input.prerequisites),
      instructors: arrToCsv(input.instructors),
      description: input.description,
      outcomes: arrToMultiline(input.outcomes)
    }
  });
}

export async function ensureSeedCourses(seed: CreateCourseInput[]) {
  for (const c of seed) {
  const client: any = prisma as any;
  await client.course.upsert({
      where: { code: c.code },
      update: {
        title: c.title,
        credits: c.credits,
        semester: c.semester,
        type: c.type,
        prerequisites: arrToCsv(c.prerequisites),
        instructors: arrToCsv(c.instructors),
        description: c.description,
        outcomes: arrToMultiline(c.outcomes)
      },
      create: {
        code: c.code,
        title: c.title,
        credits: c.credits,
        semester: c.semester,
        type: c.type,
        prerequisites: arrToCsv(c.prerequisites),
        instructors: arrToCsv(c.instructors),
        description: c.description,
        outcomes: arrToMultiline(c.outcomes)
      }
    });
  }
}
