import { Link, useSearchParams } from 'react-router';
import { Breadcrumb } from 'antd';
import { NewsFeed } from '../components/NewsFeed';
import type { TgChannel } from '../types';

interface NewsPageProps {
  tgChannels: TgChannel[];
  refreshNonce: number;
  onRefresh: () => void | Promise<void>;
}

export function NewsPage({ tgChannels, refreshNonce, onRefresh }: NewsPageProps) {
  const [searchParams] = useSearchParams();
  const selectedChannelId = searchParams.get('channel');

  return (
    <main className="main">
      <div className="main-header">
        <Breadcrumb
          className="breadcrumb"
          items={[{ title: <Link to="/">Library</Link> }, { title: 'News' }]}
        />
        <span className="main-header-count">Telegram channels</span>
      </div>
      <div className="main-content">
        <NewsFeed
          channels={tgChannels}
          selectedChannelId={selectedChannelId}
          refreshNonce={refreshNonce}
          onRefreshChannels={onRefresh}
        />
      </div>
    </main>
  );
}
