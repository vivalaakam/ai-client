import { Button, Card, Space, Tag, Typography } from 'antd';
import { CheckOutlined, SearchOutlined } from '@ant-design/icons';
import type { FeedItem, TgChannel } from '../types';
import { formatDate } from './newsUtils';

export function FeedCard({
  item,
  channel,
  sourceCount,
  onMarkViewed,
  onOpenSources,
}: {
  item: FeedItem;
  channel: TgChannel | null;
  sourceCount: number | undefined;
  onMarkViewed: (id: string) => void;
  onOpenSources: (item: FeedItem) => void;
}) {
  const date = formatDate(item.firstSeenAt);
  const text = item.text.trim() || 'No text content';

  return (
    <Card
      className={`news-card ${item.isViewed ? 'viewed' : 'unread'}`}
      size="small"
      title={
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{channel?.title ?? item.channelId}</Typography.Text>
          <Typography.Text type="secondary" className="news-date">
            {date}
          </Typography.Text>
        </Space>
      }
      extra={
        <Space wrap>
          {item.postType && <Tag color="purple">{item.postType}</Tag>}
          <Button icon={<SearchOutlined />} size="small" onClick={() => onOpenSources(item)}>
            Sources{sourceCount && sourceCount > 1 ? ` (${sourceCount})` : ''}
          </Button>
          {!item.isViewed && (
            <Button icon={<CheckOutlined />} size="small" onClick={() => onMarkViewed(item.id)}>
              Mark viewed
            </Button>
          )}
        </Space>
      }
    >
      <Typography.Paragraph className="news-text">{text}</Typography.Paragraph>
    </Card>
  );
}
