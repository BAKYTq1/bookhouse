import styles from './Loader.module.scss';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

export const Loader = ({ size = 'medium', fullScreen = false }: LoaderProps) => {
  if (fullScreen) {
    return (
      <div className={styles.fullScreenLoader}>
        <div className={`${styles.spinner} ${styles[size]}`}></div>
      </div>
    );
  }

  return <div className={`${styles.spinner} ${styles[size]}`}></div>;
};
