export interface CalendarEvent {
  uid: string;
  start: string; // YYYYMMDDThhmmssZ or YYYYMMDD
  end?: string;
  summary: string;
  date: string; // YYYYMMDD
  category: string;
}

const KEYWORD_CATEGORIES: { match: RegExp; category: string }[] = [
  { match: /exam|midterm|final/i, category: 'Exam' },
  { match: /lecture|class|teaching/i, category: 'Lecture' },
  { match: /holiday|break|vacation/i, category: 'Holiday' },
  { match: /deadline|due/i, category: 'Deadline' },
  { match: /semester begins|semester start/i, category: 'Milestone' },
  { match: /registration|enroll/i, category: 'Registration' }
];

export function categorize(summary: string): string {
  for (const k of KEYWORD_CATEGORIES) if (k.match.test(summary)) return k.category;
  return 'General';
}

export function parseICS(raw: string): CalendarEvent[] {
  const lines = raw.split(/\r?\n/);
  const events: CalendarEvent[] = [];
  let cur: Partial<CalendarEvent> | null = null;
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') cur = {};
    else if (line === 'END:VEVENT' && cur && cur.uid && cur.start && cur.summary) {
      const start = cur.start;
      const date = start.slice(0,8);
      const summary = cur.summary;
      events.push({ uid: cur.uid, start, end: cur.end, summary, date, category: categorize(summary) });
      cur = null;
    } else if (cur) {
      if (line.startsWith('UID:')) cur.uid = line.substring(4).trim();
      if (line.startsWith('DTSTART')) cur.start = line.split(':')[1];
      if (line.startsWith('DTEND')) cur.end = line.split(':')[1];
      if (line.startsWith('SUMMARY:')) cur.summary = line.substring(8).trim();
    }
  }
  return events.sort((a,b)=> a.start.localeCompare(b.start));
}

export function groupByDate(events: CalendarEvent[]) {
  return events.reduce<Record<string, CalendarEvent[]>>((acc,e)=> { (acc[e.date] ||= []).push(e); return acc; }, {});
}

export function buildCalendarMatrix(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1));
  const startDay = first.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month+1, 0)).getUTCDate();
  const cells: { day: number | null; iso: string | null }[] = [];
  for (let i=0;i<startDay;i++) cells.push({ day: null, iso: null });
  for (let d=1; d<=daysInMonth; d++) {
    const iso = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    cells.push({ day: d, iso });
  }
  while (cells.length % 7 !== 0) cells.push({ day: null, iso: null });
  const weeks: typeof cells[] = [];
  for (let i=0;i<cells.length;i+=7) weeks.push(cells.slice(i,i+7));
  return weeks;
}

export function eventsToICS(events: CalendarEvent[], prodId='-//ECE NTUA//Student Portal//EN'): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${prodId}`
  ];
  for (const e of events) {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${e.uid}`);
    lines.push(`DTSTAMP:${e.start}`);
    lines.push(`DTSTART:${e.start}`);
    if (e.end) lines.push(`DTEND:${e.end}`);
    lines.push(`SUMMARY:${e.summary}`);
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function distinctCategories(events: CalendarEvent[]): string[] {
  return Array.from(new Set(events.map(e=>e.category))).sort();
}
