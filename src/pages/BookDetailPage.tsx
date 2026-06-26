import { useNavigate, useParams } from 'react-router';
import { Breadcrumb, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { BookDetailView } from '../components/BookDetailView';
import type { BookRecord, SystemConfig } from '../types';

interface BookDetailPageProps {
  books: BookRecord[];
  config: SystemConfig;
  models: string[];
  modelsError: boolean;
  onRefresh: () => void;
  onSubscribeJob: (jobId: string) => void;
}

export function BookDetailPage({
  books,
  config,
  models,
  modelsError,
  onRefresh,
  onSubscribeJob,
}: BookDetailPageProps) {
  const navigate = useNavigate();
  const { bookId } = useParams<{ bookId: string }>();
  const title = books.find((b) => b.id === bookId)?.title || 'Book details';

  return (
    <main className="main">
      <div className="main-header">
        <Button icon={<ArrowLeftOutlined />} size="small" onClick={() => navigate('/')} />
        <Breadcrumb
          className="breadcrumb"
          items={[
            {
              title: (
                <button className="breadcrumb-link" onClick={() => navigate('/')}>
                  Library
                </button>
              ),
            },
            { title },
          ]}
        />
      </div>
      <div className="main-content">
        <BookDetailView
          config={config}
          models={models}
          modelsError={modelsError}
          onRefresh={onRefresh}
          onSubscribeJob={onSubscribeJob}
          onBack={() => navigate('/')}
        />
      </div>
    </main>
  );
}
