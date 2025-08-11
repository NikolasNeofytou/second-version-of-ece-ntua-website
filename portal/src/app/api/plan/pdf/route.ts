import { NextRequest } from 'next/server';
// pdf-lib added as dependency; ensure install after adding.
import { PDFDocument, StandardFonts } from 'pdf-lib';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
  // Using broad typing; refine with shared interfaces if promoted.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { evaluation, courses } = body as { evaluation: any; courses: any[] };
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    let page = pdf.addPage([595, 842]); // A4
    const fontSize = 10;
    let y = 820;
    function line(txt: string) {
      page.drawText(txt, { x: 40, y, size: fontSize, font });
      y -= 14;
      if (y < 60) { y = 820; page = pdf.addPage([595,842]); }
    }
    line('Integrated Master Degree Plan');
    line('');
    line(`Total: ${evaluation.totalCredits} / Core: ${evaluation.coreCredits} / Elective: ${evaluation.electiveCredits}`);
    if (evaluation.trackId) line(`Track: ${evaluation.trackId} (${evaluation.trackCredits} credits)`);
    line('');
    line('Courses:');
    for (const code of evaluation.selectedCodes) {
      const c = courses.find(c=>c.code===code);
      if (!c) continue;
      line(`${c.code}  ${c.title}  (${c.credits} ECTS, Sem ${c.semester})`);
    }
    line('');
    line('Issues:');
    if (!evaluation.issues.length) line('None (all requirements satisfied).');
    else for (const iss of evaluation.issues) line(`- ${iss.message}`);
    const bytes = await pdf.save();
    return new Response(Buffer.from(bytes), { status: 200, headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="degree-plan.pdf"' }});
  } catch {
    return new Response('Failed to generate PDF', { status: 400 });
  }
}
