import type { TranslationJob } from '../../types';
import { Badge, Card, ProgressBar } from '../ui';
import styles from './JobsView.module.scss';

export function JobCard({ job }: { job: TranslationJob }) {
  const isActive =
    job.status === 'queued' ||
    job.status === 'parsing' ||
    job.status === 'translating' ||
    job.status === 'assembling';

  return (
    <Card className={[styles.card, styles[job.status]].filter(Boolean).join(' ')}>
      <div className={styles.cardHeader}>
        <div className={styles.filename}>{job.originalFilename}</div>
        <Badge tone={job.status}>{job.status}</Badge>
      </div>
      <div className={styles.meta}>
        {job.targetLang && <span>→ {job.targetLang}</span>}
        {job.sourceLang && <span>from: {job.sourceLang}</span>}
        {job.model && <span>🤖 {job.model}</span>}
        {job.metadata?.title && <span className={styles.bookTitle}>📖 {job.metadata.title}</span>}
      </div>
      <div className={styles.message}>{job.message || '—'}</div>
      {isActive && (
        <ProgressBar
          className={styles.progress}
          value={job.progress}
          tone={job.status === 'failed' ? 'failed' : 'default'}
        />
      )}
      {job.progress > 0 && (
        <div className={styles.progressText}>
          <span>{job.progress}%</span>
        </div>
      )}
      {job.error && <div className={styles.error}>{job.error}</div>}
    </Card>
  );
}
