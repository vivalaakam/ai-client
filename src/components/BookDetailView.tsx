import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams } from 'react-router';
import { api } from '../api';
import { BookDetail } from './BookDetail';
import type { BookDetail as BookDetailType, SystemConfig } from '../types';

export function BookDetailView({
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
