import { Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { AppConfigEntry } from '../../types.ts';
import { ConfigListItem } from './ConfigListItem.tsx';

export function ConfigSidebar({
  entries,
  loading,
  error,
  selectedSlug,
  onRefresh,
  onSelect,
  onCreate,
}: {
  entries: AppConfigEntry[];
  loading: boolean;
  error: string | null;
  selectedSlug: string | null;
  onRefresh: () => void | Promise<void>;
  onSelect: (slug: string) => void;
  onCreate: () => void;
}) {
  return (
    <>
      <div className="sidebar-upload">
        <Button className="upload-btn" onClick={onCreate} type="primary">
          New config
        </Button>
        <Button
          className="sidebar-refresh-btn"
          icon={<ReloadOutlined />}
          size="small"
          onClick={onRefresh}
        >
          Refresh
        </Button>
        {error && <div className="sidebar-error">{error}</div>}
      </div>
      <div className="sidebar-list">
        {loading && entries.length === 0 ? (
          <div className="empty-state">Loading config…</div>
        ) : entries.length === 0 ? (
          <div className="empty-state">No config entries yet</div>
        ) : (
          entries.map((entry) => (
            <ConfigListItem
              key={entry.slug}
              entry={entry}
              active={entry.slug === selectedSlug}
              onClick={() => onSelect(entry.slug)}
            />
          ))
        )}
      </div>
    </>
  );
}
