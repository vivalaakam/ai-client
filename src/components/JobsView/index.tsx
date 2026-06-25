import { useState, useEffect, useCallback } from 'react';
import { api } from '../../api';
import type { TranslationJob } from '../../types';
import { Badge, Button, Card, EmptyState, ProgressBar } from '../ui';
import styles from './JobsView.module.scss';

interface JobsViewProps {
  jobs: TranslationJob[];
  onRefresh: () => void;
  onSubscribeJob: (jobId: string) => void;
}

export function JobsView({ jobs, onSubscribeJob: _onSubscribeJob }: JobsViewProps) {
  const [localJobs, setLocalJobs] = useState<TranslationJob[]>(jobs);

  useEffect(() => {
    setLocalJobs(jobs);
  }, [jobs]);

  const refreshJobs = useCallback(async () => {
    try {
      const data = await api.jobList();
      setLocalJobs(data.jobs || []);
    } catch {
      // ignore
    }
  }, []);

  // Auto-refresh every 3 seconds when there are active jobs
  useEffect(() => {
    const hasActive = localJobs.some(
      (j) =>
        j.status === 'queued' ||
        j.status === 'parsing' ||
        j.status === 'translating' ||
        j.status === 'assembling'
    );
    if (!hasActive) return;
    const interval = setInterval(refreshJobs, 3000);
    return () => clearInterval(interval);
  }, [localJobs, refreshJobs]);

  if (localJobs.length === 0) {
    return (
      <EmptyState
        className={styles.emptyState}
        icon="⚙️"
        title="No jobs yet"
        description="Upload a book and start a translation to see jobs here"
      />
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <h3>Active Jobs</h3>
        <Button size="sm" variant="secondary" onClick={refreshJobs}>
          ↻ Refresh
        </Button>
      </div>
      <div className={styles.list}>
        {localJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}

function JobCard({ job }: { job: TranslationJob }) {
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
