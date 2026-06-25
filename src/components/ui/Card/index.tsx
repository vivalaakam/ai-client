import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Card.module.scss';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div className={[styles.card, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  );
}
