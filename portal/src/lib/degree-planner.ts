// Degree planner utilities & placeholder regulations for the Integrated Master.
// NOTE: Replace placeholder numbers & track course lists with official regulation data.

export interface PlannerCourse {
  code: string;
  title: string;
  credits: number;
  semester: number;
  type: 'CORE' | 'ELECTIVE';
  prerequisites: string[];
}

export interface TrackDefinition {
  id: string;
  name: string;
  requiredCredits: number; // credits within the track
  courses: string[]; // course codes belonging to track (extend as needed)
}

export interface DegreeRules {
  totalCreditsRequired: number; // e.g. 300 for 5-year integrated master
  coreCreditsRequired: number;  // e.g. sum of mandatory core credits
  electiveCreditsRequired: number; // base elective requirement (not including track)
  maxCreditsPerSemester?: number; // advisory constraint
  maxSemesters?: number; // normal duration (e.g. 10)
  tracks: TrackDefinition[]; // available specialization tracks
}

export const DEGREE_RULES: DegreeRules = {
  totalCreditsRequired: 300,
  coreCreditsRequired: 180,
  electiveCreditsRequired: 60,
  maxCreditsPerSemester: 45,
  maxSemesters: 10,
  tracks: [
    { id: 'telecom', name: 'Telecommunications', requiredCredits: 30, courses: [] },
    { id: 'power', name: 'Power Systems', requiredCredits: 30, courses: [] },
    { id: 'cs', name: 'Computer Science', requiredCredits: 30, courses: [] }
  ]
};

export interface PlanEvaluationIssue {
  type: 'MISSING_CORE' | 'MISSING_TOTAL' | 'MISSING_ELECTIVES' | 'MISSING_TRACK' | 'PREREQ' | 'OVERLOAD_SEMESTER';
  message: string;
  detail?: string;
  courseCode?: string;
  semester?: number;
}

export interface PlanEvaluation {
  selectedCodes: string[];
  totalCredits: number;
  coreCredits: number;
  electiveCredits: number;
  trackCredits: number;
  trackId?: string;
  missingCores: string[];
  issues: PlanEvaluationIssue[];
  meetsAll: boolean;
  perSemesterCredits: Record<number, number>;
}

export function evaluatePlan(params: {
  selectedCodes: string[];
  courses: PlannerCourse[];
  rules: DegreeRules;
  trackId?: string;
}): PlanEvaluation {
  const { selectedCodes, courses, rules, trackId } = params;
  const selected = courses.filter(c => selectedCodes.includes(c.code));
  const perSemesterCredits: Record<number, number> = {};
  let coreCredits = 0, electiveCredits = 0;
  for (const c of selected) {
    perSemesterCredits[c.semester] = (perSemesterCredits[c.semester] || 0) + c.credits;
    if (c.type === 'CORE') coreCredits += c.credits; else electiveCredits += c.credits;
  }
  const totalCredits = coreCredits + electiveCredits;

  // Track credit accumulation
  const track = rules.tracks.find(t => t.id === trackId);
  const trackSet = new Set(track?.courses || []);
  let trackCredits = 0;
  if (track) {
    for (const c of selected) if (trackSet.has(c.code)) trackCredits += c.credits;
  }

  // Identify cores missing (any core not selected)
  const missingCores = courses.filter(c => c.type === 'CORE' && !selectedCodes.includes(c.code)).map(c => c.code);

  const issues: PlanEvaluationIssue[] = [];
  if (coreCredits < rules.coreCreditsRequired) {
    issues.push({ type: 'MISSING_CORE', message: `Core credits below requirement (${coreCredits}/${rules.coreCreditsRequired}).` });
  }
  if (electiveCredits < rules.electiveCreditsRequired) {
    issues.push({ type: 'MISSING_ELECTIVES', message: `Elective credits below requirement (${electiveCredits}/${rules.electiveCreditsRequired}).` });
  }
  if (totalCredits < rules.totalCreditsRequired) {
    issues.push({ type: 'MISSING_TOTAL', message: `Total credits below requirement (${totalCredits}/${rules.totalCreditsRequired}).` });
  }
  if (track) {
    if (trackCredits < track.requiredCredits) {
      issues.push({ type: 'MISSING_TRACK', message: `Track ${track.name} credits below requirement (${trackCredits}/${track.requiredCredits}).` });
    }
  }
  // Prerequisites
  for (const c of selected) {
    for (const pre of c.prerequisites) {
      if (!selectedCodes.includes(pre)) {
        issues.push({ type: 'PREREQ', message: `Missing prerequisite ${pre} for ${c.code}.`, courseCode: c.code });
      }
    }
  }
  // Semester overload check
  if (rules.maxCreditsPerSemester) {
    for (const [semStr, creds] of Object.entries(perSemesterCredits)) {
      if (creds > rules.maxCreditsPerSemester) {
        issues.push({ type: 'OVERLOAD_SEMESTER', message: `Semester ${semStr} credit load ${creds} exceeds advisory max ${rules.maxCreditsPerSemester}.`, semester: Number(semStr) });
      }
    }
  }

  return {
    selectedCodes: [...selectedCodes],
    totalCredits,
    coreCredits,
    electiveCredits,
    trackCredits,
    trackId,
    missingCores,
    issues,
    meetsAll: issues.length === 0,
    perSemesterCredits
  };
}

export function planToCSV(evalResult: PlanEvaluation, courses: PlannerCourse[]): string {
  const header = ['Code','Title','Credits','Semester','Type'];
  const rows = evalResult.selectedCodes.map(code => {
    const c = courses.find(x=>x.code===code)!;
    return [c.code, c.title, c.credits, c.semester, c.type];
  });
  return [header, ...rows].map(r=> r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
}

export function planSummaryJSON(evalResult: PlanEvaluation) {
  return JSON.stringify(evalResult, null, 2);
}
