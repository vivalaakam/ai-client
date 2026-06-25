import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Badge.module.scss';

type BadgeTone = 'queued' | 'parsing' | 'translating' | 'assembling' | 'completed' | 'failed';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: BadgeTone;
}

export function Badge({ children, className, tone, ...props }: BadgeProps) {
  return (
    <span
      className={[styles.badge, tone ? styles[tone] : '', className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </span>
  );
}
