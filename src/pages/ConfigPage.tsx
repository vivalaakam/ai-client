import { Link } from 'react-router';
import { Breadcrumb } from 'antd';
import { ConfigView } from '../components/ConfigView';
import type { AppConfigEntry } from '../types';

interface ConfigPageProps {
  entries: AppConfigEntry[];
  loading: boolean;
  error: string | null;
  selectedSlug: string | null;
  onSelectEntry: (slug: string | null) => void;
  onRefresh: () => void | Promise<void>;
}

export function ConfigPage({
  entries,
  loading,
  error,
  selectedSlug,
  onSelectEntry,
  onRefresh,
}: ConfigPageProps) {
  return (
    <main className="main">
      <div className="main-header">
        <Breadcrumb
          className="breadcrumb"
          items={[{ title: <Link to="/">Library</Link> }, { title: 'Config' }]}
        />
        <span className="main-header-count">{selectedSlug ? 'Editing config' : 'New config'}</span>
      </div>
      <div className="main-content prompt-main-content">
        <ConfigView
          entries={entries}
          loading={loading}
          error={error}
          selectedSlug={selectedSlug}
          onSelectEntry={onSelectEntry}
          onRefreshEntries={onRefresh}
        />
      </div>
    </main>
  );
}
