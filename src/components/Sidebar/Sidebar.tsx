import type { AppConfigEntry, BookRecord, PromptRecord, TgChannel } from '../../types.ts';
import { ConfigListItem } from './ConfigListItem.tsx';
import { ChannelListItem } from './ChannelListItem.tsx';
import { PromptListItem } from './PromptListItem.tsx';

interface SidebarProps {
  books: BookRecord[];
  loading: boolean;
  selectedBookId: string | null;
  tgChannels: TgChannel[];
  tgChannelsLoading: boolean;
  tgChannelsError: string | null;
  selectedChannelId: string | null;
  configEntries: AppConfigEntry[];
  configEntriesLoading: boolean;
  configEntriesError: string | null;
  selectedConfigSlug: string | null;
  prompts: PromptRecord[];
  promptsLoading: boolean;
  promptsError: string | null;
  selectedPromptId: string | null;
  onRefreshTgChannels: () => void;
  onRefreshConfigEntries: () => void | Promise<void>;
  onSelectConfigEntry: (slug: string) => void;
  onCreateConfigEntry: () => void;
  onRefreshPrompts: () => void | Promise<void>;
  onSelectPrompt: (promptId: string) => void;
  onCreatePrompt: () => void;
  onSelectBook: (bookId: string | null) => void;
  onRefresh: () => void;
  connected: boolean;
  modelsCount: number;
  modelsError: boolean;
  onUploadClick: () => void;
  currentView: 'library' | 'detail' | 'jobs' | 'news' | 'config' | 'prompts';
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
  configEntries,
  configEntriesLoading,
  configEntriesError,
  selectedConfigSlug,
  prompts,
  promptsLoading,
  promptsError,
  selectedPromptId,
  onRefreshTgChannels,
  onRefreshConfigEntries,
  onSelectConfigEntry,
  onCreateConfigEntry,
  onRefreshPrompts,
  onSelectPrompt,
  onCreatePrompt,
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
        <button
          className={`activity-item ${currentView === 'config' ? 'active' : ''}`}
          onClick={() => onNavigate('/config')}
          title="Config"
          aria-label="Config"
        >
          <span className="activity-icon">🔧</span>
        </button>
        <button
          className={`activity-item ${currentView === 'prompts' ? 'active' : ''}`}
          onClick={() => onNavigate('/prompts')}
          title="Prompts"
          aria-label="Prompts"
        >
          <span className="activity-icon">✍️</span>
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
        ) : currentView === 'prompts' ? (
          <PromptsSidebar
            prompts={prompts}
            loading={promptsLoading}
            error={promptsError}
            selectedPromptId={selectedPromptId}
            onRefresh={onRefreshPrompts}
            onSelect={onSelectPrompt}
            onCreate={onCreatePrompt}
          />
        ) : currentView === 'config' ? (
          <ConfigSidebar
            entries={configEntries}
            loading={configEntriesLoading}
            error={configEntriesError}
            selectedSlug={selectedConfigSlug}
            onRefresh={onRefreshConfigEntries}
            onSelect={onSelectConfigEntry}
            onCreate={onCreateConfigEntry}
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

function ConfigSidebar({
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
        <button className="upload-btn" onClick={onCreate}>
          + New config
        </button>
        <button className="btn btn-secondary btn-sm sidebar-refresh-btn" onClick={onRefresh}>
          Refresh
        </button>
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

function PromptsSidebar({
  prompts,
  loading,
  error,
  selectedPromptId,
  onRefresh,
  onSelect,
  onCreate,
}: {
  prompts: PromptRecord[];
  loading: boolean;
  error: string | null;
  selectedPromptId: string | null;
  onRefresh: () => void | Promise<void>;
  onSelect: (promptId: string) => void;
  onCreate: () => void;
}) {
  return (
    <>
      <div className="sidebar-upload">
        <button className="upload-btn" onClick={onCreate}>
          + New prompt
        </button>
        <button className="btn btn-secondary btn-sm sidebar-refresh-btn" onClick={onRefresh}>
          Refresh
        </button>
        {error && <div className="sidebar-error">{error}</div>}
      </div>

      <div className="sidebar-list">
        {loading && prompts.length === 0 ? (
          <div className="empty-state">Loading prompts…</div>
        ) : prompts.length === 0 ? (
          <div className="empty-state">No prompts yet</div>
        ) : (
          prompts.map((prompt) => (
            <PromptListItem
              key={prompt.id}
              prompt={prompt}
              active={prompt.id === selectedPromptId}
              onClick={() => onSelect(prompt.id)}
            />
          ))
        )}
      </div>
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
