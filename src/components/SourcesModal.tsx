import { useCallback, useState } from 'react';
import { Alert, Button, Empty, List, Modal, Space, Spin, Typography } from 'antd';
import { CopyOutlined, LinkOutlined } from '@ant-design/icons';
import type { FeedItem, FeedSourceMessage, TgChannel } from '../types';
import { formatDate } from './newsUtils';

export function SourcesModal({
  item,
  sources,
  channels,
  loading,
  error,
  onOpenSource,
  onClose,
}: {
  item: FeedItem;
  sources: FeedSourceMessage[];
  channels: Map<string, TgChannel>;
  loading: boolean;
  error: string | null;
  onOpenSource: (url: string) => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyFeedId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(item.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch (err) {
      console.warn('[news] failed to copy feed id', err);
    }
  }, [item.id]);

  return (
    <Modal
      className="news-sources-modal"
      title={
        <Space direction="vertical" size={0}>
          <Typography.Text strong>Sources</Typography.Text>
          <Typography.Text type="secondary">{formatDate(item.firstSeenAt)}</Typography.Text>
        </Space>
      }
      open
      onCancel={onClose}
      footer={null}
      width={560}
    >
      <Button className="news-feed-id" icon={<CopyOutlined />} onClick={copyFeedId}>
        <span>Feed ID</span>
        <code>{item.id}</code>
        <small>{copied ? 'Copied' : 'Click to copy'}</small>
      </Button>

      {error && <Alert className="news-alert" message={error} type="error" showIcon />}
      {loading ? (
        <div className="news-loading">
          <Spin />
        </div>
      ) : sources.length === 0 ? (
        <Empty description="No sources found" />
      ) : (
        <List
          className="news-sources-list"
          dataSource={sources}
          renderItem={(source) => {
            const channel = channels.get(source.channelId);
            return (
              <List.Item
                className="news-source-link"
                actions={[
                  <Button
                    key="open"
                    icon={<LinkOutlined />}
                    size="small"
                    onClick={() => onOpenSource(source.tgLink)}
                  >
                    Open
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={channel?.title ?? source.channelId}
                  description={`Message ${source.messageId}`}
                />
              </List.Item>
            );
          }}
        />
      )}
    </Modal>
  );
}
