import { Link } from 'react-router';
import { Breadcrumb } from 'antd';
import { JobsView } from '../components/JobsView';
import type { TranslationJob } from '../types';

interface JobsPageProps {
  jobs: TranslationJob[];
  onRefresh: () => void;
  onSubscribeJob: (jobId: string) => void;
}

export function JobsPage({ jobs, onRefresh, onSubscribeJob }: JobsPageProps) {
  return (
    <main className="main">
      <div className="main-header">
        <Breadcrumb
          className="breadcrumb"
          items={[{ title: <Link to="/">Library</Link> }, { title: 'Jobs' }]}
        />
      </div>
      <div className="main-content">
        <JobsView jobs={jobs} onRefresh={onRefresh} onSubscribeJob={onSubscribeJob} />
      </div>
    </main>
  );
}
