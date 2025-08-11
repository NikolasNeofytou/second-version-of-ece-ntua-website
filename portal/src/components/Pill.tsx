import Link from 'next/link';
import React from 'react';

interface PillProps {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  className?: string;
  'aria-current'?: 'page' | undefined;
}

export default function Pill({ href, children, active, className = '', ...rest }: PillProps) {
  const base = 'px-3 py-1 rounded-full text-xs font-medium border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]';
  const style = active
    ? 'bg-[var(--color-primary)] text-[var(--color-text-inverse)] border-[var(--color-primary-active)]'
    : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]';
  return (
    <Link prefetch={false} href={href} className={`${base} ${style} ${className}`} {...rest}>
      {children}
    </Link>
  );
}
