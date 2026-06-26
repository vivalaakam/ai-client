import { Badge, Button, Tooltip } from 'antd';
import {
  BookOutlined,
  CloudUploadOutlined,
  FormOutlined,
  ReadOutlined,
  SettingOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import type { AppConfigEntry, BookRecord, PromptRecord, TgChannel } from '../../types.ts';
import { BookListItem } from './BookListItem.tsx';
import { ConfigSidebar } from './ConfigSidebar.tsx';
import { NewsSidebar } from './NewsSidebar.tsx';
import { PromptsSidebar } from './PromptsSidebar.tsx';

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
        <Tooltip title="Library" placement="right">
          <Button
            className={`activity-item ${currentView === 'library' || currentView === 'detail' ? 'active' : ''}`}
            onClick={() => onNavigate('/')}
            aria-label="Library"
            type="text"
          >
            <Badge count={books.length} size="small" offset={[5, -3]}>
              <BookOutlined className="activity-icon" />
            </Badge>
          </Button>
        </Tooltip>
        <Tooltip title="News" placement="right">
          <Button
            className={`activity-item ${currentView === 'news' ? 'active' : ''}`}
            onClick={() => onNavigate('/news')}
            aria-label="News"
            type="text"
          >
            <ReadOutlined className="activity-icon" />
          </Button>
        </Tooltip>
        <Tooltip title="Jobs" placement="right">
          <Button
            className={`activity-item ${currentView === 'jobs' ? 'active' : ''}`}
            onClick={() => onNavigate('/jobs')}
            aria-label="Jobs"
            type="text"
          >
            <Badge count={activeCount} size="small" offset={[5, -3]}>
              <SettingOutlined className="activity-icon" />
            </Badge>
          </Button>
        </Tooltip>
        <Tooltip title="Config" placement="right">
          <Button
            className={`activity-item ${currentView === 'config' ? 'active' : ''}`}
            onClick={() => onNavigate('/config')}
            aria-label="Config"
            type="text"
          >
            <ToolOutlined className="activity-icon" />
          </Button>
        </Tooltip>
        <Tooltip title="Prompts" placement="right">
          <Button
            className={`activity-item ${currentView === 'prompts' ? 'active' : ''}`}
            onClick={() => onNavigate('/prompts')}
            aria-label="Prompts"
            type="text"
          >
            <FormOutlined className="activity-icon" />
          </Button>
        </Tooltip>
      </nav>

      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>
            <BookOutlined /> AI Translate
          </h1>
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
              <Button
                className="upload-btn"
                icon={<CloudUploadOutlined />}
                onClick={onUploadClick}
                type="primary"
              >
                Upload Book/Article
              </Button>
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
