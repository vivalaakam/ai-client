import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import type { TgChannel, TgMessage } from '../types';

const PAGE_SIZE = 30;
const ALL_CHANNELS_PAGE_SIZE = 10;

export function NewsFeed({
  channels,
  selectedChannelId,
  onRefreshChannels,
}: {
  channels: TgChannel[];
  selectedChannelId: string | null;
  onRefreshChannels: () => void;
}) {
  const [messages, setMessages] = useState<TgMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedChannel = useMemo(
    () => channels.find((channel) => channel.id === selectedChannelId) ?? null,
    [channels, selectedChannelId]
  );
  const channelById = useMemo(
    () => new Map(channels.map((channel) => [channel.id, channel])),
    [channels]
  );

  const loadMessages = useCallback(async () => {
    if (channels.length === 0) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (selectedChannelId) {
        const data = await api.tgMessages(selectedChannelId, PAGE_SIZE, 0);
        setMessages(data);
      } else {
        const batches = await Promise.all(
          channels.map((channel) => api.tgMessages(channel.id, ALL_CHANNELS_PAGE_SIZE, 0))
        );
        const merged = batches
          .flat()
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, PAGE_SIZE);
        setMessages(merged);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load news feed');
    } finally {
      setLoading(false);
    }
  }, [channels, selectedChannelId]);

  const refresh = useCallback(async () => {
    onRefreshChannels();
    await loadMessages();
  }, [loadMessages, onRefreshChannels]);

  const loadMore = useCallback(async () => {
    if (!selectedChannelId || loadingMore) return;
    setLoadingMore(true);
    try {
      const next = await api.tgMessages(selectedChannelId, PAGE_SIZE, messages.length);
      setMessages((current) => [...current, ...next]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more messages');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, messages.length, selectedChannelId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  return (
    <section className="news-feed">
      <div className="news-toolbar">
        <div>
          <h2>News feed</h2>
          <div className="news-subtitle">
            {selectedChannel ? selectedChannel.title : 'All Telegram channels'}
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={refresh} disabled={loading}>
          Refresh
        </button>
      </div>

      {error && <div className="inline-error">{error}</div>}

      {loading && messages.length === 0 ? (
        <div className="empty-state">Loading news…</div>
      ) : channels.length === 0 ? (
        <div className="empty-state">No Telegram channels yet</div>
      ) : messages.length === 0 ? (
        <div className="empty-state">No messages in this channel</div>
      ) : (
        <>
          <div className="news-list">
            {messages.map((message) => (
              <NewsMessage
                key={`${message.channelId}:${message.messageId}`}
                message={message}
                channel={channelById.get(message.channelId) ?? selectedChannel}
              />
            ))}
          </div>
          {selectedChannelId && (
            <div className="news-load-more">
              <button className="btn btn-secondary" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function NewsMessage({ message, channel }: { message: TgMessage; channel: TgChannel | null }) {
  const date = formatDate(message.date);
  const text = message.contentTextText?.trim() || 'No text content';

  return (
    <article className={`news-card ${message.isPinned ? 'pinned' : ''}`}>
      <div className="news-card-header">
        <div>
          <div className="news-channel-title">{channel?.title ?? message.channelId}</div>
          <div className="news-date">{date}</div>
        </div>
        {message.isPinned && <span className="badge parsing">pinned</span>}
      </div>
      <p className="news-text">{text}</p>
    </article>
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
