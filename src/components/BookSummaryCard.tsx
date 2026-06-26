import { Card } from './ui';
import type { BookDetail as BookDetailType } from '../types';

export function BookSummaryCard({
  detail,
  total,
  translated,
  pct,
  isComplete,
  isTranslating,
  isParsing,
  parsePct,
  onDelete,
}: {
  detail: BookDetailType;
  total: number;
  translated: number;
  pct: number;
  isComplete: boolean;
  isTranslating: boolean;
  isParsing: boolean;
  parsePct: number;
  onDelete: () => void;
}) {
  return (
    <Card>
      <div className="detail-title">{detail.title || detail.filename}</div>
      <div className="detail-author">{detail.author || 'Unknown author'}</div>
      <div className="detail-meta">
        <span>📄 {total} blocks</span>
        <span>🌍 {detail.language || '?'}</span>
        <span>📦 {detail.filename?.split('.').pop() || '?'}</span>
        {isComplete && <span className="badge completed">✓ complete</span>}
        {isTranslating && <span className="badge translating">translating</span>}
        {isParsing && <span className="badge translating">parsing {parsePct}%</span>}
        {!isComplete && !isTranslating && !isParsing && (
          <span className="badge queued">parsed</span>
        )}
      </div>

      {isParsing && detail.totalPages > 0 && (
        <div style={{ marginTop: 12 }}>
          <div className="progress-text">
            <span>
              OCR: {detail.parsedPages} / {detail.totalPages} pages
            </span>
            <span>{parsePct}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${parsePct}%` }} />
          </div>
        </div>
      )}

      {translated > 0 && !isParsing && (
        <div style={{ marginTop: 12 }}>
          <div className="progress-text">
            <span>
              {translated} / {total} blocks
            </span>
            <span>{pct}%</span>
          </div>
          <div className="progress-bar">
            <div
              className={`progress-fill ${isComplete ? 'completed' : ''}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      <div className="btn-row">
        <button className="btn-sm btn-danger" onClick={onDelete}>
          ✕ Delete
        </button>
      </div>
    </Card>
  );
}
