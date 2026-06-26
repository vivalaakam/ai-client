import { Fragment, ReactNode } from 'react';
import { Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { types } from 'sass';
import Error = types.Error;
import { Sidebar } from './Sidebar.tsx';

interface SidebarListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  keyExtractor: (item: T) => string;
  loading?: boolean;
  error?: Error | string | null;
  emptyText?: ReactNode;
  onNew?: () => void;
  newLabel?: string;
  newIcon?: ReactNode;
  onRefresh?: () => void;
  extra?: ReactNode;
}

export function SidebarList<T>({
  items,
  renderItem,
  keyExtractor,
  loading,
  error,
  emptyText = 'No items',
  onNew,
  newLabel = 'New',
  newIcon,
  onRefresh,
  extra,
}: SidebarListProps<T>) {
  return (
    <Sidebar>
      <div className="sidebar-upload">
        {onNew && (
          <Button className="upload-btn" icon={newIcon} onClick={onNew} type="primary">
            {newLabel}
          </Button>
        )}
        {onRefresh && (
          <Button
            className="sidebar-refresh-btn"
            icon={<ReloadOutlined />}
            size="small"
            onClick={onRefresh}
          >
            Refresh
          </Button>
        )}
        {extra}
        {error && <div className="sidebar-error">{error.toString()}</div>}
      </div>
      <div className="sidebar-list">
        {loading && items.length === 0 ? (
          <div className="empty-state">Loading…</div>
        ) : items.length === 0 ? (
          <div className="empty-state">{emptyText}</div>
        ) : (
          items.map((item) => <Fragment key={keyExtractor(item)}>{renderItem(item)}</Fragment>)
        )}
      </div>
    </Sidebar>
  );
}
