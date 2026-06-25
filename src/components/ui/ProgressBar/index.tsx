import styles from './ProgressBar.module.scss';

interface ProgressBarProps {
  value: number;
  tone?: 'default' | 'completed' | 'failed';
  className?: string;
}

export function ProgressBar({ value, tone = 'default', className }: ProgressBarProps) {
  const width = Math.min(100, Math.max(0, value));

  return (
    <div className={[styles.bar, className].filter(Boolean).join(' ')}>
      <div className={[styles.fill, styles[tone]].join(' ')} style={{ width: `${width}%` }} />
    </div>
  );
}
