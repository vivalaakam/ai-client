import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Form, Input, Row, Typography } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import type { AppConfigEntry } from '../types';

interface ConfigViewProps {
  entry: AppConfigEntry | null | undefined;
  isSaving: boolean;
  error: string | null;
  onSave: (params: Partial<AppConfigEntry>) => void;
}

export function ConfigView({ entry, onSave, isSaving, error }: ConfigViewProps) {
  const [slug, setSlug] = useState('');
  const [value, setValue] = useState('');
  const isNew = !entry;

  useEffect(() => {
    setSlug(entry?.slug ?? '');
    setValue(entry?.value ?? '');
  }, [entry]);

  const save = useCallback(() => {
    onSave({ slug, value });
  }, [slug, value, onSave]);

  return (
    <>
      <Row justify="space-between">
        <Typography.Title level={3}>
          {entry ? entry.slug : 'New config'}
        </Typography.Title>
        <Button icon={<SaveOutlined />} loading={isSaving} type="primary" onClick={save}>
          {entry ? 'Save' : 'Create'}
        </Button>
      </Row>

      {error && <Alert title={error} type="error" showIcon style={{ marginBottom: 16 }} />}

      <Form layout="vertical">
        <Form.Item label="Slug" required>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            disabled={!isNew}
            readOnly={!isNew}
            placeholder="config.slug"
          />
        </Form.Item>
        <Form.Item label="Value">
          <Input.TextArea
            className="config-value-textarea"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            spellCheck={false}
            autoSize={{ minRows: 16 }}
          />
        </Form.Item>
      </Form>
    </>
  );
}
