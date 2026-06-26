import { Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { TgChannel } from '../../types.ts';
import { ChannelListItem } from './ChannelListItem.tsx';

export function NewsSidebar({
  channels,
  loading,
  error,
  selectedChannelId,
  onRefresh,
  onSelect,
}: {
  channels: TgChannel[];
  loading: boolean;
  error: string | null;
  selectedChannelId: string | null;
  onRefresh: () => void;
  onSelect: (channelId: string | null) => void;
}) {
  return (
    <>
      <div className="sidebar-upload">
        <Button
          className={`sidebar-filter-btn ${selectedChannelId === null ? 'active' : ''}`}
          onClick={() => onSelect(null)}
        >
          All channels
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
        {loading && channels.length === 0 ? (
          <div className="empty-state">Loading channels…</div>
        ) : channels.length === 0 ? (
          <div className="empty-state">No channels yet</div>
        ) : (
          channels.map((channel) => (
            <ChannelListItem
              key={channel.id}
              channel={channel}
              active={channel.id === selectedChannelId}
              onClick={() => onSelect(channel.id)}
            />
          ))
        )}
      </div>
    </>
  );
}
