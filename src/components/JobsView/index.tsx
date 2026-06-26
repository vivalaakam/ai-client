import { useState, useEffect, useCallback } from 'react';
import { api } from '../../api';
import type { TranslationJob } from '../../types';
import { Button, EmptyState } from '../ui';
import { JobCard } from './JobCard';
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
