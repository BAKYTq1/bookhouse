import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Sun, Moon, BookOpen, Menu, X, Heart } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import styles from './Navbar.module.scss';

export const Navbar = () => {
  const { getCartCount } = useCart();
  const { getFavoritesCount } = useFavorites();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <BookOpen size={28} />
          <span>BookHouse</span>
        </Link>

        <div className={styles.navLinks}>
          <Link to="/" className={styles.navLink}>{t('nav.home')}</Link>
          <Link to="/catalog" className={styles.navLink}>{t('nav.catalog')}</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className={styles.navLink}>{t('nav.admin')}</Link>
          )}
        </div>

        <div className={styles.actions}>
          <select
            className={styles.languageSelect}
            value={language}
            onChange={(e) => setLanguage(e.target.value as typeof language)}
            aria-label={t('nav.language')}
          >
            <option value="ky">{t('language.ky')}</option>
            <option value="ru">{t('language.ru')}</option>
            <option value="en">{t('language.en')}</option>
          </select>

          <button className={styles.iconButton} onClick={toggleTheme} aria-label={t('nav.theme')}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <Link to="/cart" className={styles.cartButton} aria-label={t('nav.cart')}>
            <ShoppingCart size={20} />
            {getCartCount() > 0 && (
              <span className={styles.cartBadge}>{getCartCount()}</span>
            )}
          </Link>

          <Link to="/favorites" className={styles.cartButton} aria-label={t('nav.favorites')}>
            <Heart size={20} />
            {getFavoritesCount() > 0 && (
              <span className={styles.cartBadge}>{getFavoritesCount()}</span>
            )}
          </Link>

          {user ? (
            <>
              <Link to="/profile" className={styles.iconButton} aria-label={t('nav.profile')}>
                <User size={20} />
              </Link>
              <button className={styles.iconButton} onClick={handleLogout} aria-label={t('nav.logout')}>
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <Link to="/login" className={styles.loginButton}>
              {t('nav.login')}
            </Link>
          )}

          <button
            className={`${styles.iconButton} ${styles.menuButton}`}
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link to="/" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            {t('nav.home')}
          </Link>
          <Link to="/catalog" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            {t('nav.catalog')}
          </Link>
          <Link to="/favorites" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            {t('nav.favorites')}
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
              {t('nav.admin')}
            </Link>
          )}
          {user ? (
            <Link to="/profile" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
              {t('nav.profile')}
            </Link>
          ) : (
            <Link to="/login" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
              {t('nav.login')}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};
