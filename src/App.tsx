import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { UploadOverlay } from './components/UploadOverlay';
import { useWebSocket } from './hooks/useWebSocket';
import { useBooks, useConfig, useModels } from './hooks/useBooks';
import { api } from './api';
import type { TgChannel, TranslationJob } from './types';

export function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}

function AppInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const [jobUpdate, setJobUpdate] = useState<TranslationJob | null>(null);
  const [uploadJobId, setUploadJobId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<TranslationJob[]>([]);
  const [tgChannels, setTgChannels] = useState<TgChannel[]>([]);
  const [tgChannelsLoading, setTgChannelsLoading] = useState(false);
  const [tgChannelsError, setTgChannelsError] = useState<string | null>(null);
  const [newsRefreshNonce, setNewsRefreshNonce] = useState(0);

  const { connected, subscribe } = useWebSocket((job) => {
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
    if (jobUpdate) refresh();
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

  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path);
      if (path === '/jobs') {
        api
          .jobList()
          .then((data) => setJobs(data.jobs || []))
          .catch(() => {});
      }
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

  // Shared props for MainContent — passed to every route
  const mainProps = {
    books,
    config,
    models,
    modelsError,
    jobs,
    tgChannels,
    selectedChannelId,
    newsRefreshNonce,
    onRefreshTgChannels: refreshNews,
    selectedBookId,
    onNavigate: handleNavigate,
    onRefresh: refresh,
    onSubscribeJob: handleJobUpdate,
    onUploadStart: (jobId: string) => {
      setUploadJobId(jobId);
      subscribe(jobId);
    },
    onUploadComplete: handleUploadComplete,
    onSelectBook: handleSelectBook,
  };

  return (
    <div className="app">
      <Sidebar
        books={books}
        loading={loading}
        selectedBookId={selectedBookId}
        tgChannels={tgChannels}
        tgChannelsLoading={tgChannelsLoading}
        tgChannelsError={tgChannelsError}
        selectedChannelId={selectedChannelId}
        onRefreshTgChannels={refreshNews}
        onSelectBook={handleSelectBook}
        onRefresh={refresh}
        connected={connected}
        modelsCount={models.length}
        modelsError={modelsError}
        onUploadClick={() => navigate('/')}
        currentView={view}
        onNavigate={handleNavigate}
      />
      <Routes>
        <Route path="/" element={<MainContent view="library" {...mainProps} />} />
        <Route path="/news" element={<MainContent view="news" {...mainProps} />} />
        <Route path="/jobs" element={<MainContent view="jobs" {...mainProps} />} />
        <Route path="/book/:bookId" element={<MainContent view="detail" {...mainProps} />} />
        <Route path="*" element={<MainContent view="library" {...mainProps} />} />
      </Routes>
      {uploadJobId && <UploadOverlay jobId={uploadJobId} onComplete={handleUploadComplete} />}
    </div>
  );
}
