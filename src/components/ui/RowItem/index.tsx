import styles from './RowItem.module.scss';
import { FC } from 'react';
import * as React from 'react';

export interface RowItemProps {
  head: string;
  value?: string;
  extra?: React.ReactNode;
  className?: string;
  isActive: boolean;
  onClick: () => void;
}

export const RowItem: FC<RowItemProps> = ({ head, value, extra, isActive, className, onClick }) => {
  return (
    <button
      className={[styles.rowItem, isActive ? styles.active : '', className]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
    >
      <div className={styles.head}>{head}</div>
      <div className={styles.value}>{value || 'Empty value'}</div>
      <div className={styles.extra}>{extra}</div>
    </button>
  );
};
