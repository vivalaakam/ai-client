import { useCallback, useEffect, useMemo, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { api } from '../api';
import type { FeedItem, FeedSourceMessage, TgChannel } from '../types';

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
      <div className="news-toolbar">
        <div>
          <h2>News feed</h2>
          <div className="news-subtitle">
            {selectedChannel ? selectedChannel.title : 'Deduplicated Telegram feed'}
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={refresh} disabled={loading}>
          Refresh
        </button>
      </div>

      {error && <div className="inline-error">{error}</div>}

      {loading && items.length === 0 ? (
        <div className="empty-state">Loading news…</div>
      ) : items.length === 0 ? (
        <div className="empty-state">No feed items yet</div>
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
              <button className="btn btn-secondary" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
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

function FeedCard({
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
    <article className={`news-card ${item.isViewed ? 'viewed' : 'unread'}`}>
      <div className="news-card-header">
        <div>
          <div className="news-channel-title">{channel?.title ?? item.channelId}</div>
          <div className="news-date">{date}</div>
        </div>
        <div className="news-card-actions">
          {item.postType && <span className="badge parsing">{item.postType}</span>}
          <button className="btn btn-secondary btn-sm" onClick={() => onOpenSources(item)}>
            Sources{sourceCount && sourceCount > 1 ? ` (${sourceCount})` : ''}
          </button>
          {!item.isViewed && (
            <button className="btn btn-secondary btn-sm" onClick={() => onMarkViewed(item.id)}>
              Mark viewed
            </button>
          )}
        </div>
      </div>
      <p className="news-text">{text}</p>
    </article>
  );
}

function SourcesModal({
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
    <div className="news-sources-backdrop" role="presentation" onClick={onClose}>
      <div
        className="news-sources-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="news-sources-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="news-sources-header">
          <div>
            <h3 id="news-sources-title">Sources</h3>
            <div className="news-sources-subtitle">{formatDate(item.firstSeenAt)}</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>

        <button className="news-feed-id" onClick={copyFeedId}>
          <span>Feed ID</span>
          <code>{item.id}</code>
          <small>{copied ? 'Copied' : 'Click to copy'}</small>
        </button>

        {error && <div className="inline-error">{error}</div>}
        {loading ? (
          <div className="empty-state">Loading sources…</div>
        ) : sources.length === 0 ? (
          <div className="empty-state">No sources found</div>
        ) : (
          <div className="news-sources-list">
            {sources.map((source) => {
              const channel = channels.get(source.channelId);
              return (
                <button
                  key={`${source.channelId}:${source.messageId}`}
                  className="news-source-link"
                  onClick={() => onOpenSource(source.tgLink)}
                >
                  <span>{channel?.title ?? source.channelId}</span>
                  <small>Message {source.messageId}</small>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
