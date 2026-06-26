import { Progress, Tag } from 'antd';
import type { BookRecord } from '../../types.ts';

export function BookListItem({
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
          <Tag color="green">done</Tag>
        ) : isParsing ? (
          <Tag color="purple">parsing {parsePct}%</Tag>
        ) : isTranslating ? (
          <Tag color="blue">translating</Tag>
        ) : (
          <Tag color="gold">parsed</Tag>
        )}
      </div>
      <div className="book-item-author">{book.author || 'Unknown author'}</div>
      <div className="book-item-stats">
        <span>📄 {total}</span>
        <span>✅ {translated}</span>
        <span>🌍 {book.language || '?'}</span>
      </div>
      {isParsing && book.totalPages > 0 && (
        <Progress percent={parsePct} showInfo={false} status="active" />
      )}
      {translated > 0 && !isParsing && (
        <Progress percent={pct} showInfo={false} status={isComplete ? 'success' : 'active'} />
      )}
    </div>
  );
}
