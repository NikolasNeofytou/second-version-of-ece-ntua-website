"use client";
import { useState, useMemo, useEffect } from 'react';
import type { PlannerCourse, DegreeRules, PlanEvaluation } from '../../lib/degree-planner';
import { DEGREE_RULES, evaluatePlan, planToCSV, planSummaryJSON } from '../../lib/degree-planner';

interface Props { courses: PlannerCourse[]; rules?: DegreeRules }

export function DegreePlanner({ courses, rules = DEGREE_RULES }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [trackId, setTrackId] = useState<string | undefined>();
  const [query, setQuery] = useState('');
  const [semesterFilter, setSemesterFilter] = useState<number | ''>('');
  const [typeFilter, setTypeFilter] = useState('');

  const filtered = useMemo(()=> courses.filter(c => {
    if (query && !(`${c.code} ${c.title}`.toLowerCase().includes(query.toLowerCase()))) return false;
    if (semesterFilter && c.semester !== semesterFilter) return false;
    if (typeFilter && c.type !== typeFilter) return false;
    return true;
  }), [courses, query, semesterFilter, typeFilter]);

  const evaluation: PlanEvaluation = useMemo(()=> evaluatePlan({ selectedCodes: selected, courses, rules, trackId }), [selected, courses, rules, trackId]);

  function toggle(code: string) {
    setSelected(s => s.includes(code) ? s.filter(x=>x!==code) : [...s, code]);
  }

  function selectAllFiltered() { setSelected(prev => Array.from(new Set([...prev, ...filtered.map(c=>c.code)]))); }
  function clearSelection() { setSelected([]); }

  function download(filename: string, content: string, type='text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  async function savePlan() {
    try {
      await fetch('/api/plan/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ selected, trackId }) });
    } catch {}
  }
  async function loadPlan() {
    try {
      const res = await fetch('/api/plan/load');
      if (!res.ok) return;
      const data = await res.json();
      if (data && Array.isArray(data.selected)) {
        setSelected(data.selected);
        setTrackId(data.trackId);
      }
    } catch {}
  }
  useEffect(()=> { loadPlan(); }, []);

  function exportCSV() {
    download('degree-plan.csv', planToCSV(evaluation, courses), 'text/csv');
  }
  function exportJSON() {
    download('degree-plan.json', planSummaryJSON(evaluation), 'application/json');
  }
  async function exportPDF() {
    try {
      const res = await fetch('/api/plan/pdf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ evaluation, courses }) });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'degree-plan.pdf'; a.click();
      URL.revokeObjectURL(url);
    } catch {}
  }


  return (
    <div className="space-y-6">
      <div className="p-4 rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)]/40 space-y-4">
        <h2 className="text-lg font-semibold">Plan Configuration</h2>
        <div className="flex flex-wrap gap-4 items-end text-sm">
          <div className="flex flex-col">
            <label className="text-xs font-medium mb-1 text-[var(--color-text-secondary)]">Search</label>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="code or title" className="px-2 py-1 rounded border bg-[var(--color-surface)] border-[var(--color-border)] text-sm" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium mb-1 text-[var(--color-text-secondary)]">Semester</label>
            <select value={semesterFilter} onChange={e=> setSemesterFilter(e.target.value ? Number(e.target.value) : '')} className="px-2 py-1 rounded border bg-[var(--color-surface)] border-[var(--color-border)] text-sm">
              <option value="">All</option>
              {Array.from(new Set(courses.map(c=>c.semester))).sort((a,b)=>a-b).map(s=> <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1 text-[var(--color-text-secondary)]">Type</label>
              <select value={typeFilter} onChange={e=> setTypeFilter(e.target.value)} className="px-2 py-1 rounded border bg-[var(--color-surface)] border-[var(--color-border)] text-sm">
                <option value="">All</option>
                <option value="CORE">CORE</option>
                <option value="ELECTIVE">ELECTIVE</option>
              </select>
            </div>
            <div className="flex flex-col min-w-[200px]">
              <label className="text-xs font-medium mb-1 text-[var(--color-text-secondary)]">Track</label>
              <select value={trackId || ''} onChange={e=> setTrackId(e.target.value || undefined)} className="px-2 py-1 rounded border bg-[var(--color-surface)] border-[var(--color-border)] text-sm">
                <option value="">(none)</option>
                {rules.tracks.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="flex gap-2 items-center">
              <button onClick={selectAllFiltered} className="px-3 py-1.5 rounded border border-[var(--color-border)] text-xs">Select Page</button>
              <button onClick={clearSelection} className="px-3 py-1.5 rounded border border-[var(--color-border)] text-xs">Clear</button>
            </div>
            <div className="flex gap-2 items-center ml-auto flex-wrap">
              <button onClick={savePlan} className="px-3 py-1.5 rounded border border-[var(--color-border)] text-xs">Save</button>
              <button onClick={loadPlan} className="px-3 py-1.5 rounded border border-[var(--color-border)] text-xs">Reload</button>
              <button onClick={exportCSV} className="px-3 py-1.5 rounded bg-[var(--color-accent)] text-white text-xs">CSV</button>
              <button onClick={exportJSON} className="px-3 py-1.5 rounded border border-[var(--color-accent)] text-[var(--color-accent)] text-xs">JSON</button>
              <button onClick={exportPDF} className="px-3 py-1.5 rounded border border-[var(--color-accent)] text-[var(--color-accent)] text-xs">PDF</button>
            </div>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <div className="overflow-x-auto border rounded-md border-[var(--color-border)]">
            <table className="w-full text-sm min-w-[780px]">
              <thead className="bg-[var(--color-surface-alt)]/50 text-[var(--color-text-secondary)]">
                <tr>
                  <th className="p-2 text-left">Pick</th>
                  <th className="p-2 text-left">Code</th>
                  <th className="p-2 text-left">Title</th>
                  <th className="p-2 text-left">Sem</th>
                  <th className="p-2 text-left">ECTS</th>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Prerequisites</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const sel = selected.includes(c.code);
                  return (
                    <tr key={c.code} className={`border-b border-[var(--color-border)] last:border-0 ${sel ? 'bg-[var(--color-accent-muted)]/15' : ''}`}>
                      <td className="p-2 align-top"><input type="checkbox" checked={sel} onChange={()=>toggle(c.code)} /></td>
                      <td className="p-2 font-mono align-top text-xs">{c.code}</td>
                      <td className="p-2 align-top">{c.title}</td>
                      <td className="p-2 align-top text-xs">{c.semester}</td>
                      <td className="p-2 align-top text-xs">{c.credits}</td>
                      <td className="p-2 align-top text-xs"><span className={`px-2 py-0.5 rounded border text-[10px] ${c.type==='CORE' ? 'border-[var(--color-accent-muted)] bg-[var(--color-accent-muted)]/20' : 'border-[var(--color-border)] bg-[var(--color-surface-alt)]'}`}>{c.type}</span></td>
                      <td className="p-2 align-top text-[10px] text-[var(--color-text-secondary)]">{c.prerequisites.join(', ') || '—'}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="p-6 text-center text-sm text-[var(--color-text-secondary)]">No courses match filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="space-y-4">
          <div className="p-4 rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)]/40 space-y-3">
            <h3 className="font-medium">Progress</h3>
            <ProgressBar label="Total Credits" have={evaluation.totalCredits} need={rules.totalCreditsRequired} />
            <ProgressBar label="Core Credits" have={evaluation.coreCredits} need={rules.coreCreditsRequired} />
            <ProgressBar label="Elective Credits" have={evaluation.electiveCredits} need={rules.electiveCreditsRequired} />
            {trackId && (
              <ProgressBar label="Track Credits" have={evaluation.trackCredits} need={rules.tracks.find(t=>t.id===trackId)?.requiredCredits || 0} />
            )}
            <div className="pt-2 text-[10px] text-[var(--color-text-secondary)] leading-snug">
              Adjust the rules in <code className="font-mono text-[10px]">src/lib/degree-planner.ts</code> to match official regulations.
            </div>
          </div>
          <div className="p-4 rounded border border-[var(--color-border)] space-y-3 bg-[var(--color-surface)]">
            <h3 className="font-medium">Validation</h3>
            {evaluation.issues.length === 0 ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">All current requirements satisfied.</p>
            ) : (
              <ul className="space-y-2 text-xs">
                {evaluation.issues.map((iss,i)=> (
                  <li key={i} className="flex gap-2 items-start">
                    <span className="mt-0.5 w-2 h-2 rounded-full bg-amber-500" />
                    <span>{iss.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="p-4 rounded border border-[var(--color-border)] space-y-3 bg-[var(--color-surface-alt)]/30">
            <h3 className="font-medium">Semester Load</h3>
            <ul className="space-y-1 text-xs">
              {Object.entries(evaluation.perSemesterCredits).sort((a,b)=> Number(a[0])-Number(b[0])).map(([sem,cr]) => (
                <li key={sem} className="flex justify-between"><span>Semester {sem}</span><span className="font-mono">{cr} ECTS</span></li>
              ))}
              {Object.keys(evaluation.perSemesterCredits).length === 0 && <li className="text-[var(--color-text-secondary)]">No courses selected.</li>}
            </ul>
          </div>
          <div className="p-4 rounded border border-[var(--color-border)] space-y-2 text-[10px] leading-snug bg-[var(--color-surface-alt)]/20">
            <p><strong>Disclaimer:</strong> This planner is advisory. Always confirm with official academic regulations before finalizing selections.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ label, have, need }: { label: string; have: number; need: number }) {
  const pct = need === 0 ? 100 : Math.min(100, (have/need)*100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] uppercase tracking-wide text-[var(--color-text-secondary)]"><span>{label}</span><span>{have}/{need}</span></div>
      <div className="h-2 rounded bg-[var(--color-surface-alt)] overflow-hidden">
        <div className={`h-full bg-[var(--color-accent)] transition-all`} style={{ width: pct + '%' }} />
      </div>
    </div>
  );
}
