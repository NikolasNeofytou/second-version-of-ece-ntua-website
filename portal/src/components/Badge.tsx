import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'primary' | 'neutral' | 'accent';
  uppercase?: boolean;
}

export default function Badge({ tone='neutral', className='', uppercase=true, ...rest }: BadgeProps) {
  const base = 'inline-block px-2 py-0.5 rounded-sm text-[10px] tracking-wide font-medium';
  const toneClass = {
    primary: 'bg-[var(--color-primary-soft)] text-[var(--color-text-secondary)]',
    neutral: 'bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)]',
    accent: 'bg-[var(--color-accent)] text-[var(--color-text-inverse)]'
  }[tone];
  return <span className={`${base} ${toneClass} ${uppercase ? 'uppercase' : ''} ${className}`} {...rest} />;
}
