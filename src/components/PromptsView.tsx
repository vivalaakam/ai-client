import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Input, List, Select, Space, Tabs, Typography } from 'antd';
import { HistoryOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
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
    return <Card loading />;
  }

  return (
    <section className="prompt-editor-page">
      <Card
        title={
          <Space direction="vertical" size={0}>
            <Typography.Title level={3}>
              {selected ? `Prompt v${selected.version}` : 'New prompt'}
            </Typography.Title>
            <Typography.Text type="secondary">{selected?.id ?? 'Draft prompt'}</Typography.Text>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<PlusOutlined />} onClick={() => onSelectPrompt(null)}>
              New
            </Button>
            <Button disabled={!selectedPromptId} icon={<HistoryOutlined />} onClick={loadHistory}>
              History
            </Button>
            <Button icon={<SaveOutlined />} loading={saving} type="primary" onClick={save}>
              {selectedPromptId ? 'Save version' : 'Create'}
            </Button>
          </Space>
        }
      >
        {(error || localError) && (
          <Alert
            className="prompt-editor-alert"
            message={localError ?? error}
            type="error"
            showIcon
          />
        )}

        <Space direction="vertical" size="middle" className="prompt-editor-stack">
          <div>
            <Typography.Text strong>Tags</Typography.Text>
            <Select
              className="tag-select"
              mode="tags"
              value={tags}
              onChange={setTags}
              placeholder="Add tags"
              tokenSeparators={[',']}
            />
          </div>

          <Tabs
            activeKey={mode}
            onChange={(key) => setMode(key as 'edit' | 'preview')}
            items={[
              {
                key: 'edit',
                label: 'Edit',
                children: (
                  <Input.TextArea
                    className="prompt-textarea"
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    spellCheck={false}
                    autoSize={{ minRows: 20 }}
                  />
                ),
              },
              {
                key: 'preview',
                label: 'Preview',
                children: <div className="markdown-preview">{renderMarkdown(content)}</div>,
              },
            ]}
          />
        </Space>
      </Card>

      {history.length > 0 && (
        <Card className="prompt-history" title="History" size="small">
          <List
            dataSource={history}
            renderItem={(prompt) => (
              <List.Item className="settings-list-item" onClick={() => onSelectPrompt(prompt.id)}>
                <List.Item.Meta title={`v${prompt.version}`} description={prompt.id} />
              </List.Item>
            )}
          />
        </Card>
      )}
    </section>
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
