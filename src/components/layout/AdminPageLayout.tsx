import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import styles from './AdminPageLayout.module.scss';

interface AdminPageLayoutProps {
  children: ReactNode;
}

export const AdminPageLayout = ({ children }: AdminPageLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const adminMenuItems = [
    { label: t('admin.dashboard'), path: '/admin' },
    { label: t('admin.books'), path: '/admin/books' },
    { label: t('admin.users'), path: '/admin/users' },
    { label: t('admin.orders'), path: '/admin/orders' },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`${styles.adminPageLayout} ${theme}`}>
      {/* Admin Header */}
      <header className={styles.adminHeader}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <h1>📊 BookHouse Admin</h1>
          </div>

          <div className={styles.headerActions}>
            <button
              className={styles.themToggle}
              onClick={toggleTheme}
              title={t('theme.toggle')}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className={styles.languageSelect}
            >
              <option value="en">English</option>
              <option value="ru">Русский</option>
              <option value="ky">Кыргызча</option>
            </select>

            <div className={styles.userInfo}>
              <span>{user?.name}</span>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                {t('auth.logout')}
              </button>
            </div>

            <button
              className={styles.menuToggle}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      <div className={styles.adminContainer}>
        {/* Sidebar */}
        <aside className={`${styles.adminSidebar} ${menuOpen ? styles.open : ''}`}>
          <nav className={styles.adminNav}>
            {adminMenuItems.map((item) => (
              <button
                key={item.path}
                className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
                onClick={() => {
                  navigate(item.path);
                  setMenuOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className={styles.adminMain}>
          {children}
        </main>
      </div>

      {/* Admin Footer */}
      <footer className={styles.adminFooter}>
        <p>© 2026 BookHouse Admin Panel. All rights reserved.</p>
      </footer>
    </div>
  );
};
