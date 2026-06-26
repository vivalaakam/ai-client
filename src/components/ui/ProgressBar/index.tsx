import { Progress } from 'antd';

interface ProgressBarProps {
  value: number;
  tone?: 'default' | 'completed' | 'failed';
  className?: string;
}

export function ProgressBar({ value, tone = 'default', className }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, value));
  const status = tone === 'failed' ? 'exception' : tone === 'completed' ? 'success' : 'active';

  return <Progress className={className} percent={percent} showInfo={false} status={status} />;
}
