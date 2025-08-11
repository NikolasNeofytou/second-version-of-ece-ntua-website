import React from 'react';

interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function SectionHeading({ title, description, action, className='', ...rest }: SectionHeadingProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`} {...rest}>
      <div className="flex items-start gap-4 flex-wrap">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {action && <div className="ml-auto">{action}</div>}
      </div>
      {description && <p className="text-sm text-[var(--color-text-secondary)] max-w-prose">{description}</p>}
    </div>
  );
}
