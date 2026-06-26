import { Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { PromptRecord } from '../../types.ts';
import { PromptListItem } from './PromptListItem.tsx';

export function PromptsSidebar({
  prompts,
  loading,
  error,
  selectedPromptId,
  onRefresh,
  onSelect,
  onCreate,
}: {
  prompts: PromptRecord[];
  loading: boolean;
  error: string | null;
  selectedPromptId: string | null;
  onRefresh: () => void | Promise<void>;
  onSelect: (promptId: string) => void;
  onCreate: () => void;
}) {
  return (
    <>
      <div className="sidebar-upload">
        <Button className="upload-btn" onClick={onCreate} type="primary">
          New prompt
        </Button>
        <Button
          className="sidebar-refresh-btn"
          icon={<ReloadOutlined />}
          size="small"
          onClick={onRefresh}
        >
          Refresh
        </Button>
        {error && <div className="sidebar-error">{error}</div>}
      </div>

      <div className="sidebar-list">
        {loading && prompts.length === 0 ? (
          <div className="empty-state">Loading prompts…</div>
        ) : prompts.length === 0 ? (
          <div className="empty-state">No prompts yet</div>
        ) : (
          prompts.map((prompt) => (
            <PromptListItem
              key={prompt.id}
              prompt={prompt}
              active={prompt.id === selectedPromptId}
              onClick={() => onSelect(prompt.id)}
            />
          ))
        )}
      </div>
    </>
  );
}
