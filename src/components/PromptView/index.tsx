import {useCallback, useEffect, useState} from 'react';
import {App, Button, Input, Row, Select, Tabs, Typography} from 'antd';
import {CopyOutlined, SaveOutlined} from '@ant-design/icons';
import type {PromptRecord} from '../../types.ts';
import {renderMarkdown} from './renderMarkdown.tsx';
import styles from './PromptView.module.scss';

interface PromptsViewProps {
    prompt: PromptRecord | null | undefined;
    isSaving: boolean;
    error: string | null;
    onSave: (params: Partial<PromptRecord>) => void;
}

export function PromptView({prompt, onSave, isSaving}: PromptsViewProps) {
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [mode, setMode] = useState<'edit' | 'preview'>('edit');
    const {message} = App.useApp();


    useEffect(() => {
        setContent(prompt?.content ?? '');
        setTags(prompt?.tags ?? []);
    }, [prompt]);

    const save = useCallback(async () => {
        onSave({
            content,
            tags
        })
    }, [content, prompt, tags]);

    const copyId = useCallback(() => {
        navigator.clipboard.writeText(prompt?.id ?? '00000-000')
            .then(() => {
                message.success('Copied!');
            });
    }, [prompt, message])

    return (
        <>
            <Row justify="space-between">
                <Typography.Title level={3} onClick={copyId} className={styles.title}>
                    {prompt ? `Prompt v${prompt.version}` : 'New prompt'} <CopyOutlined className={styles.copyIcon} />
                </Typography.Title>
                <Button icon={<SaveOutlined/>} loading={isSaving} type="primary" onClick={save}>
                    {prompt?.id ? 'Save version' : 'Create'}
                </Button>
            </Row>
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
                                autoSize={{minRows: 20}}
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
        </>
    );
}
