import type { AppConfigEntry } from '../../types.ts';
import { RowItem } from '../ui/RowItem';
import { FC } from 'react';

export interface ConfigListItemProps {
  entry: AppConfigEntry;
  active: boolean;
  onClick: () => void;
}

export const ConfigListItem: FC<ConfigListItemProps> = ({ entry, active, onClick }) => {
  return <RowItem value={entry.value} head={entry.slug} isActive={active} onClick={onClick} />;
};
