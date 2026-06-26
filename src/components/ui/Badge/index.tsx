import { Tag } from 'antd';
import type { TagProps } from 'antd';
import type { ReactNode } from 'react';

type BadgeTone = 'queued' | 'parsing' | 'translating' | 'assembling' | 'completed' | 'failed';

interface BadgeProps extends TagProps {
  children: ReactNode;
  tone?: BadgeTone;
}

export function Badge({ children, className, tone, ...props }: BadgeProps) {
  const colorByTone: Record<BadgeTone, string> = {
    queued: 'gold',
    parsing: 'purple',
    translating: 'blue',
    assembling: 'cyan',
    completed: 'green',
    failed: 'red',
  };

  return (
    <Tag className={className} color={tone ? colorByTone[tone] : undefined} {...props}>
      {children}
    </Tag>
  );
}
