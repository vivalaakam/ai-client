import styles from './MainView.module.scss';

export interface MainViewProps {
  children: React.ReactNode;
}

export const MainView: React.FC<MainViewProps> = ({ children }) => {
  return <div className={styles.mainView}>{children}</div>;
};
