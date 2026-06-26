import { ReactNode } from 'react';
import styles from './Sidebar.module.scss';

interface SidebarProps {
  children: ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  return <aside className={styles.sidebar}>{children}</aside>;
}
