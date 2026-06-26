import { Card } from './ui';
import type { ChapterInfo } from '../types';

export function ChaptersCard({ chapters }: { chapters: ChapterInfo[] }) {
  return (
    <Card>
      <h3>📑 Chapters ({chapters.length})</h3>
      <div className="chapters-list">
        {chapters.map((chapter, index) => {
          const pct =
            chapter.totalBlocks > 0
              ? Math.round((chapter.translatedBlocks / chapter.totalBlocks) * 100)
              : 0;
          return (
            <div className="chapter-row" key={`${chapter.docPath}-${index}`}>
              <span className="chapter-name">{chapter.docPath}</span>
              <span className="chapter-progress">
                {chapter.translatedBlocks}/{chapter.totalBlocks} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
