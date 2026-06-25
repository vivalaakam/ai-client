import type { ReactNode } from 'react';
import styles from './EmptyState.module.scss';

interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, className }: EmptyStateProps) {
  return (
    <div className={[styles.emptyState, className].filter(Boolean).join(' ')}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <div>{title}</div>
      {description && <div className={styles.description}>{description}</div>}
    </div>
  );
}
