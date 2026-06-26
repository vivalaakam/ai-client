import { useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';
import { Badge, Button, Layout, Tooltip } from 'antd';
import {
  BookOutlined,
  CloudUploadOutlined,
  FormOutlined,
  ReadOutlined,
  SettingOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { api } from './api';
import { SidebarList } from './components/Sidebar/SidebarList.tsx';
import { BookListItem } from './components/Sidebar/BookListItem.tsx';
import { ChannelListItem } from './components/Sidebar/ChannelListItem.tsx';
import { UploadOverlay } from './components/UploadOverlay';
import { useBooks, useConfig, useModels } from './hooks/useBooks';
import { useWebSocket } from './hooks/useWebSocket';
import { LibraryPage } from './pages/LibraryPage';
import { BookDetailPage } from './pages/BookDetailPage';
import { NewsPage } from './pages/NewsPage';
import { JobsPage } from './pages/JobsPage';
import { ConfigPage } from './pages/ConfigPage';
import { ConfigViewPage } from './pages/ConfigViewPage.tsx';
import { ConfigNewPage } from './pages/ConfigNewPage.tsx';
import type { TgChannel, TranslationJob } from './types';
import { PromptsView } from './components/PromptsView';
import { ConfigsView } from './components/ConfigsView';
import { PromptViewPage } from './pages/PromptViewPage.tsx';
import { PromptNewPage } from './pages/PromptNewPage.tsx';
import { PromptsList } from './pages/PromptsList.tsx';
import Sider from 'antd/es/layout/Sider';

export function AppInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const [jobUpdate, setJobUpdate] = useState<TranslationJob | null>(null);
  const [uploadJobId, setUploadJobId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<TranslationJob[]>([]);
  const [tgChannels, setTgChannels] = useState<TgChannel[]>([]);
  const [tgChannelsLoading, setTgChannelsLoading] = useState(false);
  const [tgChannelsError, setTgChannelsError] = useState<string | null>(null);
  const [newsRefreshNonce, setNewsRefreshNonce] = useState(0);

  console.log('appInner rendered');

  const { subscribe } = useWebSocket((job) => {
    setJobUpdate(job);
    if (location.pathname === '/jobs') {
      api
        .jobList()
        .then((data) => setJobs(data.jobs || []))
        .catch(() => {});
    }
  });

  const { books, loading, refresh } = useBooks(jobUpdate);
  const config = useConfig();
  const { models, error: modelsError } = useModels();

  const handleJobUpdate = useCallback(
    (jobId: string) => {
      subscribe(jobId);
    },
    [subscribe]
  );

  useEffect(() => {
    if (jobUpdate) {
      refresh();
    }
  }, [jobUpdate, refresh]);

  const handleUploadComplete = useCallback(
    (bookId: string) => {
      refresh();
      navigate(bookId ? `/book/${bookId}` : '/');
      setUploadJobId(null);
    },
    [refresh, navigate]
  );

  const handleSelectBook = useCallback(
    (bookId: string | null) => {
      navigate(bookId ? `/book/${bookId}` : '/');
    },
    [navigate]
  );

  const refreshTgChannels = useCallback(async () => {
    setTgChannelsLoading(true);
    try {
      const data = await api.tgChannelList();
      setTgChannels(data);
      setTgChannelsError(null);
    } catch (err) {
      setTgChannelsError(err instanceof Error ? err.message : 'Failed to load Telegram channels');
    } finally {
      setTgChannelsLoading(false);
    }
  }, []);

  const refreshNews = useCallback(async () => {
    console.log('[news] refresh requested');
    await refreshTgChannels();
    setNewsRefreshNonce((nonce) => nonce + 1);
  }, [refreshTgChannels]);

  const view =
    location.pathname === '/news'
      ? 'news'
      : location.pathname.startsWith('/config')
        ? 'config'
        : location.pathname.startsWith('/prompts')
          ? 'prompts'
          : location.pathname === '/jobs'
            ? 'jobs'
            : location.pathname.startsWith('/book/')
              ? 'detail'
              : 'library';

  const selectedBookId = view === 'detail' ? location.pathname.split('/book/')[1] || null : null;
  const selectedChannelId =
    view === 'news' ? new URLSearchParams(location.search).get('channel') : null;

  useEffect(() => {
    if (view === 'news' && tgChannels.length === 0 && !tgChannelsLoading) {
      refreshTgChannels();
    }
  }, [refreshTgChannels, tgChannels.length, tgChannelsLoading, view]);

  const sidebarContent = (() => {
    if (view === 'prompts' || view === 'config') {
      return null;
    }
    if (view === 'news') {
      return (
        <SidebarList
          items={tgChannels}
          renderItem={(ch) => (
            <ChannelListItem
              channel={ch}
              active={ch.id === selectedChannelId}
              onClick={() =>
                navigate(ch.id === selectedChannelId ? '/news' : `/news?channel=${ch.id}`)
              }
            />
          )}
          keyExtractor={(ch) => ch.id}
          onRefresh={refreshNews}
          loading={tgChannelsLoading}
          error={tgChannelsError}
          emptyText="No channels yet"
          extra={
            <Button
              className={`sidebar-filter-btn ${selectedChannelId === null ? 'active' : ''}`}
              onClick={() => navigate('/news')}
            >
              All channels
            </Button>
          }
        />
      );
    }
    // library / detail / jobs
    return (
      <SidebarList
        items={books}
        renderItem={(book) => (
          <BookListItem
            book={book}
            active={book.id === selectedBookId}
            onClick={() => handleSelectBook(book.id)}
          />
        )}
        keyExtractor={(book) => book.id}
        onNew={() => navigate('/')}
        newLabel="Upload Book/Article"
        newIcon={<CloudUploadOutlined />}
        onRefresh={refresh}
        loading={loading}
        emptyText={
          <>
            No books yet
            <br />
            <span style={{ fontSize: 12, opacity: 0.7 }}>Upload or drag a file →</span>
          </>
        }
        extra={
          <div className="api-status">
            <div className={`api-dot ${modelsError ? 'err' : 'ok'}`} />
            <span>
              {modelsError ? 'API unavailable' : `API connected — ${models.length} model(s)`}
            </span>
          </div>
        }
      />
    );
  })();

  return (
    <Layout className="app">
      <Sider width={50}>
        <Tooltip title="Library" placement="right">
          <Button
            className={`activity-item ${location.pathname === '/' || location.pathname.startsWith('/detail') ? 'active' : ''}`}
            onClick={() => navigate('/')}
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
            className={`activity-item ${location.pathname.startsWith('/news') ? 'active' : ''}`}
            onClick={() => navigate('/news')}
            aria-label="News"
            type="text"
          >
            <ReadOutlined className="activity-icon" />
          </Button>
        </Tooltip>
        <Tooltip title="Jobs" placement="right">
          <Button
            className={`activity-item ${location.pathname.startsWith('/jobs') ? 'active' : ''}`}
            onClick={() => navigate('/jobs')}
            aria-label="Jobs"
            type="text"
          >
            <SettingOutlined className="activity-icon" />
          </Button>
        </Tooltip>
        <Tooltip title="Config" placement="right">
          <Button
            className={`activity-item ${location.pathname.startsWith('/config') ? 'active' : ''}`}
            onClick={() => navigate('/config')}
            aria-label="Config"
            type="text"
          >
            <ToolOutlined className="activity-icon" />
          </Button>
        </Tooltip>
        <Tooltip title="Prompts" placement="right">
          <Button
            className={`activity-item ${location.pathname.startsWith('/prompts') ? 'active' : ''}`}
            onClick={() => navigate('/prompts')}
            aria-label="Prompts"
            type="text"
          >
            <FormOutlined className="activity-icon" />
          </Button>
        </Tooltip>
      </Sider>

      {sidebarContent}
      <Routes>
        <Route
          path="/"
          element={
            <LibraryPage
              books={books}
              onUploadStart={(jobId) => {
                setUploadJobId(jobId);
                subscribe(jobId);
              }}
              onUploadComplete={handleUploadComplete}
            />
          }
        />
        <Route
          path="/news"
          element={
            <NewsPage
              tgChannels={tgChannels}
              refreshNonce={newsRefreshNonce}
              onRefresh={refreshNews}
            />
          }
        />
        <Route path="/config" Component={ConfigPage}>
          <Route index Component={ConfigsView} />
          <Route path="new" Component={ConfigNewPage} />
          <Route path=":slug" Component={ConfigViewPage} />
        </Route>
        <Route path="/prompts" Component={PromptsList}>
          <Route index Component={PromptsView} />
          <Route path="new" Component={PromptNewPage} />
          <Route path=":id" Component={PromptViewPage} />
        </Route>
        <Route
          path="/jobs"
          element={<JobsPage jobs={jobs} onRefresh={refresh} onSubscribeJob={handleJobUpdate} />}
        />
        <Route
          path="/book/:bookId"
          element={
            <BookDetailPage
              books={books}
              config={config}
              models={models}
              modelsError={modelsError}
              onRefresh={refresh}
              onSubscribeJob={handleJobUpdate}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {uploadJobId && <UploadOverlay jobId={uploadJobId} onComplete={handleUploadComplete} />}
    </Layout>
  );
}
