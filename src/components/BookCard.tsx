import { Card, Progress, Space, Tag, Typography } from 'antd';
import type { BookRecord } from '../types';

export function BookCard({ book, onClick }: { book: BookRecord; onClick: () => void }) {
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
