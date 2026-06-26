import { Breadcrumb, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { DropZone } from './DropZone';
import { JobsView } from './JobsView';
import { NewsFeed } from './NewsFeed';
import { ConfigView } from './ConfigView';
import { PromptsView } from './PromptsView';
import { BookCard } from './BookCard';
import { BookDetailView } from './BookDetailView';
import type {
  BookRecord,
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
