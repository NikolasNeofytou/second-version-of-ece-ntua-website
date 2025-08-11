import { ReactNode } from 'react';

interface TagProps {
  children: ReactNode;
  tone?: 'interest' | 'skill' | 'neutral';
  className?: string;
  seed?: string;          // for deterministic color variant
  icon?: ReactNode;       // optional leading icon
}

const PALETTES: Array<[string,string,string]> = [
  ['#0ea5e9', 'rgba(14,165,233,0.12)', 'rgba(14,165,233,0.35)'],
  ['#6366f1', 'rgba(99,102,241,0.12)', 'rgba(99,102,241,0.35)'],
  ['#8b5cf6', 'rgba(139,92,246,0.12)', 'rgba(139,92,246,0.35)'],
  ['#ec4899', 'rgba(236,72,153,0.12)', 'rgba(236,72,153,0.35)'],
  ['#f59e0b', 'rgba(245,158,11,0.12)', 'rgba(245,158,11,0.35)'],
  ['#10b981', 'rgba(16,185,129,0.12)', 'rgba(16,185,129,0.35)']
];

function hashSeed(seed: string) {
  let h = 0;
  for (let i=0;i<seed.length;i++) h = (h * 131 + seed.charCodeAt(i)) >>> 0;
  return h;
}

export default function Tag({ children, tone='neutral', className='', seed, icon }: TagProps) {
  const base = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide border backdrop-blur-sm select-none';
  if (tone === 'neutral') {
    return <span className={`${base} bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)] border-[var(--color-border)] ${className}`}>{icon}{children}</span>;
  }
  const key = seed || (typeof children === 'string' ? children : 'x');
  const [fg,bg,border] = PALETTES[hashSeed(key) % PALETTES.length];
  return (
    <span className={`${base} ${className}`} style={{ color: fg, background: bg, borderColor: border }}>
      {icon}{children}
    </span>
  );
}
