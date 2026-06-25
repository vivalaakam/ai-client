import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import type { PromptRecord } from '../types';

interface PromptsViewProps {
  prompts: PromptRecord[];
  loading: boolean;
  error: string | null;
  selectedPromptId: string | null;
  onSelectPrompt: (promptId: string | null) => void;
  onRefreshPrompts: () => void | Promise<void>;
}

export function PromptsView({
  prompts,
  loading,
  error,
  selectedPromptId,
  onSelectPrompt,
  onRefreshPrompts,
}: PromptsViewProps) {
  const selected = useMemo(
    () => prompts.find((prompt) => prompt.id === selectedPromptId) ?? null,
    [prompts, selectedPromptId]
  );
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [history, setHistory] = useState<PromptRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    setContent(selected?.content ?? '');
    setTags(selected?.tags ?? []);
    setHistory([]);
    setLocalError(null);
  }, [selected]);

  const save = useCallback(async () => {
    if (!content.trim()) {
      setLocalError('Prompt content is required');
      return;
    }
    setSaving(true);
    try {
      const saved = selectedPromptId
        ? await api.promptsUpdate(selectedPromptId, content, tags)
        : await api.promptsCreate(content, tags);
      await onRefreshPrompts();
      onSelectPrompt(saved.id);
      setHistory([]);
      setLocalError(null);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to save prompt');
    } finally {
      setSaving(false);
    }
  }, [content, onRefreshPrompts, onSelectPrompt, selectedPromptId, tags]);

  const loadHistory = useCallback(async () => {
    if (!selectedPromptId) return;
    try {
      setHistory(await api.promptsHistory(selectedPromptId));
      setLocalError(null);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to load prompt history');
    }
  }, [selectedPromptId]);

  if (loading && prompts.length === 0) {
    return <div className="empty-state">Loading prompts…</div>;
  }

  return (
    <section className="prompt-editor-page">
      {(error || localError) && <div className="inline-error">{localError ?? error}</div>}

      <div className="prompt-editor-header">
        <div>
          <h2>{selected ? `Prompt v${selected.version}` : 'New prompt'}</h2>
          <div className="news-subtitle">{selected?.id ?? 'Draft prompt'}</div>
        </div>
        <div className="prompt-editor-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => onSelectPrompt(null)}>
            New
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={loadHistory}
            disabled={!selectedPromptId}
          >
            History
          </button>
          <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : selectedPromptId ? 'Save version' : 'Create'}
          </button>
        </div>
      </div>

      <TagMultiselect selected={tags} onChange={setTags} />

      <div className="markdown-editor">
        <div className="markdown-pane">
          <div className="markdown-tabs">
            <button
              className={`markdown-tab ${mode === 'edit' ? 'active' : ''}`}
              onClick={() => setMode('edit')}
            >
              Edit
            </button>
            <button
              className={`markdown-tab ${mode === 'preview' ? 'active' : ''}`}
              onClick={() => setMode('preview')}
            >
              Preview
            </button>
          </div>
          {mode === 'edit' ? (
            <textarea
              className="prompt-textarea"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              spellCheck={false}
            />
          ) : (
            <div className="markdown-preview">{renderMarkdown(content)}</div>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div className="prompt-history">
          {history.map((prompt) => (
            <button
              key={prompt.id}
              className="settings-list-item"
              onClick={() => onSelectPrompt(prompt.id)}
            >
              <span>v{prompt.version}</span>
              <small>{prompt.id}</small>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function TagMultiselect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (tags: string[]) => void;
}) {
  const [newTag, setNewTag] = useState('');
  const available = [...selected].sort();

  const toggle = (tag: string) => {
    onChange(selected.includes(tag) ? selected.filter((item) => item !== tag) : [...selected, tag]);
  };

  const add = () => {
    const tag = newTag.trim();
    if (!tag || selected.includes(tag)) return;
    onChange([...selected, tag]);
    setNewTag('');
  };

  return (
    <div className="tag-multiselect">
      <label>Tags</label>
      <div className="tag-chip-row">
        {available.length === 0 && selected.length === 0 && (
          <span className="tag-empty">No tags selected</span>
        )}
        {available.map((tag) => (
          <button
            key={tag}
            className={`tag-chip ${selected.includes(tag) ? 'active' : ''}`}
            onClick={() => toggle(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      <div className="tag-add-row">
        <input
          value={newTag}
          onChange={(event) => setNewTag(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              add();
            }
          }}
          placeholder="Add tag"
        />
        <button className="btn btn-secondary btn-sm" onClick={add}>
          Add
        </button>
      </div>
    </div>
  );
}

function renderMarkdown(content: string) {
  const lines = content.split('\n');
  const nodes: JSX.Element[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let code: string[] | null = null;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    nodes.push(<p key={`p-${nodes.length}`}>{paragraph.join('\n')}</p>);
    paragraph = [];
  };
  const flushList = () => {
    if (list.length === 0) return;
    nodes.push(
      <ul key={`ul-${nodes.length}`}>
        {list.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    );
    list = [];
  };

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (code) {
        nodes.push(<pre key={`code-${nodes.length}`}>{code.join('\n')}</pre>);
        code = null;
      } else {
        flushParagraph();
        flushList();
        code = [];
      }
      continue;
    }
    if (code) {
      code.push(line);
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      const text = heading[2];
      nodes.push(
        level === 1 ? (
          <h1 key={`h-${nodes.length}`}>{text}</h1>
        ) : level === 2 ? (
          <h2 key={`h-${nodes.length}`}>{text}</h2>
        ) : (
          <h3 key={`h-${nodes.length}`}>{text}</h3>
        )
      );
      continue;
    }
    const item = /^[-*]\s+(.+)$/.exec(line);
    if (item) {
      flushParagraph();
      list.push(item[1]);
      continue;
    }
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  if (code) nodes.push(<pre key={`code-${nodes.length}`}>{code.join('\n')}</pre>);
  return nodes.length > 0 ? nodes : <p className="markdown-empty">Nothing to preview</p>;
}
