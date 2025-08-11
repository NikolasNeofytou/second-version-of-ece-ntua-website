"use client";
import { useState, useMemo } from 'react';
import type { CalendarEvent } from '../../lib/calendar';
import { buildCalendarMatrix, groupByDate, distinctCategories } from '../../lib/calendar';

interface Props { events: CalendarEvent[]; }

export function ClientCalendar({ events }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getUTCFullYear());
  const [month, setMonth] = useState(now.getUTCMonth()); // 0-based
  const [category, setCategory] = useState('');

  const categories = distinctCategories(events);

  const filtered = category ? events.filter(e=> e.category === category) : events;
  const byDate = useMemo(()=> groupByDate(filtered), [filtered]);
  const matrix = useMemo(()=> buildCalendarMatrix(year, month), [year, month]);
  const todayIso = now.toISOString().slice(0,10);
  const toKey = (iso: string)=> iso.replace(/-/g,'');

  function shiftMonths(delta: number) {
    let m = month + delta; let y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setMonth(m); setYear(y);
  }

  function monthLabel(y:number,m:number) {
    return new Date(Date.UTC(y,m,1)).toLocaleString(undefined,{ month:'long', year:'numeric' });
  }

  const categoryClass = (cat: string) => {
    switch (cat) {
      case 'Exam': return 'bg-red-500/15 border-red-500/40 text-red-700 dark:text-red-300';
      case 'Lecture': return 'bg-blue-500/15 border-blue-500/40 text-blue-700 dark:text-blue-300';
      case 'Holiday': return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300';
      case 'Deadline': return 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300';
      case 'Milestone': return 'bg-violet-500/15 border-violet-500/40 text-violet-700 dark:text-violet-300';
      case 'Registration': return 'bg-cyan-500/15 border-cyan-500/40 text-cyan-700 dark:text-cyan-300';
      case 'General':
      default: return 'bg-slate-500/15 border-slate-500/40 text-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <button onClick={()=>shiftMonths(-1)} className="px-2 py-1 rounded border border-[var(--color-border)]">←</button>
          <div className="font-medium">{monthLabel(year, month)}</div>
            <button onClick={()=>shiftMonths(1)} className="px-2 py-1 rounded border border-[var(--color-border)]">→</button>
          <button onClick={()=>{setYear(now.getUTCFullYear()); setMonth(now.getUTCMonth());}} className="ml-2 text-xs underline text-[var(--color-accent)]">Today</button>
        </div>
        <div className="flex items-center gap-2 ml-auto text-xs">
          <label className="text-[var(--color-text-secondary)]">Category:</label>
          <select value={category} onChange={e=>setCategory(e.target.value)} className="px-2 py-1 rounded border bg-[var(--color-surface-alt)] border-[var(--color-border)]">
            <option value="">All</option>
            {categories.map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-7 text-xs font-medium text-[var(--color-text-secondary)]">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=> <div key={d} className="py-1 text-center">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-px bg-[var(--color-border)] rounded overflow-hidden">
        {matrix.flat().map((cell,i)=> {
          if (!cell.iso) return <div key={i} className="h-24 bg-[var(--color-surface-alt)]" />;
          const key = toKey(cell.iso);
          const dayEvents = byDate[key] || [];
          const isToday = cell.iso === todayIso;
          return (
            <div key={i} className={`h-24 flex flex-col p-1.5 bg-[var(--color-surface)] relative ${isToday ? 'ring-2 ring-[var(--color-accent)]' : ''}`}> 
              <div className="text-[10px] font-medium mb-1 text-[var(--color-text-secondary)]">{cell.day}</div>
              <div className="flex flex-col gap-1 overflow-y-auto scrollbar-thin">
                {dayEvents.slice(0,3).map(ev => (
                  <div key={ev.uid} className={`text-[10px] leading-tight rounded px-1 py-0.5 border truncate ${categoryClass(ev.category)}`} title={`${ev.summary} • ${ev.category}`}>{ev.summary}</div>
                ))}
                {dayEvents.length > 3 && <div className="text-[10px] opacity-60">+{dayEvents.length-3} more</div>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Upcoming</h3>
        <ul className="space-y-1 max-h-64 overflow-y-auto pr-1">
          {filtered.filter(e=> e.start >= todayIso.replace(/-/g,'')).slice(0,50).map(ev => {
            const date = `${ev.start.slice(0,4)}-${ev.start.slice(4,6)}-${ev.start.slice(6,8)}`;
            return (
              <li key={ev.uid} className="flex items-start gap-3 text-xs">
                <span className="font-mono text-[var(--color-text-secondary)] w-24">{date}</span>
                <span className="flex-1">{ev.summary}</span>
                <span className={`px-1.5 py-0.5 rounded border text-[10px] leading-none ${categoryClass(ev.category)}`}>{ev.category}</span>
              </li>
            );
          })}
        </ul>
      </div>
      {categories.length > 0 && (
        <div className="pt-2 border-t border-[var(--color-border)]">
          <h3 className="text-xs font-medium mb-2 text-[var(--color-text-secondary)] tracking-wide">Legend</h3>
          <ul className="flex flex-wrap gap-2 text-[10px]">
            {categories.map(c => (
              <li key={c} className={`flex items-center gap-1 px-1.5 py-0.5 rounded border ${categoryClass(c)}`}>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
