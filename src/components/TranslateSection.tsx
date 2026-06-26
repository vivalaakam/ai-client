const LANGUAGES = [
  'English',
  'Russian',
  'Spanish',
  'French',
  'German',
  'Chinese',
  'Japanese',
  'Italian',
  'Portuguese',
];

export function TranslateSection({
  sourceLang,
  targetLang,
  model,
  models,
  modelsError,
  translating,
  onSourceLangChange,
  onTargetLangChange,
  onModelChange,
  onTranslate,
}: {
  sourceLang: string;
  targetLang: string;
  model: string;
  models: string[];
  modelsError: boolean;
  translating: boolean;
  onSourceLangChange: (value: string) => void;
  onTargetLangChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onTranslate: () => void;
}) {
  const translateDisabled =
    translating || !targetLang || (models.length > 0 && !model && !modelsError);

  return (
    <div className="translate-section">
      <h3>🌐 Translate this book</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Source Language</label>
          <select value={sourceLang} onChange={(event) => onSourceLangChange(event.target.value)}>
            <option value="auto">Auto-detect</option>
            {LANGUAGES.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Target Language</label>
          <select value={targetLang} onChange={(event) => onTargetLangChange(event.target.value)}>
            <option value="">Select…</option>
            {LANGUAGES.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group full">
          <label>Model</label>
          <select
            value={model}
            onChange={(event) => onModelChange(event.target.value)}
            disabled={modelsError}
          >
            {modelsError ? (
              <option value="">API unavailable</option>
            ) : models.length === 0 ? (
              <option value="">No models found</option>
            ) : (
              models.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))
            )}
          </select>
        </div>
      </div>
      <div className="btn-row">
        <button className="btn btn-green" onClick={onTranslate} disabled={translateDisabled}>
          {translating ? '⏳ Starting…' : '🚀 Start Translation'}
        </button>
      </div>
    </div>
  );
}
