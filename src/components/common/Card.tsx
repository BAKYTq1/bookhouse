import { ReactNode } from 'react';
import styles from './Card.module.scss';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const Card = ({ children, className = '', onClick, hover = false }: CardProps) => {
  return (
    <div
      className={`${styles.card} ${hover ? styles.hover : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
