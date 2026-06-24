import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import type { AppConfigEntry } from '../types';

interface ConfigViewProps {
  entries: AppConfigEntry[];
  loading: boolean;
  error: string | null;
  selectedSlug: string | null;
  onSelectEntry: (slug: string | null) => void;
  onRefreshEntries: () => void | Promise<void>;
}

export function ConfigView({
  entries,
  loading,
  error,
  selectedSlug,
  onSelectEntry,
  onRefreshEntries,
}: ConfigViewProps) {
  const selected = useMemo(
    () => entries.find((entry) => entry.slug === selectedSlug) ?? null,
    [entries, selectedSlug]
  );
  const isNew = selected === null;
  const [slug, setSlug] = useState('');
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setSlug(selected?.slug ?? '');
    setValue(selected?.value ?? '');
    setLocalError(null);
  }, [selected]);

  const save = useCallback(async () => {
    const nextSlug = selected?.slug ?? slug.trim();
    if (!nextSlug) {
      setLocalError('Config slug is required');
      return;
    }
    setSaving(true);
    try {
      const saved = await api.configSet(nextSlug, value);
      await onRefreshEntries();
      onSelectEntry(saved.slug);
      setLocalError(null);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to save config');
    } finally {
      setSaving(false);
    }
  }, [onRefreshEntries, onSelectEntry, selected?.slug, slug, value]);

  if (loading && entries.length === 0) {
    return <div className="empty-state">Loading config…</div>;
  }

  return (
    <section className="config-editor-page">
      {(error || localError) && <div className="inline-error">{localError ?? error}</div>}

      <div className="prompt-editor-header">
        <div>
          <h2>{selected ? selected.slug : 'New config'}</h2>
          <div className="news-subtitle">Key/value settings from ai-tg-channels</div>
        </div>
        <div className="prompt-editor-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => onSelectEntry(null)}>
            New
          </button>
          <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="config-editor-form">
        <div className="form-group">
          <label>Slug</label>
          <input
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            disabled={!isNew}
            readOnly={!isNew}
          />
        </div>
        <div className="form-group config-value-group">
          <label>Value</label>
          <textarea
            className="config-value-textarea"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            spellCheck={false}
          />
        </div>
      </div>
    </section>
  );
}
