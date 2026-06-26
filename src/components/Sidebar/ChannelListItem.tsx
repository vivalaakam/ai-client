import type { TgChannel } from '../../types.ts';
import { RowItem } from '../ui/RowItem';
import { FC } from 'react';

export interface ChannelListItemProps {
  channel: TgChannel;
  active: boolean;
  onClick: () => void;
}

export const ChannelListItem: FC<ChannelListItemProps> = ({ channel, active, onClick }) => {
  return (
    <RowItem
      value={channel.username ? `@${channel.username}` : channel.id}
      head={channel.title}
      isActive={active}
      onClick={onClick}
    />
  );
};
