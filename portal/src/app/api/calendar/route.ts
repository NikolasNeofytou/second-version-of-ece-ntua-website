import fs from 'node:fs';
import path from 'node:path';
import { NextRequest } from 'next/server';
import { parseICS, eventsToICS } from '../../../lib/calendar';

// Dynamic ICS feed with optional ?category=CategoryName filtering.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const filterCategory = url.searchParams.get('category');

  const icsPath = path.join(process.cwd(), 'public', 'calendar.ics');
  let raw = '';
  try {
    raw = fs.readFileSync(icsPath, 'utf8');
  } catch {
    return new Response('Calendar source not found', { status: 404 });
  }
  const events = parseICS(raw);
  const filtered = filterCategory ? events.filter(e => e.category === filterCategory) : events;
  const body = eventsToICS(filtered);

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="academic-calendar.ics"',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
