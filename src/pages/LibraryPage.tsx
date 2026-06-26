import { useNavigate } from 'react-router';
import { Breadcrumb } from 'antd';
import { DropZone } from '../components/DropZone';
import { BookCard } from '../components/BookCard';
import type { BookRecord } from '../types';

interface LibraryPageProps {
  books: BookRecord[];
  onUploadStart: (jobId: string) => void;
  onUploadComplete: (bookId: string) => void;
}

export function LibraryPage({ books, onUploadStart, onUploadComplete }: LibraryPageProps) {
  const navigate = useNavigate();

  return (
    <main className="main">
      <div className="main-header">
        <Breadcrumb className="breadcrumb" items={[{ title: 'Library' }]} />
        <span className="main-header-count">
          {books.length} book{books.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="main-content">
        <DropZone onUploadStart={onUploadStart} onUploadComplete={onUploadComplete} />
        {books.length > 0 && (
          <div className="books-grid">
            {books.map((book) => (
              <BookCard key={book.id} book={book} onClick={() => navigate(`/book/${book.id}`)} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
