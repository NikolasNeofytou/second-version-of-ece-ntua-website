import { ReactNode } from "react";

interface CardProps {
  title?: string;
  href?: string;
  className?: string;
  children?: ReactNode;
  icon?: ReactNode;
  interactive?: boolean;
}

export default function Card({ title, href, children, className = "", icon, interactive = true }: CardProps) {
  const content = (
    <div className={`card relative h-full flex flex-col gap-2 ${interactive ? 'transition-colors group' : ''} ${className}`}>
      {icon && <div className="text-[var(--color-accent)]">{icon}</div>}
      {title && (
        <h2 className="font-semibold text-base flex items-center gap-2 group-hover:text-[var(--color-accent)] transition-colors">
          {title}
        </h2>
      )}
      {children && <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed flex-1">{children}</div>}
    </div>
  );
  if (href) {
    return (
      <a href={href} className="focus:outline-none focus-visible:ring-2 ring-[var(--color-focus-ring)] rounded-md">
        {content}
      </a>
    );
  }
  return content;
}
