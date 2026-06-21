import type { BookRecord, TgChannel } from '../types';

interface SidebarProps {
  books: BookRecord[];
  loading: boolean;
  selectedBookId: string | null;
  tgChannels: TgChannel[];
  tgChannelsLoading: boolean;
  tgChannelsError: string | null;
  selectedChannelId: string | null;
  onRefreshTgChannels: () => void;
  onSelectBook: (bookId: string | null) => void;
  onRefresh: () => void;
  connected: boolean;
  modelsCount: number;
  modelsError: boolean;
  onUploadClick: () => void;
  currentView: 'library' | 'detail' | 'jobs' | 'news';
  onNavigate: (path: string) => void;
}

export function Sidebar({
  books,
  loading,
  selectedBookId,
  tgChannels,
  tgChannelsLoading,
  tgChannelsError,
  selectedChannelId,
  onRefreshTgChannels,
  onSelectBook,
  connected: _connected,
  modelsCount,
  modelsError,
  onUploadClick,
  currentView,
  onNavigate,
}: SidebarProps) {
  // Count active jobs (parsing/translating) for badge
  const activeCount = books.filter(
    (b) => b.status === 'parsing' || (b.translatedBlocks > 0 && !b.completedAt)
  ).length;

  return (
    <>
      <nav className="activity-bar" aria-label="Primary navigation">
        <button
          className={`activity-item ${currentView === 'library' || currentView === 'detail' ? 'active' : ''}`}
          onClick={() => onNavigate('/')}
          title="Library"
          aria-label="Library"
        >
          <span className="activity-icon">📖</span>
          {books.length > 0 && <span className="activity-badge">{books.length}</span>}
        </button>
        <button
          className={`activity-item ${currentView === 'news' ? 'active' : ''}`}
          onClick={() => onNavigate('/news')}
          title="News"
          aria-label="News"
        >
          <span className="activity-icon">📰</span>
        </button>
        <button
          className={`activity-item ${currentView === 'jobs' ? 'active' : ''}`}
          onClick={() => onNavigate('/jobs')}
          title="Jobs"
          aria-label="Jobs"
        >
          <span className="activity-icon">⚙️</span>
          {activeCount > 0 && <span className="activity-badge active">{activeCount}</span>}
        </button>
      </nav>

      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>📚 AI Translate</h1>
          <div className="subtitle">Books, articles & news</div>
        </div>

        {currentView === 'news' ? (
          <NewsSidebar
            channels={tgChannels}
            loading={tgChannelsLoading}
            error={tgChannelsError}
            selectedChannelId={selectedChannelId}
            onRefresh={onRefreshTgChannels}
            onSelect={(channelId) => onNavigate(channelId ? `/news?channel=${channelId}` : '/news')}
          />
        ) : (
          <>
            <div className="sidebar-upload">
              <button className="upload-btn" onClick={onUploadClick}>
                ⬆ Upload Book/Article
              </button>
              <div className="api-status">
                <div className={`api-dot ${modelsError ? 'err' : 'ok'}`} />
                <span>
                  {modelsError ? 'API unavailable' : `API connected — ${modelsCount} model(s)`}
                </span>
              </div>
            </div>

            <div className="sidebar-list">
              {loading && books.length === 0 ? (
                <div className="empty-state">Loading…</div>
              ) : books.length === 0 ? (
                <div className="empty-state">
                  No books yet
                  <br />
                  <span style={{ fontSize: 12, opacity: 0.7 }}>Upload or drag a file →</span>
                </div>
              ) : (
                books.map((book) => (
                  <BookListItem
                    key={book.id}
                    book={book}
                    active={book.id === selectedBookId}
                    onClick={() => onSelectBook(book.id)}
                  />
                ))
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}

function NewsSidebar({
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
        <button
          className={`sidebar-filter-btn ${selectedChannelId === null ? 'active' : ''}`}
          onClick={() => onSelect(null)}
        >
          All channels
        </button>
        <button className="btn btn-secondary btn-sm sidebar-refresh-btn" onClick={onRefresh}>
          Refresh
        </button>
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

function ChannelListItem({
  channel,
  active,
  onClick,
}: {
  channel: TgChannel;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div className={`channel-item ${active ? 'active' : ''}`} onClick={onClick}>
      <div className="channel-item-title">{channel.title}</div>
      <div className="channel-item-meta">{channel.username ? `@${channel.username}` : channel.id}</div>
    </div>
  );
}

function BookListItem({
  book,
  active,
  onClick,
}: {
  book: BookRecord;
  active: boolean;
  onClick: () => void;
}) {
  const total = book.totalBlocks || 0;
  const translated = book.translatedBlocks || 0;
  const pct = total > 0 ? Math.round((translated / total) * 100) : 0;
  const isComplete = book.completedAt !== null;
  const isTranslating = translated > 0 && !isComplete;
  const isParsing = book.status === 'parsing';
  const parsePct = book.totalPages > 0 ? Math.round((book.parsedPages / book.totalPages) * 100) : 0;

  const className = `book-item ${active ? 'active' : ''} ${
    isComplete ? 'completed' : isTranslating ? 'translating' : isParsing ? 'translating' : ''
  }`;

  return (
    <div className={className} onClick={onClick}>
      <div className="book-item-top">
        <div className="book-item-title">{book.title || book.filename}</div>
        {isComplete ? (
          <span className="badge completed">done</span>
        ) : isParsing ? (
          <span className="badge translating">parsing {parsePct}%</span>
        ) : isTranslating ? (
          <span className="badge translating">translating</span>
        ) : (
          <span className="badge queued">parsed</span>
        )}
      </div>
      <div className="book-item-author">{book.author || 'Unknown author'}</div>
      <div className="book-item-stats">
        <span>📄 {total}</span>
        <span>✅ {translated}</span>
        <span>🌍 {book.language || '?'}</span>
      </div>
      {isParsing && book.totalPages > 0 && (
        <div className="mini-bar">
          <div className="mini-bar-fill" style={{ width: `${parsePct}%` }} />
        </div>
      )}
      {translated > 0 && !isParsing && (
        <div className="mini-bar">
          <div
            className={`mini-bar-fill ${isComplete ? 'completed' : ''}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
