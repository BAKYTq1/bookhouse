import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './AdminLayout.module.scss';

export interface AdminLayoutSection {
  key: string;
  label: string;
  to: string;
}

interface AdminLayoutProps {
  title: string;
  subtitle: string;
  sections: AdminLayoutSection[];
  actions?: ReactNode;
  notices?: ReactNode;
  children: ReactNode;
}

export const AdminLayout = ({ title, subtitle, sections, actions, notices, children }: AdminLayoutProps) => {
  return (
    <div className={styles.adminPage}>
      <div className={styles.container}>
        <div className={styles.layout}>
          <div className={styles.main}>
            <div className={styles.header}>
              <div className={styles.titleBlock}>
                <h1>{title}</h1>
                <p>{subtitle}</p>
              </div>
              {actions}
            </div>

            {notices}
            {children}
          </div>

          <aside className={styles.rightNav}>
            <div className={styles.rightNavTitle}>{title}</div>
            <nav className={styles.rightNavLinks}>
              {sections.map(section => (
                <NavLink
                  key={section.key}
                  to={section.to}
                  end={section.to === '/admin'}
                  className={({ isActive }) =>
                    `${styles.rightNavLink} ${isActive ? styles.activeLink : ''}`
                  }
                >
                  {section.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      </div>
    </div>
  );
};
