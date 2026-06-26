import { Empty } from 'antd';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, className }: EmptyStateProps) {
  return (
    <Empty
      className={className}
      description={
        <span>
          {icon && <span className="empty-icon">{icon}</span>}
          {title}
          {description && <span className="empty-description">{description}</span>}
        </span>
      }
    />
  );
}
