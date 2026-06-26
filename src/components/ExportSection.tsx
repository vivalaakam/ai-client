import { Card } from './ui';

export function ExportSection({
  exporting,
  exportMode,
  exportError,
  showExportTranslated,
  onExport,
}: {
  exporting: boolean;
  exportMode: 'original' | 'translated';
  exportError: string | null;
  showExportTranslated: boolean;
  onExport: (mode: 'original' | 'translated') => void;
}) {
  return (
    <Card>
      <h3>📦 Export EPUB</h3>
      <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>
        Download the book as EPUB — original text or translated version.
      </p>
      <div className="btn-row">
        <button className="btn btn-blue" onClick={() => onExport('original')} disabled={exporting}>
          📄 Export Original
        </button>
        {showExportTranslated && (
          <button
            className="btn btn-green"
            onClick={() => onExport('translated')}
            disabled={exporting}
          >
            🌐 Export Translated
          </button>
        )}
      </div>
      {exporting && (
        <div style={{ marginTop: 12 }}>
          <div className="progress-text">
            <span>Assembling {exportMode} EPUB…</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '50%' }} />
          </div>
        </div>
      )}
      {exportError && (
        <p style={{ color: 'var(--red)', fontSize: 13, marginTop: 8 }}>{exportError}</p>
      )}
    </Card>
  );
}
