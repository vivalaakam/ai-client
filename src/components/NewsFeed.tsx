import { useCallback, useEffect, useMemo, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Alert, Button, Card, Empty, Space, Spin, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { api } from '../api';
import type { FeedItem, FeedSourceMessage, TgChannel } from '../types';
import { FeedCard } from './FeedCard';
import { SourcesModal } from './SourcesModal';

const PAGE_SIZE = 30;
const SELECTED_CHANNEL_SCAN_SIZE = 120;

export function NewsFeed({
  channels,
  selectedChannelId,
  refreshNonce,
  onRefreshChannels,
}: {
  channels: TgChannel[];
  selectedChannelId: string | null;
  refreshNonce: number;
  onRefreshChannels: () => void | Promise<void>;
}) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [nextOffset, setNextOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourcesItem, setSourcesItem] = useState<FeedItem | null>(null);
  const [sources, setSources] = useState<FeedSourceMessage[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [sourcesError, setSourcesError] = useState<string | null>(null);
  const [sourceCounts, setSourceCounts] = useState<Record<string, number>>({});

  const selectedChannel = useMemo(
    () => channels.find((channel) => channel.id === selectedChannelId) ?? null,
    [channels, selectedChannelId]
  );
  const channelById = useMemo(
    () => new Map(channels.map((channel) => [channel.id, channel])),
    [channels]
  );

  const loadFeed = useCallback(
    async (offset: number) => {
      const limit = selectedChannelId ? SELECTED_CHANNEL_SCAN_SIZE : PAGE_SIZE;
      const data = await api.feedList(limit, offset);
      const filtered = selectedChannelId
        ? data.filter((item) => item.channelId === selectedChannelId)
        : data;
      return {
        items: filtered,
        nextOffset: offset + data.length,
        hasMore: data.length === limit,
      };
    },
    [selectedChannelId]
  );

  const loadInitialFeed = useCallback(async () => {
    setLoading(true);
    try {
      const result = await loadFeed(0);
      setItems(result.items);
      setNextOffset(result.nextOffset);
      setHasMore(result.hasMore);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load news feed');
    } finally {
      setLoading(false);
    }
  }, [loadFeed]);

  const refresh = useCallback(async () => {
    await onRefreshChannels();
  }, [onRefreshChannels]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await loadFeed(nextOffset);
      setItems((current) => [...current, ...result.items]);
      setNextOffset(result.nextOffset);
      setHasMore(result.hasMore);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more feed items');
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadFeed, loadingMore, nextOffset]);

  const markViewed = useCallback(async (id: string) => {
    try {
      await api.feedMarkViewed(id);
      setItems((current) =>
        current.map((item) => (item.id === id ? { ...item, isViewed: true } : item))
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark feed item as viewed');
    }
  }, []);

  const openSources = useCallback(async (item: FeedItem) => {
    setSourcesItem(item);
    setSources([]);
    setSourcesError(null);
    setSourcesLoading(true);
    try {
      const data = await api.feedMessages(item.id);
      setSources(data);
      setSourceCounts((current) => ({ ...current, [item.id]: data.length }));
    } catch (err) {
      setSourcesError(err instanceof Error ? err.message : 'Failed to load sources');
    } finally {
      setSourcesLoading(false);
    }
  }, []);

  const closeSources = useCallback(() => {
    setSourcesItem(null);
    setSources([]);
    setSourcesError(null);
    setSourcesLoading(false);
  }, []);

  const openSourceLink = useCallback(async (url: string) => {
    try {
      await invoke('open_external_url', { url });
      setSourcesError(null);
    } catch (err) {
      setSourcesError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  useEffect(() => {
    loadInitialFeed();
  }, [loadInitialFeed, refreshNonce]);

  useEffect(() => {
    let cancelled = false;
    const missing = items.filter((item) => sourceCounts[item.id] === undefined);
    if (missing.length === 0) return;

    void Promise.all(
      missing.map(async (item) => {
        try {
          const data = await api.feedMessages(item.id);
          return [item.id, data.length] as const;
        } catch (err) {
          console.warn('[news] failed to load source count', item.id, err);
          return [item.id, 0] as const;
        }
      })
    ).then((counts) => {
      if (cancelled) return;
      setSourceCounts((current) => ({
        ...current,
        ...Object.fromEntries(counts),
      }));
    });

    return () => {
      cancelled = true;
    };
  }, [items, sourceCounts]);

  return (
    <section className="news-feed">
      <Card
        title={
          <Space direction="vertical" size={0}>
            <Typography.Title level={3}>News feed</Typography.Title>
            <Typography.Text type="secondary">
              {selectedChannel ? selectedChannel.title : 'Deduplicated Telegram feed'}
            </Typography.Text>
          </Space>
        }
        extra={
          <Button icon={<ReloadOutlined />} loading={loading} onClick={refresh}>
            Refresh
          </Button>
        }
      >
        {error && <Alert className="news-alert" message={error} type="error" showIcon />}

        {loading && items.length === 0 ? (
          <div className="news-loading">
            <Spin />
          </div>
        ) : items.length === 0 ? (
          <Empty description="No feed items yet" />
        ) : (
          <>
            <div className="news-list">
              {items.map((item) => (
                <FeedCard
                  key={item.id}
                  item={item}
                  channel={channelById.get(item.channelId) ?? selectedChannel}
                  sourceCount={sourceCounts[item.id]}
                  onMarkViewed={markViewed}
                  onOpenSources={openSources}
                />
              ))}
            </div>
            {hasMore && (
              <div className="news-load-more">
                <Button loading={loadingMore} onClick={loadMore}>
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
      {sourcesItem && (
        <SourcesModal
          item={sourcesItem}
          sources={sources}
          channels={channelById}
          loading={sourcesLoading}
          error={sourcesError}
          onOpenSource={openSourceLink}
          onClose={closeSources}
        />
      )}
    </section>
  );
}
