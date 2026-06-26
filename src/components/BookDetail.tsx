import { useCallback, useState } from 'react';
import { api } from '../api';
import { BASE_URL } from '../config';
import { BookSummaryCard } from './BookSummaryCard';
import { ChaptersCard } from './ChaptersCard';
import { ExportSection } from './ExportSection';
import { ImagesCard } from './ImagesCard';
import { TranslateSection } from './TranslateSection';
import type { BookDetail as BookDetailType, SystemConfig } from '../types';

interface BookDetailProps {
  detail: BookDetailType;
  config: SystemConfig;
  models: string[];
  modelsError: boolean;
  onRefresh: () => void;
  onSubscribeJob: (jobId: string) => void;
  onDelete: () => void;
}

export function BookDetail({
  detail,
  config,
  models,
  modelsError,
  onRefresh,
  onSubscribeJob,
  onDelete,
}: BookDetailProps) {
  const [targetLang, setTargetLang] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [model, setModel] = useState(config.defaultModel || '');
  const [translating, setTranslating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMode, setExportMode] = useState<'original' | 'translated'>('translated');
  const [exportError, setExportError] = useState<string | null>(null);

  const total = detail.totalBlocks || detail.blockCounts?.total || 0;
  const translated = detail.translatedBlocks || detail.blockCounts?.translated || 0;
  const pct = total > 0 ? Math.round((translated / total) * 100) : 0;
  const isComplete = detail.completedAt !== null;
  const isTranslating = translated > 0 && !isComplete;
  const isParsing = detail.status === 'parsing';
  const parsePct =
    detail.totalPages > 0 ? Math.round((detail.parsedPages / detail.totalPages) * 100) : 0;
  const showTranslateSection = !config.uploadOnly && !isComplete && !isParsing;
  const showExportTranslated = translated > 0;

  const handleTranslate = useCallback(async () => {
    if (!targetLang) return;
    setTranslating(true);
    try {
      const result = await api.bookStartTranslation(
        detail.id,
        targetLang,
        sourceLang,
        model || undefined
      );
      onSubscribeJob(result.jobId);
      onRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to start translation');
    }
    setTranslating(false);
  }, [detail.id, targetLang, sourceLang, model, onSubscribeJob, onRefresh]);

  const handleExport = useCallback(
    async (mode: 'original' | 'translated') => {
      setExporting(true);
      setExportMode(mode);
      setExportError(null);
      try {
        const result = await api.bookExport(detail.id, mode);
        const href = result.downloadUrl.startsWith('http')
          ? result.downloadUrl
          : BASE_URL + result.downloadUrl;
        const link = document.createElement('a');
        link.href = href;
        link.download = href.split('/').pop()?.replace('.epub', '.zip') || 'book.zip';
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (err: unknown) {
        setExportError(err instanceof Error ? err.message : 'Export failed');
      } finally {
        setExporting(false);
      }
    },
    [detail.id]
  );

  const handleDelete = useCallback(async () => {
    if (!confirm('Delete this book and all its data?')) return;
    try {
      await api.bookDelete(detail.id);
      onDelete();
    } catch {
      /* ignore */
    }
  }, [detail.id, onDelete]);

  return (
    <>
      <BookSummaryCard
        detail={detail}
        total={total}
        translated={translated}
        pct={pct}
        isComplete={isComplete}
        isTranslating={isTranslating}
        isParsing={isParsing}
        parsePct={parsePct}
        onDelete={handleDelete}
      />

      {showTranslateSection && (
        <TranslateSection
          sourceLang={sourceLang}
          targetLang={targetLang}
          model={model}
          models={models}
          modelsError={modelsError}
          translating={translating}
          onSourceLangChange={setSourceLang}
          onTargetLangChange={setTargetLang}
          onModelChange={setModel}
          onTranslate={handleTranslate}
        />
      )}

      <ExportSection
        exporting={exporting}
        exportMode={exportMode}
        exportError={exportError}
        showExportTranslated={showExportTranslated}
        onExport={handleExport}
      />

      {detail.chapters?.length > 0 && <ChaptersCard chapters={detail.chapters} />}
      {detail.images?.length > 0 && <ImagesCard images={detail.images} />}
    </>
  );
}
