import type { PromptRecord } from '../../types.ts';
import { firstLine } from './utils.ts';
import { RowItem } from '../ui/RowItem';
import { FC } from 'react';

export interface PromptListItemProps {
  prompt: PromptRecord;
  active: boolean;
  onClick: () => void;
}

export const PromptListItem: FC<PromptListItemProps> = ({ prompt, active, onClick }) => {
  const titleHead = prompt.tags[0] || firstLine(prompt.content) || prompt.id;

  const title = `${titleHead} (v${prompt.version})`;

  return (
    <RowItem
      head={title}
      value={firstLine(prompt.content)}
      isActive={active}
      extra={prompt.tags.join(', ')}
      onClick={onClick}
    />
  );
};
