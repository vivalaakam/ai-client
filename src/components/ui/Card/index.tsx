import { Card as AntCard } from 'antd';
import type { CardProps as AntCardProps } from 'antd';
import type { ReactNode } from 'react';

interface CardProps extends AntCardProps {
  children: ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <AntCard className={className} {...props}>
      {children}
    </AntCard>
  );
}
