import { useState, useCallback, useEffect } from 'react';
import { Alert, Breadcrumb, Button, Card, Progress, Space, Tag, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { DropZone } from './DropZone';
import { BookDetail } from './BookDetail';
import { JobsView } from './JobsView';
import { NewsFeed } from './NewsFeed';
import { ConfigView } from './ConfigView';
import { PromptsView } from './PromptsView';
import { api } from '../api';
import type {
  BookRecord,
  BookDetail as BookDetailType,
  AppConfigEntry,
  PromptRecord,
  SystemConfig,
  TgChannel,
  TranslationJob,
} from '../types';

interface MainContentProps {
  view: 'library' | 'detail' | 'jobs' | 'news' | 'config' | 'prompts';
  selectedBookId?: string | null;
  books: BookRecord[];
  config: SystemConfig;
  models: string[];
  modelsError: boolean;
  jobs: TranslationJob[];
  tgChannels: TgChannel[];
  configEntries: AppConfigEntry[];
  configEntriesLoading: boolean;
  configEntriesError: string | null;
  selectedConfigSlug: string | null;
  prompts: PromptRecord[];
  promptsLoading: boolean;
  promptsError: string | null;
  selectedPromptId: string | null;
  selectedChannelId: string | null;
  newsRefreshNonce: number;
  onRefreshTgChannels: () => void | Promise<void>;
  onRefreshConfigEntries: () => void | Promise<void>;
  onSelectConfigEntry: (slug: string | null) => void;
  onRefreshPrompts: () => void | Promise<void>;
  onSelectPrompt: (promptId: string | null) => void;
  onNavigate: (path: string) => void;
  onSelectBook: (bookId: string | null) => void;
  onRefresh: () => void;
  onSubscribeJob: (jobId: string) => void;
  onUploadStart: (jobId: string) => void;
  onUploadComplete: (bookId: string) => void;
}

export function MainContent(props: MainContentProps) {
  const { view } = props;

  const renderBreadcrumb = () => {
    const libraryItem = {
      title:
        view === 'library' ? (
          'Library'
        ) : (
          <button className="breadcrumb-link" onClick={() => props.onNavigate('/')}>
            Library
          </button>
        ),
    };

    if (view === 'library') {
      return <Breadcrumb className="breadcrumb" items={[libraryItem]} />;
    }

    const labelByView = {
      jobs: 'Jobs',
      news: 'News',
      config: 'Config',
      prompts: 'Prompts',
      detail: props.books.find((b) => b.id === props.selectedBookId)?.title || 'Book details',
    };

    if (view === 'jobs') {
      return (
        <Breadcrumb className="breadcrumb" items={[libraryItem, { title: labelByView.jobs }]} />
      );
    }

    return (
      <Breadcrumb className="breadcrumb" items={[libraryItem, { title: labelByView[view] }]} />
    );
  };

  if (view === 'detail') {
    return (
      <main className="main">
        <div className="main-header">
          <Button icon={<ArrowLeftOutlined />} size="small" onClick={() => props.onNavigate('/')} />
          {renderBreadcrumb()}
        </div>
        <div className="main-content">
          <BookDetailView
            config={props.config}
            models={props.models}
            modelsError={props.modelsError}
            onRefresh={props.onRefresh}
            onSubscribeJob={props.onSubscribeJob}
            onBack={() => props.onNavigate('/')}
          />
        </div>
      </main>
    );
  }

  if (view === 'jobs') {
    return (
      <main className="main">
        <div className="main-header">{renderBreadcrumb()}</div>
        <div className="main-content">
          <JobsView
            jobs={props.jobs}
            onRefresh={props.onRefresh}
            onSubscribeJob={props.onSubscribeJob}
          />
        </div>
      </main>
    );
  }

  if (view === 'news') {
    return (
      <main className="main">
        <div className="main-header">
          {renderBreadcrumb()}
          <span className="main-header-count">Telegram channels</span>
        </div>
        <div className="main-content">
          <NewsFeed
            channels={props.tgChannels}
            selectedChannelId={props.selectedChannelId}
            refreshNonce={props.newsRefreshNonce}
            onRefreshChannels={props.onRefreshTgChannels}
          />
        </div>
      </main>
    );
  }

  if (view === 'config') {
    return (
      <main className="main">
        <div className="main-header">
          {renderBreadcrumb()}
          <span className="main-header-count">
            {props.selectedConfigSlug ? 'Editing config' : 'New config'}
          </span>
        </div>
        <div className="main-content prompt-main-content">
          <ConfigView
            entries={props.configEntries}
            loading={props.configEntriesLoading}
            error={props.configEntriesError}
            selectedSlug={props.selectedConfigSlug}
            onSelectEntry={props.onSelectConfigEntry}
            onRefreshEntries={props.onRefreshConfigEntries}
          />
        </div>
      </main>
    );
  }

  if (view === 'prompts') {
    return (
      <main className="main">
        <div className="main-header">
          {renderBreadcrumb()}
          <span className="main-header-count">
            {props.selectedPromptId ? 'Editing prompt' : 'New prompt'}
          </span>
        </div>
        <div className="main-content prompt-main-content">
          <PromptsView
            prompts={props.prompts}
            loading={props.promptsLoading}
            error={props.promptsError}
            selectedPromptId={props.selectedPromptId}
            onSelectPrompt={props.onSelectPrompt}
            onRefreshPrompts={props.onRefreshPrompts}
          />
        </div>
      </main>
    );
  }

  // Library view: drop zone + book cards grid
  return (
    <main className="main">
      <div className="main-header">
        {renderBreadcrumb()}
        <span className="main-header-count">
          {props.books.length} book{props.books.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="main-content">
        <DropZone onUploadStart={props.onUploadStart} onUploadComplete={props.onUploadComplete} />
        {props.books.length > 0 && (
          <div className="books-grid">
            {props.books.map((book) => (
              <BookCard key={book.id} book={book} onClick={() => props.onSelectBook(book.id)} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// ── Book card for library grid ───────────────────

function BookCard({ book, onClick }: { book: BookRecord; onClick: () => void }) {
  const total = book.totalBlocks || 0;
  const translated = book.translatedBlocks || 0;
  const pct = total > 0 ? Math.round((translated / total) * 100) : 0;
  const isComplete = book.completedAt !== null;
  const isTranslating = translated > 0 && !isComplete;
  const isParsing = book.status === 'parsing';
  const parsePct = book.totalPages > 0 ? Math.round((book.parsedPages / book.totalPages) * 100) : 0;
  const ext = book.filename?.split('.').pop()?.toUpperCase() || '?';

  return (
    <Card
      className={`book-card ${isComplete ? 'completed' : ''}`}
      hoverable
      onClick={onClick}
      size="small"
    >
      <div className="book-card-top">
        <div className="book-card-format">{ext}</div>
        {isComplete ? (
          <Tag color="green">done</Tag>
        ) : isParsing ? (
          <Tag color="purple">parsing {parsePct}%</Tag>
        ) : isTranslating ? (
          <Tag color="blue">{pct}%</Tag>
        ) : (
          <Tag color="gold">parsed</Tag>
        )}
      </div>
      <Typography.Title level={5} className="book-card-title">
        {book.title || book.filename}
      </Typography.Title>
      <Typography.Text type="secondary" className="book-card-author">
        {book.author || 'Unknown author'}
      </Typography.Text>
      <Space wrap size={[8, 4]} className="book-card-stats">
        <span>📄 {total}</span>
        <span>✅ {translated}</span>
        <span>🌍 {book.language || '?'}</span>
        {book.targetLang && <span>→ {book.targetLang}</span>}
      </Space>
      {(translated > 0 || isParsing) && (
        <Progress
          percent={isParsing ? parsePct : pct}
          showInfo={false}
          status={isComplete ? 'success' : 'active'}
        />
      )}
    </Card>
  );
}

// ── Book detail with data fetching ───────────────

function BookDetailView({
  config,
  models,
  modelsError,
  onRefresh,
  onSubscribeJob,
  onBack,
}: {
  config: SystemConfig;
  models: string[];
  modelsError: boolean;
  onRefresh: () => void;
  onSubscribeJob: (jobId: string) => void;
  onBack: () => void;
}) {
  const { bookId } = useParams<{ bookId: string }>();
  const [detail, setDetail] = useState<BookDetailType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!bookId) return;
    try {
      const d = await api.bookGet(bookId);
      setDetail(d);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load book');
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  if (loading && !detail) {
    return <Card loading />;
  }

  if (error) {
    return (
      <Space direction="vertical">
        <Alert message={error} type="error" showIcon />
        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
          Back
        </Button>
      </Space>
    );
  }

  if (!detail) return null;

  return (
    <BookDetail
      detail={detail}
      config={config}
      models={models}
      modelsError={modelsError}
      onRefresh={() => {
        onRefresh();
        load();
      }}
      onSubscribeJob={onSubscribeJob}
      onDelete={onBack}
    />
  );
}
