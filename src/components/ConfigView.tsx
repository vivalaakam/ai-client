import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd';
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
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
    return <Card loading />;
  }

  return (
    <section className="config-editor-page">
      <Card
        title={
          <Space direction="vertical" size={0}>
            <Typography.Title level={3}>{selected ? selected.slug : 'New config'}</Typography.Title>
            <Typography.Text type="secondary">
              Key/value settings from ai-tg-channels
            </Typography.Text>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<PlusOutlined />} onClick={() => onSelectEntry(null)}>
              New
            </Button>
            <Button icon={<SaveOutlined />} loading={saving} type="primary" onClick={save}>
              Save
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

        <Form layout="vertical" className="config-editor-form">
          <Form.Item label="Slug" required validateStatus={!slug.trim() && isNew ? 'error' : ''}>
            <Input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              disabled={!isNew}
              readOnly={!isNew}
              placeholder="config.slug"
            />
          </Form.Item>
          <Form.Item label="Value" className="config-value-group">
            <Input.TextArea
              className="config-value-textarea"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              spellCheck={false}
              autoSize={{ minRows: 16 }}
            />
          </Form.Item>
        </Form>
      </Card>
    </section>
  );
}
